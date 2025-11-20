// import { Server } from 'http';
// import app from './app';
// import config from './app/config';
// import mongoose from 'mongoose';

// let server: Server;
// const port = config.port;

// async function main() {
//     try {
//       await mongoose.connect(config.database_url as string);
//       console.log("Mongodb database connected successfully")
//       server = app.listen(Number(port), '0.0.0.0', () => {
//         console.log(`The app is currently listening on port ${port}`);
//       });

//     } catch (err) {
//       console.log(err);
//     }
//   }
//   main();

  
// process.on('unhandledRejection', (err) => {
//   console.log(`unhandledRejection is detected , shutting down ...`, err);
//   if (server) {
//     server.close(() => {
//       process.exit(1);
//     });
//   }
//   process.exit(1);
// });

// process.on('uncaughtException', () => {
//   console.log(`uncaughtException is detected , shutting down ...`);
//   process.exit(1);
// });

import { Server } from 'http';
import app from './app';
import config from './app/config';
import { dbConnect } from './app/utils/dbConnect';

let server: Server;
const port = Number(config.port) || 5000; // fallback port

// Initialize database connection (works for both serverless and traditional)
// The dbConnect function uses caching, so it only connects once
dbConnect().catch((err) => {
  console.error("❌ Initial database connection failed:", err);
  // Don't exit in serverless, allow retry on next invocation
  if (process.env.VERCEL !== '1') {
    process.exit(1);
  }
});

// Export app for Vercel serverless
export default app;

// Only run as traditional server if not in serverless environment
if (process.env.VERCEL !== '1') {
  async function main() {
    try {
      if (!config.jwt_access_secret) {
        throw new Error("❌ JWT_ACCESS_SECRET is not set. Check your .env or PM2 env settings.");
      }

      // Database already connecting above, just wait for it
      console.log("⏳ Waiting for database connection...");
      await dbConnect(); // Will reuse cached connection
      console.log("✅ MongoDB database connected successfully");

      server = app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 App is listening on port ${port}`);
      });

    } catch (err) {
      console.error("❌ Startup Error:", err);
      process.exit(1);
    }
  }
  main();

  // graceful shutdown
  process.on('unhandledRejection', (err) => {
    console.log(`❌ UnhandledRejection detected, shutting down...`, err);
    if (server) {
      server.close(() => process.exit(1));
    }
  });

  process.on('uncaughtException', (err) => {
    console.log(`❌ UncaughtException detected, shutting down...`, err);
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    if (server) {
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    }
  });
}
