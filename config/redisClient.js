const redis = require("redis");

const redisClient = redis.createClient({
  url: "rediss://default:b972afc35018708f98b6f198711d7987@master.app-keydb-addon--f7dc6rb57l8c.addon.code.run:6379",
});

async () => {
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
};
