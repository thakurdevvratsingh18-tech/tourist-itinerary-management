const express = require('express');
const router = express.Router();
const {
  submitContact,
  getMessages,
  updateMessageStatus,
  replyMessage,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.post('/', submitContact);

// Admin only
router.get('/', protect, authorize('admin'), getMessages);
router.put('/:id/status', protect, authorize('admin'), updateMessageStatus);
router.post('/:id/reply', protect, authorize('admin'), replyMessage);

module.exports = router;
