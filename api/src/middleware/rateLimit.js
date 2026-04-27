const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// Shared store key: by IP + API key so IP rotation doesn't bypass limits
function keyGenerator(req) {
  return `${ipKeyGenerator(req)}::${req.headers['x-api-key'] || 'anon'}`;
}

function onLimitReached(req, res, options) {
  console.warn(`[RATE_LIMIT] ${keyGenerator(req)} hit ${options.max} req/${options.windowMs}ms on ${req.path}`);
}

// General API: 120 req / 1 min
exports.general = rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => res.status(429).json({ error: 'Demasiadas solicitudes. Intenta en un momento.' }),
});

// Auth OTP: 5 req / 15 min per IP (prevents SMS/WhatsApp bombing)
exports.otp = rateLimit({
  windowMs: 15 * 60_000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  skipSuccessfulRequests: false,
  handler: (req, res) => res.status(429).json({ error: 'Demasiados intentos de OTP. Espera 15 minutos.' }),
});

// OTP verify: 10 attempts / 15 min (brute-force on 6-digit code)
exports.otpVerify = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req)}::${req.body?.phone || ''}`,
  handler: (req, res) => res.status(429).json({ error: 'Código bloqueado temporalmente. Solicita uno nuevo.' }),
});

// Visit creation: 10 / 10 min (prevents visit spam)
exports.createVisit = rateLimit({
  windowMs: 10 * 60_000,
  max: 10,
  keyGenerator,
  handler: (req, res) => res.status(429).json({ error: 'Límite de solicitudes de visita alcanzado.' }),
});
