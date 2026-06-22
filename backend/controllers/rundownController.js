const db = require('../config/db');

const getRundowns = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM rundowns ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil rundown' });
  }
};

const createRundown = async (req, res) => {
  const { event_id, activity_name, start_time, end_time, person_in_charge } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO rundowns (event_id, activity_name, start_time, end_time, person_in_charge) VALUES (?, ?, ?, ?, ?)',
      [event_id, activity_name, start_time, end_time, person_in_charge]
    );
    const [rows] = await db.execute('SELECT * FROM rundowns WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat rundown' });
  }
};

const updateRundown = async (req, res) => {
  const { id } = req.params;
  const { event_id, activity_name, start_time, end_time, person_in_charge } = req.body;
  try {
    const [result] = await db.execute(
      'UPDATE rundowns SET event_id = ?, activity_name = ?, start_time = ?, end_time = ?, person_in_charge = ? WHERE id = ?',
      [event_id, activity_name, start_time, end_time, person_in_charge, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rundown tidak ditemukan' });
    }
    const [rows] = await db.execute('SELECT * FROM rundowns WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui rundown' });
  }
};

const deleteRundown = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('DELETE FROM rundowns WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rundown tidak ditemukan' });
    }
    res.json({ message: 'Rundown berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus rundown' });
  }
};

module.exports = {
  getRundowns,
  createRundown,
  updateRundown,
  deleteRundown,
};
