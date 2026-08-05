import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl.length > 0 ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey.length > 0 ? supabaseAnonKey : 'placeholder-key'
);