const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Find admin user with password
    const admin = await usersCollection.findOne(
      { email: 'admin@gmail.com' },
      { projection: { _id: 1, email: 1, role: 1, password: 1 } }
    );
    
    if (!admin) {
      console.log('Admin user not found');
      process.exit(1);
    }
    
    console.log('Admin user found:');
    console.log({
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      hasPassword: !!admin.password,
      passwordLength: admin.password ? admin.password.length : 0
    });
    
    // Verify the password
    const isMatch = await bcrypt.compare('admin123', admin.password);
    console.log('Password verification:', isMatch ? '✅ Correct password' : '❌ Incorrect password');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdminPassword();
