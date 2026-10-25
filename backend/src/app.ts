import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { ENV } from './config/env';
import { generalLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import apiRouter from './routes';

export const createApp = () => {
  const app = express();

  // Security Headers via Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: [ENV.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id', 'x-razorpay-signature'],
    })
  );

  // Rate Limiting
  app.use(generalLimiter);

  // Request Logging
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // Cookie Parser
  app.use(cookieParser(ENV.COOKIE_SECRET));

  // JSON Body Parser with Raw Body Retention for Webhooks
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: Request & { rawBody?: Buffer }, _res: Response, buf: Buffer) => {
        req.rawBody = buf;
      },
    })
  );

  // URL-encoded Body Parser
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Root welcoming endpoint
  app.get('/', (_req, res) => {
    res.json({
      message: 'Radhe Radhe! Welcome to Shri Radha Rani Devotional Store REST API',
      version: '1.0.0',
      docs: `${ENV.API_PREFIX}/health`,
    });
  });

  // Mount API Router
  app.use(ENV.API_PREFIX, apiRouter);

  // 404 Route Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
