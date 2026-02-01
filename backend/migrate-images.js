/**
 * Migration script to convert base64 images to file-based storage
 * Converts existing products with base64 images to use file paths
 * Run with: node migrate-images.js
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

// Define upload directory
const uploadDir = path.join(__dirname, '..', 'assets/images/products');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✓ Created upload directory:', uploadDir);
}

// Convert base64 to file and return file path
function base64ToFile(base64String, filename) {
  try {
    // Extract the base64 data (remove the data:image/jpeg;base64, prefix)
    const base64Data = base64String.split(',')[1] || base64String;
    
    // Create file path
    const filePath = path.join(uploadDir, filename);
    
    // Write file
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    
    console.log(`  ✓ Saved image: ${filename}`);
    return `/assets/images/products/${filename}`;
  } catch (error) {
    console.error(`  ✗ Error converting base64 for ${filename}:`, error.message);
    return null;
  }
}

// Main migration function
async function migrateImages() {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   Product Image Migration Script      ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Connect to database
    await connectDB();

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Iterate through products
    for (const product of products) {
      console.log(`Processing: ${product.name}`);

      // Check if image exists and is base64
      if (!product.image) {
        console.log('  ⏭ No image - skipped\n');
        skippedCount++;
        continue;
      }

      // If image already starts with / or http, it's already a file/URL
      if (product.image.startsWith('/') || product.image.startsWith('http')) {
        console.log('  ⏭ Already using file path/URL - skipped\n');
        skippedCount++;
        continue;
      }

      // If it's base64, convert it
      if (product.image.startsWith('data:')) {
        console.log('  Converting base64 image to file...');
        
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${product._id}-${uniqueSuffix}.png`;
        
        const newImagePath = base64ToFile(product.image, filename);
        
        if (newImagePath) {
          // Update product with new image path
          product.image = newImagePath;
          await product.save();
          console.log(`  ✓ Updated product: ${newImagePath}\n`);
          migratedCount++;
        } else {
          console.log('  ✗ Failed to convert image\n');
          errorCount++;
        }
      } else {
        console.log('  ⏭ Unknown image format - skipped\n');
        skippedCount++;
      }
    }

    // Summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║         Migration Summary            ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`✓ Migrated: ${migratedCount}`);
    console.log(`⏭ Skipped: ${skippedCount}`);
    console.log(`✗ Errors: ${errorCount}`);
    console.log('\n✓ Migration complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Migration Error:', error);
    process.exit(1);
  }
}

// Run migration
migrateImages();
