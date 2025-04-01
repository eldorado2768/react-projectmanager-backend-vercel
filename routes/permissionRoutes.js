const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController"); // Fixed variable name
const authMiddleware = require("../authMiddleware"); // Middleware for authentication

// Middleware to check if the user has one of the required roles
const rolesRequired = (roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res
      .status(403)
      .json({
        message: `Access denied. One of the following roles required: ${roles.join(
          ", "
        )}`,
      });
  }
  next();
};

// Route to add a new permission (superadmin only)
router.post(
  "/add-permission",
  authMiddleware,
  rolesRequired(["superadmin"]),
  permissionController.addPermission
);

// Placeholder for retrieving permissions (admin and superadmin)
// router.get("/", authMiddleware, rolesRequired(["admin", "superadmin"]), permissionController.getPermissions);

// Placeholder for updating a permission (superadmin only)
// router.put("/:id", authMiddleware, rolesRequired(["superadmin"]), permissionController.updatePermission);

// Placeholder for deleting a permission (superadmin only)
// router.delete("/:id", authMiddleware, rolesRequired(["superadmin"]), permissionController.deletePermission);

module.exports = router;
