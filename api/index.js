import express from "express";
import mongoose from "mongoose";
import userRoutes from "./userRoutes.js";

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

// Add this route to for testing MongoDB connectivity
app.get("/api/db-test", async (req, res) => {
  try {
    await mongoose.connect(
      "mongodb+srv://vercel-admin-user:t5iwB9KHQg04UqTn@cluster0.xjaw54v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
    );
    const db = mongoose.connection.db;
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
