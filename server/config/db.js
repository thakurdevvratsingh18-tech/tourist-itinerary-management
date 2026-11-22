const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tourist_itinerary';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if server unreachable
    });
    isConnected = true;
    console.log(`  ✔  MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    console.warn(`\n  ⚠  MongoDB connection notice: ${error.message}`);
    console.warn('     The application will still run in standalone / API mode.');
    console.warn('     To connect database: start local mongod OR set MONGODB_URI in .env\n');
  }
};

const getDBStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null,
});

module.exports = connectDB;
module.exports.getDBStatus = getDBStatus;
