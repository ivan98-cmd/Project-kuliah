const express = require('express');
const router = express.Router();
const rundownController = require('../controllers/rundownController');

router.get('/', rundownController.getRundowns);
router.post('/', rundownController.createRundown);

module.exports = router;
