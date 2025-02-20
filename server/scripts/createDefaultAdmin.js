const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('../models/user');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const createDefaultAdmin = async () => {
  try {
    // Log the MongoDB URI (remove in production)
    console.log('Checking environment variables...');
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (!existingAdmin) {
      console.log('Creating admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const adminUser = new User({
        username: 'admin',
        name: 'Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        userType: 'admin'
      });
      
      await adminUser.save();
      console.log('✅ Default admin user created successfully');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    if (!process.env.MONGO_URI) {
      console.error('Make sure your .env file exists in the server directory and contains MONGO_URI');
    }
    process.exit(1);
  }
};

// Add error handlers
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

createDefaultAdmin(); 