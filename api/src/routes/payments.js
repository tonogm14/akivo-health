const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const pool          = require('../db');
const auth          = require('../middleware/auth');
const culqi         = require('../services/culqi');
const niubiz        = require('../services/niubiz');
const pagoefectivo  = require('../services/pagoefectivo');
const { otpVerify } = require('../middleware/rateLimit');
const crypto        = require('crypto');
const logEvent      = require('../db/logEvent');

const PAYMENT_METHODS = ['yape', 'yape_plin', 'cash', 'card_culqi', 'card_niubiz', 'pagoefectivo'];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
}

// ── POST /payments/:visitId  — register payment method
router.post('/:visitId',
  auth,
  param('visitId').isUUID(),
  body('method').isIn(PAYMENT_METHODS),
  // card_culqi: requires culqi_token; card_niubiz: no token yet (session created server-side)
  body('culqi_token').if(body('method').equals('card_culqi')).notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const { method, culqi_token, operation_code } = req.body;
      const { visitId } = req.params;

      const { rows: [visit] } = await pool.query(
        `SELECT v.id, v.price, u.phone, u.id AS user_id
         FROM visits v JOIN users u ON u.id = v.user_id
         WHERE v.id = $1 AND v.user_id = $2`,
        [visitId, req.user.sub]
      );
      if (!visit) return res.status(404).json({ error: 'Visita no encontrada' });

      let gatewayRef = null;
      let extra      = {};

      if (method === 'card_culqi') {
        // Charge immediately with the Culqi token from the mobile SDK
        const charge = await culqi.createCharge({
          tokenId:  culqi_token,
          amount:   Math.round(visit.price * 100),   // centavos
          email:    req.user.email || `${visit.user_id}@doctorhouse.pe`,
          orderId:  visitId,
        });
        gatewayRef = charge.id;
        extra.gateway_status = charge.outcome?.type || 'vaultDirect';

      } else if (method === 'card_niubiz') {
        // Create a Niubiz session — mobile uses the session token to render checkout widget
        const sessionKey = await niubiz.createSession({
          amount:   visit.price,
          orderId:  visitId,
          email:    req.user.email || `${visit.user_id}@doctorhouse.pe`,
        });
        // Return session token to mobile (not charged yet — authorization called on confirm)
        extra.niubiz_session = sessionKey;

      } else if (method === 'pagoefectivo') {
        const cip = await pagoefectivo.createCIP({
          amount:      visit.price,
          orderId:     visitId,
          email:       req.user.email || `${visit.user_id}@doctorhouse.pe`,
          phone:       visit.phone,
          description: `Doctor House - Visita ${visitId.slice(0, 8)}`,
        });
        gatewayRef = cip.cipCode;
        extra = { cip_code: cip.cipCode, cip_url: cip.cipUrl, expires_at: cip.expirationDate };
      } else if (method === 'yape_plin' && operation_code) {
        gatewayRef = operation_code;
      }

      const { rows: [payment] } = await pool.query(
        `INSERT INTO payments (visit_id, method, amount, gateway_ref)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (visit_id) DO UPDATE
           SET method = EXCLUDED.method,
               gateway_ref = EXCLUDED.gateway_ref,
               updated_at = NOW()
         RETURNING *`,
        [visitId, method, visit.price, gatewayRef]
      );

      res.status(201).json({ ...payment, ...extra });
    } catch (err) { next(err); }
  }
);

