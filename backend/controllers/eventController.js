const db = require('../config/db');

const getEvents = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name, description, date, location FROM events ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil event' });
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT id, name, description, date, location FROM events WHERE id = ?', [id]);
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
  const { name, description, date, location } = req.body;

  if (!name || !description || !date || !location) {
    return res.status(400).json({ message: 'Semua field event wajib diisi.' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO events (name, description, date, location) VALUES (?, ?, ?, ?)',
      [name, description, date, location]
    );
    const [rows] = await db.execute('SELECT id, name, description, date, location FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat event' });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, date, location } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE events SET name = ?, description = ?, date = ?, location = ? WHERE id = ?',
      [name, description, date, location, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event tidak ditemukan' });
    }
    const [rows] = await db.execute('SELECT id, name, description, date, location FROM events WHERE id = ?', [id]);
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
