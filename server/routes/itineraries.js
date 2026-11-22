const express = require('express');
const router = express.Router();
const {
  getTripItineraries,
  getItinerary,
  updateItinerary,
  addActivity,
  updateActivity,
  removeActivity,
  reorderActivities,
} = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');

router.use(protect);

// All itineraries for a specific trip
router.get('/trip/:tripId', getTripItineraries);

// Single itinerary
router.get('/:id', getItinerary);
router.put('/:id', updateItinerary);

// Activity management within an itinerary
router.post('/:id/activities', addActivity);
router.put('/:id/activities/reorder', reorderActivities);
router.put('/:id/activities/:activityId', updateActivity);
router.delete('/:id/activities/:activityId', removeActivity);

module.exports = router;
