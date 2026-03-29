const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
const DEFAULT_ADMIN_EMAIL = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Adm1n@JCC!2026Secure';

/**
 * @desc    Login admin user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    let user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Bootstrap default admin account so first login works without manual seeding.
    if (normalizedEmail === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      if (!user) {
        await User.create({
          email: DEFAULT_ADMIN_EMAIL,
          password: DEFAULT_ADMIN_PASSWORD,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        });
        user = await User.findOne({ email: DEFAULT_ADMIN_EMAIL }).select('+password');
      } else {
        let requiresSave = false;

        if (user.role !== 'admin') {
          user.role = 'admin';
          requiresSave = true;
        }

        if (!user.password) {
          user.password = DEFAULT_ADMIN_PASSWORD;
          requiresSave = true;
        } else {
          const matchesDefaultPassword = await user.matchPassword(DEFAULT_ADMIN_PASSWORD);
          if (!matchesDefaultPassword) {
            user.password = DEFAULT_ADMIN_PASSWORD;
            requiresSave = true;
          }
        }

        if (user.loginAttempts || user.lockUntil) {
          user.loginAttempts = 0;
          user.lockUntil = null;
          requiresSave = true;
        }

        if (requiresSave) {
          await user.save();
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 60000);
      console.log(`🔒 Account locked for ${user.email}. Retry in ${minutesLeft} minutes`);
      return res.status(429).json({
        success: false,
        message: `Account locked. Try again in ${minutesLeft} minutes`
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      // Increment failed login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Lock account for 15 minutes
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
        console.log(`🔒 Account locked for ${user.email} after ${MAX_LOGIN_ATTEMPTS} failed attempts`);
      }
      
      await user.save();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        attemptsLeft: MAX_LOGIN_ATTEMPTS - user.loginAttempts
      });
    }

    // Successful login - reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Generate JWT with tokenVersion for session invalidation
    const token = jwt.sign(
      {
        userId: user._id,
        tokenVersion: user.tokenVersion
      },
      JWT_SECRET,
      { expiresIn: '24h' } // 24 hour expiration
    );

    console.log(`✅ User ${user.email} logged in successfully`);

    // Set httpOnly cookie (secure)
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  // Clear cookie with EXACT same options as when it was set
  res.cookie('adminToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0 // Expire immediately
  });

  console.log('✅ Logout successful, cookie cleared');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isPasswordMatch = await user.matchPassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Google OAuth login for regular users
 * @route   POST /api/auth/google
 * @access  Public
 */
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link googleId if the account was found by email but has no googleId yet
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create a new user (role defaults to 'user', no password needed)
      user = await User.create({
        googleId,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'user'
      });
    }

    console.log(`✅ Google OAuth login for ${user.email} (role: ${user.role})`);

    // Issue JWT using the same secret and format as admin tokens
    const token = jwt.sign(
      { userId: user._id, tokenVersion: user.tokenVersion },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set httpOnly cookie named 'userToken' (separate from admin's 'adminToken')
    res.cookie('userToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token, // returned so frontend can store it for cross-origin dev environments
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        picture: picture || null
      }
    });
  } catch (error) {
    console.error('❌ Google OAuth error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired Google credential'
    });
  }
};

/**
 * @desc    Logout regular user (clears userToken cookie)
 * @route   POST /api/auth/user/logout
 * @access  Public
 */
