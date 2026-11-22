const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES } = require('../config/constants');

const ExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip reference is required'],
    },
    category: {
      type: String,
      enum: Object.values(EXPENSE_CATEGORIES),
      required: [true, 'Expense category is required'],
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
      maxlength: [3, 'Currency code cannot exceed 3 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
    receipt: {
      type: String, // URL to uploaded receipt image
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
ExpenseSchema.index({ user: 1, trip: 1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ date: -1 });

// ─── Static: Aggregate expenses by category for a trip ───────────────────────
ExpenseSchema.statics.getSummaryByTrip = async function (tripId) {
  return this.aggregate([
    { $match: { trip: new mongoose.Types.ObjectId(tripId) } },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

// ─── Static: Get total spend for a trip ──────────────────────────────────────
ExpenseSchema.statics.getTotalForTrip = async function (tripId) {
  const result = await this.aggregate([
    { $match: { trip: new mongoose.Types.ObjectId(tripId) } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result.length > 0 ? result[0].total : 0;
};

module.exports = mongoose.model('Expense', ExpenseSchema);
