const router = require('express').Router();
const auth = require('../middlewares/auth');
const validateId = require('../middlewares/validateId');
const ctrl = require('../controllers/entry.controller');
const { parseImages } = require('../middlewares/upload');
const imageController = require('../controllers/image.controller');

router.use(auth);

router.get('/', ctrl.getEntries);
router.post('/', ctrl.createEntry);
router.get('/:id', validateId, ctrl.getEntry);
router.put('/:id', validateId, ctrl.updateEntry);
router.delete('/:id', validateId, ctrl.deleteEntry);
router.post('/:id/images', validateId, parseImages, imageController.uploadImages);
router.delete('/:id/images/:imageId', validateId, imageController.deleteImage);


module.exports = router;