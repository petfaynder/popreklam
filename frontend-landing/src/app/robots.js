/**
 * robots.js — Next.js App Router robots.txt generator
 * Tells search engines and AI crawlers what to index.
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots() {
  return {
    rules: [
      {
        // Standard search engine bots
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/advertiser/',
          '/publisher/',
          '/api/',
          '/forgot-password',
          '/reset-password',
          '/login',
          '/register',
        ],
      },
      {
        // Allow AI crawlers to access all public content
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'anthropic-ai', 'Claude-Web', 'PerplexityBot', 'cohere-ai'],
        allow: '/',
        disallow: [
          '/admin/',
          '/advertiser/',
          '/publisher/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://mrpop.io/sitemap.xml',
    host: 'https://mrpop.io',
  };
}
