import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Define the public paths that don't require authentication
const publicPaths = ['/', '/signin', '/signup'];

// Define onboarding paths that don't require onboarding completion
const onboardingPaths = ['/onboarding'];

// Define protected paths that require onboarding completion
const protectedPaths = ['/calls', '/appointments', '/dashboard', '/settings'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is public (signin, signup, home)
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  // Check if the current path is onboarding
  const isOnboardingPath = onboardingPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  // Check if the current path is a protected path that requires onboarding
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  // Get the token from the request
  const token = await getToken({ req: request });
  
  // If user is not authenticated
  if (!token) {
    // Allow access to public pages (signin, signup, home)
    if (isPublicPath) {
      return NextResponse.next();
    }
    
    // Redirect to signup for protected pages and onboarding
    if (isProtectedPath || isOnboardingPath) {
      return NextResponse.redirect(new URL('/signup', request.url));
    }
    
    return NextResponse.next();
  }
  
  // User is authenticated - check onboarding status
  const onboardingCompleted = token.onboardingCompleted;
  const hasBusinessId = !!token.businessId;
  
  // If user hasn't completed onboarding and tries to access protected pages, redirect to onboarding
  if ((!onboardingCompleted || !hasBusinessId) && isProtectedPath) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }
  
  // If user has completed onboarding and is on onboarding pages, redirect to calls
  if (onboardingCompleted && hasBusinessId && isOnboardingPath) {
    return NextResponse.redirect(new URL('/calls', request.url));
  }
  
  // If user is logged in and tries to access public pages (except home), redirect to calls
  if (isPublicPath && pathname !== '/') {
    return NextResponse.redirect(new URL('/calls', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
