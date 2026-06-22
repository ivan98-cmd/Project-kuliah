const express = require('express');
const {
  generateDescription,
  generateRundown,
  advisor,
} = require('../controllers/aiController');

const router = express.Router();

router.post('/generate-description', generateDescription);
router.post('/generate-rundown', generateRundown);
router.post('/advisor', advisor);

module.exports = router;
