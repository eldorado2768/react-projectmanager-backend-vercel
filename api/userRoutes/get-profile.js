import * as userController from "../../controllers/userController.js";
import asyncHandler from "../../middleware/asyncHandler.js";
import protect from "../../middleware/protect.js";
import checkSessionActivity from "../../middleware/sessionMiddleware.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ message: "Method not allowed" });
    }

    // Apply authentication & session validation before fetching profile
    await protect(req, res, async () => {
      await checkSessionActivity(req, res, async () => {
        return asyncHandler(userController.getUserProfile)(req, res);
      });
    });
  } catch (error) {
    console.error("Profile retrieval error:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
