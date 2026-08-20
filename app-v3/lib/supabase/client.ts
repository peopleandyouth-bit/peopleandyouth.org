import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Browser-side Supabase client.
 *
 * This client is safe to use from Client Components.
 * It uses the public/publishable Supabase key only.
 *
 * NEVER use SUPABASE_SERVICE_ROLE_KEY here.
 */
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);