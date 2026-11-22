const mongoose = require('mongoose');
let slugify;
try {
  slugify = require('slugify');
} catch (e) {
  slugify = (text, opts) => text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
const { DESTINATION_CATEGORIES } = require('../config/constants');

// ─── Sub-schemas ──────────────────────────────────────────────────────────────
const CoordinatesSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true }
);

const AttractionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: [
        'museum',
        'temple',
        'park',
        'beach',
        'market',
        'monument',
        'adventure',
        'restaurant',
        'hotel',
        'other',
      ],
      default: 'other',
    },
    duration: { type: String, default: null }, // e.g. "2 hours"
    estimatedCost: { type: Number, default: 0 },
    coordinates: CoordinatesSchema,
    images: [{ type: String }],
  },
  { _id: true }
);

const BestSeasonSchema = new mongoose.Schema(
  {
    from: { type: String, default: null }, // month name or number
    to: { type: String, default: null },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const DailyCostSchema = new mongoose.Schema(
  {
    budget: { type: Number, default: 0 },
    standard: { type: Number, default: 0 },
    luxury: { type: Number, default: 0 },
  },
  { _id: false }
);

// ─── Main Schema ──────────────────────────────────────────────────────────────
const DestinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      default: null,
    },
    city: {
      type: String,
      trim: true,
      default: null,
    },
    coordinates: {
      type: CoordinatesSchema,
      default: null,
    },
    images: {
      type: [ImageSchema],
      default: [],
    },
    attractions: {
      type: [AttractionSchema],
      default: [],
    },
    category: {
      type: [String],
      enum: DESTINATION_CATEGORIES,
      required: [true, 'At least one category is required'],
    },
    bestSeason: {
      type: BestSeasonSchema,
      default: {},
    },
    estimatedDailyCost: {
      type: DailyCostSchema,
      default: {},
    },
    climate: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: null,
    },
    currency: {
      type: String,
      default: null,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (v) => Math.round(v * 10) / 10, // round to 1 decimal
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    nearbyDestinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
DestinationSchema.index({ country: 1, city: 1 });
DestinationSchema.index({ category: 1 });
DestinationSchema.index({ isActive: 1, isFeatured: 1 });
DestinationSchema.index({ averageRating: -1 });
DestinationSchema.index({ name: 'text', description: 'text', tags: 'text' });

// ─── Pre-save: Auto-generate slug ────────────────────────────────────────────
DestinationSchema.pre('save', async function (next) {
  if (!this.isModified('name') && this.slug) return next();

  let baseSlug = slugify(this.name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  // ensure uniqueness
  while (true) {
    const existing = await mongoose
      .model('Destination')
      .findOne({ slug, _id: { $ne: this._id } });
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }

  this.slug = slug;
  next();
});

// ─── Virtual: Primary Image ───────────────────────────────────────────────────
DestinationSchema.virtual('primaryImage').get(function () {
  const primary = this.images.find((img) => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

module.exports = mongoose.model('Destination', DestinationSchema);
