import { createApp } from '../server/app.js';
import { connectDB } from '../server/config/db.js';

let appInstance = null;

/**
 * Vercel Serverless Function entry point.
 * Allows the Express backend to run directly on Vercel Serverless Functions
 * with cached MongoDB connections across cold starts.
 */
export default async function handler(req, res) {
  try {
    await connectDB();
    if (!appInstance) {
      appInstance = createApp();
    }
    return appInstance(req, res);
  } catch (error) {
    console.error('[Vercel Serverless Handler Error]', error);
    return res.status(500).json({
      success: false,
      code: 'SERVERLESS_INVOCATION_ERROR',
      message: 'Server error during serverless execution: ' + (error.message || 'Unknown error'),
    });
  }
}
