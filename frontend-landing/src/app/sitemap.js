/**
 * sitemap.js — Next.js App Router sitemap.xml generator
 * Dynamically generates sitemap including blog posts from WordPress (if available).
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

const BASE_URL = 'https://mrpop.io';

// Static public pages with SEO priorities
const STATIC_PAGES = [
  { url: '',              changeFrequency: 'weekly',  priority: 1.0 },
  { url: '/for-publishers',   changeFrequency: 'monthly', priority: 0.9 },
  { url: '/for-advertisers',  changeFrequency: 'monthly', priority: 0.9 },
  { url: '/how-it-works',     changeFrequency: 'monthly', priority: 0.8 },
  { url: '/ad-formats',       changeFrequency: 'monthly', priority: 0.8 },
  { url: '/anti-adblock',     changeFrequency: 'monthly', priority: 0.7 },
  { url: '/smart-link',       changeFrequency: 'monthly', priority: 0.7 },
  { url: '/blog',             changeFrequency: 'daily',   priority: 0.8 },
  { url: '/faq',              changeFrequency: 'monthly', priority: 0.7 },
  { url: '/api-docs',         changeFrequency: 'monthly', priority: 0.6 },
  { url: '/docs',             changeFrequency: 'monthly', priority: 0.6 },
  { url: '/contact',          changeFrequency: 'yearly',  priority: 0.5 },
  { url: '/status',           changeFrequency: 'hourly',  priority: 0.4 },
  { url: '/privacy',          changeFrequency: 'yearly',  priority: 0.3 },
  { url: '/terms',            changeFrequency: 'yearly',  priority: 0.3 },
];

// Mock blog slugs (replace with WordPress API fetch when live)
const MOCK_BLOG_SLUGS = [
  'how-to-maximize-popunder-revenue',
  'popunder-ads-vs-push-notifications',
  'top-traffic-sources-for-publishers',
  'advertiser-guide-to-popunder-campaigns',
  'anti-adblock-technology-explained',
  'understanding-cpm-rates-by-country',
];

export default async function sitemap() {
  const now = new Date().toISOString();

  // Static pages
  const staticEntries = STATIC_PAGES.map(({ url, changeFrequency, priority }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Blog posts — try WordPress first, fall back to mock slugs
  let blogEntries = [];
  try {
    const res = await fetch(
      `${process.env.WORDPRESS_URL || 'https://blog.mrpop.io'}/wp-json/wp/v2/posts?per_page=100&_fields=slug,modified`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const posts = await res.json();
      blogEntries = posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.modified ? new Date(post.modified).toISOString() : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }
  } catch {
    // WordPress not available — use mock slugs
    blogEntries = MOCK_BLOG_SLUGS.map((slug) => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  }

  return [...staticEntries, ...blogEntries];
}
