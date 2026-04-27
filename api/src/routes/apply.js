/**
 * /apply — public doctor application endpoint.
 * No API-key or JWT required (submitted from the browser landing page).
 */
const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const multer = require('multer');
const { uploadToStorage } = require('../services/storage');
const { sendEmail, welcomeDoctorHtml, newApplicationHtml } = require('../services/email');

// Multer config: memory storage, max 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
}

function adminGuard(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Token de administrador inválido.' });
  }
  next();
}

// ── POST /apply/upload — upload a single document (public) ───────────
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo.' });

    const originalName = req.file.originalname;
    const extension = originalName.split('.').pop();
    const timestamp = Date.now();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
    const destination = `applications/${filename}`;

    const url = await uploadToStorage(req.file.buffer, destination, req.file.mimetype);

    res.json({ url, name: originalName });
  } catch (err) {
    console.error('[Upload] Error:', err);
    res.status(500).json({ error: 'Error al subir el archivo a la nube.' });
  }
});

// ── POST /apply — submit application (public) ─────────────────────────────
router.post('/',
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio.').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
  body('phone').trim().notEmpty().withMessage('El teléfono es obligatorio.').isLength({ min: 9, max: 20 }),
  body('specialty').trim().notEmpty().withMessage('La especialidad es obligatoria.').isLength({ max: 100 }),
  body('cmp_license').trim().notEmpty().withMessage('El número de CMP es obligatorio.').isLength({ max: 20 }),
  body('experience_years').isInt({ min: 0, max: 60 }).withMessage('Años de experiencia inválidos.'),
  body('districts').optional().isArray().withMessage('Distritos debe ser una lista.'),
  body('bio').optional().trim().isLength({ max: 2000 }),
  body('documents').optional().isObject().withMessage('Documents debe ser un objeto.'),
  validate,
  async (req, res, next) => {
    const {
      name, email, phone, specialty, cmp_license, experience_years,
      districts, bio, university, documents,
      dni_number, birth_date, sub_specialty, work_slots, mobility_type,
      payment_method, payment_data
    } = req.body;

    try {
      const { rows: [app] } = await pool.query(
        `INSERT INTO doctor_applications
           (name, email, phone, specialty, cmp_license, experience_years, districts, bio, university, documents,
            dni_number, birth_date, sub_specialty, work_slots, mobility_type, payment_method, payment_data)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING id, name, email, specialty, cmp_license, created_at`,
        [
          name, email, phone, specialty, cmp_license,
          parseInt(experience_years) || 0,
          districts || [],
          bio || null,
          university || null,
          documents || {},
          dni_number || null,
          birth_date || null,
          sub_specialty || null,
          work_slots || [],
          mobility_type || null,
          payment_method || null,
          payment_data || {}
        ]
      );

      // Notify admin team
      sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@doctorhouse.pe',
        subject: `Nueva solicitud de doctor — ${name} (CMP ${cmp_license})`,
        html: newApplicationHtml({ name, email, specialty, cmp: cmp_license, id: app.id }),
        text: `Nueva solicitud de doctor:\nNombre: ${name}\nEmail: ${email}\nEspecialidad: ${specialty}\nCMP: ${cmp_license}\nID: ${app.id}`,
      }).catch(() => { });

      res.status(201).json({
        id: app.id,
        message: 'Solicitud recibida. Revisaremos tu CMP y te contactaremos en las próximas 24–48 horas hábiles.',
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Ya existe una solicitud con este email o número de CMP.' });
      }
      next(err);
    }
  }
);

