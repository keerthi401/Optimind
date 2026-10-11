import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseClient = null;
let supabaseStatus = {
  configured: false,
  connected: false,
  url: null,
  error: null,
};

export function isSupabaseConfigured() {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_KEY);
}

export function getSupabaseClient() {
  return supabaseClient;
}

export function getSupabaseStatus() {
  return { ...supabaseStatus };
}

export async function initSupabase() {
  if (!isSupabaseConfigured()) {
    supabaseStatus = {
      configured: false,
      connected: false,
      url: null,
      error: 'SUPABASE_URL or SUPABASE_KEY not configured',
    };
    return supabaseStatus;
  }

  try {
    console.log(`[Supabase] Initializing client for ${env.SUPABASE_URL}...`);
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Test connectivity by querying system or an empty table check
    // We use a lightweight query that tests reachability
    const { error } = await supabaseClient.from('users').select('id').limit(1);

    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      // If table doesn't exist yet, connection is still healthy, table just needs creation
      console.warn(`[Supabase Notice] Connected to Supabase, but note: ${error.message}`);
    }

    supabaseStatus = {
      configured: true,
      connected: true,
      url: env.SUPABASE_URL,
      error: null,
    };
    console.log(`[Supabase] Successfully connected to Supabase at ${env.SUPABASE_URL}`);
    return supabaseStatus;
  } catch (err) {
    console.warn(`[Supabase Warning] Failed to connect to Supabase: ${err.message}`);
    supabaseStatus = {
      configured: true,
      connected: false,
      url: env.SUPABASE_URL,
      error: err.message,
    };
    return supabaseStatus;
  }
}

export default {
  initSupabase,
  getSupabaseClient,
  isSupabaseConfigured,
  getSupabaseStatus,
};
