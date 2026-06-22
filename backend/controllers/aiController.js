const db = require('../config/db');
const openaiService = require('../services/openaiService');

const generateDescription = async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ message: 'Topic diperlukan' });
  }

  try {
    const prompt = `Buatkan deskripsi event singkat untuk: ${topic}`;
    const response = await openaiService.generateOpenAIText(prompt);
    res.json({ description: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat deskripsi AI' });
  }
};

const generateRundown = async (req, res) => {
  const { eventName, duration, keyActivities } = req.body;
  if (!eventName || !duration) {
    return res.status(400).json({ message: 'eventName dan duration diperlukan' });
  }

  try {
    const prompt = `Buatkan rundown acara untuk event ${eventName} dengan durasi ${duration} dan aktivitas: ${keyActivities || 'umum'}`;
    const response = await openaiService.generateOpenAIText(prompt);
    res.json({ rundown: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat rundown AI' });
  }
};

const advisor = async (req, res) => {
  const { question, event_id } = req.body;
  if (!question) {
    return res.status(400).json({ message: 'Pertanyaan diperlukan' });
  }

  try {
    const prompt = `Berikan saran untuk event ini: ${question}`;
    const response = await openaiService.generateOpenAIText(prompt);

    if (event_id) {
      await db.execute('INSERT INTO ai_logs (event_id, prompt, response) VALUES (?, ?, ?)', [event_id, prompt, response]);
    }

    res.json({ advice: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memanggil AI advisor' });
  }
};

module.exports = {
  generateDescription,
  generateRundown,
  advisor,
};
