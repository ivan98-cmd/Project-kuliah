import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout'];
const staticFilePattern = /^\/.*\.(ico|png|jpg|jpeg|svg|webp|css|js)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    publicRoutes.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    staticFilePattern.test(pathname)
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('syncevent-session')?.value;

  if (!sessionCookie) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
