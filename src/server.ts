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
import mongoose from 'mongoose';

let server: Server;
const port = Number(config.port) || 5000; // fallback port

// MongoDB connection cache for serverless
let cachedDb: typeof mongoose | null = null;

async function connectDB() {
  if (cachedDb) {
    console.log('✅ Using cached MongoDB connection');
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(config.database_url as string);
    cachedDb = db;
    console.log("✅ MongoDB database connected successfully");
    return db;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    throw err;
  }
}

async function main() {
  try {
    if (!config.jwt_access_secret) {
      throw new Error("❌ JWT_ACCESS_SECRET is not set. Check your .env or PM2 env settings.");
    }

    await connectDB();

    server = app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 App is listening on port ${port}`);
    });

  } catch (err) {
    console.error("❌ Startup Error:", err);
  }
}

// Only run the server if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1') {
  main();

  // graceful shutdown
  process.on('unhandledRejection', (err) => {
    console.log(`❌ UnhandledRejection detected, shutting down...`, err);
    if (server) {
      server.close(() => process.exit(1));
    }
  });

  process.on('uncaughtException', () => {
    console.log(`❌ UncaughtException detected, shutting down...`);
    process.exit(1);
  });
}

// Export for Vercel serverless
export default async (req: any, res: any) => {
  await connectDB();
  return app(req, res);
};
