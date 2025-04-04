const redis = require("redis");
const redisClient = redis.createClient(); // Adjust configuration if needed

const checkSessionActivity = async (req, res, next) => {
  const sessionID = req.headers["x-session-id"]; // Expect sessionID in the headers

  if (!sessionID) {
    return res.status(401).json({ message: "Session ID required." });
  }

  const sessionData = await redisClient.get(sessionID); // Retrieve session info from Redis
  if (!sessionData) {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }

  const parsedSessionData = JSON.parse(sessionData);
  const inactivityPeriod = Date.now() - parsedSessionData.lastActivity;

  if (inactivityPeriod > 60 * 60 * 1000) { // 1 hour of inactivity
    await redisClient.del(sessionID); // Invalidate session
    return res.status(401).json({ message: "Session expired due to inactivity." });
  }

  // Update activity
  parsedSessionData.lastActivity = Date.now();
  await redisClient.set(sessionID, JSON.stringify(parsedSessionData)); // Save updated session info

  next(); // Proceed to the next middleware or route handler
};

module.exports = checkSessionActivity;