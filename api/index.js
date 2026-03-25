require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/database');

// Register models
const Category = require('./models/Category');
const Product = require('./models/Product');

const app = express();

// Security headers via Helmet (must come before other middleware)
app.use(helmet({
  // Allow external scripts (Google Fonts, Bootstrap CDN, GIS) needed by frontend
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Middleware - CORS configuration with support for Vercel and local development
app.use(cors({
  origin: (origin, callback) => {
    // Allowed origins
    const allowedOrigins = [
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      // Vercel deployment URLs (allow any vercel.app domain)
      /^https:\/\/.*\.vercel\.app$/,
      // Allow requests with no origin (like mobile apps or curl requests)
    ];

    if (!origin || allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  // Multer file size exceeded
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
  }

  // Multer unexpected field or file type rejection
  if (err.code === 'LIMIT_UNEXPECTED_FILE' || (err.message && err.message.includes('Only image files'))) {
    return res.status(400).json({ success: false, message: err.message || 'Unexpected file upload.' });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ success: false, message: `${field} already exists.` });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
  }

  // Default 500
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found'
  });
});

// Export app for Vercel
module.exports = app;
