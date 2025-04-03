const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
  resetPasswordToken: { type: String }, // Randomly generated code
  resetPasswordExpires: { type: Date }, // Expiration timestamp
  accessCode: { type: String }, // Randomly generated code
  accessCodeExpires: { type: Date }, // Expiration timestamp
  isActivated: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
