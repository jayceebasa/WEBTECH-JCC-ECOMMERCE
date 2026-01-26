require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');

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
    const Product = require('./models/Product');
    const products = await Product.find();
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
    const Product = require('./models/Product');
    const product = await Product.findOne({ id: parseInt(req.params.id) });
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});


// Create a new product (CREATE)
app.post('/api/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    
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
