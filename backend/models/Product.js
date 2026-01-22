const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  fullDescription: String,
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['fashion', 'beauty'],
    required: true
  },
  image: String,
  material: String,
  color: String,
  fit: String,
  type: String,
  sizes: [String],
  care: String,
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