exports.userLogout = (req, res) => {
  res.cookie('userToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  });

  console.log('✅ User logout successful, cookie cleared');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @desc    Get current logged-in user (for userToken)
 * @route   GET /api/auth/user/me
 * @access  Private (user)
 */
exports.getUserMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

function formatName(user) {
  if (!user) return 'Unknown Customer';
  const first = (user.firstName || '').trim();
  const last = (user.lastName || '').trim();
  const full = `${first} ${last}`.trim();
  return full || user.email || 'Unknown Customer';
}

function toTimeAgo(date) {
  if (!date) return 'just now';
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

/**
 * @desc    Get admin dashboard data
 * @route   GET /api/auth/admin/dashboard
 * @access  Private (admin)
 */
exports.getAdminDashboardData = async (req, res) => {
  try {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      revenueAgg,
      recentOrders,
      recentUsers,
      lowStockProducts,
      orders,
      users,
      customerOrderStats,
      monthlyRevenue
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$total' } } }]),
      Order.find()
        .sort({ purchasedAt: -1 })
        .limit(5)
        .populate('user', 'firstName lastName email'),
      User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('firstName lastName email createdAt'),
      Product.find({ 'inventory.quantity': { $lte: 5 } })
        .sort({ 'inventory.quantity': 1 })
        .limit(3)
        .select('name inventory.quantity'),
      Order.find()
        .sort({ purchasedAt: -1 })
        .limit(100)
        .populate('user', 'firstName lastName email'),
      User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(100)
        .select('firstName lastName email createdAt'),
      Order.aggregate([
        {
          $group: {
            _id: '$user',
            ordersCount: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            lastOrderAt: { $max: '$purchasedAt' }
          }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$purchasedAt' },
              month: { $month: '$purchasedAt' }
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const totalRevenue = revenueAgg[0] ? Number(revenueAgg[0].totalRevenue || 0) : 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const customerStatsMap = new Map();
    customerOrderStats.forEach((entry) => {
      customerStatsMap.set(String(entry._id), {
        ordersCount: Number(entry.ordersCount || 0),
        totalSpent: Number(entry.totalSpent || 0),
        lastOrderAt: entry.lastOrderAt || null
      });
    });

    const customers = users.map((user) => {
      const stats = customerStatsMap.get(String(user._id)) || {
        ordersCount: 0,
        totalSpent: 0,
        lastOrderAt: null
      };

      return {
        id: user._id,
        name: formatName(user),
        email: user.email,
        joinedAt: user.createdAt,
        ordersCount: stats.ordersCount,
        totalSpent: stats.totalSpent,
        lastOrderAt: stats.lastOrderAt
      };
    });

    const repeatCustomers = customers.filter((customer) => customer.ordersCount > 1).length;
    const repeatCustomerRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenueData = monthlyRevenue.map((entry) => ({
      month: `${monthNames[entry._id.month - 1]} ${entry._id.year}`,
      orders: Number(entry.orders || 0),
      revenue: Number(entry.revenue || 0)
    }));

    const bestMonth = monthlyRevenueData.length
      ? monthlyRevenueData.reduce((best, current) => (current.revenue > best.revenue ? current : best), monthlyRevenueData[0])
      : null;

    const recentActivity = [
      ...recentOrders.map((order) => ({
        text: `New order received - ${order.orderNumber}`,
        time: toTimeAgo(order.purchasedAt),
        badge: 'new'
      })),
      ...recentUsers.map((user) => ({
        text: `New customer registered - ${formatName(user)}`,
        time: toTimeAgo(user.createdAt),
        badge: 'info'
      })),
      ...lowStockProducts.map((product) => ({
        text: `Low stock alert - ${product.name} (${product.inventory?.quantity || 0} left)`,
        time: 'inventory update',
        badge: 'danger'
      }))
    ]
      .slice(0, 8);

    const ordersData = orders.map((order) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customerName: formatName(order.user),
      customerEmail: order.user?.email || 'N/A',
      itemsCount: Array.isArray(order.items)
        ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
        : 0,
      total: Number(order.total || 0),
      purchasedAt: order.purchasedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalOrders,
          totalCustomers,
          totalRevenue
        },
        recentActivity,
        orders: ordersData,
        customers,
        analytics: {
          averageOrderValue,
          repeatCustomerRate,
          bestMonth,
          monthlyRevenue: monthlyRevenueData
        }
      }
    });
  } catch (error) {
    console.error('❌ Admin dashboard data error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to load admin dashboard data'
    });
  }
};
