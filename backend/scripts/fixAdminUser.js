const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function fixAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find or create admin user using the User model to trigger pre-save hooks
    let admin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!admin) {
      // Create new admin user
      admin = new User({
        username: 'admin',
        email: 'admin@gmail.com',
        password: 'admin123', // This will be hashed by the pre-save hook
        role: 'admin'
      });
    } else {
      // Update existing admin user
      admin.username = 'admin';
      admin.password = 'admin123'; // This will be hashed by the pre-save hook
      admin.role = 'admin';
    }
    
    // Save the user (this will trigger the pre-save hook to hash the password)
    await admin.save();
    
    console.log('Admin user updated successfully');
    
    // Verify the user
    const savedAdmin = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
    const isMatch = await bcrypt.compare('admin123', savedAdmin.password);
    
    console.log({
      _id: savedAdmin._id,
      email: savedAdmin.email,
      role: savedAdmin.role,
      passwordMatch: isMatch ? '✅ Correct password' : '❌ Incorrect password'
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdminUser();
