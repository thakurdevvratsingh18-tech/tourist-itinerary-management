const Booking = require('../models/Booking');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Get all bookings for the current user
 * @route   GET /api/bookings
 * @access  Private
 */
const getMyBookings = async (req, res) => {
  const { status, type, sort = '-createdAt', page = 1, limit = 10 } = req.query;

  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (type) filter.type = type;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('trip', 'title startDate endDate')
      .populate('destination', 'name slug images')
      .lean(),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: bookings,
  });
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBooking = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
    .populate('trip', 'title startDate endDate coverImage')
    .populate('destination', 'name slug images city state');

  if (!booking) throw new AppError('Booking not found', 404);

  res.status(200).json({ success: true, data: booking });
};

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res) => {
  const {
    trip,
    destination,
    type,
    title,
    description,
    provider,
    confirmationNumber,
    checkIn,
    checkOut,
    amount,
    currency,
    travelers,
    notes,
    attachments,
  } = req.body;

  if (!type || !title) {
    throw new AppError('Booking type and title are required', 400);
  }

  const booking = await Booking.create({
    user: req.user._id,
    trip,
    destination,
    type,
    title,
    description,
    provider,
    confirmationNumber,
    checkIn,
    checkOut,
    amount: amount || 0,
    currency: currency || 'USD',
    travelers: travelers || 1,
    notes,
    attachments: attachments || [],
    status: 'pending',
  });

  res.status(201).json({ success: true, message: 'Booking created', data: booking });
};

/**
 * @desc    Update a booking
 * @route   PUT /api/bookings/:id
 * @access  Private
 */
const updateBooking = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) throw new AppError('Booking not found', 404);

  const updatable = [
    'title', 'description', 'provider', 'confirmationNumber',
    'checkIn', 'checkOut', 'amount', 'currency', 'travelers',
    'notes', 'attachments', 'status', 'type',
  ];

  updatable.forEach((field) => {
    if (req.body[field] !== undefined) booking[field] = req.body[field];
  });

  await booking.save();

  res.status(200).json({ success: true, message: 'Booking updated', data: booking });
};

/**
 * @desc    Delete a booking
 * @route   DELETE /api/bookings/:id
 * @access  Private
 */
const deleteBooking = async (req, res) => {
  const booking = await Booking.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!booking) throw new AppError('Booking not found', 404);

  res.status(200).json({ success: true, message: 'Booking deleted' });
};

/**
 * @desc    Admin: get all bookings
 * @route   GET /api/bookings/admin/all
 * @access  Admin
 */
const getAllBookings = async (req, res) => {
  const { status, type, sort = '-createdAt', page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email')
      .populate('trip', 'title')
      .populate('destination', 'name slug')
      .lean(),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: bookings,
  });
};

module.exports = {
  getMyBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getAllBookings,
};
