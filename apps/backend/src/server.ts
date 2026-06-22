import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import winston from 'winston';
import prisma from './db/client';
import { checkDatabaseConnection, formatHealthCheckResponse } from './utils/healthCheck';
import orderRoutes from './routes/order.routes';
import driverRoutes from './routes/driver.routes';
import dataRoutes from './routes/data.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS allowlist (ADR 0008, security requirement #5).
// In production, CORS_ORIGIN is the Firebase Hosting URL
// (e.g. https://<project>.web.app). Supports a comma-separated list.
// When unset (local dev), default to the Vite dev origin so dev keeps working.
const DEFAULT_DEV_ORIGINS = ['http://localhost:5173'];
const corsOrigins = (process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : DEFAULT_DEV_ORIGINS
)
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: NODE_ENV === 'development'
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.json(),
    }),
    new winston.transports.File({
      filename: path.resolve(__dirname, '../../../logs/app.log'),
      maxsize: 10 * 1024 * 1024, // 10MB rotation
      maxFiles: 3,
    }),
  ],
});

// Middleware
app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
});

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await checkDatabaseConnection(prisma);
    const response = formatHealthCheckResponse(result);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// API Routes
app.use('/api/orders', orderRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/data', dataRoutes);

// Error handling middleware
interface ErrorWithStatus extends Error {
  status?: number;
}

app.use((err: ErrorWithStatus, req: Request, res: Response, _next: NextFunction) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const status = err.status || 500;
  const message = NODE_ENV === 'development'
    ? err.message
    : 'Internal server error';

  res.status(status).json({
    error: {
      message,
      status,
      ...(NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Not found',
      status: 404,
    },
  });
});

// Only start server if this file is run directly (not imported for tests)
if (require.main === module) {
  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
  });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
    });

    await prisma.$disconnect();
    logger.info('Database connection closed');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
    });

    await prisma.$disconnect();
    logger.info('Database connection closed');
    process.exit(0);
  });
}

export default app;
