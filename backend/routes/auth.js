const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Token verification endpoint (for admin pages to check auth)
router.get('/verify', verifyToken);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/update-password', protect, authController.updatePassword);

module.exports = router;
