const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeName: {
    type: String,
    required: true,
    enum: [
      'First Expense',
      'Budget Master',
      '1000 Saved',
      '30 Days Discipline',
      'Goal Crusher',
      'Frugal Five',
      'Expense Explorer',
      'Savings Streak',
      'Category Champion',
      'Monthly Master'
    ]
  },
  earnedDate: {
    type: Date,
    default: Date.now
  },
  description: String,
  icon: String
}, { timestamps: true });

badgeSchema.index({ userId: 1, badgeName: 1 }, { unique: true });

module.exports = mongoose.model('Badge', badgeSchema);
