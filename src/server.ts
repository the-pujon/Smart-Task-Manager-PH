// // import { Server } from 'http';
// // import app from './app';
// // import config from './app/config';
// // import mongoose from 'mongoose';

// // let server: Server;
// // const port = config.port;

// // async function main() {
// //     try {
// //       await mongoose.connect(config.database_url as string);
// //       console.log("Mongodb database connected successfully")
// //       server = app.listen(Number(port), '0.0.0.0', () => {
// //         console.log(`The app is currently listening on port ${port}`);
// //       });

// //     } catch (err) {
// //       console.log(err);
// //     }
// //   }
// //   main();

  
// // process.on('unhandledRejection', (err) => {
// //   console.log(`unhandledRejection is detected , shutting down ...`, err);
// //   if (server) {
// //     server.close(() => {
// //       process.exit(1);
// //     });
// //   }
// //   process.exit(1);
// // });

// // process.on('uncaughtException', () => {
// //   console.log(`uncaughtException is detected , shutting down ...`);
// //   process.exit(1);
// // });

// import { Server } from 'http';
// import app from './app';
// import config from './app/config';
// import { dbConnect } from './app/utils/dbConnect';

// let server: Server;
// const port = Number(config.port) || 5000; // fallback port

// // For serverless environments (Vercel, AWS Lambda, etc.)
// // We wrap the app to ensure DB connection before handling requests
// const handler = async (req: any, res: any) => {
//   try {
//     await dbConnect();
//     return app(req, res);
//   } catch (error) {
//     console.error("❌ Database connection failed:", error);
//     res.status(503).json({ 
//       success: false, 
//       message: 'Service temporarily unavailable - database connection failed',
//       error: process.env.NODE_ENV === 'development' ? String(error) : undefined
//     });
//   }
// };

// // Export handler for Vercel/AWS Lambda serverless
// export default handler;

// // Only run as traditional server if not in serverless environment
// if (process.env.VERCEL !== '1') {
//   async function main() {
//     try {
//       if (!config.jwt_access_secret) {
//         throw new Error("❌ JWT_ACCESS_SECRET is not set. Check your .env or PM2 env settings.");
//       }

//       // Database already connecting above, just wait for it
//       console.log("⏳ Waiting for database connection...");
//       await dbConnect(); // Will reuse cached connection
//       console.log("✅ MongoDB database connected successfully");

//       server = app.listen(port, '0.0.0.0', () => {
//         console.log(`🚀 App is listening on port ${port}`);
//       });

//     } catch (err) {
//       console.error("❌ Startup Error:", err);
//       process.exit(1);
//     }
//   }
//   main();

//   // graceful shutdown
//   process.on('unhandledRejection', (err) => {
//     console.log(`❌ UnhandledRejection detected, shutting down...`, err);
//     if (server) {
//       server.close(() => process.exit(1));
//     }
//   });

//   process.on('uncaughtException', (err) => {
//     console.log(`❌ UncaughtException detected, shutting down...`, err);
//     process.exit(1);
//   });

//   process.on('SIGTERM', () => {
//     console.log('👋 SIGTERM received, shutting down gracefully');
//     if (server) {
//       server.close(() => {
//         console.log('✅ Server closed');
//         process.exit(0);
//       });
//     }
//   });
// }




/* eslint-disable no-console */
import mongoose from "mongoose";
import { Server } from "http";
import app from "./app";
import config from "./app/config";

let server: Server;
let isConnected = false;

// Track connection attempts
let connectionAttempts = 0;
const MAX_RETRIES = 3;

async function connectWithRetry(): Promise<void> {
  // If already connected in serverless environment, reuse connection
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('📦 Using cached MongoDB connection');
    return;
  }

  try {
    connectionAttempts++;
    
    // Validate required configuration
    if (!config.database_url) {
      throw new Error("❌ MONGODB_URI is not configured in environment variables");
    }

    // Disable buffering - fail fast instead of queuing operations
    mongoose.set('bufferCommands', false);
    mongoose.set('strictQuery', false);

    console.log(`🔄 Connecting to MongoDB (attempt ${connectionAttempts}/${MAX_RETRIES})...`);
    console.log("📍 Using database URL:", config.database_url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
    
    // Connect with proper timeout settings
    await mongoose.connect(config.database_url, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 1, // Lower for serverless
      retryWrites: true,
      retryReads: true,
      family: 4, // Use IPv4
    });

    // Verify connection is ready
    if (mongoose.connection.readyState !== 1) {
      throw new Error("❌ MongoDB connection state is not ready");
    }

    isConnected = true;
    console.log("✅ MongoDB connected successfully");
    console.log("🔗 Connection state:", mongoose.connection.readyState);
    console.log("🗄️  Database name:", mongoose.connection.db?.databaseName);
    
    // Reset connection attempts on success
    connectionAttempts = 0;

  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB connection failed (attempt ${connectionAttempts}/${MAX_RETRIES}):`, error);
    
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`⏳ Retrying in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectWithRetry();
    } else {
      console.error("💡 Make sure MONGODB_URI is correctly set in your .env file");
      console.error("💡 Verify your MongoDB cluster is accessible and credentials are correct");
      throw error;
    }
  }
}

// Export for Vercel serverless (this is the entry point for Vercel)
export default async function handler(req: any, res: any) {
  try {
    // Ensure DB connection before handling request
    await connectWithRetry();
    
    // Pass request to Express app
    return app(req, res);
  } catch (error) {
    console.error("❌ Serverless handler error:", error);
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable - database connection failed',
      error: config.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

// Traditional server mode (for local development or VPS)
if (require.main === module || process.env.VERCEL !== '1') {
  async function main() {
    try {
      // Connect to MongoDB with retry logic
      await connectWithRetry();

      // Set up connection event handlers
      mongoose.connection.on('disconnected', () => {
        isConnected = false;
        console.warn('⚠️  MongoDB disconnected! Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        isConnected = true;
        console.log('✅ MongoDB reconnected successfully');
      });

      mongoose.connection.on('error', (err) => {
        isConnected = false;
        console.error('❌ MongoDB connection error:', err);
      });

      // Only start server after DB connection is established
      server = app.listen(config.port, () => {
        console.log(`🚀 App is listening on port ${config.port}`);
        console.log(`🌐 Environment: ${config.NODE_ENV || 'development'}`);
      });

    } catch (err) {
      console.error("❌ Server startup error:", err);
      process.exit(1);
    }
  }

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    if (server) {
      server.close(async () => {
        await mongoose.connection.close();
        isConnected = false;
        console.log('✅ MongoDB connection closed');
        process.exit(0);
      });
    }
  });

  main();
}