import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Blog — Ad Network Insights & Publisher Guides',
    description: 'Publisher monetization tips, advertiser campaign guides, CPM optimization strategies, and digital advertising industry insights from the MrPop.io team.',
    path: '/blog',
    keywords: ['publisher monetization tips', 'CPM optimization', 'popunder ad guide', 'ad network blog'],
});

export default function Layout({ children }) {
    return children;
}
