const crypto = require('crypto');
const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const Expense = require('../models/Expense');
const { AppError } = require('../middleware/errorHandler');

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Returns number of days between two dates (inclusive) */
const daysBetween = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  return Math.max(1, Math.round((e - s) / 86400000) + 1);
};

/** Build a Date object for the nth day of a trip */
const nthDay = (startDate, n) => {
  const d = new Date(startDate);
  d.setDate(d.getDate() + n);
  return d;
};

// ─── controllers ─────────────────────────────────────────────────────────────

/**
 * @desc    Get authenticated user's trips
 * @route   GET /api/trips
 * @access  Private
 */
const getMyTrips = async (req, res) => {
  const { status, sort = '-createdAt', page = 1, limit = 10, search } = req.query;

  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { destination: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [trips, total] = await Promise.all([
    Trip.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('destination', 'name slug images city state')
      .lean(),
    Trip.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: trips.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: trips,
  });
};

/**
 * @desc    Get single trip with its itineraries
 * @route   GET /api/trips/:id
 * @access  Private
 */
const getTrip = async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id }).populate(
    'destination',
    'name slug images city state country averageRating'
  );

  if (!trip) throw new AppError('Trip not found', 404);

  const itineraries = await Itinerary.find({ trip: trip._id }).sort('day').lean();

  res.status(200).json({ success: true, data: { ...trip.toObject(), itineraries } });
};

/**
 * @desc    Create a new trip + auto-create itinerary slots (one per day)
 * @route   POST /api/trips
 * @access  Private
 */
const createTrip = async (req, res) => {
  const {
    title,
    destination,
    startDate,
    endDate,
    budget,
    currency,
    travelers,
    notes,
    coverImage,
    tags,
  } = req.body;

  if (!title || !startDate || !endDate) {
    throw new AppError('Title, startDate, and endDate are required', 400);
  }

  if (new Date(endDate) < new Date(startDate)) {
    throw new AppError('End date must be on or after start date', 400);
  }

  const trip = await Trip.create({
    user: req.user._id,
    title,
    destination,
    startDate,
    endDate,
    budget: budget || 0,
    currency: currency || 'USD',
    travelers: travelers || 1,
    notes,
    coverImage,
    tags,
    status: 'planning',
  });

  // Auto-create one itinerary slot per day
  const totalDays = daysBetween(startDate, endDate);
  const itineraryDocs = Array.from({ length: totalDays }, (_, i) => ({
    trip: trip._id,
    user: req.user._id,
    day: i + 1,
    date: nthDay(startDate, i),
    title: `Day ${i + 1}`,
    activities: [],
  }));

  await Itinerary.insertMany(itineraryDocs);

  res.status(201).json({ success: true, message: 'Trip created', data: trip });
};

/**
 * @desc    Update trip
 * @route   PUT /api/trips/:id
 * @access  Private
 */
const updateTrip = async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
  if (!trip) throw new AppError('Trip not found', 404);

  const updatable = [
    'title', 'destination', 'startDate', 'endDate',
    'budget', 'currency', 'travelers', 'notes', 'coverImage', 'tags', 'status',
  ];

  updatable.forEach((field) => {
    if (req.body[field] !== undefined) trip[field] = req.body[field];
  });

  await trip.save();

  res.status(200).json({ success: true, message: 'Trip updated', data: trip });
};

/**
 * @desc    Delete trip + related itineraries and expenses
 * @route   DELETE /api/trips/:id
 * @access  Private
 */
const deleteTrip = async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
  if (!trip) throw new AppError('Trip not found', 404);

  await Promise.all([
    Itinerary.deleteMany({ trip: trip._id }),
    Expense.deleteMany({ trip: trip._id }),
    trip.deleteOne(),
  ]);

  res.status(200).json({ success: true, message: 'Trip and all related data deleted' });
};

/**
 * @desc    Generate a share token for the trip
 * @route   POST /api/trips/:id/share
 * @access  Private
 */
const shareTrip = async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
  if (!trip) throw new AppError('Trip not found', 404);

  if (!trip.shareToken) {
    trip.shareToken = crypto.randomBytes(20).toString('hex');
    await trip.save({ validateBeforeSave: false });
  }

  const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/trip/${trip.shareToken}`;

  res.status(200).json({ success: true, shareToken: trip.shareToken, shareUrl });
};

/**
 * @desc    Get publicly shared trip via shareToken
 * @route   GET /api/trips/shared/:token
 * @access  Public
 */
const getSharedTrip = async (req, res) => {
  const trip = await Trip.findOne({ shareToken: req.params.token })
    .populate('destination', 'name slug images city state country')
    .lean();

  if (!trip) throw new AppError('Shared trip not found or link is invalid', 404);

  const itineraries = await Itinerary.find({ trip: trip._id }).sort('day').lean();

  // Strip private info
  delete trip.user;
  delete trip.shareToken;

  res.status(200).json({ success: true, data: { ...trip, itineraries } });
};

module.exports = {
  getMyTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  shareTrip,
  getSharedTrip,
};
