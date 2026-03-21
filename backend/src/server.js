// This MUST be the very first line — loads all values from .env
// into process.env before anything else runs
require("dotenv").config();

const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start the server
// We do it in this order because the server is useless without a database
connectDB().then(() => {
  // We require app here (not at the top) so that dotenv loads first
  const app = require("./app");

  app.listen(PORT, () => {
    console.log(
      `🏥 Hospital Workflow Tracker running on http://localhost:${PORT}`
    );
  });
});