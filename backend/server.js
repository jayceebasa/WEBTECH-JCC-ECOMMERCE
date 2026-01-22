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

// TODO: Add API routes here
// - Cart routes
// - Order routes
// - Product routes

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
