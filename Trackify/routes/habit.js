const express = require('express');
const router = express.Router();
const Habit = require('../models/habit');
const {
  createHabit,
  getUserHabits,
  updateHabit,
  deleteHabit,
  completeHabit
} = require('../controllers/habitController');

const authenticate = require('../middleware/authMiddleware');

router.post('/', authenticate, createHabit);
router.get('/:userId', authenticate, getUserHabits);
router.patch('/:id', authenticate, updateHabit);
router.delete('/:id', authenticate, deleteHabit);
router.patch('/complete/:id', authenticate, completeHabit);
router.get('/me', authenticate, getUserHabits);


module.exports = router;



