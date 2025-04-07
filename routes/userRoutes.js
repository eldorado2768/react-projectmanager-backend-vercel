const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { setPassword } = require("../controllers/userController");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const checkSessionActivity = require("../middleware/sessionMiddleware");

router.post("/activate-user", asyncHandler(userController.activateUser));
router.post("/register-user", asyncHandler(userController.registerUser));
router.post("/login", asyncHandler(userController.loginUser));
router.post("/forgot-password", asyncHandler(userController.forgotPassword));
router.post("/reset-password", asyncHandler(userController.resetPassword));
router.post("/set-password", asyncHandler(userController.setPassword));
router.post("/refresh-token", asyncHandler(userController.refreshToken));
router.post("/logout-user", asyncHandler(userController.logoutUser));

module.exports = router;
