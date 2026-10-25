import { createApp } from './app';
import { ENV } from './config/env';
import { connectDb, disconnectDb } from './db/prisma';
import { logger } from './utils/logger';

const app = createApp();

const startServer = async () => {
  try {
    // Attempt DB connection
    await connectDb();

    const server = app.listen(ENV.PORT, () => {
      logger.info(`🌸 Shri Radha Rani Store API running on port ${ENV.PORT}`);
      logger.info(`🌸 Environment: ${ENV.NODE_ENV}`);
      logger.info(`🌸 API Base URL: http://localhost:${ENV.PORT}${ENV.API_PREFIX}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDb();
        logger.info('Graceful shutdown completed. Radhe Radhe!');
        process.exit(0);
      });

      // Force exit after 10s if stuck
      setTimeout(() => {
        logger.error('Forcefully exiting server after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
