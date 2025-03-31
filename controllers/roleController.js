const Role = require("../models/Roles");

const addRole = async (req, res) => {
  try {
    const { roleName, permissions } = req.body;

    // Check if the role already exists
    const existingRole = await Role.findOne({ roleName });
    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    // Create a new role
    const newRole = new Role({
      roleName,
      permissions, // Array of tableName and accessType objects
    });

    // Save the role to the database
    await newRole.save();

    res.status(201).json({ message: "Role added successfully", role: newRole });
  } catch (error) {
    console.error("Error adding role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addRole };
