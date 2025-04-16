const checkSessionActivity = async (req, res, next) => {
  const sessionID = req.headers["x-session-id"]; // Expect sessionID in the headers

  if (!sessionID) {
    return res.status(401).json({ message: "Session ID required." });
  }

  try {
    // Retrieve session info from the database
    const session = await db.collection("Sessions").findOne({ sessionID });

    if (!session) {
      return res.status(401).json({
        message: "Session expired or not found. Please log in again.",
      });
    }

    // Check inactivity period
    const inactivityPeriod = Date.now() - session.lastActivity;
    if (inactivityPeriod > 60 * 60 * 1000) {
      // 1 hour of inactivity
      // Invalidate session by deleting it from the database
      await db.collection("Sessions").deleteOne({ sessionID });
      return res
        .status(401)
        .json({ message: "Session expired due to inactivity." });
    }

    // Update activity timestamp
    session.lastActivity = Date.now();
    await db
      .collection("Sessions")
      .updateOne(
        { sessionID },
        { $set: { lastActivity: session.lastActivity } }
      );

    // Attach session data to the request object for downstream use
    req.session = session;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error validating session:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export {checkSessionActivity};
