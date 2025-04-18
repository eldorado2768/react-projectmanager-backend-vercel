import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(20).toString("hex"), //Ensure no null value
  },
  token: {
    type: String,
    required: true,
  },
  lastActivity: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Optionally create TTL Index for automatic expiration
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
