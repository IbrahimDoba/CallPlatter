import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Define the public paths that don't require authentication
const publicPaths = ['/', '/signin', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  // Get the token from the request
  const token = await getToken({ req: request });
  
  // Redirect logic
  if (token) {
    // If user is logged in and tries to access public pages, redirect to calls
    if (isPublicPath && pathname !== '/') {
      return NextResponse.redirect(new URL('/calls', request.url));
    }
  } else {
    // If user is not logged in and tries to access protected pages, redirect to signup
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/signup', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
