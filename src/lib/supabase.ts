import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project credentials for TeleCorp ERP
export const DEFAULT_SUPABASE_URL = 'https://pghjefdamuzlishnidac.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaGplZmRhbXV6bGlzaG5pZGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMjI2OTMsImV4cCI6MjEwNjY5ODY5M30.902pBXobWEi51vPDP7BQg6VxLM24nuiPBIxk8UQoHMM';

// Local storage keys for runtime configuration overrides
const SUPABASE_URL_KEY = 'telecorp_supabase_url';
const SUPABASE_KEY_KEY = 'telecorp_supabase_anon_key';
const SUPABASE_ENABLED_KEY = 'telecorp_supabase_enabled';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const storedUrl = localStorage.getItem(SUPABASE_URL_KEY) || envUrl;
  const storedKey = localStorage.getItem(SUPABASE_KEY_KEY) || envKey;
  const storedEnabled = localStorage.getItem(SUPABASE_ENABLED_KEY);

  // Enabled by default if URL and key are present
  const enabled = storedEnabled !== null ? storedEnabled === 'true' : Boolean(storedUrl && storedKey);

  return {
    url: storedUrl,
    anonKey: storedKey,
    enabled
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string, enabled: boolean) => {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
  localStorage.setItem(SUPABASE_ENABLED_KEY, String(enabled));
  // Reset client instance so it re-initializes with the new configuration
  clientInstance = null;
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.enabled || !config.url || !config.anonKey) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return clientInstance;
};

export const testSupabaseConnection = async (url?: string, key?: string): Promise<{ success: boolean; message: string; latencyMs?: number }> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { 
      success: false, 
      message: 'আপনার ডিভাইস বর্তমানে অফলাইনে রয়েছে। ইন্টারনেট সংযুক্ত হলে ক্লাউড সার্ভার সংযোগ পরীক্ষা করা যাবে।' 
    };
  }

  const testUrl = url || getSupabaseConfig().url;
  const testKey = key || getSupabaseConfig().anonKey;

  if (!testUrl || !testKey) {
    return { success: false, message: 'Supabase Project URL and Anon Key are required.' };
  }

  const startTime = Date.now();
  try {
    const testClient = createClient(testUrl, testKey);
    // Ping with a lightweight query to app_users with timeout protection
    const pingPromise = testClient.from('app_users').select('id').limit(1);
    const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out (5s)')), 5000)
    );

    const { error } = await Promise.race([pingPromise, timeoutPromise]) as any;
    const latencyMs = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet, but authentication reached Supabase
      if (error.code === 'PGRST116' || error.message.includes('relation "app_users" does not exist')) {
        return {
          success: true,
          latencyMs,
          message: 'Connected to Supabase successfully! (Tables not yet migrated, run supabase_schema.sql in SQL Editor).'
        };
      }
      return { success: false, message: `Database error: ${error.message} (${error.code || 'UNKNOWN'})` };
    }

    return {
      success: true,
      latencyMs,
      message: `Supabase Cloud Connected successfully! Ping latency: ${latencyMs}ms.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network connection failed: ${err.message || 'Unknown network error'}`
    };
  }
};
