import { withAuth } from 'next-auth/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

const authMiddleware = withAuth(
  function middleware(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Define which routes require authentication
        const protectedPaths = ['/profile', '/dashboard'];
        const { pathname } = req.nextUrl;
        
        // Remove locale prefix for path checking
        const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
        
        // Allow access to auth pages without token
        if (pathWithoutLocale.startsWith('/auth')) {
          return true;
        }
        
        // Check if the current path requires authentication
        const requiresAuth = protectedPaths.some(path => pathWithoutLocale.startsWith(path));
        
        if (requiresAuth) {
          return !!token;
        }
        
        // Allow access to all other routes
        return true;
      },
    },
  }
);

export default function middleware(req: any) {
  const publicPatterns = [
    // These paths should be publicly accessible
    '/',
    '/api',
    '/auth',
    '/explore',
    '/chat',
    '/admin'
  ];
  
  const pathname = req.nextUrl.pathname;
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
  
  const isPublicPath = publicPatterns.some(pattern => 
    pathWithoutLocale === pattern || pathWithoutLocale.startsWith(pattern + '/')
  );

  if (isPublicPath) {
    return intlMiddleware(req);
  }

  return authMiddleware(req);
}
export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(hi|es|fr|de|ja|zh)/:path*',
    
    // Enable redirects that add missing locales
    // (these are the pages that require a locale)
    '/((?!api|_next|_vercel|.*\\..*).*)/',
    
    '/profile/:path*',
    '/dashboard/:path*',
    '/auth/:path*',
  ],
};