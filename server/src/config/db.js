
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
 const mongoURI = process.env.NODE_ENV === "production" ? process.env.MONGODB_URI : process.env.MONGODB_URI_LOCAL;
  if (!mongoURI) {
    throw new Error("MongoDB connection URI is not defined in environment variables.");
  }
    await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 10000,
  });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;