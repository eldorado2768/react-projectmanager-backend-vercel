const redis = require("redis");

const redisClient = redis.createClient({
  url: "rediss://default:b972afc35018708f98b6f198711d7987@master.app-keydb-addon--f7dc6rb57l8c.addon.code.run:6379",
});

(async () => {
  try {
    const pingResponse = await redisClient.ping(); // Correct async call
    console.log("KeyDB PING Response:", pingResponse); // Expected: "PONG"
  } catch (error) {
    console.error("KeyDB PING Error:", error); // Logs ping-related errors
  }
})();
