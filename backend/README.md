# WST JCC E-Commerce Backend

Node.js backend for the WST JCC E-Commerce platform with MongoDB database.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wst-jcc-ecommerce
NODE_ENV=development
```

### 3. MongoDB Setup
Make sure MongoDB is running on your system.

#### On Windows:
- Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
- MongoDB will run as a service

#### Verify MongoDB is running:
```bash
mongosh
```

### 4. Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Project Structure

```
backend/
├── server.js           # Main server file
├── config/
│   └── database.js     # MongoDB connection configuration
├── models/             # Mongoose schemas
├── routes/             # API routes
├── controllers/        # Route handlers
├── middleware/         # Custom middleware
├── .env               # Environment variables (create this file)
└── package.json       # Dependencies
```

## Available Endpoints (To be implemented)

- `POST /api/cart/add` - Add item to cart
- `GET /api/cart` - Get cart items
- `GET /api/cart/count` - Get cart item count
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `GET /api/cart/summary` - Get cart summary
- `POST /api/orders/create` - Create order
