import { env } from '../config/env.js';

/**
 * Centralized error handler middleware.
 * Formats operational and unexpected errors consistently and protects internal traces in production.
 */
export function errorHandler(err, req, res, next) {
  // Handle invalid JSON body payloads
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON_BODY',
        message: 'The request body contains invalid JSON syntax.',
      },
    });
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const isServerFault = statusCode >= 500;

  // Log server faults for diagnostic monitoring
  if (isServerFault) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  }

  const response = {
    success: false,
    error: {
      code: err.code || (isServerFault ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
      message: err.message || 'An unexpected error occurred. Please try again.',
    },
  };

  // Expose stack trace only in development
  if (env.IS_DEV && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
