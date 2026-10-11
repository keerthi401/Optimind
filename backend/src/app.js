import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';
import documentRoutes from './routes/document.routes.js';
import ragRoutes from './routes/rag.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';
import progressRoutes from './routes/progress.routes.js';

export function createApp() {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // 2. Explicit CORS Origin Handling
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        const isAllowed = env.ALLOWED_ORIGINS.some((allowed) => {
          if (allowed === '*' || allowed === origin) return true;
          // Support localhost and 127.0.0.1 wildcard port matching in development
          if (env.IS_DEV && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) return true;
          return false;
        });

        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked request from origin: ${origin}`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Rate Limiting for API routes
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests created from this IP, please try again later.',
      },
    },
  });
  app.use('/api', limiter);

  // 4. Request Body Parsing
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // 5. Minimal Secure Request Logging
  app.use(requestLogger);

  // 6. Registered API Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/rag', ragRoutes);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/roadmaps', roadmapRoutes);
  app.use('/api/progress', progressRoutes);

  // 7. Fallback 404 for unknown routes
  app.use(notFoundHandler);

  // 8. Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
