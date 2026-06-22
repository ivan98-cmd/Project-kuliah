const express = require('express');
const {
  getRundowns,
  createRundown,
  updateRundown,
  deleteRundown,
} = require('../controllers/rundownController');

const router = express.Router();

router.get('/', getRundowns);
router.post('/', createRundown);
router.put('/:id', updateRundown);
router.delete('/:id', deleteRundown);

module.exports = router;
