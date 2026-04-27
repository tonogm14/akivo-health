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

module.exports = router;
