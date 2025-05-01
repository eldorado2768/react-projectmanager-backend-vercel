import express from "express";
import mongoose from "mongoose";
import connectDB from "./config/connectDB.js";
import userRoutes from "../routes/userRoutes.js";
connectDB();
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mount routes
app.use("/api/users", userRoutes);

app.get("/api/test", (req, res) => {
  console.log("Test route hit!");
  res.status(200).send("Test route works!");
});

app.get("/api/hello", (req, res) => {
  console.log("Hello route hit!");
  res.status(200).send("Hello World!");
});

app.get("/api/test-no-middleware", (req, res) => {
  res.status(200).send("This route works without middleware!");
});

// Add this route to server.js for testing MongoDB connectivity
app.get("/api/db-test", async (req, res) => {
  try {
    // Use the built-in MongoDB ping command to test connectivity
    await mongoose.connection.db.command({ ping: 1 });
    console.log("MongoDB ping successful!");
    res.status(200).json({ message: "Database connection is working!" });
  } catch (error) {
    console.error("Database ping failed:", error.message);
    res
      .status(500)
      .json({ message: "Failed to connect to MongoDB.", error: error.message });
  }
});

export default (req, res) => app(req, res);
