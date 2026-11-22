const mongoose = require('mongoose');
const { ACTIVITY_TYPES } = require('../config/constants');

// ─── Sub-schema: single activity in a day ────────────────────────────────────
const ActivitySchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      required: [true, 'Activity order is required'],
      min: 1,
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      default: null,
    },
    attraction: {
      name: { type: String, default: null },
      coordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },
    startTime: {
      type: String, // HH:mm format
      default: null,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'startTime must be HH:mm format'],
    },
    endTime: {
      type: String,
      default: null,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'endTime must be HH:mm format'],
    },
    duration: {
      type: Number, // minutes
      default: null,
      min: [0, 'Duration cannot be negative'],
    },
    type: {
      type: String,
      enum: Object.values(ACTIVITY_TYPES),
      required: [true, 'Activity type is required'],
      default: ACTIVITY_TYPES.SIGHTSEEING,
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: [0, 'Estimated cost cannot be negative'],
    },
    actualCost: {
      type: Number,
      default: null,
      min: [0, 'Actual cost cannot be negative'],
    },
    bookingReference: {
      type: String,
      default: null,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'skipped', 'cancelled'],
      default: 'pending',
    },
  },
  { _id: true }
);

// ─── Main Schema ──────────────────────────────────────────────────────────────
const ItinerarySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    day: {
      type: Number,
      required: [true, 'Day number is required'],
      min: [1, 'Day must be at least 1'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    activities: {
      type: [ActivitySchema],
      default: [],
    },
    totalDistance: {
      type: Number, // kilometres
      default: 0,
      min: [0, 'Total distance cannot be negative'],
    },
    estimatedTravelTime: {
      type: Number, // minutes
      default: 0,
      min: [0, 'Estimated travel time cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
ItinerarySchema.index({ trip: 1, day: 1 }, { unique: true });
ItinerarySchema.index({ user: 1 });
ItinerarySchema.index({ date: 1 });

// ─── Virtual: Estimated day cost ─────────────────────────────────────────────
ItinerarySchema.virtual('estimatedDayCost').get(function () {
  return this.activities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0);
});

// ─── Virtual: Actual day cost ─────────────────────────────────────────────────
ItinerarySchema.virtual('actualDayCost').get(function () {
  return this.activities.reduce((sum, a) => sum + (a.actualCost || 0), 0);
});

// ─── Pre-save: sort activities by order ──────────────────────────────────────
ItinerarySchema.pre('save', function (next) {
  if (this.activities && this.activities.length > 0) {
    this.activities.sort((a, b) => a.order - b.order);
  }
  next();
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);
