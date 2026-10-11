import { app } from '../backend/src/app.js';
import { connectDatabase } from '../backend/src/config/db.js';

let isDbConnected = false;

export default async function handler(req, res) {
  if (!isDbConnected) {
    try {
      await connectDatabase();
      isDbConnected = true;
    } catch (err) {
      console.warn('[Vercel Serverless] DB connection notice:', err.message);
    }
  }

  return app(req, res);
}
