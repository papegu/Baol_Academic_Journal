import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = req.cookies.get('role')?.value || '';

  const isAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/dashboard/editor');
  const isAuthorArea = pathname.startsWith('/dashboard/author');

  if (isAdminArea && role !== 'ADMIN') {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthorArea && !role) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
