import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Contact Us — Support & Sales',
    description: 'Get in touch with the MrPop.io team for publisher support, advertiser inquiries, or technical help. Average response time under 4 hours.',
    path: '/contact',
    keywords: ['ad network support', 'contact MrPop', 'publisher support', 'advertiser contact'],
});

export default function Layout({ children }) {
    return children;
}
