const Goal = require('../models/Goal');
const Badge = require('../models/Badge');

exports.createGoal = async (req, res, next) => {
  try {
    const { goalName, targetAmount, deadline, currency, category } = req.body;
    const goal = await Goal.create({ userId: req.user._id, goalName, targetAmount, deadline, currency: currency || req.user.currency, category });
    res.status(201).json({ success: true, message: 'Goal created successfully', goal });
  } catch (error) { next(error); }
};

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (error) { next(error); }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true, runValidators: true });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      await goal.save();
      await Badge.findOneAndUpdate({ userId: req.user._id, badgeName: 'Goal Crusher' }, { userId: req.user._id, badgeName: 'Goal Crusher', description: 'Completed a savings goal!', icon: '🏆' }, { upsert: true });
    }
    res.json({ success: true, message: 'Goal updated successfully', goal });
  } catch (error) { next(error); }
};

exports.addToGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    goal.currentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
      await Badge.findOneAndUpdate({ userId: req.user._id, badgeName: 'Goal Crusher' }, { userId: req.user._id, badgeName: 'Goal Crusher', description: 'Completed a savings goal!', icon: '🏆' }, { upsert: true });
    }
    await goal.save();
    const saved = goal.currentAmount;
    if (saved >= 1000) {
      await Badge.findOneAndUpdate({ userId: req.user._id, badgeName: '1000 Saved' }, { userId: req.user._id, badgeName: '1000 Saved', description: 'Saved over 1000!', icon: '💰' }, { upsert: true });
    }
    res.json({ success: true, message: 'Amount added to goal', goal });
  } catch (error) { next(error); }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) { next(error); }
};
