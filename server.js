/**
 * Local Development Server
 * This file is used for running the server locally during development.
 * For Vercel deployment, the API is accessed via /api/index.js directly as a serverless function.
 */

require('dotenv').config();
const app = require('./api/index.js');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   WST JCC E-Commerce Backend Server        ║
║   Running on http://localhost:${PORT}      ║
║   Environment: ${process.env.NODE_ENV}     ║
╚════════════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
