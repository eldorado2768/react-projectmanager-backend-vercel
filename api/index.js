import express from "express";
import userRoutes from "../routes/userRoutes.js";

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

export default (req, res) => app(req, res);
