const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { sendEmail, welcomeDoctorHtml, rejectedDoctorHtml } = require('../services/email');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Real-time presence memory store
const viewersStr = {}; // { [target_id]: { [admin_id]: { name, last_ping } } }
setInterval(() => {
  const now = Date.now();
  for (const tid in viewersStr) {
    for (const aid in viewersStr[tid]) {
      if (now - viewersStr[tid][aid].last_ping > 20000) delete viewersStr[tid][aid];
    }
    if (Object.keys(viewersStr[tid]).length === 0) delete viewersStr[tid];
  }
}, 15000);

/** ── Audit Log Helper ─────────────────────────────────── */
async function logAction(adminId, action, targetType, targetId, details) {
  try {
    await pool.query(
      'INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
      [adminId, action, targetType, targetId, details ? JSON.stringify(details) : null]
    );
  } catch (err) { console.error('Audit Log Error:', err); }
}

/** ── Auth Middleware ──────────────────────────────────── */
async function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows: [admin] } = await pool.query('SELECT * FROM admins WHERE id = $1', [decoded.id]);
    if (!admin || !admin.is_active) return res.status(403).json({ error: 'Acceso denegado.' });
    req.admin = admin;
    next();
  } catch (err) { return res.status(403).json({ error: 'Token inválido.' }); }
}

const hasPermission = (moduleName) => {
  return (req, res, next) => {
    if (req.admin.is_root || req.admin.role === 'admin') return next();
    if ((req.admin.permissions || []).includes(moduleName)) return next();
    return res.status(403).json({ error: `Sin permiso para: ${moduleName}` });
  };
};

/** ── Admin Login ──────────────────────────────────────── */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows: [admin] } = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) return res.status(401).json({ error: 'Inválido.' });
    if (!admin.is_active) return res.status(403).json({ error: 'Inactivo.' });

    const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role, is_root: admin.is_root }, JWT_SECRET, { expiresIn: '12h' });
    await pool.query('UPDATE admins SET last_login = NOW() WHERE id = $1', [admin.id]);
    await logAction(admin.id, 'login', 'admin', admin.id);
    res.json({ token, admin: { id: admin.id, username: admin.username, name: admin.name, role: admin.role, permissions: admin.permissions, is_root: admin.is_root } });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── Profile Management ────────────────────────────────── */
router.get('/me', adminAuth, async (req, res) => {
  const { password_hash, ...safeUser } = req.admin;
  res.json(safeUser);
});

