const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get cart
router.get('/', cartController.getCart);
// Add to cart
router.post('/add', cartController.addToCart);
// Remove from cart
router.post('/remove', cartController.removeFromCart);
// Update quantity
router.post('/update', cartController.updateQuantity);
// Clear cart
router.post('/clear', cartController.clearCart);

module.exports = router;
