/**
 * Minimal, secure HTTP request logger.
 * Never logs credentials, cookies, authorization tokens, or payload bodies.
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    // Standard structured log format
    const logMessage = `[${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} - ${duration}ms`;

    if (statusCode >= 500) {
      console.error(logMessage);
    } else if (statusCode >= 400) {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  });

  next();
}
