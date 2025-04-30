import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/connectDB.js";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Configure CORS
const allowedOrigins = [
  "https://react-projectmanager.vercel.app",
  "https://react-projectmanager-git-master-david-brotmans-projects.vercel.app",
];

app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow all necessary request methods
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "x-session-id",
    ],
    credentials: true, // Required if using authentication headers
  })
);

app.options("*", cors());

// Middleware to parse JSON requests
app.use(express.json());

// Call connectDB to initiate the database connection
connectDB();

// Use Modular Routes
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use((err, req, res, next) => {
  console.error("Error:", err); // Log the error for debugging
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

const dbtest_URL = `${process.env.BACKEND_URL}/api/db-test`;

// Add this route to server.js for testing MongoDB connectivity
app.get(dbtest_URL, async (req, res) => {
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

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("Gracefully shutting down...");
  await mongoose.connection.close();
  process.exit(0);
});
