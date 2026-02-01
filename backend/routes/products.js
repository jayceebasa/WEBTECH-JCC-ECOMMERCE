const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public routes
/**
 * Get all products with filtering options
 * Query params: category, featured, inStock, limit, page
 */
router.get('/', productController.getAllProducts);

/**
 * Get featured products
 * Query params: limit
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * Search products
 * Query params: q (search query), limit, page
 */
router.get('/search', productController.searchProducts);

/**
 * Get single product by ID
 */
router.get('/:id', productController.getProductById);

/**
 * Get products by category
 * Query params: limit, page
 */
router.get('/category/:categoryId', productController.getProductsByCategory);

// Protected routes (Admin only)
/**
 * Create new product
 */
router.post('/', productController.createProduct);

/**
 * Update product
 */
router.put('/:id', productController.updateProduct);

/**
 * Delete product
 */
router.delete('/:id', productController.deleteProduct);

/**
 * Update product inventory
 */
router.put('/:id/inventory', productController.updateInventory);

module.exports = router;
