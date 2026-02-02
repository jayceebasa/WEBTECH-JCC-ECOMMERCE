const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

/**
 * Authentication Middleware
 * Validates JWT token and attaches user to request
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in cookies first (most secure)
  if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  }
  // Fallback to Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify JWT signature
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`🔍 JWT verified for userId: ${decoded.userId}`);

    // Find user by ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if token version matches (invalidate if password was changed)
    if (decoded.tokenVersion !== user.tokenVersion) {
      console.log(`⚠️ Token version mismatch for ${user.email}. Token invalidated after password change`);
      return res.status(401).json({
        success: false,
        message: 'Session invalidated. Please login again.'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    console.error('❌ Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Verify token endpoint - for frontend to verify token validity
 */
exports.verifyToken = async (req, res) => {
  let token;

  // Check for token in cookies first
  if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  }
  // Fallback to Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    console.log('❌ Token verification failed: No token provided');
    return res.status(401).json({
      success: false,
      valid: false,
      message: 'No token provided'
    });
  }

  try {
    // Verify JWT signature
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`🔍 Verifying JWT for userId: ${decoded.userId}`);

    // Find user by ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log(`❌ User not found for userId: ${decoded.userId}`);
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'User not found'
      });
    }

    // Check if token version matches (invalidate if password was changed)
    if (decoded.tokenVersion !== user.tokenVersion) {
      console.log(`⚠️ Token version mismatch for ${user.email}. Token invalidated after password change`);
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Session invalidated. Please login again.'
      });
    }

    if (user.role !== 'admin') {
      console.log(`❌ User is not admin. Role: ${user.role}`);
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Invalid token or user'
      });
    }

    console.log(`✅ JWT verified for user: ${user.email}`);
    res.status(200).json({
      success: true,
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('❌ JWT expired');
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Token expired. Please login again.'
      });
    }
    console.error('❌ Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      valid: false,
      message: 'Invalid token'
    });
  }
};
