import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/*
 * ============================================================
 * SERVER-SIDE SUPABASE CLIENT
 * ============================================================
 *
 * Used for authenticated SSR requests.
 *
 * This client uses the user's Supabase session cookies.
 *
 * DO NOT use this client for service-role/admin operations.
 */

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(
                  name,
                  value,
                  options
                );
              }
            );
          } catch {
            /*
             * Cookie writes may be ignored in contexts where
             * cookies cannot be mutated.
             *
             * Route handlers can normally mutate them.
             */
          }
        },
      },
    }
  );
}


/*
 * ============================================================
 * SUPABASE ADMIN CLIENT
 * ============================================================
 *
 * Existing API routes in this project already import:
 *
 *     import { supabaseAdmin } from "@/lib/supabase/server";
 *
 * Therefore this export MUST remain available.
 *
 * This client uses the SERVICE ROLE KEY and must NEVER be
 * imported into client-side React components.
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable.'
  );
}

if (!serviceRoleKey) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY environment variable.'
  );
}

export const supabaseAdmin =
  createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );