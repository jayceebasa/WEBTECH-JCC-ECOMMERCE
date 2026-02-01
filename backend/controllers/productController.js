const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { category, featured, inStock, limit = 10, page = 1 } = req.query;
    
    let query = {};

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
    const {
      name,
      description,
      fullDescription,
      price,
      category,
      image,
      details,
      sizes,
      inventory,
      featured
    } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required'
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category does not exist'
      });
    }

    // Create product
    const product = new Product({
      name,
      description,
      fullDescription,
      price,
      category,
      image,
      details,
      sizes,
      inventory,
      featured
    });

    await product.save();
    await product.populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
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

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: { id }
    });
  } catch (error) {
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
