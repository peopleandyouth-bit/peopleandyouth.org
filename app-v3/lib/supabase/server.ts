import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey);

export function createClient() {
  return supabase;
}

export default createClient;