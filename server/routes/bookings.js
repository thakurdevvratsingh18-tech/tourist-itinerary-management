const express = require('express');
const router = express.Router();
const {
  getMyBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Admin route
router.get('/admin/all', authorize('admin'), getAllBookings);

// User routes
router.get('/', getMyBookings);
router.post('/', createBooking);
router.get('/:id', getBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
