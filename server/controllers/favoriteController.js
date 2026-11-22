const Favorite = require('../models/Favorite');
const Destination = require('../models/Destination');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Get current user's favorites
 * @route   GET /api/favorites
 * @access  Private
 */
const getMyFavorites = async (req, res) => {
  const { sort = '-createdAt', page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [favorites, total] = await Promise.all([
    Favorite.find({ user: req.user._id })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('destination', 'name slug city state country images averageRating category isFeatured')
      .lean(),
    Favorite.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    count: favorites.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: favorites,
  });
};

/**
 * @desc    Add a destination to favorites
 * @route   POST /api/favorites/:destinationId
 * @access  Private
 */
const addFavorite = async (req, res) => {
  const { destinationId } = req.params;

  const destination = await Destination.findOne({ _id: destinationId, isActive: true });
  if (!destination) throw new AppError('Destination not found', 404);

  const existing = await Favorite.findOne({ user: req.user._id, destination: destinationId });
  if (existing) {
    return res.status(200).json({ success: true, message: 'Already in favorites', data: existing });
  }

  const favorite = await Favorite.create({
    user: req.user._id,
    destination: destinationId,
  });

  // Increment favorites count on destination if field exists
  await Destination.findByIdAndUpdate(destinationId, { $inc: { favoritesCount: 1 } });

  res.status(201).json({ success: true, message: 'Added to favorites', data: favorite });
};

/**
 * @desc    Remove a destination from favorites
 * @route   DELETE /api/favorites/:destinationId
 * @access  Private
 */
const removeFavorite = async (req, res) => {
  const { destinationId } = req.params;

  const favorite = await Favorite.findOneAndDelete({
    user: req.user._id,
    destination: destinationId,
  });

  if (!favorite) throw new AppError('Favorite not found', 404);

  await Destination.findByIdAndUpdate(destinationId, {
    $inc: { favoritesCount: -1 },
  });

  res.status(200).json({ success: true, message: 'Removed from favorites' });
};

/**
 * @desc    Check if a destination is in the user's favorites
 * @route   GET /api/favorites/check/:destinationId
 * @access  Private
 */
const checkFavorite = async (req, res) => {
  const { destinationId } = req.params;

  const favorite = await Favorite.findOne({
    user: req.user._id,
    destination: destinationId,
  }).lean();

  res.status(200).json({ success: true, isFavorite: !!favorite, data: favorite || null });
};

module.exports = {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};
