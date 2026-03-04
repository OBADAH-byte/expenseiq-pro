const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, updateExpense, deleteExpense, getStats } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/stats', getStats);
router.route('/').get(getExpenses).post(addExpense);
router.route('/:id').put(updateExpense).delete(deleteExpense);

module.exports = router;
