module.exports = function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
