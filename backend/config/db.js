const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log("Server will start without database connection");
    return null;
  }
};

mongoose.connection.on("error", (err) => {
  console.error(`Mongoose connection error: ${err.message}`);
});

module.exports = connectDB;