// ── POST /payments/:visitId/confirm  — confirm / capture payment
router.post('/:visitId/confirm',
  auth,
  param('visitId').isUUID(),
  // card_niubiz: client sends the transaction token from SDK after card entry
  body('niubiz_token').optional().isString(),
  validate,
  async (req, res, next) => {
    try {
      const { visitId } = req.params;

      const { rows: [payment] } = await pool.query(
        `SELECT p.*, v.price FROM payments p JOIN visits v ON v.id = p.visit_id
         WHERE p.visit_id = $1`,
        [visitId]
      );
      if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });

      if (payment.method === 'card_niubiz' && req.body.niubiz_token) {
        const auth_result = await niubiz.authorizeTransaction({
          transactionToken: req.body.niubiz_token,
          amount:   payment.price,
          orderId:  visitId,
        });
        await pool.query(
          `UPDATE payments SET gateway_ref = $2, status = 'confirmed', confirmed_at = NOW()
           WHERE visit_id = $1`,
          [visitId, auth_result.order?.purchaseNumber || visitId]
        );
      } else {
        // cash / yape / culqi already charged / pagoefectivo pending webhook
        await pool.query(
          `UPDATE payments SET status = 'confirmed', confirmed_at = NOW()
           WHERE visit_id = $1 AND method NOT IN ('pagoefectivo')`,
          [visitId]
        );
      }

      const { rows: [updated] } = await pool.query(
        'SELECT * FROM payments WHERE visit_id = $1', [visitId]
      );

      await logEvent(visitId, 'payment_confirmed', 'patient', req.user.sub, {
        method: updated.method,
        amount: updated.amount,
      });

      // After payment confirm, the visit is officially 'matched'
      await pool.query(
        `UPDATE visits SET status = 'matched' WHERE id = $1 AND status != 'cancelled'`,
        [visitId]
      );

      res.json(updated);
    } catch (err) { next(err); }
  }
);

// ── PATCH /payments/:visitId/tip  — add tip after visit
router.patch('/:visitId/tip',
  auth,
  param('visitId').isUUID(),
  body('tip').isFloat({ min: 0, max: 200 }),
  validate,
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `UPDATE payments SET tip = $2, status = 'paid'
         WHERE visit_id = $1
         RETURNING *`,
        [req.params.visitId, req.body.tip]
      );
      if (!rows.length) return res.status(404).json({ error: 'Pago no encontrado' });

      await logEvent(req.params.visitId, 'tip_added', 'patient', req.user.sub, {
        tip: req.body.tip,
      });

      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// ── POST /payments/webhook/culqi  — Culqi payment notifications
router.post('/webhook/culqi',
  (req, res, next) => {
    // Webhook uses raw body for signature verification — re-parse manually
    req.rawBody = req.rawBody || '';
    next();
  },
  (req, res, next) => {
    const sig     = req.headers['x-culqi-hmac'] || '';
    const secret  = process.env.CULQI_WEBHOOK_SECRET || '';
    if (!culqi.verifyWebhook(req.rawBody, sig, secret)) {
      return res.status(401).json({ error: 'Webhook signature inválida' });
    }
    next();
  },
  async (req, res, next) => {
    try {
      const event = req.body;
      if (event?.object === 'event' && event?.type === 'charge.creation.success') {
        const chargeId = event.data?.id;
        const orderId  = event.data?.metadata?.order_id;
        if (orderId) {
          await pool.query(
            `UPDATE payments SET status = 'confirmed', gateway_ref = $2, confirmed_at = NOW()
             WHERE visit_id = $1`,
            [orderId, chargeId]
          );
        }
      }
      res.json({ received: true });
    } catch (err) { next(err); }
  }
);

// ── POST /payments/webhook/pagoefectivo  — PagoEfectivo cash payment confirmations
router.post('/webhook/pagoefectivo',
  (req, res, next) => {
    const sig = req.headers['authorization'] || '';
    if (!pagoefectivo.verifyWebhook(req.rawBody, sig)) {
      return res.status(401).json({ error: 'Webhook signature inválida' });
    }
    next();
  },
  async (req, res, next) => {
    try {
      const { transactionCode, cipCode, paymentStatus } = req.body;
      if (paymentStatus === 'PAGADO' && transactionCode) {
        await pool.query(
          `UPDATE payments SET status = 'confirmed', gateway_ref = $2, confirmed_at = NOW()
           WHERE visit_id = $1`,
          [transactionCode, String(cipCode)]
        );
        // Also mark visit as paid
        await pool.query(
          `UPDATE visits SET status = 'in_progress' WHERE id = $1 AND status = 'pending'`,
          [transactionCode]
        );
      }
      res.json({ received: true });
    } catch (err) { next(err); }
  }
);

module.exports = router;