router.put('/me', adminAuth, async (req, res) => {
  const { name, password } = req.body;
  try {
    const updates = [];
    const params = [];
    if (name) { params.push(name); updates.push(`name = $${params.length}`); }
    if (password) {
      const hash = await bcrypt.hash(password, 12);
      params.push(hash);
      updates.push(`password_hash = $${params.length}`);
    }
    if (updates.length === 0) return res.json({ message: 'Sin cambios.' });
    params.push(req.admin.id);
    await pool.query(`UPDATE admins SET ${updates.join(', ')} WHERE id = $${params.length}`, params);
    res.json({ message: 'Ok.' });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── Audit Logs ────────────────────────────────────────── */
router.get('/logs', adminAuth, hasPermission('management'), async (req, res) => {
  const { page = 1, limit = 50, dateFrom, dateTo, search } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (dateFrom) { params.push(dateFrom); where += ` AND l.created_at >= $${params.length}`; }
  if (dateTo) { params.push(dateTo); where += ` AND l.created_at <= $${params.length}::date + interval '1 day'`; }
  if (search) {
    params.push(`%${search}%`);
    where += ` AND (l.action ILIKE $${params.length} OR l.details::text ILIKE $${params.length} OR a.name ILIKE $${params.length})`;
  }

  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM admin_audit_logs l JOIN admins a ON l.admin_id = a.id ${where}`, params);
    const total = parseInt(countRes.rows[0].count);
    params.push(parseInt(limit), parseInt(offset));
    const { rows } = await pool.query(`
            SELECT l.*, a.name as admin_name, a.username as admin_username
            FROM admin_audit_logs l
            JOIN admins a ON l.admin_id = a.id
            ${where}
            ORDER BY l.created_at DESC
            LIMIT $${params.length - 1} OFFSET $${params.length}
        `, params);
    res.json({ rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── User Management ──────────────────────────────────── */
router.get('/users', adminAuth, hasPermission('management'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, username, name, role, permissions, is_active, is_root, last_login FROM admins ORDER BY is_root DESC, created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.post('/users', adminAuth, hasPermission('management'), async (req, res) => {
  const { username, password, name, role, permissions } = req.body;
  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows: [newUser] } = await pool.query('INSERT INTO admins (username, password_hash, name, role, permissions, is_active, is_root) VALUES ($1, $2, $3, $4, $5, true, false) RETURNING id', [username, hash, name, role, JSON.stringify(permissions || [])]);
    res.json({ message: 'Ok' });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.get('/users/:id', adminAuth, hasPermission('management'), async (req, res) => {
  try {
    const { rows: [user] } = await pool.query('SELECT id, username, name, role, permissions, is_active, is_root, last_login, created_at FROM admins WHERE id = $1', [req.params.id]);
    if (!user) return res.status(404).json({ error: '404' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.get('/users/:id/logs', adminAuth, hasPermission('management'), async (req, res) => {
  try {
    const { rows } = await pool.query(`
            SELECT l.*, a.name as admin_name, a.username as admin_username
            FROM admin_audit_logs l
            JOIN admins a ON l.admin_id = a.id
            WHERE l.admin_id = $1
            ORDER BY l.created_at DESC
            LIMIT 100
        `, [req.params.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.post('/users/:id/reset-password', adminAuth, hasPermission('management'), async (req, res) => {
  const { id } = req.params;
  const { newPassword, adminPassword } = req.body;
  try {
    const isAuth = await bcrypt.compare(adminPassword, req.admin.password_hash);
    if (!isAuth) return res.status(403).json({ error: 'Firma incorrecta.' });
    const newHash = await bcrypt.hash(newPassword, 12);
    const { rowCount } = await pool.query('UPDATE admins SET password_hash = $1 WHERE id = $2 AND is_root = false', [newHash, id]);
    if (rowCount === 0) return res.status(404).json({ error: '404' });
    await logAction(req.admin.id, 'reset_user_password', 'admin', id, { auth_user: req.admin.username });
    res.json({ message: 'Ok' });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.post('/users/:id/toggle', adminAuth, hasPermission('management'), async (req, res) => {
  try {
    const { rows: [target] } = await pool.query('SELECT is_root FROM admins WHERE id = $1', [req.params.id]);
    if (!target || target.is_root) return res.status(403).json({ error: 'Inmune' });
    const { rows: [updated] } = await pool.query('UPDATE admins SET is_active = NOT is_active WHERE id = $1 RETURNING is_active', [req.params.id]);
    await logAction(req.admin.id, 'toggle_user_status', 'admin', req.params.id, { new_status: updated.is_active });
    res.json({ message: 'Ok', is_active: updated.is_active });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── Specialized Modules ───────────────────────────── */
router.get('/stats', adminAuth, hasPermission('overview'), async (req, res) => {
  try {
    const apps = await pool.query('SELECT status, count(*) as count FROM doctor_applications GROUP BY status');
    const finance = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total_billed, COALESCE(SUM(amount * 0.20), 0) as commissions FROM payments WHERE status IN ('confirmed', 'paid')`);
    const growth = await pool.query(`SELECT TO_CHAR(created_at, 'DD/MM') as date, COUNT(*) as visits FROM visits WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY TO_CHAR(created_at, 'DD/MM'), date ORDER BY MIN(created_at)`);
    const daily = await pool.query(`SELECT COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as new_today, COUNT(*) FILTER (WHERE reviewed_at >= CURRENT_DATE AND status = 'approved') as approved_today, COUNT(*) FILTER (WHERE reviewed_at >= CURRENT_DATE AND status = 'rejected') as rejected_today FROM doctor_applications`);
    res.json({ applications: apps.rows.reduce((a, r) => ({ ...a, [r.status]: parseInt(r.count) }), { pending: 0, approved: 0, rejected: 0 }), finance: { total_billed: parseFloat(finance.rows[0].total_billed), commissions: parseFloat(finance.rows[0].commissions), profit: parseFloat(finance.rows[0].commissions) * 0.8 }, growth: growth.rows, daily: daily.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.get('/applications', adminAuth, hasPermission('apps'), async (req, res) => {
  const { status, dateFrom } = req.query;
  let query = 'SELECT * FROM doctor_applications WHERE 1=1';
  const params = [];
  if (status) { params.push(status); query += ` AND status = $${params.length}`; }
  if (dateFrom) { params.push(dateFrom); query += ` AND created_at >= $${params.length}`; }
  query += ' ORDER BY created_at DESC';
  try {
    const { rows } = await pool.query(query, params);
    const dRes = await pool.query(`SELECT COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as new_today, COUNT(*) FILTER (WHERE reviewed_at >= CURRENT_DATE AND status = 'approved') as approved_today, COUNT(*) FILTER (WHERE reviewed_at >= CURRENT_DATE AND status = 'rejected') as rejected_today FROM doctor_applications`);
    res.json({ rows, daily: dRes.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.get('/applications/:id', adminAuth, hasPermission('apps'), async (req, res) => {
  try {
    const { rows: [app] } = await pool.query('SELECT * FROM doctor_applications WHERE id = $1', [req.params.id]);
    if (!app) return res.status(404).json({ error: '404' });
    await logAction(req.admin.id, 'observing_application', 'doctor_application', req.params.id);
    res.json(app);
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.get('/applications/:id/history', adminAuth, async (req, res) => {
  if (req.admin.role !== 'admin' && !req.admin.is_root) return res.status(403).json({ error: '403' });
  try { const { rows } = await pool.query(`SELECT h.*, a.name as admin_name FROM admin_audit_logs h JOIN admins a ON h.admin_id = a.id WHERE h.target_type = 'doctor_application' AND h.target_id = $1 ORDER BY h.created_at DESC`, [req.params.id]); res.json(rows); }
  catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.post('/applications/:id/ping', adminAuth, (req, res) => {
  const tid = req.params.id;
  const aid = req.admin.id;
  if (!viewersStr[tid]) viewersStr[tid] = {};
  viewersStr[tid][aid] = { name: req.admin.name, last_ping: Date.now() };
  res.sendStatus(204);
});

router.get('/applications/:id/viewers', adminAuth, (req, res) => {
  const tid = req.params.id;
  const list = viewersStr[tid] ? Object.values(viewersStr[tid]) : [];
  res.json(list);
});
router.post('/applications/:id/log-step', adminAuth, hasPermission('apps'), async (req, res) => {
  const { step } = req.body;
  const action = 'step_' + step;
  try {
    const { rows: [exists] } = await pool.query('SELECT id FROM admin_audit_logs WHERE target_id = $1 AND action = $2', [req.params.id, action]);
    if (exists) {
      await pool.query('DELETE FROM admin_audit_logs WHERE target_id = $1 AND action = $2', [req.params.id, action]);
      return res.json({ message: 'Removed' });
    }
    await logAction(req.admin.id, action, 'doctor_application', req.params.id);
    res.json({ message: 'Added' });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.post('/applications/:id/:action', adminAuth, hasPermission('apps'), async (req, res) => {
  const { id, action } = req.params;
  const { reason } = req.body;
  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  try {
    const { rows: [app] } = await pool.query('SELECT * FROM doctor_applications WHERE id = $1', [id]);
    if (!app) return res.status(404).json({ error: '404' });

    await pool.query('UPDATE doctor_applications SET status = $1, reviewed_at = NOW() WHERE id = $2', [newStatus, id]);

    if (action === 'approve') {
      // 1. Promote files to permanent storage
      const permanentDocs = {};
      const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

      for (const [key, url] of Object.entries(app.documents || {})) {
        if (!url) continue;
        try {
          // Extract source path from GCS URL
          const pathStart = url.indexOf(bucketName) + bucketName.length + 1;
          const sourcePath = decodeURIComponent(url.substring(pathStart));
          const extension = sourcePath.split('.').pop();
          const targetPath = `doctors/doc_${id}/${key}.${extension}`;

          permanentDocs[key] = await moveFile(sourcePath, targetPath);
        } catch (fileErr) {
          console.error(`Error promoting ${key}:`, fileErr);
          permanentDocs[key] = url; // Fallback to original URL if move fails
        }
      }

      // 2. Create the real doctor record (integrated PRO profile)
      const tempPass = Math.random().toString(36).slice(-8);
      const passHash = await bcrypt.hash(tempPass, 12);

      // UPSERT into doctors (if CMP exists, update fields)
      await pool.query(`
        INSERT INTO doctors 
          (name, email, phone, specialty, cmp_license, experience_years, districts, bio, university, documents,
           dni_number, birth_date, sub_specialty, work_slots, mobility_type, payment_method, payment_data,
           password_hash, is_active)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,true)
        ON CONFLICT (cmp_license) DO UPDATE SET
          name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, 
          specialty = EXCLUDED.specialty, experience_years = EXCLUDED.experience_years,
          districts = EXCLUDED.districts, bio = EXCLUDED.bio, university = EXCLUDED.university,
          documents = EXCLUDED.documents, dni_number = EXCLUDED.dni_number, birth_date = EXCLUDED.birth_date,
          sub_specialty = EXCLUDED.sub_specialty, work_slots = EXCLUDED.work_slots,
          mobility_type = EXCLUDED.mobility_type, payment_method = EXCLUDED.payment_method,
          payment_data = EXCLUDED.payment_data, is_active = true
      `, [
        app.name, app.email, app.phone, app.specialty, app.cmp_license, app.experience_years,
        app.districts, app.bio, app.university, permanentDocs,
        app.dni_number, app.birth_date, app.sub_specialty, app.work_slots, app.mobility_type,
        app.payment_method, app.payment_data, passHash
      ]);

      await sendEmail({
        to: app.email,
        subject: '¡Bienvenido/a a la red de Doctor House Pro!',
        html: welcomeDoctorHtml({ name: app.name, email: app.email, password: tempPass })
      });
      await logAction(req.admin.id, 'approve_application', 'doctor_application', id);
    } else {
      await sendEmail({
        to: app.email,
        subject: 'Actualización sobre tu solicitud - Doctor House',
        html: rejectedDoctorHtml({ name: app.name, reason: reason || 'No se proporcionó una razón específica.' })
      });
      await logAction(req.admin.id, 'reject_application', 'doctor_application', id, { reason });
    }

    res.json({ message: 'Ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error.' });
  }
});

router.get('/doctors', adminAuth, hasPermission('doctors'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM doctors ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.get('/doctors/:id', adminAuth, hasPermission('doctors'), async (req, res) => {
  try {
    const { rows: [doc] } = await pool.query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
    if (!doc) return res.status(404).json({ error: '404' });
    res.json(doc);
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.post('/doctors/:id/deactivate', adminAuth, hasPermission('doctors'), async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ error: 'Motivo requerido.' });

  try {
    const { rows: [doc] } = await pool.query('UPDATE doctors SET is_active = false WHERE id = $1 RETURNING id, name, email', [id]);
    if (!doc) return res.status(404).json({ error: '404' });

    await sendEmail({
      to: doc.email,
      subject: 'Aviso de seguridad: Tu cuenta ha sido desactivada',
      html: deactivatedDoctorHtml({ name: doc.name, reason })
    });

    await logAction(req.admin.id, 'deactivate_doctor', 'doctor', id, { reason });
    res.json({ message: 'Médico desactivado y notificado.' });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── Consultations ──────────────────────────────────────────── */

router.get('/consultations/stats', adminAuth, hasPermission('consultations'), async (req, res) => {
  const { date_from, date_to, user_id } = req.query;
  const params = [];
  let where = 'WHERE 1=1';
  if (date_from) { params.push(date_from); where += ` AND v.created_at >= $${params.length}::date`; }
  if (date_to)   { params.push(date_to);   where += ` AND v.created_at <  $${params.length}::date + interval '1 day'`; }
  if (user_id)   { params.push(user_id);   where += ` AND v.user_id = $${params.length}`; }
  try {
    const { rows: [s] } = await pool.query(`
      SELECT
        COUNT(*)                                                                         AS total,
        COUNT(*) FILTER (WHERE v.status IN ('pending','matched','on_way','arrived'))     AS active,
        COUNT(*) FILTER (WHERE v.status = 'completed')                                  AS completed,
        COUNT(*) FILTER (WHERE v.status = 'cancelled')                                  AS cancelled,
        COALESCE(SUM(p.amount) FILTER (WHERE p.pstatus IN ('confirmed','paid')), 0)     AS revenue
      FROM visits v
      LEFT JOIN LATERAL (
        SELECT amount, status AS pstatus FROM payments WHERE visit_id = v.id ORDER BY created_at DESC LIMIT 1
      ) p ON true
      ${where}
    `, params);
    res.json({
      total: parseInt(s.total), active: parseInt(s.active),
      completed: parseInt(s.completed), cancelled: parseInt(s.cancelled),
      revenue: parseFloat(s.revenue),
      period: date_from && date_to ? `${date_from} – ${date_to}` :
              date_from ? `Desde ${date_from}` : date_to ? `Hasta ${date_to}` : 'Todo el tiempo',
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error.' }); }
});

router.get('/consultations', adminAuth, hasPermission('consultations'), async (req, res) => {
  const { status, date_from, date_to, user_id, search, limit = 50, offset = 0 } = req.query;
  const params = [];
  let where = 'WHERE 1=1';
  if (status)    { params.push(status);    where += ` AND v.status = $${params.length}::visit_status`; }
  if (date_from) { params.push(date_from); where += ` AND v.created_at >= $${params.length}::date`; }
  if (date_to)   { params.push(date_to);   where += ` AND v.created_at <  $${params.length}::date + interval '1 day'`; }
  if (user_id)   { params.push(user_id);   where += ` AND v.user_id = $${params.length}`; }
  if (search) {
    params.push(`%${search}%`);
    where += ` AND (u.name ILIKE $${params.length} OR d.name ILIKE $${params.length})`;
  }
  try {
    const cntQ = await pool.query(
      `SELECT COUNT(*) FROM visits v LEFT JOIN users u ON v.user_id = u.id LEFT JOIN doctors d ON v.doctor_id = d.id ${where}`,
      params
    );
    params.push(parseInt(limit), parseInt(offset));
    const { rows } = await pool.query(`
      SELECT
        v.id, v.status, v.urgency, v.service_type, v.address, v.created_at, v.cancel_reason, v.eta_minutes,
        COALESCE(vp.name, u.name) AS patient_name,
        vp.age                    AS patient_age,
        vp.age_group,
        u.phone                   AS patient_phone,
        u.id                      AS user_id,
        d.id                      AS doctor_id,
        d.name                    AS doctor_name,
        d.specialty,
        d.cmp_license,
        p.amount, p.tip,
        p.method                  AS payment_method,
        p.pstatus                 AS payment_status,
        r.rating,
        CASE WHEN cr.consultation_finished_at IS NOT NULL AND cr.consultation_started_at IS NOT NULL
          THEN ROUND(EXTRACT(EPOCH FROM (cr.consultation_finished_at - cr.consultation_started_at)) / 60)
          ELSE NULL END           AS duration_minutes
      FROM visits v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN doctors d ON v.doctor_id = d.id
      LEFT JOIN LATERAL (SELECT * FROM visit_patients WHERE visit_id = v.id LIMIT 1) vp ON true
      LEFT JOIN LATERAL (SELECT amount, tip, method, status AS pstatus FROM payments WHERE visit_id = v.id ORDER BY created_at DESC LIMIT 1) p ON true
      LEFT JOIN reviews r ON r.visit_id = v.id
      LEFT JOIN consultation_reports cr ON cr.visit_id = v.id
      ${where}
      ORDER BY v.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);
    res.json({ rows, total: parseInt(cntQ.rows[0].count), limit: parseInt(limit), offset: parseInt(offset) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error.' }); }
});

router.get('/consultations/:id', adminAuth, hasPermission('consultations'), async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: [v] } = await pool.query(`
      SELECT
        v.*,
        COALESCE(vp.name, u.name) AS patient_name,
        vp.age                    AS patient_age,
        vp.age_group,
        vp.medical_flags,
        vp.notes                  AS patient_notes,
        u.phone                   AS patient_phone,
        u.id                      AS user_id,
        d.name                    AS doctor_name,
        d.specialty,
        d.cmp_license,
        d.phone                   AS doctor_phone,
        p.amount, p.tip,
        p.method                  AS payment_method,
        p.pstatus                 AS payment_status,
        p.confirmed_at            AS payment_confirmed_at,
        r.rating,
        r.tags                    AS review_tags
      FROM visits v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN doctors d ON v.doctor_id = d.id
      LEFT JOIN LATERAL (SELECT * FROM visit_patients WHERE visit_id = v.id LIMIT 1) vp ON true
      LEFT JOIN LATERAL (SELECT amount, tip, method, status AS pstatus, confirmed_at FROM payments WHERE visit_id = v.id ORDER BY created_at DESC LIMIT 1) p ON true
      LEFT JOIN reviews r ON r.visit_id = v.id
      WHERE v.id = $1
    `, [id]);
    if (!v) return res.status(404).json({ error: 'Not found.' });

    const [symptomRows, [report], prescriptions, events] = await Promise.all([
      pool.query('SELECT symptom_code FROM visit_symptoms WHERE visit_id = $1', [id])
        .then(r => r.rows),
      pool.query(`
        SELECT *, CASE WHEN consultation_finished_at IS NOT NULL AND consultation_started_at IS NOT NULL
          THEN ROUND(EXTRACT(EPOCH FROM (consultation_finished_at - consultation_started_at)) / 60)
          ELSE NULL END AS duration_minutes
        FROM consultation_reports WHERE visit_id = $1`, [id])
        .then(r => r.rows),
      pool.query('SELECT * FROM prescriptions WHERE visit_id = $1 ORDER BY created_at', [id])
        .then(r => r.rows),
      pool.query(`
        SELECT ve.*, COALESCE(u.name, d.name) AS actor_name
        FROM visit_events ve
        LEFT JOIN users   u ON ve.actor_type = 'patient' AND ve.actor_id = u.id
        LEFT JOIN doctors d ON ve.actor_type = 'doctor'  AND ve.actor_id = d.id
        WHERE ve.visit_id = $1 ORDER BY ve.created_at ASC`, [id])
        .then(r => r.rows),
    ]);

    await logAction(req.admin.id, 'view_consultation', 'visit', id);
    res.json({
      ...v,
      symptoms: symptomRows.map(s => s.symptom_code),
      report: report || null,
      prescriptions,
      events,
      review: v.rating ? { rating: v.rating, tags: v.review_tags } : null,
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error.' }); }
});

// SPA fallback — serve admin/index.html for all unmatched GET routes
const nodePath = require('path');
const ADMIN_CSP = [
  "default-src 'none'",
  "script-src 'self' https://unpkg.com 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
].join('; ');

router.get('*', (req, res) => {
  res.setHeader('Content-Security-Policy', ADMIN_CSP);
  res.sendFile(nodePath.resolve(__dirname, '../../../web/admin/index.html'));
});

module.exports = router;
