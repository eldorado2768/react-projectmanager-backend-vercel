import express from "express";
import userRoutes from "../routes/userRoutes.js";

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mount routes
app.use("/api/users", userRoutes);

export default (req, res) => app(req, res);
