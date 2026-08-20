import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  /*
   * ============================================================
   * PUBLIC ADMIN AUTH ROUTES
   * ============================================================
   */

  if (
    pathname === '/admin/login' ||
    pathname === '/admin/verify' ||
    pathname === '/admin/reset-password'
  ) {
    return response;
  }

  /*
   * ============================================================
   * ONLY PROTECT /admin/*
   * ============================================================
   */

  if (!pathname.startsWith('/admin')) {
    return response;
  }

  /*
   * ============================================================
   * SERVER-SIDE AUTHENTICATION CHECK
   * ============================================================
   *
   * getUser() asks Supabase to validate the authenticated user.
   * We do not trust a cookie merely because it exists.
   */

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.log(
      '[PROXY] No authenticated Supabase user:',
      error?.message || 'No user'
    );

    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = '/admin/login';
    loginUrl.search = '';

    loginUrl.searchParams.set(
      'redirect',
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  /*
   * ============================================================
   * AUTHENTICATED
   * ============================================================
   */

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};