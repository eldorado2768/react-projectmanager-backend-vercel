import db from "../server.js"; //database connection
import * as userController from "../controllers/userController.js"; 
import asyncHandler from "../middleware/asyncHandler.js";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      return asyncHandler(userController.activateUser)(req, res);
    }

    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Route handler error:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

