const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../authMiddleware"); // Add this line

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword); // Added this line
router.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});
router.get("/user/:id/details", userController.getUserDetails);

router.post("/testRoute", (req, res) => {
  res.send("Test Route Works");
});

module.exports = router;
