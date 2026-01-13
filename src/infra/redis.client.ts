import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
});
redis.on("error", (err) => {
  console.error("[redis] error:", err);
});
export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
    console.log("[Redis] connected");
  }
}
export async function disconnectRedis() {
  if (redis.isOpen) {
    await redis.quit();
    console.log("[Redis] disconnected");
  }
}
