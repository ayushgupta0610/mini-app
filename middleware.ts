import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on every request
export function middleware(request: NextRequest) {
  // Check if the URL path is /quiz
  if (request.nextUrl.pathname === '/quiz') {
    // Rewrite the URL to the root path, but keep the request going to the /quiz route
    // This preserves the functionality while changing what appears in the browser URL
    return NextResponse.rewrite(new URL('/', request.url));
  }
  
  // For all other routes, continue normally
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/quiz'],
};
