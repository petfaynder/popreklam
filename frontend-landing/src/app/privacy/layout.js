import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Privacy Policy',
    description: 'Learn how MrPop.io collects, uses, and protects your personal data. Full GDPR compliance, cookie policy, and data retention information.',
    path: '/privacy',
    noIndex: false,
});

export default function Layout({ children }) {
    return children;
}
