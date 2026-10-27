import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error.message);
    throw error;
  }
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] MongoDB disconnected cleanly.');
  }
}
