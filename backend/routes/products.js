const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// CREATE - Add new product
router.post('/', productController.createProduct);

module.exports = router;