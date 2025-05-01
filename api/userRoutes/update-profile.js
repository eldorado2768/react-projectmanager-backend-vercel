import * as userController from "../../controllers/userController.js";
import asyncHandler from "../../middleware/asyncHandler.js";
import protect from "../../middleware/protect.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "PUT") {
      res.setHeader("Allow", ["PUT"]);
      return res.status(405).json({ message: "Method not allowed" });
    }

    // Apply authentication before allowing updates
    await protect(req, res, async () => {
      return asyncHandler(userController.updateUserProfile)(req, res);
    });
  } catch (error) {
    console.error("Profile update error:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
