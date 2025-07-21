const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
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
    
    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      // Update existing admin
      await usersCollection.updateOne(
        { email: 'admin@gmail.com' },
        { 
          $set: { 
            username: 'admin',
            role: 'admin',
            password: await bcrypt.hash('admin', 12)
          } 
        }
      );
      console.log('Admin user updated successfully');
    } else {
      // Create new admin
      await usersCollection.insertOne({
        username: 'admin',
        email: 'admin@gmail.com',
        password: await bcrypt.hash('admin', 12),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Admin user created successfully');
    }
    
    // Verify the admin user
    const admin = await usersCollection.findOne(
      { email: 'admin@gmail.com' },
      { projection: { _id: 1, email: 1, role: 1 } }
    );
    
    console.log('Admin user details:', admin);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
