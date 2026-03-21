const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // process.env.MONGO_URI reads the value from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(` MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    // If MongoDB is not running or the URI is wrong, stop everything
    console.error(" MongoDB connection failed:", err.message);
    process.exit(1); // Exit with error code 1 — means something went wrong
  }
};

module.exports = connectDB;