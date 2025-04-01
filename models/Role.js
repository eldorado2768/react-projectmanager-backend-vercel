const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, unique: true }, // e.g., "superadmin", "admin"
  permissions: [
    {
      tableName: { type: String, required: true }, // Table name this role has access to
      accessType: { type: String, required: true }, // CRUD/RU/etc.
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Role", roleSchema);
