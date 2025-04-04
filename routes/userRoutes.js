const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { setPassword } = require("../controllers/userController");
const authMiddleware = require("../authMiddleware");

router.post("/activate-user", async (req, res, next) => {
  try {
    return await userController.activateUser(req, res); // Call the controller function
  } catch (error) {
    next(error); // Pass the error to the centralized error handler
  }
});

router.post("/register-user", async (req, res, next) => {
  try {
    return await userController.registerUser(req, res);
  } catch (error) {
    next(error); // Passes the error to a centralized error handler
  }
});

router.post("/login", async (req, res, next) => {
  console.log("Login route invoked");
  try {
    return await userController.loginUser(req, res);
  } catch (error) {
    next(error); // Passes the error to a centralized error handler
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    return await userController.forgotPassword(req, res);
  } catch (error) {
    next(error); // Passes the error to a centralized error handler
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    return await userController.resetPassword(req, res);
  } catch (error) {
    next(error); // Passes the error to a centralized error handler
  }
});

router.post("/set-password", async (req, res, next) => {
  try {
    return await userController.setPassword(req, res);
  } catch (error) {
    next(error); // Passes the error to a centralized error handler
  }
});

router.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

module.exports = router;
