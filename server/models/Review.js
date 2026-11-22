const mongoose = require('mongoose');
const { TRAVEL_TYPES } = require('../config/constants');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Review content is required'],
      minlength: [20, 'Review must be at least 20 characters'],
      maxlength: [3000, 'Review cannot exceed 3000 characters'],
    },
    visitDate: {
      type: Date,
      default: null,
    },
    travelType: {
      type: String,
      enum: TRAVEL_TYPES,
      default: 'solo',
    },
    pros: {
      type: [String],
      default: [],
    },
    cons: {
      type: [String],
      default: [],
    },
    photos: {
      type: [String], // array of image URLs
      default: [],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Unique: one review per user per destination
ReviewSchema.index({ user: 1, destination: 1 }, { unique: true });
ReviewSchema.index({ destination: 1, isApproved: 1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ createdAt: -1 });

// ─── Post-save: Update destination averageRating & reviewCount ────────────────
ReviewSchema.post('save', async function () {
  await updateDestinationStats(this.destination);
});

ReviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateDestinationStats(doc.destination);
});

ReviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) await updateDestinationStats(doc.destination);
});

async function updateDestinationStats(destinationId) {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    {
      $match: {
        destination: new mongoose.Types.ObjectId(destinationId),
        isApproved: true,
      },
    },
    {
      $group: {
        _id: '$destination',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Destination').findByIdAndUpdate(destinationId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    await mongoose.model('Destination').findByIdAndUpdate(destinationId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
}

module.exports = mongoose.model('Review', ReviewSchema);
