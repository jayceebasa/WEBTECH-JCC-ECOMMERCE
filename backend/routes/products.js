const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware');

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
 * Get products by category
 * Query params: limit, page
 * NOTE: Must be before /:id route to avoid conflict
 */
router.get('/category/:categoryId', productController.getProductsByCategory);

/**
 * Get single product by ID
 * NOTE: This must be after specific routes like /featured, /search, /category
 */
router.get('/:id', productController.getProductById);

// Protected routes (Admin only)
/**
 * Create new product with image upload
 */
router.post('/', upload.single('imageFile'), productController.createProduct);

/**
 * Update product with optional image upload
 */
router.put('/:id', upload.single('imageFile'), productController.updateProduct);

/**
 * Delete product
 */
router.delete('/:id', productController.deleteProduct);

/**
 * Update product inventory
 */
router.put('/:id/inventory', productController.updateInventory);

module.exports = router;
