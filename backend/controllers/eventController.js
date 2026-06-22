const db = require('../config/db');

const getEvents = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT e.*, u.nama AS organizer_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      ORDER BY e.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil event' });
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM events WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Event tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil event' });
  }
};

const createEvent = async (req, res) => {
  const { title, description, location, start_date, end_date, status, organizer_id } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO events (title, description, location, start_date, end_date, status, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, location, start_date, end_date, status, organizer_id]
    );
    const [rows] = await db.execute('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat event' });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, location, start_date, end_date, status, organizer_id } = req.body;
  try {
    const [result] = await db.execute(
      'UPDATE events SET title = ?, description = ?, location = ?, start_date = ?, end_date = ?, status = ?, organizer_id = ? WHERE id = ?',
      [title, description, location, start_date, end_date, status, organizer_id, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event tidak ditemukan' });
    }
    const [rows] = await db.execute('SELECT * FROM events WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui event' });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('DELETE FROM events WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event tidak ditemukan' });
    }
    res.json({ message: 'Event berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus event' });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
