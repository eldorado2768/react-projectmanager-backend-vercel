import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, unique: true },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }], // Use ObjectId references
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model("Role", roleSchema);
