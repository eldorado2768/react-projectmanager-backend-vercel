const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const authMiddleware = require("../authMiddleware"); // Middleware for authentication

 
const rolesRequired = (roles) => (req, res, next) => {
    // Check if the user has one of the required roles
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: `Access denied. One of the following roles required: ${roles.join(", ")}` });
    }
    next();
  };

// Route to add a new role (superadmin only)
router.post("/add-role", authMiddleware, rolesRequired(["superadmin"]), roleController.addRole);

// Retrieve an existing role (admin, superadmin)
//router.get("/", authMiddleware, rolesRequired(["admin", "superadmin"]), roleController.getRoles);

// Update an existing role (superadmin only)
//router.put("/:id", authMiddleware, rolesRequired(["superadmin"]), roleController.updateRole);

// Delete an existing role (superadmin only)
//router.delete("/:id", authMiddleware, rolesRequired(["superadmin"]), roleController.deleteRole);

module.exports = router;
