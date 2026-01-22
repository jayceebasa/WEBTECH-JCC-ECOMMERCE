# Node.js & MongoDB Setup Guide

This guide will help you complete the Node.js and MongoDB setup for the WST JCC E-Commerce project.

## ✅ What's Already Done

- Node.js 10.9.3 installed
- Backend folder created with all necessary structure
- npm dependencies installed (Express, Mongoose, CORS, dotenv, body-parser, nodemon)
- Basic server configuration set up
- Environment variables configured
- MongoDB connection module created

## 📋 Next Steps to Complete Setup

### Step 1: Install MongoDB Community Edition

**For Windows:**

1. Download MongoDB Community Edition from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the installation wizard
3. Choose "Install MongoDB as a Service" (recommended)
4. Complete the installation

**Verify MongoDB Installation:**
```bash
mongosh
```

This should open the MongoDB shell. If it works, MongoDB is properly installed.

### Step 2: Ensure MongoDB Service is Running

**On Windows:**
- MongoDB should start automatically as a service
- You can verify by opening Task Manager and checking for "mongod.exe"

**Or start it manually:**
```bash
# Open PowerShell as Administrator
net start MongoDB
```

### Step 3: Start the Backend Server

From the `backend` folder, run:

```bash
npm run dev
```

This will start the server with nodemon (auto-restarts on file changes).

**Expected Output:**
```
╔════════════════════════════════════════════╗
║   WST JCC E-Commerce Backend Server       ║
║   Running on http://localhost:5000         ║
║   Environment: development               ║
╚════════════════════════════════════════════╝
```

### Step 4: Verify Server is Running

Open your browser or use curl to test:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-01-23T..."
}
```

## 📁 Backend Project Structure

```
backend/
├── server.js              # Main server entry point
├── package.json          # Node.js dependencies
├── .env                  # Environment variables
├── .gitignore           # Git ignore file
├── config/
│   └── database.js      # MongoDB connection configuration
├── models/              # Mongoose schemas (to be created)
├── routes/              # API route handlers (to be created)
├── controllers/         # Business logic (to be created)
└── middleware/          # Custom middleware (to be created)
```

## 🔧 Environment Configuration

The `.env` file in the backend folder contains:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wst-jcc-ecommerce
NODE_ENV=development
```

You can modify these values as needed.

## 📦 Installed Dependencies

- **express** (4.18.2) - Web framework
- **mongoose** (7.5.0) - MongoDB ODM
- **cors** (2.8.5) - Cross-Origin Resource Sharing
- **body-parser** (1.20.2) - Request body parsing
- **dotenv** (16.3.1) - Environment variables
- **nodemon** (3.0.1) - Auto-restart on file changes (dev only)

## ✨ Current Server Status

✓ Server configured and ready to start
✓ MongoDB connection module created
✓ CORS enabled for frontend integration
✓ Development environment ready
✓ Folder structure organized for API implementation

## 🚀 Ready to Implement APIs

The backend is now ready for API implementation. The following endpoints need to be created:

- `POST /api/cart/add` - Add item to cart
- `GET /api/cart` - Get cart items
- `GET /api/cart/count` - Get cart item count
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `GET /api/cart/summary` - Get cart summary with totals
- `POST /api/orders/create` - Create order from cart

## 💡 Tips

- Use `npm run dev` during development (with nodemon auto-restart)
- Use `npm start` for production
- MongoDB must be running in the background for the server to connect
- The backend server should run on a different port from the frontend (5000 is default)
- Frontend will communicate with backend via API calls to `http://localhost:5000/api/*`

## 🆘 Troubleshooting

**MongoDB connection error:**
- Make sure MongoDB service is running
- Check if MongoDB is listening on port 27017
- Verify the MONGODB_URI in .env file

**Port already in use:**
- Change PORT in .env to another port (e.g., 5001)
- Or stop any other service using port 5000

**Module not found errors:**
- Run `npm install` again in the backend folder
- Delete `node_modules` folder and run `npm install` fresh
