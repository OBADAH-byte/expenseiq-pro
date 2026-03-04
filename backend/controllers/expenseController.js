const Expense = require('../models/Expense');
const Badge = require('../models/Badge');

const checkAndAwardBadges = async (userId) => {
  const count = await Expense.countDocuments({ userId });
  if (count === 1) {
    await Badge.findOneAndUpdate({ userId, badgeName: 'First Expense' }, { userId, badgeName: 'First Expense', description: 'Added your first expense!', icon: '🎯' }, { upsert: true });
  }
  if (count >= 5) {
    await Badge.findOneAndUpdate({ userId, badgeName: 'Expense Explorer' }, { userId, badgeName: 'Expense Explorer', description: 'Tracked 5 expenses!', icon: '🗺️' }, { upsert: true });
  }
};

exports.addExpense = async (req, res, next) => {
  try {
    const { amount, category, description, currency, date } = req.body;
    const expense = await Expense.create({ userId: req.user._id, amount, category, description, currency: currency || req.user.currency, date: date || new Date() });
    await checkAndAwardBadges(req.user._id);
    res.status(201).json({ success: true, message: 'Expense added successfully', expense });
  } catch (error) { next(error); }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, search, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };
    if (category && category !== 'all') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) query.description = { $regex: search, $options: 'i' };
    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query).sort({ date: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, expenses, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) { next(error); }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true, runValidators: true });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense updated successfully', expense });
  } catch (error) { next(error); }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) { next(error); }
};

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTotal = await Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const categoryBreakdown = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    const monthlyTrend = await Expense.aggregate([
      { $match: { userId, date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const allTimeTotal = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    res.json({
      success: true,
      stats: {
        monthlyTotal: monthlyTotal[0]?.total || 0,
        allTimeTotal: allTimeTotal[0]?.total || 0,
        categoryBreakdown,
        monthlyTrend
      }
    });
  } catch (error) { next(error); }
};
