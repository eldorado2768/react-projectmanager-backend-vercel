cconst redis = require("redis");

const redisClient = redis.createClient({
  url: "rediss://default:b972afc35018708f98b6f198711d7987@master.app-keydb-addon--f7dc6rb57l8c.addon.code.run:6379", // Replace with Northflank's REDIS_MASTER_URL
});

redisClient.on("error", (error) => {
  console.error("KeyDB Client Error:", error); // Logs connection errors
});

(async () => {
  try {
    console.log("Attempting KeyDB connection...");
    await redisClient.connect(); // Ensure this is awaited
    console.log("KeyDB connected successfully!");

    // Test PING command
    const pingResponse = await redisClient.ping();
    console.log("PING Response:", pingResponse); // Expected: "PONG"
  } catch (error) {
    console.error("KeyDB connection failed:", error); // Logs initialization errors
  }
})();

module.exports = redisClient;
