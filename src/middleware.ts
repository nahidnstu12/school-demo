import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Add logging for debugging
  console.log(`🚀 Middleware executing for: ${request.nextUrl.pathname}`);

  const protectedPaths = ['/posts/create', '/posts/edit'];

  if (protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    const token = await getToken({ req: request });

    console.log('👤 Auth status:', token ? 'Authenticated' : 'Not authenticated');

    if (!token) {
      const url = new URL('/api/auth/signin', request.url);
      url.searchParams.set('callbackUrl', request.url);
      console.log('🔄 Redirecting to:', url.toString());
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/posts/create', '/posts/edit/:path*', '/api/posts/:path*'],
};
