const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { sendReceiptEmail } = require('../services/receiptEmailService');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.json({ data: cart || { items: [] } });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart', error: err.message });
  }
};

// Add product to cart
exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    cart.updatedAt = Date.now();
    await cart.save();
    // Populate product details before returning
    await cart.populate('items.product');
    res.json({ data: cart });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart', error: err.message });
  }
};

// Remove product from cart
exports.removeFromCart = async (req, res) => {
  const { productId } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.updatedAt = Date.now();
    await cart.save();
    await cart.populate('items.product');
    res.json({ data: cart });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from cart', error: err.message });
  }
};

// Update quantity
exports.updateQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Product not in cart' });
    item.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    await cart.populate('items.product');
    res.json({ data: cart });
  } catch (err) {
    res.status(500).json({ message: 'Error updating quantity', error: err.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ data: cart });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart', error: err.message });
  }
};

// Checkout cart and send receipt email
exports.checkoutCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty.'
      });
    }

    const checkoutItems = cart.items
      .filter((item) => item.product)
      .map((item) => {
        const unitPrice = Number(item.product.price || 0);
        const quantity = Number(item.quantity || 1);
        return {
          productId: item.product._id,
          name: item.product.name || 'Product',
          quantity,
          unitPrice,
          lineTotal: unitPrice * quantity
        };
      });

    if (checkoutItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid products found in cart.'
      });
    }

    const subtotal = checkoutItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = 0;
    const total = subtotal + shipping;
    const purchasedAt = new Date();
    const orderNumber = `JCC-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

    let receiptEmailSent = false;
    let receiptEmailError = null;

    try {
      await sendReceiptEmail({
        to: req.user.email,
        orderNumber,
        userName: req.user.firstName || req.user.email,
        items: checkoutItems,
        subtotal,
        shipping,
        total,
        purchasedAt
      });
      receiptEmailSent = true;
    } catch (emailError) {
      receiptEmailError = emailError.message;
      console.error('Receipt email error:', emailError.message);
    }

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({
      success: true,
      data: {
        orderNumber,
        purchasedAt,
        items: checkoutItems,
        subtotal,
        shipping,
        total,
        receiptEmailSent,
        receiptEmailError
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error during checkout',
      error: err.message
    });
  }
};
