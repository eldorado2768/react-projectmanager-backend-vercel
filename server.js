const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const redisClient = require("./config/redisClient"); // Adjust the path as needed

const app = express();
const PORT = process.env.PORT || 10000;

// Validate Environment Variables
if (!process.env.MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in the environment.");
  process.exit(1); // Exit with failure
}

// Configure CORS
const allowedOrigins = [
  "https://react-projectmanager-git-master-david-brotmans-projects.vercel.app",
  "https://react-projectmanager-8urnh0evd-david-brotmans-projects.vercel.app",
];
app.use(
  cors({
    origin: allowedOrigins,
  })
);

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Test Route
app.get("/test", (req, res) => {
  res.send("Hello from the backend!");
});

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

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

redisClient.ping((err, res) => {
  if (err) {
    console.error("Redis PING Error:", err);
  } else {
    console.log("Redis Connection Test:", res); // Should print "PONG"
  }
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("Gracefully shutting down...");
  await mongoose.connection.close();
  process.exit(0);
});
