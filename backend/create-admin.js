require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

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

// Create admin account
const createAdminAccount = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@webtech-jcc.com' });
    if (existingAdmin) {
      console.log('✗ Admin account already exists!');
      mongoose.connection.close();
      process.exit(0);
    }

    // Create new admin account
    const adminUser = new User({
      email: 'admin@webtech-jcc.com',
      password: 'admin123', // Default password - CHANGE THIS IMMEDIATELY
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    });

    await adminUser.save();
    console.log('\n✓ Admin account created successfully!');
    console.log('\n--- Admin Account Details ---');
    console.log(`Email: admin@webtech-jcc.com`);
    console.log(`Password: admin123`);
    console.log(`Role: admin`);
    console.log('\n⚠️  WARNING: Please change the password immediately after first login!');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating admin account:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

createAdminAccount();
