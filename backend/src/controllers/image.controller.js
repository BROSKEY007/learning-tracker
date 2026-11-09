const imageRepo = require('../repositories/image.repository');
const storage = require('../utils/imageStorage');
const AppError = require('../utils/AppError');
const MAX_IMAGES_PER_ENTRY = 5;

exports.uploadImages = async (req, res, next) => {
  try {
    const ok = await imageRepo.entryBelongsToUser(req.entryId, req.user.id);
    if (!ok) throw new AppError('Entry not found', 404);
       const existing = await imageRepo.countByEntry(req.entryId);
       
    if (existing + req.files.length > MAX_IMAGES_PER_ENTRY) {
      throw new AppError(
        `An entry can have at most ${MAX_IMAGES_PER_ENTRY} images (it has ${existing})`,
        400
      );
    }
    if (!req.files || req.files.length === 0) {
      throw new AppError('Please choose at least one image', 400);
    }

    const images = [];
    for (const file of req.files) {
      const key = await storage.uploadImage(file, req.entryId);
      const row = await imageRepo.create(req.entryId, key);
      images.push({ id: row.id, url: await storage.getImageUrl(key) });
    }

    res.status(201).json({ images });
  } catch (err) {
    next(err);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const imageId = Number(req.params.imageId);
    if (!Number.isInteger(imageId) || imageId < 1 || imageId > 2147483647) {
      throw new AppError('Invalid image id', 400);
    }

    const image = await imageRepo.findByIdForUser(imageId, req.entryId, req.user.id);
    if (!image) throw new AppError('Image not found', 404);

    await imageRepo.remove(image.id);
    try {
      await storage.deleteImage(image.storage_key);
    } catch (e) {
      console.error('Storage delete failed:', e.message);
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};