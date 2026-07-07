import { createClient } from '@supabase/supabase-js';
import { getStoredAuth } from './auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const authenticatedSupabase = () => {
  const auth = getStoredAuth();
  if (!auth) throw new Error('Not authenticated');

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: Bearer ${auth.token},
      },
    },
  });
};
