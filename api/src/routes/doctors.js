const router = require('express').Router();
const { query, param, body, validationResult } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');
const { sendPushNotification } = require('../services/notifications');

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
}

// In dev, skip JWT so the mobile prototype works without a login flow
const devPassthrough = process.env.NODE_ENV !== 'production'
  ? (req, res, next) => next()
  : auth;

// Alias kept for readability at the nearby route
const nearbyAuth = devPassthrough;

// GET /doctors/nearby?lat=&lng=&radius_km=10
router.get('/nearby',
  nearbyAuth,
  query('lat').isFloat({ min: -90, max: 90 }),
  query('lng').isFloat({ min: -180, max: 180 }),
  query('radius_km').optional().isFloat({ min: 0.1, max: 50 }),
  validate,
  async (req, res, next) => {
    try {
      const userLat   = parseFloat(req.query.lat);
      const userLng   = parseFloat(req.query.lng);
      const radius_km = parseFloat(req.query.radius_km || 10);

      let { rows } = await pool.query(
        `SELECT
           id, name, specialty, cmp_license, experience_years,
           rating, total_reviews, is_available, latitude, longitude,
           ROUND((
             6371 * acos(LEAST(GREATEST(
               cos(radians($1)) * cos(radians(latitude)) *
               cos(radians(longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(latitude))
             , -1), 1))
           )::numeric, 2) AS distance_km
         FROM doctors
         WHERE is_available = TRUE AND latitude IS NOT NULL
           AND (6371 * acos(LEAST(GREATEST(
               cos(radians($1)) * cos(radians(latitude)) *
               cos(radians(longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(latitude))
           , -1), 1))) <= $3
         ORDER BY distance_km
         LIMIT 20`,
        [userLat, userLng, radius_km]
      );

      // Dev fallback: si no hay nadie en rango, devolver al Dr. Amilcar Marcano
      if (!rows.length && process.env.NODE_ENV !== 'production') {
        const { rows: fallback } = await pool.query(
          `SELECT id, name, specialty, cmp_license, experience_years,
                  rating, total_reviews, is_available, latitude, longitude,
                  0 AS distance_km
           FROM doctors
           WHERE name ILIKE '%Marcano%' AND is_available = TRUE
           LIMIT 1`
        );
        rows = fallback;
      }

      res.json(rows);
    } catch (err) { next(err); }
  }
);

// GET /doctors/:id
router.get('/:id',
  devPassthrough,
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT d.*,
           COALESCE(
             json_agg(
               json_build_object(
                 'id',           r.id,
                 'rating',       r.rating,
                 'tags',         r.tags,
                 'tip',          r.tip,
                 'created_at',   r.created_at,
                 'patient_name', vp.name
               )
               ORDER BY r.created_at DESC
             ) FILTER (WHERE r.id IS NOT NULL),
             '[]'
           ) AS recent_reviews
         FROM doctors d
         LEFT JOIN reviews r ON r.doctor_id = d.id
         LEFT JOIN visits rv ON rv.id = r.visit_id
         LEFT JOIN visit_patients vp ON vp.visit_id = rv.id
         WHERE d.id = $1
         GROUP BY d.id`,
        [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Doctor no encontrado' });
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// GET /doctors/:id/stats — performance stats (today, week, month)
router.get('/:id/stats',
  devPassthrough,
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { rows: [stats] } = await pool.query(
        `SELECT
           d.rating,
           d.total_reviews,
           (SELECT COUNT(*) FROM visits WHERE doctor_id = d.id AND status = 'completed')
             AS total_visits,
           (SELECT COUNT(*) FROM visits WHERE doctor_id = d.id AND status = 'completed'
             AND created_at >= CURRENT_DATE)
             AS today_visits,
           (SELECT COALESCE(SUM(p.amount), 0) FROM payments p
             JOIN visits v ON p.visit_id = v.id
             WHERE v.doctor_id = d.id AND v.status = 'completed'
             AND v.created_at >= CURRENT_DATE)
             AS today_earned,
           (SELECT COUNT(*) FROM visits WHERE doctor_id = d.id AND status = 'completed'
             AND created_at >= DATE_TRUNC('week', CURRENT_DATE))
             AS week_visits,
           (SELECT COALESCE(SUM(p.amount), 0) FROM payments p
             JOIN visits v ON p.visit_id = v.id
             WHERE v.doctor_id = d.id AND v.status = 'completed'
             AND v.created_at >= DATE_TRUNC('week', CURRENT_DATE))
             AS week_earned,
           (SELECT COALESCE(SUM(p.amount), 0) FROM payments p
             JOIN visits v ON p.visit_id = v.id
             WHERE v.doctor_id = d.id AND v.status = 'completed'
             AND v.created_at >= DATE_TRUNC('month', CURRENT_DATE))
             AS month_earned
         FROM doctors d
         WHERE d.id = $1`,
        [req.params.id]
      );
      if (!stats) return res.status(404).json({ error: 'Doctor no encontrado' });
      res.json(stats);
    } catch (err) { next(err); }
  }
);

// GET /doctors/:id/visits — completed visit history
router.get('/:id/visits',
  devPassthrough,
  param('id').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
  async (req, res, next) => {
    try {
      const limit  = parseInt(req.query.limit  || '50');
      const offset = parseInt(req.query.offset || '0');
      const { rows } = await pool.query(
        `SELECT v.id, v.status, v.address, v.created_at,
                vp.name AS patient_name, vp.age AS patient_age,
                r.rating,
                COALESCE(p.amount, 85) AS fee,
                ROUND(COALESCE(p.amount, 85) * 0.82, 2) AS net,
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
         LEFT JOIN visit_patients vp ON vp.visit_id = v.id
         LEFT JOIN reviews r ON r.visit_id = v.id
         LEFT JOIN payments p ON p.visit_id = v.id AND p.status = 'paid'
         WHERE v.doctor_id = $1 AND v.status = 'completed'
         ORDER BY v.created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.params.id, limit, offset]
      );
      res.json(rows);
    } catch (err) { next(err); }
  }
);

