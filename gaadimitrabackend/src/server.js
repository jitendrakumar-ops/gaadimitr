import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { initRedis, closeRedis } from './config/redis.js';
import { initFirebase } from './config/firebase.js';
import { initS3Client } from './config/s3.js';
import { initSocketIO } from './sockets/socket.js';
import { initBookingQueue, closeBookingQueue } from './jobs/booking.job.js';
import { initNotificationQueue, closeNotificationQueue } from './jobs/notification.job.js';
import logger from './utils/logger.js';

const PORT = Number(process.env.PORT) || 5001;

const server = http.createServer(app);

// 1. Initialize Real-Time Socket.IO
initSocketIO(server);

// 2. Start Application Infrastructure
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Initialize Redis connection
    initRedis();

    // Initialize Cloud Integrations (with safe dev fallbacks)
    initFirebase();
    initS3Client();

    // Initialize BullMQ background queues
    initBookingQueue();
    initNotificationQueue();

    // Start HTTP listening
    server.listen(PORT, () => {
      logger.info(`🚀 Production Vehicle Booking Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Fatal error during server startup');
    process.exit(1);
  }
};

// 3. Graceful Shutdown Management
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await closeBookingQueue();
      await closeNotificationQueue();
      await closeRedis();
      await disconnectDatabase();
      logger.info('All connections closed cleanly. Exiting process.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during graceful shutdown');
      process.exit(1);
    }
  });

  // Force shutdown if cleanup takes too long
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing termination.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason }, 'Unhandled Promise Rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ error: error.message, stack: error.stack }, 'Uncaught Exception');
  process.exit(1);
});

startServer();

export { server, app };
