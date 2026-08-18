const mongoose = require('mongoose');
const { MONGODB_URI } = require('./config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB Atlas connection failed (${error.message}). Retrying with public DNS fallback...`);
    try {
      const dns = require('dns');
      dns.setServers(['8.8.8.8', '8.8.4.4']);
      const conn = await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB connected via fallback DNS: ${conn.connection.host}`);
    } catch (err2) {
      console.error(`❌ MongoDB connection error: ${err2.message}`);
      console.warn(`⚠️ Server will remain running. (Note: IP address may need to be whitelisted on MongoDB Atlas if on mobile hotspot).`);
    }
  }
};

module.exports = connectDB;
