import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'For Publishers — Monetize Your Website Traffic',
    description: "Monetize your website with MrPop.io's high-CPM popunder and push ad network. Earn $0.50–$8.00 CPM with weekly payouts, 100% fill rate, and real-time stats. Compatible with Google AdSense.",
    path: '/for-publishers',
    keywords: ['publisher monetization', 'website monetization', 'popunder CPM', 'push ad revenue', 'weekly payouts'],
});

// Service JSON-LD schema for Google rich results
function PublisherServiceSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'MrPop.io Publisher Ad Monetization',
        description: 'Earn up to $8 CPM by monetizing your website traffic with popunder, push notification, and in-page push ads. Weekly payouts, 70% revenue share, 100% fill rate.',
        provider: {
            '@type': 'Organization',
            name: 'MrPop.io',
            url: 'https://mrpop.io',
        },
        serviceType: 'Ad Network Publisher Monetization',
        areaServed: 'Worldwide',
        audience: {
            '@type': 'Audience',
            audienceType: 'Website Publishers and Bloggers',
        },
        offers: {
            '@type': 'Offer',
            description: 'Revenue share up to 70% of ad revenue. CPM rates from $0.50 to $8.00 depending on traffic geography.',
            price: '0',
            priceCurrency: 'USD',
            eligibleRegion: {
                '@type': 'Place',
                name: 'Worldwide',
            },
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Ad Formats for Publishers',
            itemListElement: [
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Popunder Ads', description: 'Full-page ads that open behind the active window on user click.' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Push Notification Ads', description: 'Browser push alerts sent to subscribed users.' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'In-Page Push Ads', description: 'Push-style notification shown inline on the page without opt-in.' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Smart Link', description: 'Auto-optimizing direct link that routes to the highest-paying offer per visitor.' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Anti-Adblock', description: 'Recover up to 40% of lost revenue from visitors using ad blockers.' } },
            ],
        },
        url: 'https://mrpop.io/for-publishers',
    };
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export default function Layout({ children }) {
    return (
        <>
            <PublisherServiceSchema />
            {children}
        </>
    );
}
