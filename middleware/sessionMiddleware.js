import jwt from "jsonwebtoken";
import Session from "../models/Session.js";

const checkSessionActivity = async (req, res, next) => {
  const token = req.cookies.authToken; // Get the authToken from
  console.log("Cookies received in request:", req.cookies);

  if (!token) {
    return res.status(401).json({ message: "Authentication token required." });
  }

  try {
    // Validate token using JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve session from the database
    const session = await Session.findOne({ accessToken: token });

    if (!session) {
      return res.status(401).json({
        message: "Session expired or not found. Please log in again.",
      });
    }

    // Check inactivity period
    const inactivityPeriod = Date.now() - session.lastActivity;
    if (inactivityPeriod > 60 * 60 * 1000) {
      console.log(
        "🚨 User session inactive for too long. Attempting deletion..."
      );

      // Delete session after 1 hour of inactivity
      await Session.deleteOne({ accessToken: token });

      return res
        .status(401)
        .json({ message: "Session expired due to inactivity." });
    }

    // Update activity timestamp
    session.lastActivity = Date.now();
    await Session.updateOne(
      { accessToken: token },
      { $set: { lastActivity: session.lastActivity } }
    );

    // ✅ Attach session data to request (INCLUDING userId!)
    req.session = session;
    req.userId = decoded.userId; // Attach userId from decoded token

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error validating session:", error);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

export default checkSessionActivity;
