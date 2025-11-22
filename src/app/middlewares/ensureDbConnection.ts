import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

/**
 * Middleware to ensure MongoDB connection is active before processing requests
 * This prevents "buffering timed out" errors when DB connection is lost
 */
export const ensureDbConnection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const connectionState = mongoose.connection.readyState;
  
  // 0 = disconnected
  // 1 = connected
  // 2 = connecting
  // 3 = disconnecting
  
  if (connectionState !== 1) {
    const stateMap: Record<number, string> = {
      0: 'disconnected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    console.error(`❌ MongoDB connection state: ${stateMap[connectionState] || 'unknown'}`);
    
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      `Database is ${stateMap[connectionState] || 'unavailable'}. Please try again in a moment.`
    );
  }
  
  next();
};
