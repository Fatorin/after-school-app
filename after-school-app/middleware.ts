// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login';
  const token = request.cookies.get('auth_token')?.value;

  if (isPublicPath && token) {
    // 如果是公開路徑且有 token，重定向到首頁
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublicPath && !token) {
    // 如果不是公開路徑且沒有 token，重定向到登入頁
    const from = new URL('/login', request.url);
    from.searchParams.set('from', path);
    return NextResponse.redirect(from);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
  ]
};