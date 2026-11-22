const express = require('express');
const router = express.Router();
const {
  getDestinationReviews,
  addReview,
  updateReview,
  deleteReview,
  getMyReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public
router.get('/destination/:destinationId', getDestinationReviews);

// Protected
router.use(protect);
router.get('/my', getMyReviews);
router.post('/destination/:destinationId', addReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
