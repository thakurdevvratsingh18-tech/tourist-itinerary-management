const mongoose = require('mongoose');
const {
  BOOKING_TYPES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
} = require('../config/constants');

const BookingSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: Object.values(BOOKING_TYPES),
      required: [true, 'Booking type is required'],
    },
    title: {
      type: String,
      required: [true, 'Booking title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    provider: {
      type: String,
      trim: true,
      default: null,
    },
    confirmationNumber: {
      type: String,
      trim: true,
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      default: null,
    },
    startTime: {
      type: String, // HH:mm
      default: null,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'startTime must be HH:mm format'],
    },
    endTime: {
      type: String,
      default: null,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'endTime must be HH:mm format'],
    },
    amount: {
      type: Number,
      required: [true, 'Booking amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
      maxlength: [3, 'Currency code cannot exceed 3 characters'],
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    notes: {
      type: String,
      default: '',
    },
    bookingUrl: {
      type: String,
      default: null,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
BookingSchema.index({ user: 1, trip: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ startDate: 1 });
BookingSchema.index({ type: 1 });

// ─── Validation: endDate >= startDate ────────────────────────────────────────
BookingSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be on or after start date');
  }
  next();
});

// ─── Virtual: duration in nights/days ────────────────────────────────────────
BookingSchema.virtual('durationDays').get(function () {
  if (!this.startDate || !this.endDate) return null;
  const diffMs = new Date(this.endDate) - new Date(this.startDate);
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Booking', BookingSchema);
