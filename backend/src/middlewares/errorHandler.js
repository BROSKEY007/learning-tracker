module.exports = (err, req, res, next) => {
  console.error(err.stack);

  const status = err.statusCode || 500;
  const message = status === 500 ? 'Server error' : err.message;

  res.status(status).json({ success: false, message });
};