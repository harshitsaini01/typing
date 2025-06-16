// scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

async function createAdmin() {
  // Check if required environment variables exist
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Use environment variables for credentials
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    // Validate password strength
    if (password.length < 12 || 
        !/[A-Z]/.test(password) || 
        !/[a-z]/.test(password) || 
        !/[0-9]/.test(password) || 
        !/[^A-Za-z0-9]/.test(password)) {
      console.error('Error: Password must be at least 12 characters long and contain uppercase, lowercase, numbers, and special characters');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.error('Error: An admin with this email already exists');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Increased from 10 to 12 rounds

    const admin = new Admin({ email, password: hashedPassword });
    await admin.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();