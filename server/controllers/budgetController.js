const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const { AppError } = require('../middleware/errorHandler');

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Verify trip ownership */
const verifyTripOwner = async (tripId, userId) => {
  const trip = await Trip.findOne({ _id: tripId, user: userId });
  if (!trip) throw new AppError('Trip not found or access denied', 404);
  return trip;
};

// ─── controllers ─────────────────────────────────────────────────────────────

/**
 * @desc    Get all expenses for a trip
 * @route   GET /api/budget/trip/:tripId
 * @access  Private
 */
const getExpenses = async (req, res) => {
  const { tripId } = req.params;
  const { category, sort = '-date', page = 1, limit = 20 } = req.query;

  await verifyTripOwner(tripId, req.user._id);

  const filter = { trip: tripId, user: req.user._id };
  if (category) filter.category = category;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [expenses, total] = await Promise.all([
    Expense.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
    Expense.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: expenses.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: expenses,
  });
};

/**
 * @desc    Add an expense to a trip
 * @route   POST /api/budget/trip/:tripId
 * @access  Private
 */
const addExpense = async (req, res) => {
  const { tripId } = req.params;
  await verifyTripOwner(tripId, req.user._id);

  const { title, amount, category, date, paymentMethod, notes, currency } = req.body;

  if (!title || amount === undefined) {
    throw new AppError('Title and amount are required', 400);
  }

  if (amount < 0) throw new AppError('Amount cannot be negative', 400);

  const expense = await Expense.create({
    trip: tripId,
    user: req.user._id,
    title,
    amount,
    category: category || 'other',
    date: date || new Date(),
    paymentMethod: paymentMethod || 'cash',
    notes,
    currency: currency || 'USD',
  });

  res.status(201).json({ success: true, message: 'Expense added', data: expense });
};

/**
 * @desc    Update an expense
 * @route   PUT /api/budget/:expenseId
 * @access  Private
 */
const updateExpense = async (req, res) => {
  const expense = await Expense.findOne({
    _id: req.params.expenseId,
    user: req.user._id,
  });
  if (!expense) throw new AppError('Expense not found', 404);

  const updatable = ['title', 'amount', 'category', 'date', 'paymentMethod', 'notes', 'currency'];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) expense[field] = req.body[field];
  });

  if (expense.amount < 0) throw new AppError('Amount cannot be negative', 400);

  await expense.save();

  res.status(200).json({ success: true, message: 'Expense updated', data: expense });
};

/**
 * @desc    Delete an expense
 * @route   DELETE /api/budget/:expenseId
 * @access  Private
 */
const deleteExpense = async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.expenseId,
    user: req.user._id,
  });
  if (!expense) throw new AppError('Expense not found', 404);

  res.status(200).json({ success: true, message: 'Expense deleted' });
};

/**
 * @desc    Get budget summary for a trip
 * @route   GET /api/budget/trip/:tripId/summary
 * @access  Private
 */
const getBudgetSummary = async (req, res) => {
  const { tripId } = req.params;
  const trip = await verifyTripOwner(tripId, req.user._id);

  // Aggregate by category
  const categoryAgg = await Expense.aggregate([
    { $match: { trip: trip._id, user: req.user._id } },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
      },
    },
    { $sort: { total: -1 } },
  ]);

  // Daily spending trend
  const dailyAgg = await Expense.aggregate([
    { $match: { trip: trip._id, user: req.user._id } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalSpent = categoryAgg.reduce((sum, c) => sum + c.total, 0);
  const budget = trip.budget || 0;
  const remaining = budget - totalSpent;
  const percentUsed = budget > 0 ? Math.round((totalSpent / budget) * 100) : null;

  const byCategory = categoryAgg.map((c) => ({
    category: c._id,
    total: Math.round(c.total * 100) / 100,
    count: c.count,
    avgAmount: Math.round(c.avgAmount * 100) / 100,
    percentage: totalSpent > 0 ? Math.round((c.total / totalSpent) * 100) : 0,
  }));

  const dailyTrend = dailyAgg.map((d) => ({
    date: d._id,
    total: Math.round(d.total * 100) / 100,
    count: d.count,
  }));

  res.status(200).json({
    success: true,
    data: {
      tripId,
      budget: Math.round(budget * 100) / 100,
      currency: trip.currency || 'USD',
      totalSpent: Math.round(totalSpent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      percentUsed,
      isOverBudget: remaining < 0,
      byCategory,
      dailyTrend,
    },
  });
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getBudgetSummary,
};
