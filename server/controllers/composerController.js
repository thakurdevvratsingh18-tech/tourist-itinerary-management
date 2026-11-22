const Destination = require('../models/Destination');
const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const { optimizeJourney } = require('../services/routeOptimizer');

/**
 * @desc    Generate optimized Plan A (distance) & Plan B (experience)
 * @route   POST /api/composer/optimize
 * @access  Public
 */
exports.optimizeJourneyRoute = async (req, res) => {
  const {
    origin,
    destinationIds = [],
    destinations: rawDestinations = [],
    startDate = new Date().toISOString().split('T')[0],
    days = 5,
    totalBudget = 40000,
    travelers = 1,
    transportPreference = 'mixed',
    interests = [],
  } = req.body;

  let destinationsToOptimize = [];

  // If destination IDs provided, load full models from database
  if (destinationIds && destinationIds.length > 0) {
    destinationsToOptimize = await Destination.find({
      _id: { $in: destinationIds },
      isActive: true,
    }).lean();
  } else if (rawDestinations && rawDestinations.length > 0) {
    destinationsToOptimize = rawDestinations;
  } else {
    // Default fallback: pull top 5 featured destinations
    destinationsToOptimize = await Destination.find({ isActive: true })
      .limit(5)
      .lean();
  }

  if (destinationsToOptimize.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid destinations found to compose route',
    });
  }

  const optimizationResult = optimizeJourney({
    origin,
    destinations: destinationsToOptimize,
    startDate,
    days: parseInt(days, 10),
    totalBudget: parseInt(totalBudget, 10),
    travelers: parseInt(travelers, 10),
    transportPreference,
    interests: Array.isArray(interests) ? interests : [interests],
  });

  return res.status(200).json({
    success: true,
    data: optimizationResult,
  });
};

/**
 * @desc    Save a chosen composer plan as a real Trip and Itineraries
 * @route   POST /api/composer/save
 * @access  Private
 */
exports.saveComposerPlan = async (req, res) => {
  const {
    title,
    plan,
    startDate,
    days,
    travelers = 1,
    transportPreference = 'mixed',
  } = req.body;

  if (!plan || !plan.orderedDestinations || !plan.itinerary) {
    return res.status(400).json({
      success: false,
      message: 'Invalid plan data provided',
    });
  }

  const start = new Date(startDate || Date.now());
  const numDays = parseInt(days || plan.itinerary.length, 10);
  const end = new Date(start);
  end.setDate(start.getDate() + (numDays - 1));

  // Extract unique destination IDs from plan
  const destinationIds = [
    ...new Set(
      plan.orderedDestinations
        .map((d) => d._id)
        .filter(Boolean)
    ),
  ];

  // 1. Create Trip record
  const trip = await Trip.create({
    title: title || `Smart Journey: ${plan.name}`,
    description: `Auto-composed trip with ${plan.orderedDestinations.length} destinations over ${numDays} days. Strategy: ${plan.strategy}.`,
    user: req.user._id,
    destinations: destinationIds,
    startDate: start,
    endDate: end,
    numberOfDays: numDays,
    numberOfTravelers: parseInt(travelers, 10),
    totalBudget: plan.budgetBreakdown?.totalEstimated || 0,
    transportMode: transportPreference.toLowerCase(),
    travelStyle: 'solo',
    status: 'planned',
  });

  // 2. Create daily Itinerary records
  const itineraryPromises = plan.itinerary.map((dayPlan, index) => {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + index);

    const activities = (dayPlan.activities || []).map((act, aIdx) => ({
      order: aIdx + 1,
      title: act.title,
      description: act.description,
      startTime: act.startTime,
      endTime: act.endTime,
      type: act.type || 'sightseeing',
      estimatedCost: act.estimatedCost || 0,
      attraction: act.attraction || {},
    }));

    return Itinerary.create({
      trip: trip._id,
      user: req.user._id,
      day: dayPlan.day || index + 1,
      date: dayDate,
      title: dayPlan.title,
      notes: `Estimated daily budget: ₹${dayPlan.dayCosts?.total || 0}`,
      activities,
    });
  });

  await Promise.all(itineraryPromises);

  return res.status(201).json({
    success: true,
    message: 'Trip and full day-by-day itineraries saved successfully',
    tripId: trip._id,
    trip,
  });
};
