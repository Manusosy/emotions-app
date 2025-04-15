// This file handles Supabase client initialization
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log the actual environment variables to validate they're being loaded
console.log('Env vars check:', {
  SUPABASE_URL_SET: !!SUPABASE_URL,
  SUPABASE_URL_LENGTH: SUPABASE_URL?.length || 0,
  SUPABASE_URL_START: SUPABASE_URL?.substring(0, 15) || 'not-set',
  SUPABASE_ANON_KEY_SET: !!SUPABASE_ANON_KEY,
  SUPABASE_ANON_KEY_LENGTH: SUPABASE_ANON_KEY?.length || 0,
});

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('⚠️ Missing required Supabase environment variables');
  console.error('Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  console.error('You can copy these values from your Supabase project dashboard');
  
  if (import.meta.env.DEV) {
    // In development, show detailed error
    throw new Error('⚠️ Missing Supabase environment variables. Check your .env file.');
  } else {
    // In production, use fallback values or show a warning
    console.warn('Using fallback Supabase URL and key. Authentication features will not work.');
  }
}

// Log Supabase initialization (safe partial display)
console.log(`Initializing Supabase client with URL: ${SUPABASE_URL?.substring(0, 15)}...`);

// Create Supabase client with better defaults
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder-url.supabase.co', 
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-client-info': 'emotions-app'
      }
    },
    db: {
      schema: 'public'
    },
    // Add error handling for network issues
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        // Default timeout of 30 seconds
        signal: options?.signal || AbortSignal.timeout(30000)
      }).catch(error => {
        console.error('Supabase fetch error:', error);
        throw error;
      });
    }
  }
);
