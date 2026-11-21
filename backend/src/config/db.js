const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      maxPoolSize: 50,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`[MongoDB] Connected successfully (Pool: 10-50): ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
