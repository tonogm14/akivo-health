const crypto = require('crypto');

const VALID_KEYS = new Set(
  (process.env.API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean)
);

const REPLAY_WINDOW_MS = 60_000; // reject requests older than 60 s

/**
 * Verifies every inbound request carries:
 *   X-API-Key:   known app key
 *   X-Timestamp: unix ms within ±60 s of server time
 *   X-Signature: HMAC-SHA256(API_SIGNING_SECRET, `${timestamp}|${method}|${path}|${bodyHash}`)
 *
 * This prevents:
 *   - Unauthorized clients (no key/wrong key)
 *   - Replay attacks (timestamp window)
 *   - Tampered requests (HMAC covers method + path + body)
 */
module.exports = function apiKey(req, res, next) {
  // Health endpoint doesn't require signing
  if (req.path === '/health') return next();

  // In dev, skip all signing — prototype works without secrets
  if (process.env.NODE_ENV !== 'production') return next();

  const key       = req.headers['x-api-key'];
  const timestamp = req.headers['x-timestamp'];
  const signature = req.headers['x-signature'];

  // 1. API key must be present and known
  if (!key || !VALID_KEYS.has(key)) {
    return res.status(403).json({ error: 'Acceso no autorizado.' });
  }

  // 2. Timestamp must be present and recent
  const tsNum = Number(timestamp);
  if (!timestamp || Number.isNaN(tsNum)) {
    return res.status(403).json({ error: 'Timestamp requerido.' });
  }
  const drift = Math.abs(Date.now() - tsNum);
  if (drift > REPLAY_WINDOW_MS) {
    return res.status(403).json({ error: 'Solicitud expirada o reloj desincronizado.' });
  }

  // 3. HMAC signature must match
  if (!signature) {
    return res.status(403).json({ error: 'Firma requerida.' });
  }

  const bodyHash = crypto
    .createHash('sha256')
    .update(req.rawBody || '')
    .digest('hex');

  const payload  = `${timestamp}|${req.method}|${req.originalUrl}|${bodyHash}`;
  const expected = crypto
    .createHmac('sha256', process.env.API_SIGNING_SECRET || '')
    .update(payload)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  const sigBuf = Buffer.from(signature,  'hex');
  const expBuf = Buffer.from(expected,   'hex');

  if (
    sigBuf.length !== expBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expBuf)
  ) {
    return res.status(403).json({ error: 'Firma inválida.' });
  }

  next();
};
