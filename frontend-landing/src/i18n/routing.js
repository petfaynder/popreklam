import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // All supported locales
  locales: ['en', 'tr', 'ru', 'pt', 'es', 'fr', 'id', 'ar', 'de'],

  // Default locale (fallback when no match)
  defaultLocale: 'en',

  // Detect locale from browser Accept-Language header + cookie
  // Cookie name: NEXT_LOCALE (set when user manually switches language)
  localeDetection: true,
});
