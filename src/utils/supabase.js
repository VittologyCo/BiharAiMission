import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing. Check your .env file and ensure variables start with REACT_APP_');
}

// Custom lock function to bypass Web Locks API (navigator.locks) and prevent lock stealing errors in React
const customLock = async (name, acquireTimeout, fn) => {
  return await fn();
};

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: customLock,
  }
});
