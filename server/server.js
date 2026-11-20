import fs from 'fs';
import path from 'path';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

async function startServer() {
  try {
    // 1. Ensure upload directory exists (handles ephemeral disks on Render seamlessly)
    const uploadPath = path.resolve(process.cwd(), ENV.UPLOAD_DIR);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // 2. Establish database connection
    await connectDB();

    // 3. Initialize application
    const app = createApp();

    // 4. Start HTTP server binding explicitly to 0.0.0.0 for containerized environments
    const server = app.listen(ENV.PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(` Smart College Complaint System - Backend Server`);
      console.log(` Soch College of IT, Pokhara`);
      console.log(` Listening on: 0.0.0.0:${ENV.PORT}`);
      console.log(` Health Check: http://localhost:${ENV.PORT}/api/v1/health`);
      console.log(` Environment: ${ENV.NODE_ENV}`);
      console.log(`=======================================================`);
    });

    // Graceful shutdown handling
    const handleShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error('Fatal error during server startup:', error.message || error);
    process.exit(1);
  }
}

startServer();
