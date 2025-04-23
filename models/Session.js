import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accessToken: { type: String, required: true }, // Stores the JWT token
  refreshToken: { type: String }, // Optional for refresh token strategy
  expiresAt: { type: Date, required: true }, // Token expiration time
  createdAt: { type: Date, default: Date.now },
});

// Optionally create TTL Index for automatic expiration
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
