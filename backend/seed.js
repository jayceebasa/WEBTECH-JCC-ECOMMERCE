require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wst-jcc-ecommerce';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB Connected');
    return true;
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    return false;
  }
};

// Seed products
const seedProducts = async () => {
  try {
    // Read products from JSON file
    const productsPath = path.join(__dirname, '../data/products.json');
    const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    console.log(`\nFound ${data.products.length} products to migrate...`);
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('✓ Cleared existing products');
    
    // Insert new products
    const result = await Product.insertMany(data.products);
    console.log(`✓ Successfully migrated ${result.length} products to MongoDB!`);
    
    console.log('\nMigration Summary:');
    console.log(`- Total products: ${result.length}`);
    console.log(`- Fashion items: ${data.products.filter(p => p.category === 'fashion').length}`);
    console.log(`- Beauty items: ${data.products.filter(p => p.category === 'beauty').length}`);
    
  } catch (error) {
    console.error('✗ Seeding Error:', error.message);
    process.exit(1);
  }
};

// Run migration
const runMigration = async () => {
  const connected = await connectDB();
  if (connected) {
    await seedProducts();
    console.log('\n✓ Migration completed successfully!\n');
    mongoose.connection.close();
    process.exit(0);
  }
};

runMigration();
