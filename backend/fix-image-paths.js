/**
 * Script to update product image paths from old location to new location
 * Updates paths from: assets/images/Product Images/... 
 * To: /assets/images/products/...
 * Run with: node fix-image-paths.js
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Load Product model
const Product = require('./models/Product');

// Paths
const oldImagesDir = path.join(__dirname, '..', 'assets/images/Product Images');
const newImagesDir = path.join(__dirname, '..', 'assets/images/products');

// Ensure new directory exists
if (!fs.existsSync(newImagesDir)) {
  fs.mkdirSync(newImagesDir, { recursive: true });
}

// Main function
async function fixImagePaths() {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   Product Image Path Migration       ║');
    console.log('╚════════════════════════════════════════╝\n');

    await connectDB();

    // Get all products with old image paths
    const products = await Product.find({
      image: { $regex: 'Product Images' }
    });

    console.log(`Found ${products.length} products with old image paths\n`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      console.log(`Processing: ${product.name}`);
      console.log(`  Old path: ${product.image}`);

      // Extract filename from old path
      const filename = product.image.split('/').pop() || product.image.split('\\').pop();
      
      if (!filename) {
        console.log('  ✗ Could not extract filename\n');
        errorCount++;
        continue;
      }

      // Check if file exists in old location
      const oldFilePath = path.join(oldImagesDir, filename);
      
      if (fs.existsSync(oldFilePath)) {
        try {
          // Copy file to new location
          const newFilePath = path.join(newImagesDir, filename);
          fs.copyFileSync(oldFilePath, newFilePath);
          
          // Update product with new path
          product.image = `/assets/images/products/${filename}`;
          await product.save();
          
          console.log(`  ✓ New path: ${product.image}\n`);
          migratedCount++;
        } catch (error) {
          console.log(`  ✗ Error copying file: ${error.message}\n`);
          errorCount++;
        }
      } else {
        console.log(`  ⚠ Old file not found at: ${oldFilePath}`);
        // Still update the path in case file was moved elsewhere
        product.image = `/assets/images/products/${filename}`;
        await product.save();
        console.log(`  ✓ Updated path anyway: ${product.image}\n`);
        migratedCount++;
      }
    }

    // Summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║         Migration Summary            ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`✓ Migrated: ${migratedCount}`);
    console.log(`✗ Errors: ${errorCount}`);
    console.log('\n✓ All image paths updated!\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  }
}

fixImagePaths();
