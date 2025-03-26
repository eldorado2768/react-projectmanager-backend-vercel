const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  permissionDescription: { type: String, required: true },
  tableName: { type: String },
  permission: { type: String },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Permission", permissionSchema);
