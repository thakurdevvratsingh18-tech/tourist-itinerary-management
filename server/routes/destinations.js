const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  getFeaturedDestinations,
  getNearbyDestinations,
  searchDestinations,
} = require('../controllers/destinationController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');

// Public routes – specific paths before :slugOrId
router.get('/featured', getFeaturedDestinations);
router.get('/nearby', getNearbyDestinations);
router.get('/search', searchDestinations);

router.get('/', getDestinations);
router.get('/:slugOrId', optionalProtect, getDestination);

// Admin-only routes
router.post('/', protect, authorize('admin'), createDestination);
router.put('/:id', protect, authorize('admin'), updateDestination);
router.delete('/:id', protect, authorize('admin'), deleteDestination);

module.exports = router;
