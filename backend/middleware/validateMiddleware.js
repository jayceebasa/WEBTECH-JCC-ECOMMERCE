const { body, param, query, validationResult } = require('express-validator');

/**
 * Reads validation errors from express-validator and sends a 400 response if any exist.
 * Must be placed after the rule arrays in every route.
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ---------------------------------------------------------------------------
// Auth rules
// ---------------------------------------------------------------------------

/** POST /api/auth/login */
exports.loginRules = [
  body('email')
    .isEmail().withMessage('A valid email address is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

/** POST /api/auth/google */
exports.googleLoginRules = [
  body('credential')
    .notEmpty().withMessage('Google credential token is required'),
];

/** PUT /api/auth/update-password */
exports.updatePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// ---------------------------------------------------------------------------
// Product rules
// ---------------------------------------------------------------------------

/** POST /api/products  |  PUT /api/products/:id */
exports.productRules = [
  body('name')
    .notEmpty().withMessage('Product name is required')
    .trim()
    .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category')
    .notEmpty().withMessage('Category is required'),
  body('description')
    .optional()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

/** PUT /api/products/:id/inventory */
exports.inventoryRules = [
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

// ---------------------------------------------------------------------------
// Category rules
// ---------------------------------------------------------------------------

/** POST /api/categories  |  PUT /api/categories/:id */
exports.categoryRules = [
  body('name')
    .notEmpty().withMessage('Category name is required')
    .trim()
    .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];
