// config/db.js – Mongoose connection
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://harshlal0112_db_user:tshhD87KbUD6HRqV@cluster0.awv9usn.mongodb.net/?appName=Cluster0';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
