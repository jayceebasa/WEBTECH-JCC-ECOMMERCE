require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');

// Register models
const Category = require('./models/Category');
const Product = require('./models/Product');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'WST JCC E-Commerce Backend API',
    status: 'Server is running',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Test connection endpoint
app.get('/api/test/connection', (req, res) => {
  const mongoose = require('mongoose');
  res.json({ 
    message: 'Frontend successfully connected to backend!',
    backendTime: new Date().toISOString(),
    mongodbConnected: mongoose.connection.readyState === 1,
    mongodbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.json({
      products: products
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const id = req.params.id;

    let product;

    // Try to find by MongoDB _id first
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).populate('category');
    }

    // If not found, try to find by old custom id field
    if (!product) {
      product = await Product.findOne({ id: parseInt(id) });
    }

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});


// Create a new product (CREATE)
app.post('/api/products', async (req, res) => {
  try {
    // Create new product with the data from request body
    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      fullDescription: req.body.fullDescription,
      price: req.body.price,
      category: req.body.categoryId,
      image: req.body.image,
      details: {
        material: req.body.material,
        color: req.body.color,
        fit: req.body.fit,
        type: req.body.type,
        care: req.body.care
      },
      sizes: req.body.sizes,
      inventory: {
        quantity: req.body.quantity || 0,
        inStock: req.body.inStock !== false
      },
      featured: req.body.featured || false
    });
    
    // Save to database
    const savedProduct = await newProduct.save();
    const populatedProduct = await Product.findById(savedProduct._id).populate('category');
    
    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// TODO: Add API routes here
// - Cart routes
// - Order routes
// - User routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   WST JCC E-Commerce Backend Server       ║
║   Running on http://localhost:${PORT}         ║
║   Environment: ${process.env.NODE_ENV}               ║
╚════════════════════════════════════════════╝
  `);
});
