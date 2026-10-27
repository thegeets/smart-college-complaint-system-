import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

async function startServer() {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Initialize application
    const app = createApp();

    // 3. Start HTTP server
    const server = app.listen(ENV.PORT, () => {
      console.log(`=======================================================`);
      console.log(` Smart College Complaint System - Backend Server`);
      console.log(` Soch College of IT, Pokhara`);
      console.log(` Running on: http://localhost:${ENV.PORT}`);
      console.log(` API Endpoint: http://localhost:${ENV.PORT}/api/v1/health`);
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
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
}

startServer();
