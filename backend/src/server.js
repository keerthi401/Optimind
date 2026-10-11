import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';

let server;

async function startServer() {
  // Initialize Database connection (supports real MongoDB and fallback in-memory)
  await connectDatabase();

  server = app.listen(env.PORT, () => {
    console.log('========================================================');
    console.log(`🚀 OptiMind AI Backend Server Started`);
    console.log(`📡 URL: http://localhost:${env.PORT}`);
    console.log(`🌐 Environment: ${env.NODE_ENV}`);
    console.log(`🔒 Allowed Origins: ${env.ALLOWED_ORIGINS.join(', ')}`);
    console.log(`🩺 Health Endpoint: http://localhost:${env.PORT}/api/health`);
    console.log('========================================================');
  });
}

// Graceful Shutdown Handlers
function handleGracefulShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Shutting down HTTP server gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP connections closed. Process terminating.');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('[Server] Force shutdown timeout exceeded. Terminating forcefully.');
      process.exit(1);
    }, 5000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process Error] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Process Error] Uncaught Exception:', error);
  process.exit(1);
});

startServer();
