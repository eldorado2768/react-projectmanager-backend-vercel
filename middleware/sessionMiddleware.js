import Session from "../models/Session.js";

const checkSessionActivity = async (req, res, next) => {
  
  const sessionId = req.headers["x-session-id"]; // Expect sessionId in headers

  if (!sessionId) {
    return res.status(401).json({ message: "Session ID required." });
  }

  try {
    // Retrieve session info from the database
    const session = await Session.findOne({ sessionId });

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

      // 1 hour of inactivity
      await Session.deleteOne({ sessionId });

     
      return res
        .status(401)
        .json({ message: "Session expired due to inactivity." });
    }

    // Update activity timestamp
    session.lastActivity = Date.now();
    await Session.updateOne(
      { sessionId },
      { $set: { lastActivity: session.lastActivity } }
    );

    // ✅ Attach session data to request (INCLUDING userId!)
    req.session = session;
    req.userId = session.userId; // ✅ Ensure userId is available for downstream use

    

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error validating session:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
export default checkSessionActivity;
