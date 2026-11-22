const Review = require('../models/Review');
const Destination = require('../models/Destination');
const { AppError } = require('../middleware/errorHandler');

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Recalculate and persist averageRating + reviewCount on a destination */
const refreshDestinationRating = async (destinationId) => {
  const stats = await Review.aggregate([
    { $match: { destination: destinationId, isApproved: true } },
    {
      $group: {
        _id: '$destination',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Destination.findByIdAndUpdate(destinationId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    await Destination.findByIdAndUpdate(destinationId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};

// ─── controllers ─────────────────────────────────────────────────────────────

/**
 * @desc    Get approved reviews for a destination
 * @route   GET /api/reviews/destination/:destinationId
 * @access  Public
 */
const getDestinationReviews = async (req, res) => {
  const { sort = '-createdAt', page = 1, limit = 10, minRating } = req.query;

  const filter = {
    destination: req.params.destinationId,
    isApproved: true,
  };
  if (minRating) filter.rating = { $gte: parseInt(minRating, 10) };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name profilePicture')
      .lean(),
    Review.countDocuments(filter),
  ]);

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { destination: reviews[0]?.destination || req.params.destinationId, isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    ratingDistribution: distribution,
    data: reviews,
  });
};

/**
 * @desc    Add a review for a destination
 * @route   POST /api/reviews/destination/:destinationId
 * @access  Private
 */
const addReview = async (req, res) => {
  const { rating, title, comment, visitDate, tripType, images } = req.body;

  if (!rating || !comment) {
    throw new AppError('Rating and comment are required', 400);
  }

  if (rating < 1 || rating > 5) throw new AppError('Rating must be between 1 and 5', 400);

  // Check destination exists
  const destination = await Destination.findById(req.params.destinationId);
  if (!destination) throw new AppError('Destination not found', 404);

  // One review per user per destination
  const existing = await Review.findOne({
    user: req.user._id,
    destination: req.params.destinationId,
  });
  if (existing) throw new AppError('You have already reviewed this destination', 409);

  const review = await Review.create({
    user: req.user._id,
    destination: req.params.destinationId,
    rating: parseInt(rating, 10),
    title,
    comment,
    visitDate,
    tripType,
    images: images || [],
    isApproved: false, // pending admin approval
  });

  // Update stats (will be 0 / unchanged until approved, but good practice)
  await refreshDestinationRating(destination._id);

  res.status(201).json({
    success: true,
    message: 'Review submitted and pending approval',
    data: review,
  });
};

/**
 * @desc    Update own review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) throw new AppError('Review not found or not yours', 404);

  const updatable = ['rating', 'title', 'comment', 'visitDate', 'tripType', 'images'];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) review[field] = req.body[field];
  });

  if (review.rating < 1 || review.rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  // Reset approval on edit
  review.isApproved = false;
  await review.save();
  await refreshDestinationRating(review.destination);

  res.status(200).json({ success: true, message: 'Review updated (pending re-approval)', data: review });
};

/**
 * @desc    Delete a review (own or admin)
 * @route   DELETE /api/reviews/:id
 * @access  Private (own or admin)
 */
const deleteReview = async (req, res) => {
  const filter =
    req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };

  const review = await Review.findOneAndDelete(filter);
  if (!review) throw new AppError('Review not found or not authorized', 404);

  await refreshDestinationRating(review.destination);

  res.status(200).json({ success: true, message: 'Review deleted' });
};

/**
 * @desc    Get current user's reviews
 * @route   GET /api/reviews/my
 * @access  Private
 */
const getMyReviews = async (req, res) => {
  const { sort = '-createdAt', page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find({ user: req.user._id })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('destination', 'name slug images city')
      .lean(),
    Review.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: reviews,
  });
};

module.exports = {
  getDestinationReviews,
  addReview,
  updateReview,
  deleteReview,
  getMyReviews,
};
