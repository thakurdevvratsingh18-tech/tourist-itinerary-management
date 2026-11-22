const express = require('express');
const router = express.Router();
const {
  getMyTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  shareTrip,
  getSharedTrip,
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

// Public – shared trip access (no auth needed)
router.get('/shared/:token', getSharedTrip);

// Protected routes
router.use(protect);

router.get('/', getMyTrips);
router.post('/', createTrip);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/share', shareTrip);

module.exports = router;
