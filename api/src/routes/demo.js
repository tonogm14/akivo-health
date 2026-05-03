const router = require('express').Router();
const pool = require('../db');

// GET /demo/injectables
router.get('/injectables', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, price, requires_prescription
       FROM injectables
       WHERE is_active = TRUE
       ORDER BY name`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /demo/services
router.get('/services', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT slug, name, description, is_active, base_price
       FROM services ORDER BY base_price`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /demo/visits/:id/force-match
router.post('/visits/:id/force-match', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows: [doctor] } = await pool.query(
      "SELECT id FROM doctors WHERE is_available = TRUE LIMIT 1"
    );
    if (!doctor) return res.status(404).json({ error: 'No hay doctores disponibles para forzar match.' });

    await pool.query(
      "UPDATE visits SET doctor_id = $1, status = 'matched', matched_at = NOW(), eta_minutes = 15 WHERE id = $2",
      [doctor.id, id]
    );
    res.json({ success: true, doctor_id: doctor.id });
  } catch (err) { next(err); }
});

module.exports = router;
