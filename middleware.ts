import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = req.cookies.get('role')?.value || '';

  const isAdminPath = pathname.startsWith('/admin');
  const isEditorPath = pathname.startsWith('/dashboard/editor');
  const isAuthorPath = pathname.startsWith('/dashboard/author');

  if (isAdminPath && role !== 'ADMIN') {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isEditorPath && role !== 'ADMIN' && role !== 'EDITOR') {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthorPath && !role) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
