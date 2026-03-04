const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalName: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: [100, 'Goal name cannot exceed 100 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be at least 1']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'General',
    enum: ['General', 'Emergency Fund', 'Vacation', 'Home', 'Vehicle', 'Education', 'Retirement', 'Other']
  }
}, { timestamps: true });

goalSchema.virtual('progressPercentage').get(function() {
  return Math.min(Math.round((this.currentAmount / this.targetAmount) * 100), 100);
});

goalSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);
