const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /coupons/validate/:code
router.get('/validate/:code', auth, async (req, res, next) => {
  try {
    const { code } = req.params;
    const { rows: [coupon] } = await pool.query(
      `SELECT * FROM coupons 
       WHERE code = $1 AND is_active = TRUE 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR used_count < max_uses)`,
      [code.toUpperCase()]
    );

    if (!coupon) {
      return res.status(404).json({ error: 'Cupón no válido o expirado.' });
    }

    res.json({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.discount_value)
    });
  } catch (err) { next(err); }
});

module.exports = router;
