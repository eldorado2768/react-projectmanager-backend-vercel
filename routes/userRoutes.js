import express from "express";

const router = express.Router();

router.post("/login-user", (req, res) => {
  console.log("Login route hit");
  res.status(200).send("Login route works!");
});

export default router;
