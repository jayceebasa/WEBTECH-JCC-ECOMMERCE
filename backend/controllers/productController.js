const Product = require('../models/Product');
const Category = require('../models/Category');
const path = require('path');
const fs = require('fs');

// Helper function to delete image file if not used by other products
const deleteImageIfOrphaned = async (imagePath) => {
  if (!imagePath || imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return; // Don't delete cloud URLs or base64
  }

  try {
    // Check if any other product uses this image
    const count = await Product.countDocuments({ image: imagePath });
    
    if (count === 0) {
      // No other product uses this image, safe to delete
      const filePath = path.join(__dirname, '..', '..', imagePath.replace(/^\//, ''));
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑 Deleted orphaned image:', imagePath);
      }
    }
  } catch (error) {
    console.error('Error checking/deleting orphaned image:', error.message);
  }
};

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { q, category, featured, inStock, limit = 10, page = 1 } = req.query;
    
    let query = {};

    // Search by name if search query provided
    if (q) {
      query.name = { $regex: q, $options: 'i' }; // Case-insensitive search
    }

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Filter by featured if provided
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    // Filter by stock status if provided
    if (inStock !== undefined) {
      query['inventory.inStock'] = inStock === 'true';
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .populate('category', 'name')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total: totalProducts,
      page: parseInt(page),
      pages: Math.ceil(totalProducts / limit),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT REQUEST ===');
    console.log('File:', req.file);
    console.log('Body keys:', Object.keys(req.body));

    const {
      name,
      description,
      fullDescription,
      price,
      category,
      sizes,
      featured
    } = req.body;

    console.log('Extracted fields:', { name, price, category, sizes: sizes?.substring(0, 50) });

    // Parse JSON strings from FormData
    let details = {};
    let inventory = { quantity: 0, inStock: false };
    
    try {
      if (req.body.details && typeof req.body.details === 'string') {
        details = JSON.parse(req.body.details);
      } else if (req.body.details) {
        details = req.body.details;
      }
      
      if (req.body.inventory && typeof req.body.inventory === 'string') {
        inventory = JSON.parse(req.body.inventory);
      } else if (req.body.inventory) {
        inventory = req.body.inventory;
      }
    } catch (parseError) {
      console.error('Error parsing details/inventory JSON:', parseError);
    }

    // Parse sizes if it's a string
    let sizeArray = [];
    if (sizes) {
      if (typeof sizes === 'string') {
        sizeArray = sizes.split(',').map(s => s.trim()).filter(s => s);
      } else if (Array.isArray(sizes)) {
        sizeArray = sizes;
      }
    }

    console.log('Parsed data:', { sizeArray, details, inventory });

    // Validate required fields
    if (!name || !price || !category) {
      console.error('Missing required fields:', { name, price, category });
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required'
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      console.error('Category not found:', category);
      return res.status(400).json({
        success: false,
        message: 'Category does not exist'
      });
    }

    // Handle image - either from file upload or base64
    let imagePath = '';
    if (req.file) {
      // If file was uploaded, construct the relative path
      imagePath = `/assets/images/products/${req.file.filename}`;
      console.log('File uploaded, image path:', imagePath);
    } else if (req.body.image) {
      // Fallback to base64 if provided (for backward compatibility)
      imagePath = req.body.image;
      console.log('Using base64 image');
    } else {
      console.log('No image provided');
    }

    // Create product
    const product = new Product({
      name,
      description,
      fullDescription,
      price,
      category,
      image: imagePath,
      details,
      sizes: sizeArray,
      inventory,
      featured: featured === 'true' || featured === true
    });

    await product.save();
    await product.populate('category', 'name');

    console.log('✓ Product created:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('✗ Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify product exists
    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If category is being updated, verify it exists
    if (updates.category && updates.category !== product.category.toString()) {
      const categoryExists = await Category.findById(updates.category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category does not exist'
        });
      }
    }

    // Parse JSON strings from FormData
    if (updates.details && typeof updates.details === 'string') {
      try {
        updates.details = JSON.parse(updates.details);
      } catch (e) {
        console.error('Error parsing details:', e);
      }
    }

    if (updates.inventory && typeof updates.inventory === 'string') {
      try {
        updates.inventory = JSON.parse(updates.inventory);
      } catch (e) {
        console.error('Error parsing inventory:', e);
      }
    }

    // Parse sizes if it's a string
    if (updates.sizes && typeof updates.sizes === 'string') {
      updates.sizes = updates.sizes.split(',').map(s => s.trim()).filter(s => s);
    }

    // Handle image - if new file uploaded, use that path
    if (req.file) {
      // Delete old image if it's being replaced
      if (product.image && product.image.startsWith('/assets/images/products/')) {
        await deleteImageIfOrphaned(product.image);
      }
      updates.image = `/assets/images/products/${req.file.filename}`;
    } else if (updates.image && updates.image.startsWith('data:')) {
      // If base64 is provided (backward compatibility), keep it as is
    } else if (!req.file && !updates.image) {
      // If no new image provided, keep the existing one
      updates.image = product.image;
    }

    // Update product
    product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete the product's image if it's not used by other products
    if (product.image && product.image.startsWith('/assets/images/products/')) {
      await deleteImageIfOrphaned(product.image);
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ featured: true })
      .populate('category', 'name')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
      error: error.message
    });
  }
};

/**
 * @desc    Search products
 * @route   GET /api/products/search
 * @access  Public
 */
exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 10, page = 1 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const skip = (page - 1) * limit;
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { fullDescription: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('category', 'name')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { fullDescription: { $regex: q, $options: 'i' } }
      ]
    });

    res.status(200).json({
      success: true,
      query: q,
      count: products.length,
      total: totalProducts,
      page: parseInt(page),
      pages: Math.ceil(totalProducts / limit),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:categoryId
 * @access  Public
 */
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const skip = (page - 1) * limit;
    const products = await Product.find({ category: categoryId })
      .populate('category', 'name')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments({ category: categoryId });

    res.status(200).json({
      success: true,
      category: category.name,
      count: products.length,
      total: totalProducts,
      page: parseInt(page),
      pages: Math.ceil(totalProducts / limit),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message
    });
  }
};

/**
 * @desc    Update product inventory
 * @route   PUT /api/products/:id/inventory
 * @access  Private/Admin
 */
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.inventory.quantity = parseInt(quantity);
    product.inventory.inStock = quantity > 0;

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        id: product._id,
        inventory: product.inventory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating inventory',
      error: error.message
    });
  }
};
