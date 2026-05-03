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
  const { id } = req.params;
  const { dateFrom, search } = req.query;
  try {
    let query = `
      SELECT l.*, a.name as admin_name, a.username as admin_username
      FROM admin_audit_logs l
      JOIN admins a ON l.admin_id = a.id
      WHERE l.admin_id = $1
    `;
    const params = [id];

    if (dateFrom) {
      params.push(dateFrom);
      query += ` AND l.created_at >= $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (l.action ILIKE $${params.length} OR l.target_type ILIKE $${params.length} OR CAST(l.metadata AS TEXT) ILIKE $${params.length})`;
    }

    query += ` ORDER BY l.created_at DESC LIMIT 200`;

    const { rows } = await pool.query(query, params);
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

router.get('/doctors/:id/stats', adminAuth, hasPermission('doctors'), async (req, res) => {
  try {
    const { rows: [stats] } = await pool.query(`
      SELECT
        COUNT(v.*)                                                        AS total_visits,
        COUNT(v.*) FILTER (WHERE v.status = 'completed')                 AS completed_visits,
        COUNT(v.*) FILTER (WHERE v.status = 'cancelled')                 AS cancelled_visits,
        ROUND(AVG(r.rating)::numeric, 2)                                 AS avg_rating,
        COUNT(r.*)                                                        AS total_reviews,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status IN ('confirmed','paid')), 0) AS total_revenue,
        ROUND(COALESCE(
          SUM(EXTRACT(EPOCH FROM (cr.consultation_finished_at - cr.consultation_started_at)) / 60)::numeric,
          0
        ) / 60, 1)                                                        AS total_hours
      FROM visits v
      LEFT JOIN reviews r ON r.visit_id = v.id
      LEFT JOIN LATERAL (
        SELECT amount, status FROM payments WHERE visit_id = v.id ORDER BY created_at DESC LIMIT 1
      ) p ON true
      LEFT JOIN consultation_reports cr ON cr.visit_id = v.id
      WHERE v.doctor_id = $1
    `, [req.params.id]);
    res.json(stats || {});
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

router.get('/consultations/:id/chat', adminAuth, hasPermission('consultations'), async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT cm.*,
        CASE WHEN cm.sender_type = 'patient' THEN COALESCE(u.name, 'Paciente') ELSE COALESCE(d.name, 'Médico') END AS sender_name
      FROM chat_messages cm
      LEFT JOIN users   u ON cm.sender_type = 'patient' AND cm.sender_id = u.id
      LEFT JOIN doctors d ON cm.sender_type = 'doctor'  AND cm.sender_id = d.id
      WHERE cm.visit_id = $1
      ORDER BY cm.created_at ASC
    `, [req.params.id]);
    await logAction(req.admin.id, 'view_chat', 'visit', req.params.id);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.get('/consultations/stats', adminAuth, hasPermission('consultations'), async (req, res) => {
  const { date_from, date_to, user_id } = req.query;
  const params = [];
  let where = 'WHERE 1=1';
  if (date_from) { params.push(date_from); where += ` AND v.created_at >= $${params.length}::date`; }
  if (date_to)   { params.push(date_to);   where += ` AND v.created_at <  $${params.length}::date + interval '1 day'`; }
  if (user_id)   { params.push(user_id);   where += ` AND v.user_id = $${params.length}`; }
  try {
    const [cntRes, revRes] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)                                                                                  AS total,
          COUNT(*) FILTER (WHERE v.status::text IN ('pending','matched','on_way','arrived'))        AS active,
          COUNT(*) FILTER (WHERE v.status::text = 'completed')                                     AS completed,
          COUNT(*) FILTER (WHERE v.status::text = 'cancelled')                                     AS cancelled
        FROM visits v ${where}
      `, params),
      pool.query(`
        SELECT COALESCE(SUM(p.amount), 0) AS revenue
        FROM payments p
        JOIN visits v ON p.visit_id = v.id
        WHERE p.status::text IN ('confirmed','paid') ${where.replace('WHERE 1=1', 'AND 1=1').replace('WHERE ', 'AND ')}
      `, params),
    ]);
    const s = cntRes.rows[0];
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

/** ── Patients ───────────────────────────────────────────── */

router.get('/patients', adminAuth, hasPermission('consultations'), async (req, res) => {
  const { search, limit = 100, offset = 0 } = req.query;
  const params = [];
  let where = 'WHERE 1=1';
  if (search) { params.push(`%${search}%`); where += ` AND (u.name ILIKE $${params.length} OR u.phone ILIKE $${params.length})`; }
  try {
    const cntRes = await pool.query(`SELECT COUNT(*) FROM users u ${where}`, params);
    params.push(parseInt(limit), parseInt(offset));
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.phone, u.created_at,
        (SELECT COUNT(*) FROM visits v WHERE v.user_id = u.id) AS visit_count
      FROM users u ${where}
      ORDER BY u.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);
    res.json({ rows, total: parseInt(cntRes.rows[0].count) });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── Patients ───────────────────────────────────────────── */

router.get('/patients/:id', adminAuth, hasPermission('consultations'), async (req, res) => {
  try {
    const { rows: [user] } = await pool.query(
      'SELECT id, name, phone, created_at, push_token IS NOT NULL AS has_push FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!user) return res.status(404).json({ error: '404' });

    const [{ rows: visits }, { rows: [agg] }] = await Promise.all([
      pool.query(`
        SELECT v.id, v.status, v.urgency, v.service_type, v.address, v.created_at,
          d.name AS doctor_name, d.specialty,
          p.amount, p.tip, p.method AS payment_method,
          r.rating
        FROM visits v
        LEFT JOIN doctors d ON v.doctor_id = d.id
        LEFT JOIN LATERAL (
          SELECT amount, tip, method FROM payments WHERE visit_id = v.id ORDER BY created_at DESC LIMIT 1
        ) p ON true
        LEFT JOIN reviews r ON r.visit_id = v.id
        WHERE v.user_id = $1
        ORDER BY v.created_at DESC
        LIMIT 50
      `, [req.params.id]),
      pool.query(`
        SELECT
          COUNT(*)                                                AS total,
          COUNT(*) FILTER (WHERE v.status = 'completed')         AS completed,
          COALESCE(SUM(p.amount + COALESCE(p.tip,0)), 0)         AS total_spent
        FROM visits v
        LEFT JOIN LATERAL (
          SELECT amount, tip FROM payments WHERE visit_id = v.id ORDER BY created_at DESC LIMIT 1
        ) p ON true
        WHERE v.user_id = $1
      `, [req.params.id]),
    ]);

    res.json({ ...user, visits, stats: agg });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── Payouts ────────────────────────────────────────────── */

router.get('/payouts', adminAuth, hasPermission('consultations'), async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.visit_id, p.amount, p.tip, p.method AS payment_method, p.status, p.created_at,
        u.name AS patient_name,
        d.name AS doctor_name
      FROM payments p
      LEFT JOIN visits v ON p.visit_id = v.id
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN doctors d ON v.doctor_id = d.id
      ORDER BY p.created_at DESC
      LIMIT 500
    `);
    const agg = await pool.query(`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE status IN ('confirmed','paid')), 0) AS total_collected,
        COALESCE(SUM(tip)    FILTER (WHERE status IN ('confirmed','paid')), 0) AS total_tips,
        COUNT(*) FILTER (WHERE status = 'pending')                             AS pending_count
      FROM payments
    `);
    res.json({ rows, summary: agg.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── Reviews ────────────────────────────────────────────── */

router.get('/reviews', adminAuth, hasPermission('consultations'), async (req, res) => {
  const { status, limit = 200, offset = 0 } = req.query;
  const params = [];
  let where = 'WHERE 1=1';
  if (status) { params.push(status); where += ` AND r.status = $${params.length}`; }
  try {
    params.push(parseInt(limit), parseInt(offset));
    const { rows } = await pool.query(`
      SELECT r.*,
        COALESCE(vp.name, u.name) AS patient_name,
        u.phone                   AS patient_phone,
        d.name                    AS doctor_name
      FROM reviews r
      JOIN visits v ON r.visit_id = v.id
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN doctors d ON r.doctor_id = d.id
      LEFT JOIN LATERAL (SELECT name FROM visit_patients WHERE visit_id = v.id LIMIT 1) vp ON true
      ${where}
      ORDER BY r.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);
    res.json({ rows });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.post('/reviews/:id/hide', adminAuth, hasPermission('consultations'), async (req, res) => {
  try {
    const { rows: [r] } = await pool.query(
      "UPDATE reviews SET status = 'hidden', moderated_by = $1, moderated_at = NOW() WHERE id = $2 RETURNING id",
      [req.admin.id, req.params.id]
    );
    if (!r) return res.status(404).json({ error: '404' });
    await logAction(req.admin.id, 'hide_review', 'review', req.params.id);
    res.json({ message: 'Reseña ocultada.' });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.post('/reviews/:id/restore', adminAuth, hasPermission('consultations'), async (req, res) => {
  try {
    const { rows: [r] } = await pool.query(
      "UPDATE reviews SET status = 'visible', moderated_by = $1, moderated_at = NOW() WHERE id = $2 RETURNING id",
      [req.admin.id, req.params.id]
    );
    if (!r) return res.status(404).json({ error: '404' });
    await logAction(req.admin.id, 'restore_review', 'review', req.params.id);
    res.json({ message: 'Reseña restaurada.' });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── Coupons ────────────────────────────────────────────── */

router.get('/coupons', adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ rows });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.post('/coupons', adminAuth, hasPermission('consultations'), async (req, res) => {
  const { code, description, discount_type, discount_value, max_uses, expires_at } = req.body;
  if (!code || !discount_value) return res.status(400).json({ error: 'code y discount_value requeridos.' });
  try {
    await pool.query(
      'INSERT INTO coupons (code, description, discount_type, discount_value, max_uses, expires_at, is_active) VALUES ($1,$2,$3,$4,$5,$6,true)',
      [code.toUpperCase(), description, discount_type || 'percentage', parseFloat(discount_value), max_uses || null, expires_at || null]
    );
    await logAction(req.admin.id, 'create_coupon', 'coupon', null, { code });
    res.json({ message: 'Ok' });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── Reports / Exports ──────────────────────────────────── */

router.get('/reports/export', adminAuth, hasPermission('consultations'), async (req, res) => {
  const { type = 'consultations', date_from, date_to } = req.query;
  const params = [];
  let where = 'WHERE 1=1';
  if (date_from) { params.push(date_from); where += ` AND v.created_at >= $${params.length}::date`; }
  if (date_to)   { params.push(date_to);   where += ` AND v.created_at <  $${params.length}::date + interval '1 day'`; }

  try {
    let rows, headers, filename;

    if (type === 'consultations') {
      ({ rows } = await pool.query(`
        SELECT
          v.id, v.status, v.urgency, v.service_type, v.address,
          TO_CHAR(v.created_at AT TIME ZONE 'America/Lima', 'YYYY-MM-DD HH24:MI') AS fecha,
          COALESCE(vp.name, u.name) AS paciente,
          u.phone AS telefono,
          d.name AS doctor,
          d.cmp_license AS cmp,
          p.amount, p.tip,
          p.method AS metodo_pago,
          p.status AS estado_pago,
          r.rating AS calificacion,
          v.cancel_reason AS motivo_cancelacion
        FROM visits v
        LEFT JOIN users u ON v.user_id = u.id
        LEFT JOIN doctors d ON v.doctor_id = d.id
        LEFT JOIN LATERAL (SELECT name FROM visit_patients WHERE visit_id = v.id LIMIT 1) vp ON true
        LEFT JOIN LATERAL (SELECT amount, tip, method, status FROM payments WHERE visit_id = v.id ORDER BY created_at DESC LIMIT 1) p ON true
        LEFT JOIN reviews r ON r.visit_id = v.id
        ${where}
        ORDER BY v.created_at DESC
        LIMIT 5000
      `, params));
      headers = ['id','status','urgency','service_type','address','fecha','paciente','telefono','doctor','cmp','amount','tip','metodo_pago','estado_pago','calificacion','motivo_cancelacion'];
      filename = 'consultas';
    } else if (type === 'payouts') {
      ({ rows } = await pool.query(`
        SELECT p.id, TO_CHAR(p.created_at AT TIME ZONE 'America/Lima', 'YYYY-MM-DD') AS fecha,
          p.amount, p.tip,
          p.method AS metodo, p.status AS estado,
          u.name AS paciente, d.name AS doctor
        FROM payments p
        LEFT JOIN visits v ON p.visit_id = v.id
        LEFT JOIN users u ON v.user_id = u.id
        LEFT JOIN doctors d ON v.doctor_id = d.id
        ${where.replace('v.created_at','p.created_at')}
        ORDER BY p.created_at DESC
        LIMIT 5000
      `, params));
      headers = ['id','fecha','amount','tip','metodo','estado','paciente','doctor'];
      filename = 'pagos';
    } else if (type === 'doctors') {
      ({ rows } = await pool.query(`
        SELECT d.id, d.name, d.specialty, d.cmp_license,
          d.email, d.phone, d.experience_years,
          d.rating, d.total_reviews, d.is_active, d.is_available,
          TO_CHAR(d.created_at, 'YYYY-MM-DD') AS alta,
          COUNT(v.*) AS total_visitas,
          COUNT(v.*) FILTER (WHERE v.status = 'completed') AS completadas
        FROM doctors d
        LEFT JOIN visits v ON v.doctor_id = d.id
        GROUP BY d.id
        ORDER BY d.created_at DESC
      `));
      headers = ['id','name','specialty','cmp_license','email','phone','experience_years','rating','total_reviews','is_active','is_available','alta','total_visitas','completadas'];
      filename = 'medicos';
    } else {
      return res.status(400).json({ error: 'Tipo inválido. Use: consultations, payouts, doctors' });
    }

    const now = new Date().toISOString().slice(0, 10);
    const period = date_from && date_to ? `_${date_from}_${date_to}` : date_from ? `_desde_${date_from}` : '';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}${period}_${now}.csv"`);

    const esc = v => {
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };

    res.write('﻿'); // UTF-8 BOM for Excel
    res.write(headers.join(',') + '\n');
    for (const row of rows) {
      res.write(headers.map(h => esc(row[h])).join(',') + '\n');
    }
    res.end();

    await logAction(req.admin.id, `export_${type}`, 'report', null, { count: rows.length, date_from, date_to });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error.' }); }
});

/** ── Live Control — SSE stream ──────────────────────────── */

// In-memory SSE clients registry
const sseClients = new Set();

function broadcastEvent(event) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try { client.write(data); } catch { sseClients.delete(client); }
  }
}

// Expose so visit/doctor routes can emit events
router.broadcastEvent = broadcastEvent;

router.get('/live/stream', async (req, res) => {
  // Auth via query token (SSE can't set headers)
  const token = req.query.token;
  if (!token) return res.status(401).end();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows: [admin] } = await pool.query('SELECT id FROM admins WHERE id = $1 AND is_active = true', [decoded.id]);
    if (!admin) return res.status(403).end();
  } catch { return res.status(403).end(); }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'connected', ts: Date.now() })}\n\n`);
  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch { clearInterval(heartbeat); }
  }, 25000);

  req.on('close', () => {
    sseClients.delete(res);
    clearInterval(heartbeat);
  });
});

/** ── Live Control — Stats & active data ─────────────────── */

router.get('/live/stats', adminAuth, async (req, res) => {
  try {
    const [visits, doctors] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM visits WHERE status IN ('pending','matched','on_way','arrived','in_consultation')`),
      pool.query(`SELECT COUNT(*) FROM doctors WHERE is_available = true AND is_active = true`),
    ]);
    res.json({
      active_visits: parseInt(visits.rows[0].count),
      online_doctors: parseInt(doctors.rows[0].count),
    });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.get('/live/visits', adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT v.id, v.status, v.urgency, v.address, v.created_at, v.user_id, v.doctor_id,
        COALESCE(vp.name, u.name) AS patient_name, u.phone AS user_phone,
        d.name AS doctor_name
      FROM visits v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN doctors d ON v.doctor_id = d.id
      LEFT JOIN LATERAL (SELECT name FROM visit_patients WHERE visit_id = v.id LIMIT 1) vp ON true
      WHERE v.status IN ('pending','matched','on_way','arrived','in_consultation')
      ORDER BY v.created_at DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.get('/live/doctors', adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, specialty, phone, is_available, is_active, latitude, longitude, push_token
      FROM doctors
      WHERE is_active = true
      ORDER BY is_available DESC, name ASC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── Live Control — Push notifications ──────────────────── */

const { Expo } = (() => { try { return require('expo-server-sdk'); } catch { return { Expo: class { isExpoPushToken() { return false; } async sendPushNotificationsAsync() {} } }; } })();
const _expo = new Expo();

async function sendPush(token, title, body) {
  if (!token || !Expo.isExpoPushToken(token)) return false;
  try {
    await _expo.sendPushNotificationsAsync([{ to: token, sound: 'default', title, body }]);
    return true;
  } catch { return false; }
}

router.post('/live/push/user/:userId', adminAuth, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title y body requeridos.' });
  try {
    const { rows: [user] } = await pool.query('SELECT push_token FROM users WHERE id = $1', [req.params.userId]);
    if (!user) return res.status(404).json({ error: '404' });
    const ok = await sendPush(user.push_token, title, body);
    await logAction(req.admin.id, 'push_user', 'user', req.params.userId, { title, ok });
    res.json({ message: ok ? 'Enviado' : 'Sin token push', sent: ok });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.post('/live/push/doctor/:doctorId', adminAuth, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title y body requeridos.' });
  try {
    const { rows: [doc] } = await pool.query('SELECT push_token FROM doctors WHERE id = $1', [req.params.doctorId]);
    if (!doc) return res.status(404).json({ error: '404' });
    const ok = await sendPush(doc.push_token, title, body);
    await logAction(req.admin.id, 'push_doctor', 'doctor', req.params.doctorId, { title, ok });
    res.json({ message: ok ? 'Enviado' : 'Sin token push', sent: ok });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.post('/live/push/broadcast', adminAuth, async (req, res) => {
  const { target = 'all', title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title y body requeridos.' });
  try {
    let tokens = [];
    if (target === 'all' || target === 'users') {
      const { rows } = await pool.query('SELECT push_token FROM users WHERE push_token IS NOT NULL');
      tokens.push(...rows.map(r => r.push_token));
    }
    if (target === 'all' || target === 'doctors') {
      const { rows } = await pool.query('SELECT push_token FROM doctors WHERE push_token IS NOT NULL AND is_active = true');
      tokens.push(...rows.map(r => r.push_token));
    }
    tokens = tokens.filter(t => Expo.isExpoPushToken(t));
    let sent = 0;
    for (let i = 0; i < tokens.length; i += 100) {
      const batch = tokens.slice(i, i + 100).map(to => ({ to, sound: 'default', title, body }));
      try { await _expo.sendPushNotificationsAsync(batch); sent += batch.length; } catch {}
    }
    await logAction(req.admin.id, 'push_broadcast', 'platform', null, { target, title, total: tokens.length, sent });
    res.json({ message: `Broadcast enviado`, total: tokens.length, sent });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── Live Control — Visit actions ───────────────────────── */

router.post('/live/visits/:visitId/cancel', adminAuth, async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ error: 'Motivo requerido.' });
  try {
    const { rows: [visit] } = await pool.query(
      "UPDATE visits SET status = 'cancelled', cancel_reason = $1 WHERE id = $2 AND status NOT IN ('completed','cancelled') RETURNING id, user_id, doctor_id, push_token",
      [reason, req.params.visitId]
    );
    if (!visit) return res.status(404).json({ error: 'Visita no encontrada o ya finalizada.' });

    // Notify patient
    if (visit.push_token) await sendPush(visit.push_token, 'Consulta cancelada', `Tu consulta fue cancelada por el equipo. Motivo: ${reason}`);

    // Notify doctor
    if (visit.doctor_id) {
      const { rows: [doc] } = await pool.query('SELECT push_token FROM doctors WHERE id = $1', [visit.doctor_id]);
      if (doc?.push_token) await sendPush(doc.push_token, 'Visita cancelada', 'El equipo canceló una visita asignada.');
    }

    broadcastEvent({ type: 'visit_cancelled', visitId: visit.id, reason, ts: Date.now(), message: `Visita ${visit.id} cancelada por admin: ${reason}` });
    await logAction(req.admin.id, 'cancel_visit', 'visit', visit.id, { reason });
    res.json({ message: 'Visita cancelada.' });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

router.post('/live/visits/:visitId/reassign', adminAuth, async (req, res) => {
  const { doctorId } = req.body;
  if (!doctorId) return res.status(400).json({ error: 'doctorId requerido.' });
  try {
    const { rows: [visit] } = await pool.query(
      "UPDATE visits SET doctor_id = $1, status = 'matched' WHERE id = $2 AND status IN ('pending','matched') RETURNING id",
      [doctorId, req.params.visitId]
    );
    if (!visit) return res.status(404).json({ error: '404' });
    broadcastEvent({ type: 'visit_matched', visitId: visit.id, doctorId, ts: Date.now(), message: `Visita ${visit.id} reasignada` });
    await logAction(req.admin.id, 'reassign_visit', 'visit', visit.id, { doctorId });
    res.json({ message: 'Reasignada.' });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

/** ── Live Control — Doctor toggle ───────────────────────── */

router.post('/live/doctors/:doctorId/toggle', adminAuth, async (req, res) => {
  try {
    const { rows: [doc] } = await pool.query(
      'UPDATE doctors SET is_available = NOT is_available WHERE id = $1 RETURNING id, name, is_available',
      [req.params.doctorId]
    );
    if (!doc) return res.status(404).json({ error: '404' });
    broadcastEvent({ type: doc.is_available ? 'doctor_online' : 'doctor_offline', doctorId: doc.id, ts: Date.now(), message: `Dr. ${doc.name} ${doc.is_available ? 'activado' : 'pausado'} por admin` });
    await logAction(req.admin.id, 'toggle_doctor', 'doctor', doc.id, { is_available: doc.is_available });
    res.json({ message: 'Ok', is_available: doc.is_available });
  } catch (err) { res.status(500).json({ error: 'Error.' }); }
});

// SPA fallback — serve admin/index.html for all unmatched GET routes
const nodePath = require('path');
const ADMIN_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
].join('; ');

router.get('*', (req, res) => {
  const indexPath = nodePath.resolve(__dirname, '../../../web/admin/dist/index.html');
  const fallback  = nodePath.resolve(__dirname, '../../../web/admin/index.html');
  const fs = require('fs');
  const file = fs.existsSync(indexPath) ? indexPath : (fs.existsSync(fallback) ? fallback : null);
  if (!file) return res.status(404).send('Admin not built. Run: npm run build in web/admin');
  res.setHeader('Content-Security-Policy', ADMIN_CSP);
  res.sendFile(file);
});

module.exports = router;
