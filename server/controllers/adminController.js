const User = require('../models/User');
const Destination = require('../models/Destination');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Expense = require('../models/Expense');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
const getDashboardStats = async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    totalDestinations,
    totalTrips,
    totalBookings,
    totalReviews,
    pendingReviews,
    revenueAgg,
    monthlyRevenueAgg,
    recentBookings,
    topDestinations,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Destination.countDocuments({ isActive: true }),
    Trip.countDocuments(),
    Booking.countDocuments(),
    Review.countDocuments(),
    Review.countDocuments({ isApproved: false }),
    Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    Expense.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]),
    Booking.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name email')
      .populate('destination', 'name')
      .lean(),
    Destination.find({ isActive: true })
      .sort('-reviewCount -averageRating')
      .limit(5)
      .select('name slug images averageRating reviewCount')
      .lean(),
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        newUsersLast30Days: newUsers,
        totalDestinations,
        totalTrips,
        totalBookings,
        totalReviews,
        pendingReviews,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
      monthlyRevenueTrend: monthlyRevenueAgg,
      recentBookings,
      topDestinations,
    },
  });
};

/**
 * @desc    Get all users (paginated + search)
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getUsers = async (req, res) => {
  const { search, role, isActive, sort = '-createdAt', page = 1, limit = 20 } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: users,
  });
};

/**
 * @desc    Update a user's role
 * @route   PUT /api/admin/users/:id/role
 * @access  Admin
 */
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const allowedRoles = ['user', 'admin', 'agent', 'moderator'];

  if (!allowedRoles.includes(role)) {
    throw new AppError(`Role must be one of: ${allowedRoles.join(', ')}`, 400);
  }

  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot change your own role', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) throw new AppError('User not found', 404);

  res.status(200).json({ success: true, message: 'User role updated', data: user });
};

/**
 * @desc    Delete (deactivate) a user
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
const deleteUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot delete your own account via admin panel', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'User deactivated' });
};

/**
 * @desc    Get all reviews (admin) with optional status filter
 * @route   GET /api/admin/reviews
 * @access  Admin
 */
const getReviews = async (req, res) => {
  const { isApproved, sort = '-createdAt', page = 1, limit = 20 } = req.query;

  const filter = {};
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email profilePicture')
      .populate('destination', 'name slug')
      .lean(),
    Review.countDocuments(filter),
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

/**
 * @desc    Approve a review
 * @route   PUT /api/admin/reviews/:id/approve
 * @access  Admin
 */
const approveReview = async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved: true, approvedAt: new Date(), approvedBy: req.user._id },
    { new: true }
  ).populate('destination', 'name');

  if (!review) throw new AppError('Review not found', 404);

  // Refresh destination rating
  const stats = await Review.aggregate([
    { $match: { destination: review.destination._id, isApproved: true } },
    { $group: { _id: '$destination', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Destination.findByIdAndUpdate(review.destination._id, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  }

  res.status(200).json({ success: true, message: 'Review approved', data: review });
};

/**
 * @desc    Reject a review
 * @route   PUT /api/admin/reviews/:id/reject
 * @access  Admin
 */
const rejectReview = async (req, res) => {
  const { reason } = req.body;

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      isApproved: false,
      rejectedAt: new Date(),
      rejectedBy: req.user._id,
      rejectionReason: reason || 'Does not meet community guidelines',
    },
    { new: true }
  );

  if (!review) throw new AppError('Review not found', 404);

  res.status(200).json({ success: true, message: 'Review rejected', data: review });
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getReviews,
  approveReview,
  rejectReview,
};