// PATCH /doctors/:id/availability  (internal / doctor app)
router.patch('/:id/availability',
  auth,
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { is_available, latitude, longitude } = req.body;
      const { rows } = await pool.query(
        `UPDATE doctors
         SET is_available = COALESCE($2, is_available),
             latitude     = COALESCE($3, latitude),
             longitude    = COALESCE($4, longitude)
         WHERE id = $1
         RETURNING id, name, is_available, latitude, longitude`,
        [req.params.id, is_available, latitude, longitude]
      );
      if (!rows.length) return res.status(404).json({ error: 'Doctor no encontrado' });
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// PATCH /doctors/:id/location — doctor app sends live GPS position
// Updates doctor coords, recalculates ETA for all active visits, fires push notification at 5 min
router.patch('/:id/location',
  auth,
  param('id').isUUID(),
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  validate,
  async (req, res, next) => {
    try {
      const docLat = parseFloat(req.body.latitude);
      const docLng = parseFloat(req.body.longitude);

      // Update doctor's location
      const { rows: docRows } = await pool.query(
        `UPDATE doctors SET latitude = $1, longitude = $2 WHERE id = $3 RETURNING id, name`,
        [docLat, docLng, req.params.id]
      );
      if (!docRows.length) return res.status(404).json({ error: 'Doctor no encontrado' });

      // Log location
      await pool.query(
        `INSERT INTO doctor_location_logs (doctor_id, latitude, longitude) VALUES ($1,$2,$3)`,
        [req.params.id, docLat, docLng]
      );

      // Find active visits for this doctor
      const { rows: visits } = await pool.query(
        `SELECT id, latitude AS patient_lat, longitude AS patient_lng,
                push_token, eta_minutes, status
         FROM visits
         WHERE doctor_id = $1 AND status IN ('matched','on_way')`,
        [req.params.id]
      );

      const updates = [];
      for (const visit of visits) {
        const patLat = parseFloat(visit.patient_lat);
        const patLng = parseFloat(visit.patient_lng);
        if (isNaN(patLat) || isNaN(patLng)) continue;

        const distKm = haversineKm(docLat, docLng, patLat, patLng);
        const newEta = Math.max(1, Math.round(distKm / 30 * 60 + 2));

        await pool.query(`UPDATE visits SET eta_minutes = $1 WHERE id = $2`, [newEta, visit.id]);

        // Push when crossing 5-minute threshold
        if (visit.push_token && newEta <= 5 && (visit.eta_minutes ?? 99) > 5) {
          await sendPushNotification(visit.push_token, {
            title: '🏠 Tu doctor está llegando',
            body: `El doctor llegará en aproximadamente ${newEta} minuto${newEta === 1 ? '' : 's'}. ¡Prepárate!`,
            data: { visitId: visit.id, type: 'doctor_arriving', eta: newEta },
          });
        }
        updates.push({ visitId: visit.id, eta_minutes: newEta, distance_km: Math.round(distKm * 100) / 100 });
      }

      res.json({ doctor: docRows[0].name, updated_visits: updates.length, visits: updates });
    } catch (err) { next(err); }
  }
);

module.exports = router;
