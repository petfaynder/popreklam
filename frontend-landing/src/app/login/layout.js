import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Sign In',
    description: 'Sign in to your MrPop.io publisher or advertiser dashboard. Access analytics, manage campaigns, and track earnings.',
    path: '/login',
    noIndex: true,
});

export default function Layout({ children }) {
    return children;
}
