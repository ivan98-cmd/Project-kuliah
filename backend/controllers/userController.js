const db = require('../config/db');

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Gagal mengambil daftar pengguna.' });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role || 'Peserta']
    );
    res.status(201).json({ id: result.insertId, name, email, role: role || 'Peserta' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Gagal membuat pengguna.' });
  }
};
