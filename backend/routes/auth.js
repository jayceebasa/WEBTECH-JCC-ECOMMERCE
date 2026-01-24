const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes (would require authentication middleware)
// router.get('/me', protect, authController.getMe);
// router.put('/update-password', protect, authController.updatePassword);

module.exports = router;
