import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export const connectDb = async () => {
  try {
    await prisma.$connect();
    logger.info(' Connected to PostgreSQL database successfully via Prisma');
  } catch (err) {
    logger.error(' Failed to connect to database:', err);
    throw err;
  }
};

export const disconnectDb = async () => {
  await prisma.$disconnect();
  logger.info(' Disconnected from PostgreSQL database');
};
