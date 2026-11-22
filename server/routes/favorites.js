const express = require('express');
const router = express.Router();
const {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getMyFavorites);
router.get('/check/:destinationId', checkFavorite);
router.post('/:destinationId', addFavorite);
router.delete('/:destinationId', removeFavorite);

module.exports = router;
