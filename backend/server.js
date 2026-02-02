require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/database');

// Register models
const Category = require('./models/Category');
const Product = require('./models/Product');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:3000', 'http://localhost:3000'],
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies

// Serve static files from assets folder
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

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

// API Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// TODO: Add more API routes here
// - Cart routes
// - Order routes
// - User routes
// - Category routes

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
