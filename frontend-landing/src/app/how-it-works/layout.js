import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'How It Works — Ad Network Process Explained',
    description: 'Learn how MrPop.io connects publishers and advertisers. Understand ad serving, revenue sharing, real-time bidding, and payment flows — step by step.',
    path: '/how-it-works',
    keywords: ['how ad network works', 'popunder ad serving', 'publisher revenue share', 'RTB explained'],
});

export default function Layout({ children }) {
    return children;
}
