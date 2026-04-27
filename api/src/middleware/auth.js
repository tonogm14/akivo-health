const jwt = require('jsonwebtoken');

// Seeded dev user ID — matches api/src/db/seed.js
const DEV_USER_ID = 'baf43ecc-7679-45ef-a99c-d928bbc63009';

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;

  // Dev bypass: no token → use seeded test user
  if (process.env.NODE_ENV !== 'production' && !header?.startsWith('Bearer ')) {
    req.user = { sub: DEV_USER_ID };
    return next();
  }

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
