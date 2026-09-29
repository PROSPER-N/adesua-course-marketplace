const mongoose = require("mongoose");

async function connectDB() {
  try {
    // Give up after 10 seconds instead of the default 30, so a wrong URI fails quickly.
    const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error("Could not connect to MongoDB.");
    console.error(
      "Check MONGO_URI in backend/.env, and that your IP address is allowed in Atlas (Network Access)."
    );
    console.error(`Details: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
