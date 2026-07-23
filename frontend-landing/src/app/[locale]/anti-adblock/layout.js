import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
    title: 'Anti-Adblock',
    description: 'Recover up to 40% of lost ad revenue with MrPop.io Anti-Adblock technology. Compliant, non-intrusive ad recovery for publishers.',
    path: '/anti-adblock',
    keywords: ['anti adblock', 'adblock revenue recovery', 'ad blocker bypass'],
});

export default function Layout({ children }) {
    return children;
}
