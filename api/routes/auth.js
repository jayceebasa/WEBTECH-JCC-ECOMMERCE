const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect, verifyToken, protectUser, verifyUserToken } = require('../middleware/authMiddleware');
const { validate, loginRules, googleLoginRules, updatePasswordRules } = require('../middleware/validateMiddleware');

// Rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts per IP
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Admin routes ---
router.post('/login', loginLimiter, loginRules, validate, authController.login);
router.post('/logout', authController.logout);
router.get('/verify', verifyToken);
router.get('/me', protect, authController.getMe);
router.put('/update-password', protect, updatePasswordRules, validate, authController.updatePassword);

// --- User (Google OAuth) routes ---
router.get('/google/config', (req, res) => {
  // The Google Client ID is not secret — it's safe to expose to the frontend.
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID || '' });
});
router.post('/google', googleLoginRules, validate, authController.googleLogin);
router.post('/user/logout', authController.userLogout);
router.get('/user/verify', verifyUserToken);
router.get('/user/me', protectUser, authController.getUserMe);

module.exports = router;
