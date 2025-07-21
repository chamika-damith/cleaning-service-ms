const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      // Update existing admin
      existingAdmin.role = 'admin';
      existingAdmin.password = await bcrypt.hash('admin', 12);
      await existingAdmin.save();
      console.log('Admin user updated successfully');
    } else {
      // Create new admin
      const adminUser = new User({
        username: 'admin',
        email: 'admin@gmail.com',
        password: 'admin',
        role: 'admin'
      });
      
      // The pre-save hook will hash the password
      await adminUser.save();
      console.log('Admin user created successfully');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
