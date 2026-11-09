const pool = require('../config/db');

async function entryBelongsToUser(entryId, userId) {
  const { rows } = await pool.query(
    'SELECT id FROM entries WHERE id = $1 AND user_id = $2',
    [entryId, userId]
  );
  return rows.length > 0;
}

async function create(entryId, storageKey) {
  const { rows } = await pool.query(
    `INSERT INTO entry_images (entry_id, storage_key)
     VALUES ($1, $2)
     RETURNING id, entry_id, storage_key, created_at`,
    [entryId, storageKey]
  );
  return rows[0];
}

async function findByIdForUser(imageId, entryId, userId) {
  const { rows } = await pool.query(
    `SELECT i.id, i.storage_key
     FROM entry_images i
     JOIN entries e ON e.id = i.entry_id
     WHERE i.id = $1 AND i.entry_id = $2 AND e.user_id = $3`,
    [imageId, entryId, userId]
  );
  return rows[0];
}

async function remove(imageId) {
  await pool.query('DELETE FROM entry_images WHERE id = $1', [imageId]);
}

async function findByEntryIds(entryIds) {
  const { rows } = await pool.query(
    `SELECT id, entry_id, storage_key
     FROM entry_images
     WHERE entry_id = ANY($1::int[])
     ORDER BY id`,
    [entryIds]
  );
  return rows;
}

async function findKeysByEntry(entryId, userId) {
  const { rows } = await pool.query(
    `SELECT i.storage_key
     FROM entry_images i
     JOIN entries e ON e.id = i.entry_id
     WHERE i.entry_id = $1 AND e.user_id = $2`,
    [entryId, userId]
  );
  return rows.map((r) => r.storage_key);
}

async function countByEntry(entryId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM entry_images WHERE entry_id = $1',
    [entryId]
  );
  return rows[0].count;
}


module.exports = {
  entryBelongsToUser,
  create,
  findByIdForUser,
  remove,
  findByEntryIds,
  findKeysByEntry,
  countByEntry
};