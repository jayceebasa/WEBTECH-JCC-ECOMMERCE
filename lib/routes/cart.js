const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protectUser } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protectUser);

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
// Checkout cart
router.post('/checkout', cartController.checkoutCart);

module.exports = router;
