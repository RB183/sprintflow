const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    // Don't crash in local dev demo mode
  }
};

module.exports = connectDB;
