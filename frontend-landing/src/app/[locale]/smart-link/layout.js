import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Smart Link — Automatic Offer Matching',
    description: 'MrPop.io Smart Link automatically routes each visitor to the highest-paying offer based on their geo, device, and browsing context. One link, maximum revenue.',
    path: '/smart-link',
    keywords: ['smart link', 'direct link', 'automatic offer matching', 'geo-targeted link', 'affiliate smart link'],
});

export default function Layout({ children }) {
    return children;
}
