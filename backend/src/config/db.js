const mongoose = require('mongoose');

// MongoDB connection URI loaded strictly from environment variable
const LOCAL_MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/citypilot';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(LOCAL_MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected to database: ${conn.connection.name} at ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error (${LOCAL_MONGO_URI}):`, error.message);
    console.log(`ℹ️ CityPilot backend will run in hybrid mode with fallback storage if MongoDB is unavailable.`);
    return null;
  }
};

module.exports = { connectDB, LOCAL_MONGO_URI };
