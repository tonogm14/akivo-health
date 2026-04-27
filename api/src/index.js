require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const crypto = require('crypto');
const hpp = require('hpp');
const path = require('path');
const pool = require('./db');
const apiKey = require('./middleware/apiKey');
const auditLog = require('./middleware/auditLog');
const { general: generalLimit } = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Trust nginx proxy (so req.ip is the real client IP, not 172.x.x.x)
app.set('trust proxy', 1);

// ── Public landing page + doctor application form (served as static files)
// Mounted before HMAC/auth so the browser can load it without API credentials
app.use(express.static(path.join(__dirname, '../../web'), {
  index: 'index.html',
  extensions: ['html'],
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
}));

// ── Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      scriptSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

// ── CORS — only the configured origin (app domain)
app.use(cors({
  origin: process.env.CORS_ORIGIN || false,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Timestamp', 'X-Signature'],
  credentials: false,
}));

// ── Raw body capture (required before express.json, for HMAC verification)
// Skip for multipart (file uploads) to avoid consuming the stream before multer
app.use((req, res, next) => {
  const isMultipart = req.headers['content-type']?.includes('multipart/form-data');
  if (isMultipart) return next();

  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    req.rawBody = data;
    try { req.body = data ? JSON.parse(data) : {}; } catch { req.body = {}; }
    next();
  });
});

// ── HTTP parameter pollution guard
app.use(hpp());

// ── Audit logging
app.use(auditLog);

// ── Global rate limit (before auth so bots don't burn DB)
app.use(generalLimit);

// ── Health check (no HMAC auth — used by Docker healthcheck & load balancer)
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', ts: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// ── Payment gateway webhooks (third-party signed, must bypass our HMAC)
app.use('/payments/webhook', require('./routes/payments'));

// ── Demo endpoints (dev only — no HMAC, no JWT, for the browser prototype)
if (process.env.NODE_ENV !== 'production') {
  app.use('/demo', cors({ origin: '*' }), require('./routes/demo'));
}

// ── Public doctor application endpoint (no HMAC — submitted from browser form)
app.use('/apply',
  cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'X-Admin-Token'] }),
  require('./routes/apply')
);

// ── Admin Dashboard API (no HMAC verification, uses JWT)
app.use('/admin',
  cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }),
  require('./routes/admin')
);

// ── API key + HMAC signature verification (all routes below this point)
app.use(apiKey);

// ── Routes
app.use('/auth', require('./routes/auth'));
app.use('/doctors', require('./routes/doctors'));
app.use('/visits', require('./routes/visits'));
app.use('/payments', require('./routes/payments'));
app.use('/reviews', require('./routes/reviews'));
app.use('/users', require('./routes/users'));

// ── 404
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// ── Error handler
app.use(errorHandler);

// ── Start
app.listen(PORT, () => {
  console.log(`Doctor House API · http://localhost:${PORT}`);
  console.log(`   Env: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
