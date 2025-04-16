import Permission from "../models/Permission.js";

const addPermission = async (req, res) => {
  try {
    const { permissionDescription, tableName, permission } = req.body;

    // Validate input
    if (!permissionDescription || !tableName || !permission) {
      return res.status(400).json({
        message:
          "All fields are required: permissionDescription, tableName, and permission.",
      });
    }

    // Normalize tableName and permission to lowercase
    const normalizedTableName = tableName.toLowerCase();
    const normalizedPermission = permission.toLowerCase();

    // Check if the permission already exists
    const existingPermission = await Permission.findOne({
      tableName: normalizedTableName,
      permission: normalizedPermission,
    });
    if (existingPermission) {
      return res.status(400).json({ message: "Permission already exists" });
    }

    // Create a new permission
    const newPermission = new Permission({
      permissionDescription,
      tableName: normalizedTableName,
      permission: normalizedPermission,
    });

    // Save the permission to the database
    await newPermission.save();

    res.status(201).json({
      success: true,
      message: "Permission added successfully",
      permission: newPermission,
    });
  } catch (error) {
    console.error("Error adding permission:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

export default addPermission;
