const User = require('../models/User');

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
    // Decode token
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, timestamp] = decodedToken.split(':');

    // Check token expiry (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    const tokenExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (tokenAge > tokenExpiry) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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
    console.error('Auth middleware error:', error);
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
    // Decode token
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, timestamp] = decodedToken.split(':');

    console.log(`🔍 Verifying token for userId: ${userId}`);

    // Check token expiry (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    const tokenExpiry = 24 * 60 * 60 * 1000;

    if (tokenAge > tokenExpiry) {
      console.log(`❌ Token expired: ${tokenAge}ms old (max: ${tokenExpiry}ms)`);
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Token has expired'
      });
    }

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      console.log(`❌ User not found for userId: ${userId}`);
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'User not found'
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

    console.log(`✅ Token verified for user: ${user.email}`);
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
    console.error('❌ Token verification error:', error);
    return res.status(401).json({
      success: false,
      valid: false,
      message: 'Invalid token'
    });
  }
};
