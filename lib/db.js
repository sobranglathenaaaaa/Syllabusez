import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Warn if not configured
if (!supabaseUrl || !supabaseKey) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("Supabase URL or Key is missing. Database operations will fail.");
  }
}

// Create a single supabase client for interacting with your database
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;
