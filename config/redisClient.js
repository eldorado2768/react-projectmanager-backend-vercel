const redis = require("redis");

const redisClient = redis.createClient({
  url: "redis://red-cvo7gaumcj7s73fus710:6379", 
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

redisClient.connect().then(() => {
  console.log("Redis Connected Successfully!");

  // PING test
  redisClient.ping((err, res) => {
    if (err) {
      console.error("Redis PING Error:", err);
    } else {
      console.log("Redis Connection Test:", res); // Should print "PONG"
    }
  });
});

module.exports = redisClient;
