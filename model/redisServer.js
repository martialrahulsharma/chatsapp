import dotenv from "dotenv";
import redis from "redis";

dotenv.config();

// connect to redis
export const redisClient = redis.createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});

// Handle redis error
redisClient.on("error", (error) => {
  console.log("Redis error ", error);
});
