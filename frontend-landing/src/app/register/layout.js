import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Create Account',
    description: 'Register as a publisher or advertiser on PopReklam. Start monetizing your traffic or driving conversions in minutes.',
    path: '/register',
    noIndex: true,
});

export default function Layout({ children }) {
    return children;
}
