import express from "express";
import { setPassword } from "../controllers/userController.js";
import * as userController from "../controllers/userController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/activate-user", asyncHandler(userController.activateUser));
router.post("/register-user", asyncHandler(userController.registerUser));
router.post("/login", asyncHandler(userController.loginUser));
router.post("/forgot-password", asyncHandler(userController.forgotPassword));
router.post("/reset-password", asyncHandler(userController.resetPassword));
router.post("/set-password", asyncHandler(userController.setPassword));
router.post("/refresh-token", asyncHandler(userController.refreshToken));
router.post("/logout-user", asyncHandler(userController.logoutUser));
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

export {router};
