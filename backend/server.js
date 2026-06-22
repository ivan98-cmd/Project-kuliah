const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const participantRoutes = require('./routes/participants');
const rundownRoutes = require('./routes/rundowns');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/rundowns', rundownRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SyncEvent backend is running' });
});

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await db.testConnection();
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
