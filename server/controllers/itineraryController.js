const mongoose = require('mongoose');
const Itinerary = require('../models/Itinerary');
const Trip = require('../models/Trip');
const { AppError } = require('../middleware/errorHandler');

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Verify the trip belongs to the requesting user */
const verifyTripOwner = async (tripId, userId) => {
  const trip = await Trip.findOne({ _id: tripId, user: userId });
  if (!trip) throw new AppError('Trip not found or access denied', 404);
  return trip;
};

/** Find an itinerary owned (via trip) by the user */
const findOwnedItinerary = async (itineraryId, userId) => {
  const itinerary = await Itinerary.findById(itineraryId).populate('trip', 'user');
  if (!itinerary) throw new AppError('Itinerary not found', 404);
  if (itinerary.trip.user.toString() !== userId.toString()) {
    throw new AppError('Not authorized to access this itinerary', 403);
  }
  return itinerary;
};

// ─── controllers ─────────────────────────────────────────────────────────────

/**
 * @desc    Get all itinerary days for a trip
 * @route   GET /api/itineraries/trip/:tripId
 * @access  Private
 */
const getTripItineraries = async (req, res) => {
  await verifyTripOwner(req.params.tripId, req.user._id);

  const itineraries = await Itinerary.find({ trip: req.params.tripId })
    .sort('day')
    .populate('activities.destination', 'name slug images')
    .lean();

  res.status(200).json({ success: true, count: itineraries.length, data: itineraries });
};

/**
 * @desc    Get a single itinerary day
 * @route   GET /api/itineraries/:id
 * @access  Private
 */
const getItinerary = async (req, res) => {
  const itinerary = await findOwnedItinerary(req.params.id, req.user._id);
  await itinerary.populate('activities.destination', 'name slug images');

  res.status(200).json({ success: true, data: itinerary });
};

/**
 * @desc    Update itinerary title / notes
 * @route   PUT /api/itineraries/:id
 * @access  Private
 */
const updateItinerary = async (req, res) => {
  const itinerary = await findOwnedItinerary(req.params.id, req.user._id);

  const { title, notes } = req.body;
  if (title !== undefined) itinerary.title = title;
  if (notes !== undefined) itinerary.notes = notes;

  await itinerary.save();

  res.status(200).json({ success: true, message: 'Itinerary updated', data: itinerary });
};

/**
 * @desc    Add an activity to an itinerary day
 * @route   POST /api/itineraries/:id/activities
 * @access  Private
 * Body: { name, type, startTime, endTime, duration, location, destination, notes, cost, currency }
 */
const addActivity = async (req, res) => {
  const itinerary = await findOwnedItinerary(req.params.id, req.user._id);

  const {
    name,
    type,
    startTime,
    endTime,
    duration,
    location,
    destination,
    notes,
    cost,
    currency,
    icon,
  } = req.body;

  if (!name) throw new AppError('Activity name is required', 400);

  const activity = {
    _id: new mongoose.Types.ObjectId(),
    name,
    type: type || 'activity',
    startTime,
    endTime,
    duration,
    location,
    destination: destination || undefined,
    notes,
    cost: cost || 0,
    currency: currency || 'USD',
    icon,
  };

  itinerary.activities.push(activity);
  await itinerary.save();

  res.status(201).json({ success: true, message: 'Activity added', data: itinerary });
};

/**
 * @desc    Update a specific activity within an itinerary
 * @route   PUT /api/itineraries/:id/activities/:activityId
 * @access  Private
 */
const updateActivity = async (req, res) => {
  const itinerary = await findOwnedItinerary(req.params.id, req.user._id);

  const activity = itinerary.activities.id(req.params.activityId);
  if (!activity) throw new AppError('Activity not found', 404);

  const updatable = [
    'name', 'type', 'startTime', 'endTime', 'duration',
    'location', 'destination', 'notes', 'cost', 'currency', 'icon',
  ];

  updatable.forEach((field) => {
    if (req.body[field] !== undefined) activity[field] = req.body[field];
  });

  await itinerary.save();

  res.status(200).json({ success: true, message: 'Activity updated', data: itinerary });
};

/**
 * @desc    Remove an activity from an itinerary
 * @route   DELETE /api/itineraries/:id/activities/:activityId
 * @access  Private
 */
const removeActivity = async (req, res) => {
  const itinerary = await findOwnedItinerary(req.params.id, req.user._id);

  const activity = itinerary.activities.id(req.params.activityId);
  if (!activity) throw new AppError('Activity not found', 404);

  activity.deleteOne();
  await itinerary.save();

  res.status(200).json({ success: true, message: 'Activity removed', data: itinerary });
};

/**
 * @desc    Reorder activities within an itinerary
 * @route   PUT /api/itineraries/:id/activities/reorder
 * @access  Private
 * Body: { orderedIds: ["activityId1", "activityId2", ...] }
 */
const reorderActivities = async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    throw new AppError('orderedIds must be an array of activity IDs', 400);
  }

  const itinerary = await findOwnedItinerary(req.params.id, req.user._id);

  // Build a map for O(1) lookup
  const activityMap = {};
  itinerary.activities.forEach((a) => {
    activityMap[a._id.toString()] = a.toObject();
  });

  // Validate all provided IDs exist
  for (const id of orderedIds) {
    if (!activityMap[id]) {
      throw new AppError(`Activity ID ${id} not found in this itinerary`, 400);
    }
  }

  // Reconstruct activities in the specified order, appending any not in the list
  const reordered = orderedIds.map((id) => activityMap[id]);
  const mentioned = new Set(orderedIds);
  itinerary.activities.forEach((a) => {
    if (!mentioned.has(a._id.toString())) reordered.push(a.toObject());
  });

  itinerary.activities = reordered;
  await itinerary.save();

  res.status(200).json({ success: true, message: 'Activities reordered', data: itinerary });
};

module.exports = {
  getTripItineraries,
  getItinerary,
  updateItinerary,
  addActivity,
  updateActivity,
  removeActivity,
  reorderActivities,
};
