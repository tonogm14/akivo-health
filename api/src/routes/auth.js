const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const OTP_TTL_MINUTES = 10;

// ── helpers
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function issueToken(userId, phone) {
  return jwt.sign({ sub: userId, phone }, process.env.JWT_SECRET, { expiresIn: '100y' });
}
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
}

// POST /auth/otp  — request OTP (dev: returns code in response)
router.post('/otp',
  body('phone').matches(/^\+51\d{9}$/).withMessage('Número peruano requerido (+51XXXXXXXXX)'),
  validate,
  async (req, res, next) => {
    try {
      const { phone } = req.body;

      // Invalidate previous unused codes
      await pool.query(
        `UPDATE otp_codes SET used = TRUE WHERE phone = $1 AND used = FALSE`,
        [phone]
      );

      const code = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

      await pool.query(
        `INSERT INTO otp_codes (phone, code, expires_at) VALUES ($1, $2, $3)`,
        [phone, code, expiresAt]
      );

      // TODO production: send via Twilio WhatsApp / SMS
      // await twilioClient.messages.create({ to: `whatsapp:${phone}`, ... })

      if (process.env.NODE_ENV !== 'production') {
        const fs = require('fs');
        const msg = `\n==================================\n  OTP DEMO | ${phone}\n  Codigo: ${code}\n==================================\n\n`;
        fs.writeSync(1, msg);
      }

      const payload = { message: `Código enviado a ${phone}` };
      if (process.env.NODE_ENV !== 'production') payload.dev_code = code;

      res.json(payload);
    } catch (err) { next(err); }
  }
);

// POST /auth/verify  — verify OTP, return JWT
router.post('/verify',
  body('phone').matches(/^\+51\d{9}$/),
  body('code').isLength({ min: 6, max: 6 }).isNumeric(),
  validate,
  async (req, res, next) => {
    try {
      const { phone, code } = req.body;

      const { rows } = await pool.query(
        `SELECT id FROM otp_codes
         WHERE phone = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [phone, code]
      );

      if (!rows.length) {
        return res.status(401).json({ error: 'Código incorrecto o expirado' });
      }

      await pool.query(`UPDATE otp_codes SET used = TRUE WHERE id = $1`, [rows[0].id]);

      // Upsert user
      const userRes = await pool.query(
        `INSERT INTO users (phone) VALUES ($1)
         ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone
         RETURNING id, phone, name, created_at`,
        [phone]
      );

      const user = userRes.rows[0];
      res.json({ token: issueToken(user.id, user.phone), user });
    } catch (err) { next(err); }
  }
);

module.exports = router;
