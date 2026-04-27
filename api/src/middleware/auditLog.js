module.exports = function auditLog(req, res, next) {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  const apiKey = req.headers['x-api-key'] ? req.headers['x-api-key'].slice(0, 8) + '…' : 'none';

  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    console.log(
      JSON.stringify({
        level,
        ts:     new Date().toISOString(),
        method,
        path:   originalUrl,
        status: res.statusCode,
        ms,
        ip,
        key:    apiKey,
        uid:    req.user?.id ?? null,
      })
    );
  });

  next();
};
