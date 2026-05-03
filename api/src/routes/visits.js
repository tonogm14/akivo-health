const router = require('express').Router();
const { body, param, query, validationResult } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');
const { sendPushNotification } = require('../services/notifications');
const logEvent = require('../db/logEvent');

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

// POST /visits  — create a visit request
router.post('/',
  auth,
  body('urgency').isIn(['now', 'today', 'schedule']),
  body('address').notEmpty(),
  body('symptoms').isArray({ min: 1 }),
  body('patient.name').notEmpty(),
  body('patient.age_group').isIn(['baby', 'child', 'teen', 'adult', 'elder', 'other']),
  validate,
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        urgency, address, address_ref, latitude, longitude,
        scheduled_at, symptoms, patient,
        doctor_type = 'general', specialty_requested = null,
        push_token = null,
      } = req.body;

      // Assign nearest available doctor
      let doctorId = null;
      let etaMinutes = null;
      if (urgency !== 'schedule') {
        const userLat = parseFloat(latitude) || -12.0648;
        const userLng = parseFloat(longitude) || -75.2111;
        const { rows: docs } = await client.query(
          `SELECT id, latitude, longitude,
             (6371 * acos(LEAST(GREATEST(
               cos(radians($1)) * cos(radians(latitude)) *
               cos(radians(longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(latitude))
             , -1), 1))) AS dist_km
           FROM doctors
           WHERE is_available = TRUE AND latitude IS NOT NULL
             AND id NOT IN (
               SELECT doctor_id FROM visits
               WHERE doctor_id IS NOT NULL
                 AND status NOT IN ('completed', 'cancelled')
                 AND scheduled_at BETWEEN NOW() AND NOW() + INTERVAL '60 minutes'
             )
             AND (6371 * acos(LEAST(GREATEST(
               cos(radians($1)) * cos(radians(latitude)) *
               cos(radians(longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(latitude))
             , -1), 1))) <= 10
           ORDER BY dist_km
           LIMIT 1`,
          [userLat, userLng]
        );
        let doc = docs[0];

        // DEMO fallback: assign to the dev doctor so the doctor app can receive the request
        if (!doc && process.env.NODE_ENV !== 'production') {
          const DEV_DOCTOR_ID = '608ba0ed-10f6-4370-ab78-104b0bce02bb';
          const { rows: fallback } = await client.query(
            `SELECT id, latitude, longitude FROM doctors
             WHERE id = $1
             LIMIT 1`,
            [DEV_DOCTOR_ID]
          );
          if (!fallback[0]) {
            const { rows: marcano } = await client.query(
              `SELECT id, latitude, longitude FROM doctors
               WHERE name ILIKE '%Marcano%' LIMIT 1`
            );
            doc = marcano[0];
          } else {
            doc = fallback[0];
          }
        }

        if (doc) {
          doctorId = doc.id;
          // rough ETA: distance/30 km/h * 60 + base 10 min
          const distKm = Math.sqrt(
            Math.pow((doc.latitude  - userLat) * 111, 2) +
            Math.pow((doc.longitude - userLng) * 85,  2)
          );
          etaMinutes = Math.round(distKm / 30 * 60 + 10);
        }
      }

      const status = doctorId ? 'matched' : 'unmatch';

      // Create visit
      const { rows: [visit] } = await client.query(
        `INSERT INTO visits
           (user_id, doctor_id, status, urgency, address, address_ref,
            latitude, longitude, scheduled_at, eta_minutes,
            doctor_type, specialty_requested, push_token, price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *`,
        [
          req.user.sub, doctorId, status, urgency, address, address_ref || null,
          latitude || null, longitude || null,
          scheduled_at || null, etaMinutes,
          doctor_type, specialty_requested || null,
          push_token || null,
          req.body.price || 120.00,
        ]
      );

      // Symptoms
      for (const code of symptoms) {
        await client.query(
          `INSERT INTO visit_symptoms (visit_id, symptom_code) VALUES ($1,$2)`,
          [visit.id, code]
        );
      }

      // Patient
      await client.query(
        `INSERT INTO visit_patients
           (visit_id, name, age_group, age, medical_flags, notes, document, has_meds, med_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          visit.id, patient.name, patient.age_group,
          patient.age ? parseInt(patient.age, 10) : null,
          patient.flags || [], patient.notes || null,
          patient.document || null,
          patient.has_meds === true,
          patient.med_name || null,
        ]
      );

      // Doctor availability is updated when they accept (PATCH status → on_way)

      await client.query('COMMIT');

      // Log visit creation events
      await logEvent(visit.id, 'visit_requested', 'patient', req.user.sub, {
        urgency: visit.urgency,
        service_type: visit.service_type || null,
        address: visit.address,
      });
      if (doctorId) {
        await logEvent(visit.id, 'doctor_assigned', 'system', null, {
          doctor_id: doctorId,
          eta_minutes: etaMinutes,
        });
      }

      // Return full visit with doctor info
      const { rows: [full] } = await pool.query(
        `SELECT v.*,
           row_to_json(d) AS doctor,
           json_agg(vs.symptom_code) AS symptoms,
           row_to_json(vp) AS patient
         FROM visits v
         LEFT JOIN doctors d       ON d.id = v.doctor_id
         LEFT JOIN visit_symptoms vs ON vs.visit_id = v.id
         LEFT JOIN visit_patients vp ON vp.visit_id = v.id
         WHERE v.id = $1
         GROUP BY v.id, d.id, vp.id`,
        [visit.id]
      );

      // Broadcast to admin SSE stream
      try {
        const adminRouter = require('./admin');
        if (adminRouter.broadcastEvent) {
          adminRouter.broadcastEvent({ type: 'visit_created', visitId: visit.id, urgency: visit.urgency, ts: Date.now(), message: `Nueva visita ${visit.id} · urgencia ${visit.urgency}` });
        }
      } catch {}

      res.status(201).json(full);
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

// GET /visits/pending-for-doctor/:doctorId — doctor app polls for incoming requests
// No auth required in dev so the doctor prototype works without login
const devPassthrough = process.env.NODE_ENV !== 'production'
  ? (req, res, next) => next()
  : auth;

router.get('/pending-for-doctor/:doctorId',
  devPassthrough,
  param('doctorId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT v.id, v.status, v.urgency, v.address, v.address_ref,
                v.latitude, v.longitude, v.eta_minutes, v.created_at,
                row_to_json(vp) AS patient,
                COALESCE(json_agg(vs.symptom_code) FILTER (WHERE vs.symptom_code IS NOT NULL), '[]') AS symptoms
         FROM visits v
         LEFT JOIN visit_patients vp ON vp.visit_id = v.id
         LEFT JOIN visit_symptoms vs ON vs.visit_id = v.id
         WHERE v.doctor_id = $1 AND v.status = 'pending'
         GROUP BY v.id, vp.id
         ORDER BY v.created_at DESC
         LIMIT 5`,
        [req.params.doctorId]
      );
      res.json(rows);
    } catch (err) { next(err); }
  }
);

