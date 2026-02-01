const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

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
router.post('/', categoryController.createCategory);

/**
 * Update category
 */
router.put('/:id', categoryController.updateCategory);

/**
 * Delete category
 */
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
