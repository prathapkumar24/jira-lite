import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  /*const refreshToken = request.cookies.get('refresh_token')?.value;
  console.log('refreshToken',refreshToken);*/

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;
  //console.log('cookieStore', refreshToken);

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/admin');
  // 1. Guard dashboard routes for unauthenticated users
  if (isDashboardRoute && !refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  // 2. Redirect authenticated users away from public auth routes
  if (isAuthRoute && refreshToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
