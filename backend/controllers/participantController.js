const db = require('../config/db');

const getParticipants = async (req, res) => {
  try {
    // Mengambil data peserta langsung dari database MySQL
    const [rows] = await db.execute('SELECT * FROM participants ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil peserta' });
  }
};

const createParticipant = async (req, res) => {
  const { event_id, full_name, email, phone, attendance_status } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO participants (event_id, full_name, email, phone, attendance_status) VALUES (?, ?, ?, ?, ?)',
      [event_id, full_name, email, phone, attendance_status]
    );
    const [rows] = await db.execute('SELECT * FROM participants WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menambahkan peserta' });
  }
};

const updateParticipant = async (req, res) => {
  const { id } = req.params;
  const { event_id, full_name, email, phone, attendance_status } = req.body;
  try {
    const [result] = await db.execute(
      'UPDATE participants SET event_id = ?, full_name = ?, email = ?, phone = ?, attendance_status = ? WHERE id = ?',
      [event_id, full_name, email, phone, attendance_status, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Peserta tidak ditemukan' });
    }
    const [rows] = await db.execute('SELECT * FROM participants WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui peserta' });
  }
};

const deleteParticipant = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('DELETE FROM participants WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Peserta tidak ditemukan' });
    }
    res.json({ message: 'Peserta berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus peserta' });
  }
};

module.exports = {
  getParticipants,
  createParticipant,
  updateParticipant,
  deleteParticipant,
};
