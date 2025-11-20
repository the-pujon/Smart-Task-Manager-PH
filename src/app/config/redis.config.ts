// /* eslint-disable no-console */
// import { createClient, RedisClientType } from "redis";

// let redisClient: RedisClientType;

// export const getRedisClient = async () => {
//   if (!redisClient) {
//     redisClient = createClient({
//       username: "default",
//       password: process.env.REDIS_PASSWORD,
//       socket: {
//         host: process.env.REDIS_HOST,
//         port: 14561,
//         reconnectStrategy: (retries) => {
//           if (retries >= 3) {
//             return new Error("Failed to connect to Redis");
//           }
//           return Math.min(retries * 50, 2000);
//         },
//       },
//     });

//     redisClient.on("error", (err) => {
//       console.error("Redis error:", err);
//     });

//     redisClient.on("connect", () => {
//       console.log("Connected to Redis");
//     });

//     redisClient.on("ready", () => console.log("Redis Client Ready"));
//     redisClient.on("reconnecting", () => console.log("Redis Client Reconnecting"));
//     redisClient.on("end", () => console.log("Redis Client Ended"));

//     await redisClient.connect();
//   }

//   return redisClient;
// };



/* eslint-disable no-console */
import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType;

export const getRedisClient = async () => {
  if (!redisClient) {
    const host = process.env.REDIS_HOST;
    const port = Number(process.env.REDIS_PORT);

    if (!host) throw new Error("REDIS_HOST is missing");
    if (!port || isNaN(port)) throw new Error("REDIS_PORT is invalid");
    if (!process.env.REDIS_PASSWORD) throw new Error("REDIS_PASSWORD is missing");

    redisClient = createClient({
      username: "default",
      password: process.env.REDIS_PASSWORD,
      socket: {
        host,
        port,
        reconnectStrategy: (retries) => {
          if (retries >= 3) {
            return new Error("Failed to connect to Redis");
          }
          return Math.min(retries * 50, 2000);
        },
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis error:", err);
    });

    redisClient.on("connect", () => {
      console.log("Connected to Redis");
    });

    redisClient.on("ready", () => console.log("Redis Client Ready"));
    redisClient.on("reconnecting", () =>
      console.log("Redis Client Reconnecting")
    );
    redisClient.on("end", () => console.log("Redis Client Ended"));

    await redisClient.connect();
  }

  return redisClient;
};