// GET /visits/:id/timeline — ordered event log for a visit
router.get('/:id/timeline', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, event_type, actor_type, actor_id, metadata, created_at
       FROM visit_events
       WHERE visit_id = $1
       ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /visits/:id
router.get('/:id',
  auth,
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT v.*,
           row_to_json(d)  AS doctor,
           row_to_json(vp) AS patient,
           row_to_json(p)  AS payment,
           COALESCE(
             (SELECT json_agg(vs.symptom_code) FROM visit_symptoms vs WHERE vs.visit_id = v.id),
             '[]'
           ) AS symptoms
         FROM visits v
         LEFT JOIN doctors d         ON d.id = v.doctor_id
         LEFT JOIN visit_patients vp ON vp.visit_id = v.id
         LEFT JOIN payments p        ON p.visit_id = v.id
         WHERE v.id = $1 AND v.user_id = $2`,
        [req.params.id, req.user.sub]
      );
      if (!rows.length) return res.status(404).json({ error: 'Visita no encontrada' });
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// GET /visits  — user's visit history
router.get('/',
  auth,
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT v.id, v.status, v.urgency, v.address, v.created_at,
           v.scheduled_at, v.price, v.eta_minutes,
           d.name AS doctor_name, d.specialty AS doctor_specialty, d.rating AS doctor_rating,
           row_to_json(vp) AS patient,
           COALESCE(
             (SELECT json_agg(vs.symptom_code) FROM visit_symptoms vs WHERE vs.visit_id = v.id),
             '[]'
           ) AS symptoms
         FROM visits v
         LEFT JOIN doctors d ON d.id = v.doctor_id
         LEFT JOIN visit_patients vp ON vp.visit_id = v.id
         WHERE v.user_id = $1
         ORDER BY v.created_at DESC
         LIMIT 50`,
        [req.user.sub]
      );
      res.json(rows);
    } catch (err) { next(err); }
  }
);

