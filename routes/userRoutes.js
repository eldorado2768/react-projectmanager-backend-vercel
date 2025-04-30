import express from "express";
import protect from "../middleware/protect.js";

const router = express.Router();

router.post("/login-user", protect, async (req, res) => {
  res.status(200).send("Login route works with protect middleware!");
});

export default router;
