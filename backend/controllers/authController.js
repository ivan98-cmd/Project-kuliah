const db = require('../config/db');

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password diperlukan' });
  }

  try {
    const [rows] = await db.execute('SELECT id, nama, email, role FROM users WHERE email = ? AND password = ?', [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = rows[0];
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal login' });
  }
};

module.exports = {
  login,
};
