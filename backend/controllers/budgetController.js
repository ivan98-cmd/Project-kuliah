const db = require('../config/db');

const getBudgets = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM budgets ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil anggaran' });
  }
};

const createBudget = async (req, res) => {
  const { event_id, category, amount, notes, transaction_date } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO budgets (event_id, category, amount, notes, transaction_date) VALUES (?, ?, ?, ?, ?)',
      [event_id, category, amount, notes, transaction_date]
    );
    const [rows] = await db.execute('SELECT * FROM budgets WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menambahkan anggaran' });
  }
};

const updateBudget = async (req, res) => {
  const { id } = req.params;
  const { event_id, category, amount, notes, transaction_date } = req.body;
  try {
    const [result] = await db.execute(
      'UPDATE budgets SET event_id = ?, category = ?, amount = ?, notes = ?, transaction_date = ? WHERE id = ?',
      [event_id, category, amount, notes, transaction_date, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Anggaran tidak ditemukan' });
    }
    const [rows] = await db.execute('SELECT * FROM budgets WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui anggaran' });
  }
};

const deleteBudget = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('DELETE FROM budgets WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Anggaran tidak ditemukan' });
    }
    res.json({ message: 'Anggaran berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus anggaran' });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
