import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Terms of Service',
    description: "Read MrPop.io's terms of service covering publisher and advertiser obligations, prohibited content policies, revenue sharing terms, and payment conditions.",
    path: '/terms',
    noIndex: false,
});

export default function Layout({ children }) {
    return children;
}
