const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
/**
 * Get all categories
 */
router.get('/', categoryController.getAllCategories);

/**
 * Get single category by ID
 */
router.get('/:id', categoryController.getCategoryById);

// Protected routes (Admin only)
/**
 * Create new category
 */
router.post('/', protect, categoryController.createCategory);

/**
 * Update category
 */
router.put('/:id', protect, categoryController.updateCategory);

/**
 * Delete category
 */
router.delete('/:id', protect, categoryController.deleteCategory);

module.exports = router;
