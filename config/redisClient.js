const redis = require("redis");

const redisClient = redis.createClient({
  url: "rediss://red-cvo7gaumcj7s73fus710:oX0sL6ob6uV6CddsCRAyFGYtS7lOo3wr@oregon-keyvalue.render.com:6379",
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error); // Log connection errors
});

(async () => {
  try {
    console.log("Attempting Redis connection...");
    await redisClient.connect(); // Explicitly connect
    console.log("Redis connected successfully!");
  } catch (error) {
    console.error("Redis connection failed:", error); // Detailed error
  }
})();

module.exports = redisClient;
