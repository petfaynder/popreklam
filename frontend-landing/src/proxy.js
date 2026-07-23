import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all paths EXCEPT:
  //  - /admin (internal panel, always English)
  //  - /_next (Next.js internals)
  //  - /api  (API routes)
  //  - Files with extensions (.ico, .png, .jpg, etc.)
  matcher: [
    '/((?!admin|api|_next|_vercel|.*\\.[a-zA-Z]+$).*)',
  ],
};
