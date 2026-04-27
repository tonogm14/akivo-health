/**
 * Email service using Nodemailer (SMTP).
 *
 * Required .env variables:
 *   SMTP_HOST       — e.g. smtp.gmail.com | smtp.sendgrid.net
 *   SMTP_PORT       — 587 (TLS) or 465 (SSL). Default: 587
 *   SMTP_SECURE     — "true" for port 465 (SSL). Default: false (STARTTLS)
 *   SMTP_USER       — SMTP login username
 *   SMTP_PASS       — SMTP login password / API key
 *   SMTP_FROM       — Sender address, e.g. "Doctor House <noreply@doctorhouse.pe>"
 *   ADMIN_EMAIL     — Where internal notifications go (new applications, etc.)
 *
 * If SMTP is not configured, emails are silently skipped and logged to console.
 */

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[Email] SMTP no configurado — emails deshabilitados (configura SMTP_HOST, SMTP_USER, SMTP_PASS en .env)');
    return null;
  }

  const nodemailer = require('nodemailer');
  _transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });

  return _transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email] (deshabilitado) Para: ${to} · Asunto: ${subject}`);
    if (text) console.log(`[Email] Contenido:\n${text}`);
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Doctor House" <noreply@doctorhouse.pe>',
      to,
      subject,
      html,
      text,
    });
    console.log('[Email] Enviado →', info.messageId, '→', to);
    return info.messageId;
  } catch (err) {
    console.error('[Email] Error al enviar a', to, ':', err.message);
    return null;
  }
}

/* ─────────────────────────────────────────────────
   Template: Bienvenida al doctor aprobado
───────────────────────────────────────────────── */
function welcomeDoctorHtml({ name, email, password }) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bienvenido/a a Doctor House</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F4F6F8;margin:0;padding:20px}
  .wrap{max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:linear-gradient(135deg,#06235A 0%,#0F4AB5 100%);padding:36px 40px;text-align:center}
  .logo{color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px}.logo span{color:#5FE8E8}
  .tagline{color:rgba(255,255,255,.7);font-size:13px;margin-top:6px}
  .body{padding:40px}
  h1{color:#0D1B2A;font-size:22px;font-weight:800;margin:0 0 10px;letter-spacing:-.3px}
  p{color:#5A6472;font-size:15px;line-height:1.65;margin:0 0 18px}
  .cred-box{background:#F4F6F8;border-radius:14px;padding:22px 26px;margin:24px 0;border:1px solid #E0E6EF}
  .cred-title{font-size:11px;font-weight:800;color:#8A96A4;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px}
  .cred-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #E0E6EF}
  .cred-row:last-child{border-bottom:none}
  .cred-key{font-size:12px;font-weight:700;color:#8A96A4}
  .cred-val{font-size:14px;font-weight:800;color:#0D1B2A;font-family:monospace;letter-spacing:.3px}
  .warn{background:#FFF8E6;border:1px solid #F0D080;border-radius:10px;padding:14px 18px;font-size:13px;color:#7A4D0A;margin:0 0 22px}
  .btn{display:block;background:#0B8A8A;color:#fff;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:800;font-size:15px;margin:8px 0 24px}
  .steps{background:#E6F4F4;border-radius:12px;padding:18px 22px;margin-bottom:22px}
  .steps h3{font-size:13px;font-weight:800;color:#0B8A8A;margin:0 0 12px}
  .step{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
  .step:last-child{margin-bottom:0}
  .step-num{width:22px;height:22px;border-radius:50%;background:#0B8A8A;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
  .step-txt{font-size:13px;color:#086666;font-weight:600}
  .ftr{background:#F4F6F8;padding:22px 40px;text-align:center;border-top:1px solid #E0E6EF}
  .ftr p{font-size:12px;color:#8A96A4;margin:0}
  .ftr a{color:#0B8A8A}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="logo">Doctor<span>House</span></div>
    <div class="tagline">Atención médica a domicilio · Lima, Perú</div>
  </div>
  <div class="body">
    <h1>¡Bienvenido/a, ${escapeHtml(name)}!</h1>
    <p>Tu solicitud fue <strong>aprobada</strong>. Ya eres parte de Doctor House y puedes empezar a atender pacientes en Lima.</p>

    <div class="cred-box">
      <div class="cred-title">Tus credenciales de acceso</div>
      <div class="cred-row">
        <span class="cred-key">Email</span>
        <span class="cred-val">${escapeHtml(email)}</span>
      </div>
      <div class="cred-row">
        <span class="cred-key">Contraseña temporal</span>
        <span class="cred-val">${escapeHtml(password)}</span>
      </div>
    </div>

    <div class="warn">⚠️ <strong>Importante:</strong> Cambia tu contraseña al ingresar por primera vez. Esta contraseña temporal expira en 72 horas.</div>

    <div class="steps">
      <h3>PRÓXIMOS PASOS</h3>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-txt">Descarga la app <strong>Doctor House Pro</strong> en tu Android o iOS.</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-txt">Ingresa con tu email y contraseña temporal. Crea tu nueva contraseña.</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-txt">Activa tu disponibilidad y define tu zona de atención.</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-txt">¡Listo! Empieza a recibir solicitudes de pacientes.</div>
      </div>
    </div>

    <a href="#" class="btn">Descargar Doctor House Pro →</a>

    <p style="font-size:13px;color:#8A96A4">
      ¿Necesitas ayuda? Escríbenos a <a href="mailto:soporte@doctorhouse.pe" style="color:#0B8A8A;font-weight:600">soporte@doctorhouse.pe</a> o responde este correo.
    </p>
  </div>
  <div class="ftr">
    <p>Doctor House S.A.C. · Lima, Perú · © ${year}<br>
    <a href="mailto:medicos@doctorhouse.pe">medicos@doctorhouse.pe</a></p>
  </div>
</div>
</body>
</html>`;
}

