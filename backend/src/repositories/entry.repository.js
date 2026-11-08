const pool = require('../config/db');

const COLUMNS = `id, topic, notes,
  to_char(entry_date, 'YYYY-MM-DD') AS entry_date,
  created_at`;

exports.findAllByUser = async (userId, search) => {
  const pattern = search ? `%${search}%` : '%';
  const { rows } = await pool.query(
    `SELECT ${COLUMNS}
     FROM entries
     WHERE user_id = $1
       AND (topic ILIKE $2 OR notes ILIKE $2)
     ORDER BY entry_date DESC, id DESC`,
    [userId, pattern]
  );
  return rows;
};

exports.findByIdForUser = async (id, userId) => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM entries WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return rows[0];
};

exports.create = async (userId, { topic, notes, entryDate }) => {
  const { rows } = await pool.query(
    `INSERT INTO entries (user_id, topic, notes, entry_date)
     VALUES ($1, $2, $3,
       COALESCE($4::date, (NOW() AT TIME ZONE 'Asia/Dhaka')::date))
     RETURNING ${COLUMNS}`,
    [userId, topic, notes, entryDate]
  );
  return rows[0];
};

exports.update = async (id, userId, { topic, notes, entryDate }) => {
  const { rows } = await pool.query(
    `UPDATE entries
     SET topic = $1,
         notes = $2,
         entry_date = COALESCE($3::date, entry_date)
     WHERE id = $4 AND user_id = $5
     RETURNING ${COLUMNS}`,
    [topic, notes, entryDate, id, userId]
  );
  return rows[0];
};

exports.remove = async (id, userId) => {
  const { rows } = await pool.query(
    'DELETE FROM entries WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return rows[0];
};