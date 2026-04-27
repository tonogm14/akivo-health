const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');
const logEvent = require('../db/logEvent');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
}

// POST /reviews/:visitId
router.post('/:visitId',
  auth,
  param('visitId').isUUID(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('tags').optional().isArray(),
  body('tip').optional().isFloat({ min: 0 }),
  validate,
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rating, tags = [], tip = 0 } = req.body;
      const { visitId } = req.params;

      // Validate visit ownership and get doctor_id
      const { rows: [visit] } = await client.query(
        `SELECT doctor_id FROM visits
         WHERE id = $1 AND user_id = $2 AND status = 'completed'`,
        [visitId, req.user.sub]
      );
      if (!visit) {
        return res.status(404).json({ error: 'Visita no encontrada o aún no completada' });
      }

      // Insert review
      const { rows: [review] } = await client.query(
        `INSERT INTO reviews (visit_id, doctor_id, rating, tags, tip)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [visitId, visit.doctor_id, rating, tags, tip]
      );

      // Update doctor aggregate rating
      if (review) {
        await client.query(
          `UPDATE doctors
           SET rating = (rating * total_reviews + $2) / (total_reviews + 1),
               total_reviews = total_reviews + 1
           WHERE id = $1`,
          [visit.doctor_id, rating]
        );
      }

      // Update tip on payment if provided
      if (tip > 0) {
        await client.query(
          `UPDATE payments SET tip = $2, status = 'paid' WHERE visit_id = $1`,
          [visitId, tip]
        );
      }

      await client.query('COMMIT');

      if (review) {
        await logEvent(visitId, 'review_submitted', 'patient', req.user.sub, { rating });
      }

      res.status(201).json(review || { message: 'Ya existe una reseña para esta visita' });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

module.exports = router;
