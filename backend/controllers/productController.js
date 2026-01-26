const Product = require('../models/Product');

// Create a new product
const createProduct = async (req, res) => {
  try {
    // Get the highest id and add 1 for the new product
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const newId = lastProduct ? lastProduct.id + 1 : 1;

    // Create new product with the data from request body
    const newProduct = new Product({
      id: newId,
      name: req.body.name,
      description: req.body.description,
      fullDescription: req.body.fullDescription,
      price: req.body.price,
      category: req.body.category,
      image: req.body.image,
      material: req.body.material,
      color: req.body.color,
      fit: req.body.fit,
      type: req.body.type,
      sizes: req.body.sizes,
      care: req.body.care,
      inStock: req.body.inStock,
      featured: req.body.featured
    });

    // Save to database
    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  createProduct
};