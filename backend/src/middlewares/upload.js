const multer = require('multer');
const AppError = require('../utils/AppError');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Only JPG, PNG, WEBP or GIF images are allowed', 400));
    }
    cb(null, true);
  },
});

const parseImages = (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
      const messages = {
        LIMIT_FILE_SIZE: 'Each image must be 5MB or smaller',
        LIMIT_FILE_COUNT: 'You can upload up to 5 images at a time',
        LIMIT_UNEXPECTED_FILE: 'Send files using the field name "images" (max 5)',
      };
      const message = messages[err.code] || `Upload error: ${err.message}`;
      return next(new AppError(message, 400));
    
    }
    next(err);
  });
};

module.exports = { parseImages };