/* ─────────────────────────────────────────────────
   Template: Notificación interna — nueva solicitud
───────────────────────────────────────────────── */
function newApplicationHtml({ name, email, specialty, cmp, id }) {
  return `<div style="font-family:sans-serif;max-width:500px;margin:20px auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #E0E6EF">
  <h2 style="color:#06235A;margin:0 0 16px">Nueva solicitud de doctor</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:8px 0;color:#8A96A4;font-size:13px;font-weight:700;width:140px">ID solicitud</td><td style="padding:8px 0;font-size:13px;font-weight:700">${id}</td></tr>
    <tr><td style="padding:8px 0;color:#8A96A4;font-size:13px;font-weight:700">Nombre</td><td style="padding:8px 0;font-size:13px;font-weight:700">${escapeHtml(name)}</td></tr>
    <tr><td style="padding:8px 0;color:#8A96A4;font-size:13px;font-weight:700">Email</td><td style="padding:8px 0;font-size:13px;font-weight:700">${escapeHtml(email)}</td></tr>
    <tr><td style="padding:8px 0;color:#8A96A4;font-size:13px;font-weight:700">Especialidad</td><td style="padding:8px 0;font-size:13px;font-weight:700">${escapeHtml(specialty)}</td></tr>
    <tr><td style="padding:8px 0;color:#8A96A4;font-size:13px;font-weight:700">CMP</td><td style="padding:8px 0;font-size:13px;font-weight:700">${escapeHtml(cmp)}</td></tr>
  </table>
  <div style="margin-top:20px;padding:14px;background:#F4F6F8;border-radius:8px;font-size:13px;color:#5A6472">
    Para aprobar: <code>POST /apply/${id}/approve</code> con header <code>x-admin-token: TU_TOKEN</code>
  </div>
</div>`;
}