// ── GET /apply — list applications (admin) ────────────────────────────────
router.get('/', adminGuard, async (req, res, next) => {
  try {
    const status = req.query.status || 'pending';
    const { rows } = await pool.query(
      `SELECT id, name, email, phone, specialty, cmp_license, experience_years,
              districts, bio, university, status, created_at, reviewed_at, admin_notes, doctor_id
       FROM doctor_applications
       WHERE status = $1
       ORDER BY created_at DESC`,
      [status]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── GET /apply/:id — single application (admin) ───────────────────────────
router.get('/:id', adminGuard, param('id').isUUID(), validate, async (req, res, next) => {
  try {
    const { rows: [app] } = await pool.query(
      `SELECT * FROM doctor_applications WHERE id = $1`,
      [req.params.id]
    );
    if (!app) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    res.json(app);
  } catch (err) { next(err); }
});

// ── POST /apply/:id/approve — approve + create doctor account (admin) ─────
router.post('/:id/approve',
  adminGuard,
  param('id').isUUID(),
  body('admin_notes').optional().trim().isLength({ max: 1000 }),
  validate,
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: [app] } = await client.query(
        `SELECT * FROM doctor_applications WHERE id = $1 AND status = 'pending'`,
        [req.params.id]
      );
      if (!app) return res.status(404).json({ error: 'Solicitud no encontrada o ya procesada.' });

      // Generate temporary password (readable, 8 chars: 4 uppercase + 4 digits)
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const digits = '23456789';
      const rawPass = [0, 1, 2, 3].map(() => chars[Math.floor(Math.random() * chars.length)]).join('')
        + [0, 1, 2, 3].map(() => digits[Math.floor(Math.random() * digits.length)]).join('');
      const passwordHash = await bcrypt.hash(rawPass, 12);

      // Create doctor account
      const { rows: [doctor] } = await client.query(
        `INSERT INTO doctors
           (name, specialty, cmp_license, phone, experience_years,
            email, password_hash, districts, bio, university, force_password_change)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE)
         RETURNING id, name, email`,
        [
          app.name, app.specialty, app.cmp_license, app.phone,
          app.experience_years, app.email, passwordHash,
          app.districts || [], app.bio || null,
          app.university || null,
        ]
      );

      // Mark application approved
      await client.query(
        `UPDATE doctor_applications
         SET status = 'approved', doctor_id = $1, reviewed_at = NOW(),
             admin_notes = COALESCE($2, admin_notes)
         WHERE id = $3`,
        [doctor.id, req.body.admin_notes || null, app.id]
      );

      await client.query('COMMIT');

      // Send welcome email
      const emailSent = await sendEmail({
        to: doctor.email,
        subject: '¡Bienvenido/a a Doctor House! Tus credenciales de acceso',
        html: welcomeDoctorHtml({ name: doctor.name, email: doctor.email, password: rawPass }),
        text: `Bienvenido/a a Doctor House, ${doctor.name}.\n\nTus credenciales:\nEmail: ${doctor.email}\nContraseña temporal: ${rawPass}\n\nCambia tu contraseña al ingresar por primera vez.\n\nEquipo Doctor House`,
      });

      res.json({
        message: 'Doctor aprobado. Email de bienvenida enviado.',
        doctor_id: doctor.id,
        email: doctor.email,
        email_sent: emailSent !== null,
        // Only exposed in dev so admin can verify manually if SMTP is off
        ...(process.env.NODE_ENV !== 'production' && { temp_password: rawPass }),
      });
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Ya existe un doctor con este email o CMP.' });
      }
      next(err);
    } finally {
      client.release();
    }
  }
);

// ── POST /apply/:id/reject — reject application (admin) ──────────────────
router.post('/:id/reject',
  adminGuard,
  param('id').isUUID(),
  body('admin_notes').optional().trim().isLength({ max: 1000 }),
  validate,
  async (req, res, next) => {
    try {
      const { rows: [app] } = await pool.query(
        `UPDATE doctor_applications
         SET status = 'rejected', reviewed_at = NOW(),
             admin_notes = COALESCE($2, admin_notes)
         WHERE id = $1 AND status = 'pending'
         RETURNING id, name, email`,
        [req.params.id, req.body.admin_notes || null]
      );
      if (!app) return res.status(404).json({ error: 'Solicitud no encontrada o ya procesada.' });

      sendEmail({
        to: app.email,
        subject: 'Actualización sobre tu solicitud en Doctor House',
        html: `<p>Hola ${app.name},<br><br>Gracias por tu interés en Doctor House. Después de revisar tu solicitud, en esta oportunidad no podemos aprobar tu ingreso.<br><br>Si crees que hubo un error o tienes preguntas, escríbenos a <a href="mailto:medicos@doctorhouse.pe">medicos@doctorhouse.pe</a>.<br><br>Atentamente,<br>Equipo Doctor House</p>`,
        text: `Hola ${app.name},\n\nGracias por tu interés en Doctor House. En esta oportunidad no podemos aprobar tu solicitud.\n\nSi tienes preguntas, escríbenos a medicos@doctorhouse.pe.\n\nEquipo Doctor House`,
      }).catch(() => { });

      res.json({ message: 'Solicitud rechazada.', id: app.id });
    } catch (err) { next(err); }
  }
);

module.exports = router;
