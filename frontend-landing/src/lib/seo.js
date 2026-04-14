/**
 * Centralized SEO metadata generator for MrPop.io public pages.
 *
 * Usage — in any page.js (server component or at top-level):
 *   import { generatePageMetadata } from '@/lib/seo';
 *   export const metadata = generatePageMetadata({
 *       title: 'For Publishers',
 *       description: 'Earn more from your traffic...',
 *       path: '/for-publishers',
 *   });
 */

const SITE_NAME = 'MrPop.io';
const BASE_URL = 'https://mrpop.io';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * @param {{ title?: string, description?: string, path?: string, ogImage?: string, noIndex?: boolean, keywords?: string[] }} options
 * @returns {import('next').Metadata}
 */
export function generatePageMetadata({
    title,
    description,
    path = '',
    ogImage = DEFAULT_OG_IMAGE,
    noIndex = false,
    keywords = [],
} = {}) {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Premium Ad Network for Publishers & Advertisers`;
    const fullUrl = `${BASE_URL}${path}`;

    return {
        title: fullTitle,
        description: description || 'MrPop.io is a premium ad network connecting publishers with high-quality advertisers. Maximize revenue with popunder, push, native, and display ads.',
        keywords: [
            'ad network', 'popunder ads', 'publisher monetization', 'advertiser traffic',
            'CPM', 'CPA', 'push notification ads', 'native ads', ...keywords,
        ],
        metadataBase: new URL(BASE_URL),
        alternates: {
            canonical: fullUrl,
        },
        openGraph: {
            title: fullTitle,
            description: description || 'Premium ad network for publishers and advertisers.',
            url: fullUrl,
            siteName: SITE_NAME,
            images: [{ url: ogImage, width: 1200, height: 630 }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description: description || 'Premium ad network for publishers and advertisers.',
            images: [ogImage],
        },
        robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    };
}
