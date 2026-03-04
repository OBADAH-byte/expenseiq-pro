const Badge = require('../models/Badge');

const ALL_BADGES = [
  { badgeName: 'First Expense', description: 'Added your first expense', icon: '🎯', requirement: 'Track your first expense' },
  { badgeName: 'Budget Master', description: 'Stayed under budget for a month', icon: '👑', requirement: 'Stay within budget for 30 days' },
  { badgeName: '1000 Saved', description: 'Saved over 1000 in goals', icon: '💰', requirement: 'Save 1000 across all goals' },
  { badgeName: '30 Days Discipline', description: 'Tracked expenses every day for 30 days', icon: '🔥', requirement: 'Log expenses for 30 consecutive days' },
  { badgeName: 'Goal Crusher', description: 'Completed a savings goal', icon: '🏆', requirement: 'Complete any savings goal' },
  { badgeName: 'Frugal Five', description: 'Reduced spending 5 months in a row', icon: '📉', requirement: 'Decrease spending 5 months consecutively' },
  { badgeName: 'Expense Explorer', description: 'Tracked expenses in 5 different categories', icon: '🗺️', requirement: 'Use 5 different expense categories' },
  { badgeName: 'Savings Streak', description: 'Made contributions to a goal 7 days in a row', icon: '⚡', requirement: 'Contribute to a goal for 7 consecutive days' },
  { badgeName: 'Category Champion', description: 'Reduced spending in your top category', icon: '🎖️', requirement: 'Cut your highest category spending by 20%' },
  { badgeName: 'Monthly Master', description: 'Generated a monthly report', icon: '📊', requirement: 'View your first monthly report' }
];

exports.getUserBadges = async (req, res, next) => {
  try {
    const earnedBadges = await Badge.find({ userId: req.user._id });
    const earnedNames = new Set(earnedBadges.map(b => b.badgeName));
    const allBadges = ALL_BADGES.map(badge => ({
      ...badge,
      earned: earnedNames.has(badge.badgeName),
      earnedDate: earnedBadges.find(b => b.badgeName === badge.badgeName)?.earnedDate || null
    }));
    res.json({ success: true, badges: allBadges, earnedCount: earnedBadges.length, totalCount: ALL_BADGES.length });
  } catch (error) { next(error); }
};

exports.awardBadge = async (req, res, next) => {
  try {
    const { badgeName } = req.body;
    const validBadge = ALL_BADGES.find(b => b.badgeName === badgeName);
    if (!validBadge) return res.status(400).json({ success: false, message: 'Invalid badge name' });
    const badge = await Badge.findOneAndUpdate(
      { userId: req.user._id, badgeName },
      { userId: req.user._id, badgeName, description: validBadge.description, icon: validBadge.icon },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: `Badge "${badgeName}" awarded!`, badge });
  } catch (error) { next(error); }
};
