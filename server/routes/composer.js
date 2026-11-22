const express = require('express');
const router = express.Router();
const {
  optimizeJourneyRoute,
  saveComposerPlan,
} = require('../controllers/composerController');
const { protect } = require('../middleware/auth');

// Public route to calculate route options
router.post('/optimize', optimizeJourneyRoute);

// Protected route to save generated route to user's dashboard trips
router.post('/save', protect, saveComposerPlan);

module.exports = router;
