const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  permissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Permission" },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, unique: true },
  lastUpdated: { type: Date, default: Date.now },
  resetPasswordToken: { type: String, default: null }, // Added this line
  resetPasswordExpires: { type: Date, default: null }, // Added this line
});

module.exports = mongoose.model("User", userSchema);
