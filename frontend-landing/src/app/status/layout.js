import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Platform Status',
    description: 'Check the current operational status of PopReklam services. Network uptime, API availability, and system performance.',
    path: '/status',
    keywords: ['platform status', 'system uptime', 'service status'],
});

export default function Layout({ children }) {
    return children;
}
