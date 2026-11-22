const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const { AppError } = require('../middleware/errorHandler');

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Haversine distance in km between two {lat,lng} points */
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── controllers ─────────────────────────────────────────────────────────────

/**
 * @desc    Get all destinations (search, filter, sort, paginate)
 * @route   GET /api/destinations
 * @access  Public
 */
const getDestinations = async (req, res) => {
  const {
    search,
    category,
    featured,
    sort = '-createdAt',
    page = 1,
    limit = 12,
    minRating,
    country,
    state,
  } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { state: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) filter.category = category;
  if (featured === 'true') filter.isFeatured = true;
  if (country) filter.country = { $regex: country, $options: 'i' };
  if (state) filter.state = { $regex: state, $options: 'i' };
  if (minRating) filter.averageRating = { $gte: parseFloat(minRating) };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [destinations, total] = await Promise.all([
    Destination.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
    Destination.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: destinations.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: destinations,
  });
};

/**
 * @desc    Get single destination by slug or id
 * @route   GET /api/destinations/:slugOrId
 * @access  Public
 */
const getDestination = async (req, res) => {
  const { slugOrId } = req.params;

  const isObjectId = mongoose.Types.ObjectId.isValid(slugOrId);
  const query = isObjectId ? { _id: slugOrId } : { slug: slugOrId };

  const destination = await Destination.findOne({ ...query, isActive: true });
  if (!destination) throw new AppError('Destination not found', 404);

  // Populate approved reviews (latest 5)
  const reviews = await Review.find({ destination: destination._id, isApproved: true })
    .sort('-createdAt')
    .limit(5)
    .populate('user', 'name profilePicture')
    .lean();

  // Increment view count if model supports it
  if (destination.viewCount !== undefined) {
    await Destination.findByIdAndUpdate(destination._id, { $inc: { viewCount: 1 } });
  }

  res.status(200).json({
    success: true,
    data: { ...destination.toObject(), reviews },
  });
};

/**
 * @desc    Create destination (admin)
 * @route   POST /api/destinations
 * @access  Admin
 */
const createDestination = async (req, res) => {
  const destination = await Destination.create(req.body);
  res.status(201).json({ success: true, message: 'Destination created', data: destination });
};

/**
 * @desc    Update destination (admin)
 * @route   PUT /api/destinations/:id
 * @access  Admin
 */
const updateDestination = async (req, res) => {
  const destination = await Destination.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!destination) throw new AppError('Destination not found', 404);

  res.status(200).json({ success: true, message: 'Destination updated', data: destination });
};

/**
 * @desc    Soft-delete destination (admin) – sets isActive=false
 * @route   DELETE /api/destinations/:id
 * @access  Admin
 */
const deleteDestination = async (req, res) => {
  const destination = await Destination.findById(req.params.id);
  if (!destination) throw new AppError('Destination not found', 404);

  destination.isActive = false;
  await destination.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Destination deactivated' });
};

/**
 * @desc    Get featured destinations (up to 6)
 * @route   GET /api/destinations/featured
 * @access  Public
 */
const getFeaturedDestinations = async (req, res) => {
  const destinations = await Destination.find({ isFeatured: true, isActive: true })
    .sort('-averageRating -reviewCount')
    .limit(6)
    .lean();

  res.status(200).json({ success: true, count: destinations.length, data: destinations });
};

/**
 * @desc    Get nearby destinations by coordinates
 * @route   GET /api/destinations/nearby?lat=&lng=&radius=50
 * @access  Public
 */
const getNearbyDestinations = async (req, res) => {
  const { lat, lng, radius = 50, limit = 10 } = req.query;

  if (!lat || !lng) throw new AppError('lat and lng query params are required', 400);

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusKm = parseFloat(radius);
  const limitNum = Math.min(50, parseInt(limit, 10));

  if (isNaN(latitude) || isNaN(longitude)) throw new AppError('Invalid coordinates', 400);

  // Use MongoDB $geoNear if destination has 2dsphere index; otherwise haversine fallback
  let destinations;
  try {
    destinations = await Destination.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'distance',
          maxDistance: radiusKm * 1000, // metres
          spherical: true,
          query: { isActive: true },
        },
      },
      { $limit: limitNum },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 1] },
        },
      },
    ]);
  } catch (_) {
    // Fallback: manual haversine filter
    const all = await Destination.find({ isActive: true }).lean();
    destinations = all
      .map((d) => {
        const coords = d.coordinates || d.location?.coordinates;
        if (!coords) return null;
        const [dLng, dLat] = Array.isArray(coords) ? coords : [coords.lng, coords.lat];
        const dist = haversine(latitude, longitude, dLat, dLng);
        return dist <= radiusKm ? { ...d, distanceKm: Math.round(dist * 10) / 10 } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limitNum);
  }

  res.status(200).json({ success: true, count: destinations.length, data: destinations });
};

/**
 * @desc    Autocomplete search – returns name, slug, city, state
 * @route   GET /api/destinations/search?q=
 * @access  Public
 */
const searchDestinations = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) {
    return res.status(200).json({ success: true, data: [] });
  }

  const destinations = await Destination.find(
    {
      isActive: true,
      $or: [
        { name: { $regex: q.trim(), $options: 'i' } },
        { city: { $regex: q.trim(), $options: 'i' } },
        { state: { $regex: q.trim(), $options: 'i' } },
      ],
    },
    'name slug city state category images averageRating'
  )
    .limit(10)
    .lean();

  res.status(200).json({ success: true, count: destinations.length, data: destinations });
};

module.exports = {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  getFeaturedDestinations,
  getNearbyDestinations,
  searchDestinations,
};
