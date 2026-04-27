const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');
const logEvent = require('../db/logEvent');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
}

// GET /users/me
router.get('/me', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, phone, name, created_at FROM users WHERE id = $1`,
      [req.user.sub]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /users/me
router.patch('/me',
  auth,
  body('name').optional().isLength({ min: 2, max: 100 }),
  validate,
  async (req, res, next) => {
    try {
      const { name } = req.body;
      const { rows } = await pool.query(
        `UPDATE users SET name = COALESCE($2, name) WHERE id = $1
         RETURNING id, phone, name, created_at`,
        [req.user.sub, name]
      );
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// GET /users/me/visits
router.get('/me/visits', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT v.id, v.status, v.urgency, v.address, v.created_at,
         v.scheduled_at, v.price, v.eta_minutes,
         d.name AS doctor_name, d.specialty, d.rating AS doctor_rating
       FROM visits v
       LEFT JOIN doctors d ON d.id = v.doctor_id
       WHERE v.user_id = $1
       ORDER BY v.created_at DESC
       LIMIT 20`,
      [req.user.sub]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /users/:id/history — patient's visit history with event summary
router.get('/:id/history', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        v.id, v.status, v.service_type, v.urgency, v.created_at, v.updated_at,
        v.cancel_reason,
        d.name  AS doctor_name,
        d.specialty,
        p.amount, p.method AS payment_method, p.status AS payment_status,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'event_type', e.event_type,
            'actor_type', e.actor_type,
            'metadata',   e.metadata,
            'created_at', e.created_at
          ) ORDER BY e.created_at ASC)
          FROM visit_events e WHERE e.visit_id = v.id),
          '[]'
        ) AS events
      FROM visits v
      LEFT JOIN doctors  d ON d.id = v.doctor_id
      LEFT JOIN payments p ON p.visit_id = v.id
      WHERE v.user_id = $1
      ORDER BY v.created_at DESC
      LIMIT 50
    `, [req.params.id]);
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
