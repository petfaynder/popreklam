import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'For Advertisers — Buy Targeted Pop & Push Traffic',
    description: 'Run high-performance popunder and push notification campaigns with MrPop.io. Geo-targeting, device targeting, real-time bidding. $100 minimum deposit, no hidden fees.',
    path: '/for-advertisers',
    keywords: ['buy pop traffic', 'popunder advertising', 'push notification ads', 'targeted traffic', 'CPM campaigns'],
});

// Service JSON-LD schema for Google rich results
function AdvertiserServiceSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'MrPop.io Advertiser Traffic Platform',
        description: 'Buy targeted popunder and push notification traffic. Advanced geo, device, and browser targeting. $100 minimum deposit. Campaigns live in 1–2 hours.',
        provider: {
            '@type': 'Organization',
            name: 'MrPop.io',
            url: 'https://mrpop.io',
        },
        serviceType: 'Digital Advertising Network',
        areaServed: 'Worldwide',
        audience: {
            '@type': 'Audience',
            audienceType: 'Advertisers and Performance Marketers',
        },
        offers: {
            '@type': 'Offer',
            description: 'CPM-based campaigns. Minimum deposit $100 USD. No setup fee.',
            priceSpecification: {
                '@type': 'PriceSpecification',
                minPrice: 100,
                priceCurrency: 'USD',
                description: 'Minimum campaign budget',
            },
            eligibleRegion: {
                '@type': 'Place',
                name: 'Worldwide',
            },
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Advertising Formats',
            itemListElement: [
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Popunder Traffic', description: 'High-volume popunder ad campaigns with geo and device targeting.' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Push Notification Traffic', description: 'Opt-in push notification campaigns with high CTR.' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'In-Page Push Traffic', description: 'Push-style display ads without subscription requirement.' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Smart Link Traffic', description: 'Auto-optimized direct link traffic for maximum conversion.' } },
            ],
        },
        url: 'https://mrpop.io/for-advertisers',
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
            <AdvertiserServiceSchema />
            {children}
        </>
    );
}
