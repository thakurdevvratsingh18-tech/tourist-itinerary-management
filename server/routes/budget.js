const express = require('express');
const router = express.Router();
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getBudgetSummary,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Trip-scoped routes
router.get('/trip/:tripId', getExpenses);
router.post('/trip/:tripId', addExpense);
router.get('/trip/:tripId/summary', getBudgetSummary);

// Individual expense routes
router.put('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);

module.exports = router;
