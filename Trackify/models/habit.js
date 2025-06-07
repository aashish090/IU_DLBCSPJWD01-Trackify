const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String }, 
  frequency: { type: String, enum: ['daily', 'every 2 days', 'every 3 days', 'weekly', 'monthly'], required: true },
  streak: { type: Number, default: 0 },
  lastCompleted: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastReminderDate: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
