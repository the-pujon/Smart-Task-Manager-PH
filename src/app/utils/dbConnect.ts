import mongoose from 'mongoose';
import config from '../config';

// Track connection state across serverless invocations
let isConnected: boolean = false;

/**
 * Connect to MongoDB with optimized settings for serverless environments
 * This function caches the connection to reuse across Lambda invocations
 */
export const dbConnect = async (): Promise<void> => {
  // If already connected, reuse the existing connection
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('📦 Using cached MongoDB connection');
    return;
  }

  try {
    // Configure mongoose for serverless
    mongoose.set('strictQuery', false);
    
    // Disable buffering - fail fast instead of buffering commands
    mongoose.set('bufferCommands', false);
    
    const db = await mongoose.connect(config.database_url as string, {
      // Serverless-optimized settings
      maxPoolSize: 10, // Limit connection pool size
      minPoolSize: 1,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      family: 4, // Use IPv4, skip trying IPv6
      
      // Connection management
      retryWrites: true,
      retryReads: true,
      
      // Compression
      compressors: ['zlib'],
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully (serverless)');
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      isConnected = false;
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.log('🔌 Mongoose disconnected');
    });

  } catch (error) {
    isConnected = false;
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

/**
 * Get the current connection status
 */
export const getConnectionStatus = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};

/**
 * Disconnect from MongoDB (useful for cleanup in non-serverless environments)
 */
export const dbDisconnect = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 MongoDB disconnected');
  }
};