function rejectedDoctorHtml({ name, reason }) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Estado de tu solicitud - Doctor House</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F4F6F8;margin:0;padding:20px}
  .wrap{max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:linear-gradient(135deg,#06235A 0%,#0F4AB5 100%);padding:36px 40px;text-align:center}
  .logo{color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px}.logo span{color:#5FE8E8}
  .body{padding:40px}
  h1{color:#1F2328;font-size:22px;font-weight:800;margin:0 0 16px;letter-spacing:-.3px}
  p{color:#5A6472;font-size:15px;line-height:1.65;margin:0 0 18px}
  .reason-box{background:#FFF1F0;border:1px solid #FFA39E;border-radius:14px;padding:24px;margin:24px 0}
  .reason-title{font-size:11px;font-weight:800;color:#CF222E;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
  .reason-text{font-size:14px;color:#1F2328;line-height:1.6;font-weight:600}
  .ftr{background:#F4F6F8;padding:22px 40px;text-align:center;border-top:1px solid #E0E6EF}
  .ftr p{font-size:12px;color:#8A96A4;margin:0}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr"><div class="logo">Doctor<span>House</span></div></div>
  <div class="body">
    <h1>Hola, ${escapeHtml(name)}</h1>
    <p>Gracias por tu interés en unirte a nuestra red de médicos a domicilio. Hemos revisado tu perfil y documentos detalladamente.</p>
    <p>Lamentablemente, en este momento <strong>no podemos proceder con tu activación</strong> debido a las siguientes observaciones:</p>
    
    <div class="reason-box">
      <div class="reason-title">Observaciones a corregir</div>
      <div class="reason-text">${escapeHtml(reason)}</div>
    </div>

    <p>Si consideras que puedes subsanar estas observaciones, por favor responde a este correo adjuntando la información solicitada para una nueva revisión.</p>
    <p>Esperamos contar contigo pronto.</p>
  </div>
  <div class="ftr">
    <p>Doctor House S.A.C. · Lima, Perú · © ${year}</p>
  </div>
</div>
</body>
</html>`;
}

function deactivatedDoctorHtml({ name, reason }) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Estado de tu cuenta - Doctor House</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F4F6F8;margin:0;padding:20px}
  .wrap{max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:linear-gradient(135deg,#06235A 0%,#0F4AB5 100%);padding:36px 40px;text-align:center}
  .logo{color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px}.logo span{color:#5FE8E8}
  .body{padding:40px}
  h1{color:#1F2328;font-size:22px;font-weight:800;margin:0 0 16px;letter-spacing:-.3px}
  p{color:#5A6472;font-size:15px;line-height:1.65;margin:0 0 18px}
  .deact-box{background:#FFF1F0;border:1px solid #FFA39E;border-radius:14px;padding:24px;margin:24px 0}
  .deact-title{font-size:11px;font-weight:800;color:#CF222E;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
  .deact-text{font-size:14px;color:#1F2328;line-height:1.6;font-weight:600}
  .ftr{background:#F4F6F8;padding:22px 40px;text-align:center;border-top:1px solid #E0E6EF}
  .ftr p{font-size:12px;color:#8A96A4;margin:0}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr"><div class="logo">Doctor<span>House</span></div></div>
  <div class="body">
    <h1>Hola, Dr/a. ${escapeHtml(name)}</h1>
    <p>Te informamos que tu acceso a la plataforma <strong>Doctor House Pro</strong> ha sido temporalmente desactivado por nuestro equipo administrativo.</p>
    
    <div class="deact-box">
      <div class="deact-title">Motivo de la desactivación</div>
      <div class="deact-text">${escapeHtml(reason)}</div>
    </div>

    <p>Mientras tu cuenta esté desactivada, no podrás recibir nuevas solicitudes de pacientes ni acceder a la aplicación.</p>
    <p>Si deseas apelar esta decisión o tienes dudas, por favor contáctanos directamente a <a href="mailto:medicos@doctorhouse.pe" style="color:#0F4AB5;font-weight:700">medicos@doctorhouse.pe</a>.</p>
  </div>
  <div class="ftr">
    <p>Doctor House S.A.C. · Lima, Perú · © ${year}</p>
  </div>
</div>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = { sendEmail, welcomeDoctorHtml, newApplicationHtml, rejectedDoctorHtml, deactivatedDoctorHtml };
