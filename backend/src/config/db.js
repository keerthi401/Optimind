import mongoose from 'mongoose';
import { env } from './env.js';
import { initSupabase, getSupabaseStatus, isSupabaseConfigured } from './supabase.js';

let dbStatus = {
  connected: false,
  mode: 'uninitialized',
  host: null,
  error: null,
};

export async function connectDatabase() {
  // 1. Try Supabase first if configured
  if (isSupabaseConfigured()) {
    console.log(`[Database] Supabase credentials detected. Connecting to Supabase...`);
    const sb = await initSupabase();
    if (sb.connected) {
      dbStatus = {
        connected: true,
        mode: 'supabase',
        host: sb.url,
        error: null,
      };
      return dbStatus;
    } else {
      console.warn(`[Database Warning] Could not connect to Supabase (${sb.error}).`);
    }
  }

  // 2. Try MongoDB if configured
  if (env.MONGODB_URI) {
    try {
      console.log(`[Database] Attempting connection to MongoDB URI...`);
      const conn = await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      dbStatus = {
        connected: true,
        mode: 'mongodb',
        host: conn.connection.host,
        error: null,
      };
      console.log(`[Database] Successfully connected to MongoDB at ${conn.connection.host}`);
      return dbStatus;
    } catch (err) {
      console.warn(`[Database Warning] Could not connect to configured MongoDB URI (${err.message}).`);
      console.warn(`[Database] Activating in-memory store mode for resilient local operation.`);
      dbStatus = {
        connected: true,
        mode: 'in-memory-fallback',
        host: 'memory',
        error: err.message,
      };
      return dbStatus;
    }
  }

  // 3. Fallback to resilient in-memory mode
  console.log(`[Database] No persistent database configured. Operating in resilient in-memory storage mode.`);
  dbStatus = {
    connected: true,
    mode: 'in-memory-fallback',
    host: 'memory',
    error: null,
  };
  return dbStatus;
}

export function getDatabaseStatus() {
  return { ...dbStatus };
}

export default {
  connectDatabase,
  getDatabaseStatus,
};
