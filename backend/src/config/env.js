import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function validateEnv() {
  const port = parseInt(process.env.PORT || '5000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT configuration: "${process.env.PORT}". Must be between 1 and 65535.`);
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  const rawFrontendUrls = process.env.FRONTEND_URL || 'http://localhost:5174,http://localhost:5173,http://localhost:3000';
  const allowedOrigins = rawFrontendUrls
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '300', 10);
  const maxFileSizeBytes = parseInt(process.env.MAX_FILE_SIZE_BYTES || `${15 * 1024 * 1024}`, 10);

  const uploadDir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : (process.env.VERCEL ? '/tmp' : path.resolve(process.cwd(), 'uploads'));

  return {
    PORT: port,
    NODE_ENV: nodeEnv,
    IS_PROD: nodeEnv === 'production',
    IS_DEV: nodeEnv === 'development',
    ALLOWED_ORIGINS: allowedOrigins,
    MONGODB_URI: process.env.MONGODB_URI || '',
    SUPABASE_URL: (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
    SUPABASE_KEY: (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ''
    ).trim(),
    JWT_SECRET: process.env.JWT_SECRET || 'optimind_jwt_secure_dev_secret_key_8492049210491',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    GEMINI_API_KEY: (process.env.GEMINI_API_KEY || '').trim(),
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    RATE_LIMIT_WINDOW_MS: isNaN(rateLimitWindowMs) ? 900000 : rateLimitWindowMs,
    RATE_LIMIT_MAX: isNaN(rateLimitMax) ? 300 : rateLimitMax,
    MAX_FILE_SIZE_BYTES: isNaN(maxFileSizeBytes) ? 15728640 : maxFileSizeBytes,
    UPLOAD_DIR: uploadDir,
  };
}

export const env = validateEnv();
export default env;
