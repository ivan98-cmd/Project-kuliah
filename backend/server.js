const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const rundownRoutes = require('./routes/rundownRoutes');
const participantRoutes = require('./routes/participantRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rundowns', rundownRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SyncEvent backend is running' });
});

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await db.getConnection();
    console.log('Connected to MySQL database');

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
    process.exit(1);
  }
};

startServer();
