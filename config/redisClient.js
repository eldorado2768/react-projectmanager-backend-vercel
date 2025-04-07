const redis = require("redis");

const redisClient = redis.createClient({
  url: "redis://red-cvo7gaumcj7s73fus710:6379", // Switch to plain redis:// protocol
});

(async () => {
  try {
    console.log("Initializing Redis connection...");
    await redisClient.connect();
    console.log("Redis connected successfully!");

    // Test Redis PING
    const result = await redisClient.ping();
    console.log("PING response:", result); // Expected: "PONG"
  } catch (error) {
    console.error("Redis connection failed:", error); // More detailed logging
  }
})();
