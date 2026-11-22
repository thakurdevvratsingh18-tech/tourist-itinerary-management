const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const {
  TRIP_STATUS,
  TRAVEL_STYLES,
  INTERESTS,
} = require('../config/constants');

const TripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    destinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination',
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    numberOfDays: {
      type: Number,
      min: [1, 'Trip must be at least 1 day'],
    },
    numberOfTravelers: {
      type: Number,
      required: [true, 'Number of travelers is required'],
      min: [1, 'At least 1 traveler required'],
      default: 1,
    },
    status: {
      type: String,
      enum: Object.values(TRIP_STATUS),
      default: TRIP_STATUS.DRAFT,
    },
    totalBudget: {
      type: Number,
      default: 0,
      min: [0, 'Budget cannot be negative'],
    },
    transportMode: {
      type: String,
      enum: ['flight', 'train', 'bus', 'car', 'ship', 'mixed', 'other'],
      default: 'mixed',
    },
    travelStyle: {
      type: String,
      enum: TRAVEL_STYLES,
      default: 'solo',
    },
    interests: {
      type: [String],
      enum: INTERESTS,
      default: [],
    },
    shareToken: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    coverImage: {
      type: String,
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
TripSchema.index({ user: 1, status: 1 });
TripSchema.index({ isPublic: 1 });
TripSchema.index({ startDate: 1 });

// ─── Pre-save: Compute numberOfDays ──────────────────────────────────────────
TripSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const diffMs = new Date(this.endDate) - new Date(this.startDate);
    this.numberOfDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);
  }
  next();
});

// ─── Validation: endDate >= startDate ────────────────────────────────────────
TripSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be on or after start date');
  }
  next();
});

// ─── Virtual: Duration label ──────────────────────────────────────────────────
TripSchema.virtual('durationLabel').get(function () {
  if (!this.numberOfDays) return null;
  return this.numberOfDays === 1
    ? '1 day'
    : `${this.numberOfDays} days`;
});

module.exports = mongoose.model('Trip', TripSchema);
