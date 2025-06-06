import express from "express";
import addPermission from "../controllers/permissionController.js"; // Fixed variable name
import protect from "../middleware/protect.js"; // Middleware for authentication
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

// Middleware to check if the user has one of the required roles
const rolesRequired = (roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      message: `Access denied. One of the following roles required: ${roles.join(
        ", "
      )}`,
    });
  }
  next();
};

router.post(
  "/add-permission",
  protect,
  rolesRequired(["superadmin"]),
  asyncHandler(addPermission)
);

// Placeholder for retrieving permissions (admin and superadmin)
// router.get("/", authMiddleware, rolesRequired(["admin", "superadmin"]), permissionController.getPermissions);

// Placeholder for updating a permission (superadmin only)
// router.put("/:id", authMiddleware, rolesRequired(["superadmin"]), permissionController.updatePermission);

// Placeholder for deleting a permission (superadmin only)
// router.delete("/:id", authMiddleware, rolesRequired(["superadmin"]), permissionController.deletePermission);

export default router;
