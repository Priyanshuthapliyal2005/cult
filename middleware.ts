import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Define which routes require authentication
        const protectedPaths = ['/profile', '/dashboard'];
        const { pathname } = req.nextUrl;
        
        // Allow access to auth pages without token
        if (pathname.startsWith('/auth')) {
          return true;
        }
        
        // Check if the current path requires authentication
        const requiresAuth = protectedPaths.some(path => pathname.startsWith(path));
        
        if (requiresAuth) {
          return !!token;
        }
        
        // Allow access to all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/profile/:path*',
    '/dashboard/:path*',
    '/auth/:path*',
  ],
};