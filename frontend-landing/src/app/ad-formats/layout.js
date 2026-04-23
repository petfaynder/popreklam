import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Ad Formats — Popunder, Push, In-Page Push & More',
    description: 'Explore MrPop.io ad formats: Popunder, Push Notification, In-Page Push, Interstitial, Smart Link, and Banner ads. Compare CPM rates, use cases, and performance benchmarks.',
    path: '/ad-formats',
    keywords: ['popunder ads', 'push notification ads', 'in-page push', 'interstitial ads', 'smart link', 'banner ads', 'ad formats comparison'],
});

export default function Layout({ children }) {
    return children;
}
