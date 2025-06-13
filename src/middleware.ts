import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;

  // ✅ Skip public files (static, images, etc.)
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/favicon.ico") ||
		pathname.startsWith("/api") ||
		pathname.match(/\.(.*)$/) // static files like .png, .css, .js
	) {
		return NextResponse.next();
	}

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",],
};
