const express = require('express');
const {
  getParticipants,
  createParticipant,
  updateParticipant,
  deleteParticipant,
} = require('../controllers/participantController');

const router = express.Router();

router.get('/', getParticipants);
router.post('/', createParticipant);
router.put('/:id', updateParticipant);
router.delete('/:id', deleteParticipant);

module.exports = router;