// PATCH /visits/:id/status  — update visit status (doctor app / internal)
router.patch('/:id/status',
  auth,
  param('id').isUUID(),
  body('status').isIn(['matched', 'on_way', 'arrived', 'in_consultation', 'completed', 'cancelled']),
  validate,
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { status, cancel_reason } = req.body;
      let finalStatus = status;

      const { rows: [old] } = await client.query("SELECT status, doctor_id FROM visits WHERE id = $1", [req.params.id]);
      if (!old) return res.status(404).json({ error: 'Visita no encontrada' });

      // If doctor is being assigned, set status to matched
      if (status === 'matched' || (status === 'on_way' && !old.doctor_id)) {
        finalStatus = 'matched';
      }

      const { rows } = await client.query(
        `UPDATE visits 
         SET status = $1, 
             cancel_reason = COALESCE($2, cancel_reason),
             matched_at = CASE WHEN $1 = 'matched' AND matched_at IS NULL THEN NOW() ELSE matched_at END
         WHERE id = $3
         RETURNING *`,
        [finalStatus, cancel_reason || null, req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Visita no encontrada' });

      const visit = rows[0];

      // Doctor accepted — mark unavailable and notify patient
      if (status === 'on_way' && visit.doctor_id) {
        await client.query(
          `UPDATE doctors SET is_available = FALSE WHERE id = $1`,
          [visit.doctor_id]
        );
        if (visit.push_token) {
          await sendPushNotification(visit.push_token, {
            title: '🏠 Doctor en camino',
            body: 'Tu doctor aceptó la solicitud y está en camino hacia ti.',
            data: { visitId: visit.id, type: 'doctor_accepted' },
          });
        }
      }

      // Visit ended — free doctor
      if (['completed', 'cancelled'].includes(status) && visit.doctor_id) {
        await client.query(
          `UPDATE doctors SET is_available = TRUE WHERE id = $1`,
          [visit.doctor_id]
        );
        // Notify patient to review after completed visit
        if (status === 'completed' && visit.push_token) {
          await sendPushNotification(visit.push_token, {
            title: '⭐ ¿Cómo estuvo tu visita?',
            body: 'La visita terminó. Cuéntanos cómo te fue con tu doctor.',
            data: { visitId: visit.id, type: 'visit_completed' },
          });
        }
      }

      await client.query('COMMIT');

      // Log status-change events
      const actorId = visit.doctor_id || null;
      if (status === 'on_way') {
        await logEvent(visit.id, 'doctor_accepted', 'doctor', actorId, { eta_minutes: visit.eta_minutes });
      } else if (status === 'arrived') {
        await logEvent(visit.id, 'doctor_arrived', 'doctor', actorId, {});
      } else if (status === 'in_consultation') {
        await logEvent(visit.id, 'consultation_started', 'doctor', actorId, {});
      } else if (status === 'completed') {
        await logEvent(visit.id, 'visit_completed', 'doctor', actorId, { fee: visit.fee || null });
      } else if (status === 'cancelled') {
        await logEvent(visit.id, 'doctor_rejected', 'doctor', actorId, { reason: cancel_reason || null });
      }

      res.json(visit);
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

// DELETE /visits/:id  — cancel
router.delete('/:id',
  auth,
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { cancel_reason } = req.body;
      const { rows: updateRows } = await pool.query(
        `UPDATE visits
         SET status = 'cancelled', cancel_fee = 15.00, cancel_reason = $2
         WHERE id = $1 AND user_id = $3 AND status NOT IN ('completed','cancelled')
         RETURNING id, cancel_fee`,
        [req.params.id, cancel_reason || null, req.user.sub]
      );
      if (!updateRows.length) return res.status(404).json({ error: 'Visita no encontrada o ya finalizada' });

      // Free doctor
      await pool.query(
        `UPDATE doctors d SET is_available = TRUE
         FROM visits v WHERE v.id = $1 AND d.id = v.doctor_id`,
        [req.params.id]
      );

      // Fetch full visit to return to client
      const { rows: [fullVisit] } = await pool.query(
        `SELECT v.*,
           d.name AS doctor_name, d.specialty AS doctor_specialty, d.cmp_license AS doctor_cmp, d.experience_years AS doctor_exp,
           row_to_json(vp) AS patient,
           COALESCE(
             (SELECT json_agg(vs.symptom_code) FROM visit_symptoms vs WHERE vs.visit_id = v.id),
             '[]'
           ) AS symptoms
         FROM visits v
         LEFT JOIN doctors d         ON d.id = v.doctor_id
         LEFT JOIN visit_patients vp ON vp.visit_id = v.id
         WHERE v.id = $1`,
        [req.params.id]
      );

      await logEvent(fullVisit.id, 'visit_cancelled', 'patient', req.user.sub, {
        reason: cancel_reason || null,
        cancel_fee: updateRows[0].cancel_fee,
      });

      res.json(fullVisit);
    } catch (err) { next(err); }
  }
);

// GET /visits/:id/eta  — patient polls doctor's current GPS-based ETA
router.get('/:id/eta',
  auth,
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT v.id, v.eta_minutes, v.status,
                v.latitude  AS patient_lat,  v.longitude  AS patient_lng,
                d.latitude  AS doctor_lat,   d.longitude  AS doctor_lng,
                d.name AS doctor_name
         FROM visits v
         LEFT JOIN doctors d ON d.id = v.doctor_id
         WHERE v.id = $1 AND v.user_id = $2`,
        [req.params.id, req.user.sub]
      );
      if (!rows.length) return res.status(404).json({ error: 'Visita no encontrada' });
      const r = rows[0];

      let eta_minutes = r.eta_minutes;
      let distance_km = null;
      if (r.doctor_lat && r.doctor_lng && r.patient_lat && r.patient_lng) {
        distance_km = haversineKm(
          parseFloat(r.doctor_lat), parseFloat(r.doctor_lng),
          parseFloat(r.patient_lat), parseFloat(r.patient_lng)
        );
        eta_minutes = Math.max(1, Math.round(distance_km / 30 * 60 + 2));
        distance_km = Math.round(distance_km * 100) / 100;
      }

      res.json({
        eta_minutes,
        distance_km,
        status:     r.status,
        doctor_name: r.doctor_name,
        doctor_lat: r.doctor_lat  ? parseFloat(r.doctor_lat)  : null,
        doctor_lng: r.doctor_lng  ? parseFloat(r.doctor_lng)  : null,
      });
    } catch (err) { next(err); }
  }
);

// PATCH /visits/:id/doctor-location  — doctor app sends GPS update
// Recalculates ETA and triggers push notification when crossing 5-min threshold
router.patch('/:id/doctor-location',
  auth,
  param('id').isUUID(),
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  validate,
  async (req, res, next) => {
    try {
      const { latitude, longitude } = req.body;
      const docLat = parseFloat(latitude);
      const docLng = parseFloat(longitude);

      const { rows } = await pool.query(
        `SELECT v.id, v.status, v.push_token, v.eta_minutes,
                v.latitude AS patient_lat, v.longitude AS patient_lng,
                v.doctor_id
         FROM visits v
         WHERE v.id = $1 AND v.status IN ('matched','on_way')`,
        [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Visita no encontrada o no activa' });
      const visit = rows[0];

      // Update doctor's live location
      await pool.query(
        `UPDATE doctors SET latitude = $1, longitude = $2 WHERE id = $3`,
        [docLat, docLng, visit.doctor_id]
      );
      await pool.query(
        `INSERT INTO doctor_location_logs (doctor_id, latitude, longitude) VALUES ($1,$2,$3)`,
        [visit.doctor_id, docLat, docLng]
      );

      // Recalculate ETA
      const patLat = parseFloat(visit.patient_lat);
      const patLng = parseFloat(visit.patient_lng);
      let newEta = visit.eta_minutes;
      let distKm = null;

      if (!isNaN(patLat) && !isNaN(patLng)) {
        distKm  = haversineKm(docLat, docLng, patLat, patLng);
        newEta  = Math.max(1, Math.round(distKm / 30 * 60 + 2));
        await pool.query(`UPDATE visits SET eta_minutes = $1 WHERE id = $2`, [newEta, visit.id]);
      }

      // Push notification when crossing the 5-minute threshold
      if (visit.push_token && newEta <= 5 && (visit.eta_minutes ?? 99) > 5) {
        await sendPushNotification(visit.push_token, {
          title: '🏠 Tu doctor está llegando',
          body: `Llegará en aproximadamente ${newEta} minuto${newEta === 1 ? '' : 's'}. ¡Prepárate!`,
          data: { visitId: visit.id, type: 'doctor_arriving', eta: newEta },
        });
      }

      res.json({
        eta_minutes: newEta,
        distance_km: distKm !== null ? Math.round(distKm * 100) / 100 : null,
      });
    } catch (err) { next(err); }
  }
);

// POST /visits/:id/report — save or update clinical consultation data
router.post('/:id/report', auth, async (req, res, next) => {
  try {
    const {
      temp, bp, hr, spo2, rr, weight,
      diagnosis, diagnosis_code, clinical_notes,
      consultation_started_at, consultation_finished_at
    } = req.body;

    // Parse bp "120/80" → systolic/diastolic
    let bp_systolic = null, bp_diastolic = null;
    if (bp && typeof bp === 'string' && bp.includes('/')) {
      const parts = bp.split('/');
      bp_systolic  = parseInt(parts[0]) || null;
      bp_diastolic = parseInt(parts[1]) || null;
    } else if (typeof bp === 'number') {
      bp_systolic = bp;
    }

    // Verify visit exists and doctor is assigned
    const { rows: [visit] } = await pool.query(
      'SELECT id, doctor_id, status FROM visits WHERE id = $1',
      [req.params.id]
    );
    if (!visit) return res.status(404).json({ error: 'Visita no encontrada.' });

    const { rows: [report] } = await pool.query(`
      INSERT INTO consultation_reports
        (visit_id, doctor_id, temp_c, bp_systolic, bp_diastolic, hr_bpm,
         spo2_pct, rr_rpm, weight_kg, diagnosis, diagnosis_code, clinical_notes,
         consultation_started_at, consultation_finished_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (visit_id) DO UPDATE SET
        temp_c = EXCLUDED.temp_c,
        bp_systolic = EXCLUDED.bp_systolic,
        bp_diastolic = EXCLUDED.bp_diastolic,
        hr_bpm = EXCLUDED.hr_bpm,
        spo2_pct = EXCLUDED.spo2_pct,
        rr_rpm = EXCLUDED.rr_rpm,
        weight_kg = EXCLUDED.weight_kg,
        diagnosis = EXCLUDED.diagnosis,
        diagnosis_code = EXCLUDED.diagnosis_code,
        clinical_notes = EXCLUDED.clinical_notes,
        consultation_started_at = COALESCE(consultation_reports.consultation_started_at, EXCLUDED.consultation_started_at),
        consultation_finished_at = EXCLUDED.consultation_finished_at,
        updated_at = NOW()
      RETURNING *
    `, [
      req.params.id, visit.doctor_id,
      temp || null, bp_systolic, bp_diastolic,
      hr ? parseInt(hr) : null,
      spo2 ? parseFloat(spo2) : null,
      rr ? parseInt(rr) : null,
      weight ? parseFloat(weight) : null,
      diagnosis || null, diagnosis_code || null, clinical_notes || null,
      consultation_started_at || null, consultation_finished_at || null
    ]);

    // Log events (if vitals present)
    if (temp || bp || hr) {
      await logEvent(req.params.id, 'vitals_recorded', 'doctor', visit.doctor_id, {
        temp, bp, hr, spo2, rr, weight
      });
    }
    if (diagnosis) {
      await logEvent(req.params.id, 'diagnosis_recorded', 'doctor', visit.doctor_id, {
        diagnosis: diagnosis?.substring(0, 100), diagnosis_code
      });
    }

    res.json(report);
  } catch (err) { next(err); }
});

// GET /visits/:id/report — retrieve clinical report for a visit
router.get('/:id/report', auth, async (req, res, next) => {
  try {
    const { rows: [report] } = await pool.query(
      'SELECT * FROM consultation_reports WHERE visit_id = $1',
      [req.params.id]
    );
    if (!report) return res.status(404).json({ error: 'No hay informe clínico para esta visita.' });
    res.json(report);
  } catch (err) { next(err); }
});

// POST /visits/:id/prescriptions — save prescriptions for a visit (replace strategy)
router.post('/:id/prescriptions', auth, async (req, res, next) => {
  try {
    const { prescriptions } = req.body; // array of { drug_name, dose, frequency, duration_days, instructions }
    if (!Array.isArray(prescriptions) || prescriptions.length === 0)
      return res.status(422).json({ error: 'Se requiere un array de prescripciones.' });

    const { rows: [visit] } = await pool.query(
      'SELECT id, doctor_id FROM visits WHERE id = $1', [req.params.id]
    );
    if (!visit) return res.status(404).json({ error: 'Visita no encontrada.' });

    // Delete existing prescriptions for this visit (replace strategy)
    await pool.query('DELETE FROM prescriptions WHERE visit_id = $1', [req.params.id]);

    const inserted = [];
    for (const rx of prescriptions) {
      const { rows: [row] } = await pool.query(`
        INSERT INTO prescriptions (visit_id, doctor_id, drug_name, dose, frequency, duration_days, instructions)
        VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
      `, [req.params.id, visit.doctor_id, rx.drug_name, rx.dose || null, rx.frequency || null,
          rx.duration_days ? parseInt(rx.duration_days) : null, rx.instructions || null]);
      inserted.push(row);
    }

    await logEvent(req.params.id, 'prescription_recorded', 'doctor', visit.doctor_id, {
      count: inserted.length,
      drugs: inserted.map(r => r.drug_name)
    });

    res.json(inserted);
  } catch (err) { next(err); }
});

// GET /visits/:id/prescriptions — retrieve prescriptions for a visit
router.get('/:id/prescriptions', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM prescriptions WHERE visit_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /visits/checkout — Atomic Create Visit + Register Payment
router.post('/checkout',
  auth,
  body('visit.urgency').isIn(['now', 'today', 'schedule']),
  body('visit.address').notEmpty(),
  body('visit.symptoms').isArray({ min: 1 }),
  body('payment.method').notEmpty(),
  validate,
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { visit: vData, payment: pData } = req.body;
      const {
        urgency, address, address_ref, latitude, longitude,
        scheduled_at, symptoms, patient,
        doctor_type = 'general', specialty_requested = null,
        push_token = null, price = 120.00
      } = vData;

      // 1. Assign nearest available doctor
      let doctorId = null;
      let etaMinutes = null;
      if (urgency !== 'schedule') {
        const userLat = parseFloat(latitude) || -12.0648;
        const userLng = parseFloat(longitude) || -75.2111;
        const { rows: docs } = await client.query(
          `SELECT id, latitude, longitude,
             (6371 * acos(LEAST(GREATEST(
               cos(radians($1)) * cos(radians(latitude)) *
               cos(radians(longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(latitude))
             , -1), 1))) AS dist_km
           FROM doctors
           WHERE is_available = TRUE AND latitude IS NOT NULL
             AND id NOT IN (
               SELECT doctor_id FROM visits
               WHERE doctor_id IS NOT NULL
                 AND status NOT IN ('completed', 'cancelled')
                 AND scheduled_at BETWEEN NOW() AND NOW() + INTERVAL '60 minutes'
             )
             AND (6371 * acos(LEAST(GREATEST(
               cos(radians($1)) * cos(radians(latitude)) *
               cos(radians(longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(latitude))
             , -1), 1))) <= 15
           ORDER BY dist_km
           LIMIT 1`,
          [userLat, userLng]
        );
        let doc = docs[0];
        if (!doc && process.env.NODE_ENV !== 'production') {
          const { rows: marcano } = await client.query(`SELECT id, latitude, longitude FROM doctors WHERE name ILIKE '%Marcano%' LIMIT 1`);
          doc = marcano[0];
        }
        if (doc) {
          doctorId = doc.id;
          const distKm = Math.sqrt(Math.pow((doc.latitude-userLat)*111,2) + Math.pow((doc.longitude-userLng)*85,2));
          etaMinutes = Math.round(distKm / 30 * 60 + 10);
        }
      }

      // 2. Create Visit
      const { rows: [visit] } = await client.query(
        `INSERT INTO visits
           (user_id, doctor_id, status, urgency, address, address_ref,
            latitude, longitude, scheduled_at, eta_minutes,
            doctor_type, specialty_requested, push_token, price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *`,
        [req.user.sub, doctorId, doctorId ? 'matched' : 'unmatch', urgency, address, address_ref || null,
         latitude || null, longitude || null, scheduled_at || null, etaMinutes,
         doctor_type, specialty_requested || null, push_token || null, price]
      );

      // 3. Symptoms
      for (const code of symptoms) {
        await client.query(`INSERT INTO visit_symptoms (visit_id, symptom_code) VALUES ($1,$2)`, [visit.id, code]);
      }

      // 4. Patient
      await client.query(
        `INSERT INTO visit_patients (visit_id, name, age_group, age, medical_flags, notes, document, has_meds, med_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          visit.id, patient.name, patient.age_group, 
          patient.age ? parseInt(patient.age, 10) : null, 
          patient.flags || [], patient.notes || null,
          patient.document || null,
          !!patient.has_meds,
          patient.med_name || null
        ]
      );

      // 5. Register Payment
      await client.query(
        `INSERT INTO payments (visit_id, method, amount, status, operation_code)
         VALUES ($1,$2,$3,$4,$5)`,
        [visit.id, pData.method, price, 'pending', pData.operation_code || null]
      );

      await client.query('COMMIT');
      await logEvent(visit.id, 'visit_requested', 'patient', req.user.sub, { urgency: visit.urgency, address: visit.address });
      
      const { rows: [full] } = await pool.query(
        `SELECT v.*, row_to_json(d) AS doctor, json_agg(vs.symptom_code) AS symptoms, row_to_json(vp) AS patient
         FROM visits v
         LEFT JOIN doctors d ON d.id = v.doctor_id
         LEFT JOIN visit_symptoms vs ON vs.visit_id = v.id
         LEFT JOIN visit_patients vp ON vp.visit_id = v.id
         WHERE v.id = $1 GROUP BY v.id, d.id, vp.id`,
        [visit.id]
      );
      res.status(201).json(full);
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

module.exports = router;
