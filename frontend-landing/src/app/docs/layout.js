import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Documentation',
    description: 'PopReklam integration documentation. Step-by-step guides for adding ad codes, Smart Link setup, API integration, and Anti-Adblock configuration.',
    path: '/docs',
    keywords: ['ad network documentation', 'integration guide', 'SDK docs'],
});

export default function Layout({ children }) {
    return children;
}
