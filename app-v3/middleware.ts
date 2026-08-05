import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ALWAYS allow /admin/login and non-admin routes to pass without checking
  if (pathname === '/admin/login' || !pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Check for session cookies
  const accessToken = req.cookies.get('sb-access-token')?.value;
  const hasAuthCookie = req.cookies.getAll().some(cookie => 
    cookie.name.includes('auth-token') || cookie.name.includes('sb-')
  );

  // If accessing protected /admin/* routes without cookie, redirect to /admin/login
  if (!accessToken && !hasAuthCookie) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};