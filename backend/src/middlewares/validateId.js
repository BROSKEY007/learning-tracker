const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
    return next(new AppError('Invalid id', 400));
  }

  req.entryId = id;
  next();
};