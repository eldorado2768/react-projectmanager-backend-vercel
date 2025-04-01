const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, unique: true },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }], // Use ObjectId references
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Role", roleSchema);
