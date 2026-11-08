const entryRepo = require('../repositories/entry.repository');
const AppError = require('../utils/AppError');

function cleanEntry({ topic, notes, entry_date }) {
  if (typeof topic !== 'string' || topic.trim() === '') {
    throw new AppError('Topic is required', 400);
  }
  if (topic.trim().length > 150) {
    throw new AppError('Topic must be 150 characters or less', 400);
  }
  if (notes !== undefined && notes !== null && typeof notes !== 'string') {
    throw new AppError('Notes must be text', 400);
  }
  if (entry_date !== undefined && entry_date !== null && entry_date !== '') {
    const valid =
      typeof entry_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry_date);
    if (!valid) {
      throw new AppError('Date must be in YYYY-MM-DD format', 400);
    }
  }

  return {
    topic: topic.trim(),
    notes: notes ? notes.trim() : null,
    entryDate: entry_date || null,
  };
}

exports.getEntries = async (req, res, next) => {
  try {
    const search =
      typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const entries = await entryRepo.findAllByUser(req.user.id, search);
    res.json({ success: true, data: entries });
  } catch (err) {
    next(err);
  }
};

exports.getEntry = async (req, res, next) => {
  try {
    const entry = await entryRepo.findByIdForUser(req.entryId, req.user.id);
    if (!entry) throw new AppError('Entry not found', 404);
    res.json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
};

exports.createEntry = async (req, res, next) => {
  try {
    const cleaned = cleanEntry(req.body);
    const entry = await entryRepo.create(req.user.id, cleaned);
    res
      .status(201)
      .json({ success: true, data: entry, message: 'Entry created' });
  } catch (err) {
    next(err);
  }
};

exports.updateEntry = async (req, res, next) => {
  try {
    const cleaned = cleanEntry(req.body);
    const entry = await entryRepo.update(req.entryId, req.user.id, cleaned);
    if (!entry) throw new AppError('Entry not found', 404);
    res.json({ success: true, data: entry, message: 'Entry updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteEntry = async (req, res, next) => {
  try {
    const deleted = await entryRepo.remove(req.entryId, req.user.id);
    if (!deleted) throw new AppError('Entry not found', 404);
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
};