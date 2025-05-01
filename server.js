import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
    });
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Initialize Database Connection
connectDB();

const db = mongoose.connection;

// Graceful Shutdown for Local/Non-Serverless Environments
process.on("SIGINT", async () => {
  console.log("Gracefully shutting down...");
  await mongoose.connection.close();
  process.exit(0);
});

// Export Database Connection for Routes to Use
export default db;
