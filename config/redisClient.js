const redis = require("redis");

const externalURL =
  "rediss://red-cvo7gaumcj7s73fus710:oX0sL6ob6uV6CddsCRAyFGYtS7lOo3wr@oregon-keyvalue.render.com:6379";

const redisClient = redis.createClient({
  url: externalURL,
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
