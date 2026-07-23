import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'API Reference',
    description: 'MrPop.io REST API documentation. Full reference for authentication, publisher endpoints, advertiser endpoints, and reporting APIs.',
    path: '/api-docs',
    keywords: ['ad network API', 'REST API', 'programmatic advertising API'],
});

export default function Layout({ children }) {
    return children;
}
