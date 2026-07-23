// FAQ sorularının schema için kopyası (page.js'deki faqs array'i ile senkron tutulmalı)
const FAQ_SCHEMA_DATA = [
    { question: 'How much can I earn as a publisher?', answer: 'Publisher earnings vary based on traffic quality, geography, and ad formats. Our publishers earn between $0.50 to $8.00 CPM depending on these factors. Top publishers with Tier 1 traffic (US, UK, CA) earn $3-8 CPM. With 100,000 daily visitors, you could earn $3,000-$24,000 monthly. We offer up to 70% revenue share, one of the highest in the industry.' },
    { question: 'What are the minimum requirements to join as a publisher?', answer: 'To join as a publisher, you need: minimum 1,000 daily visitors, original and legal content with no copyright violations, no adult or illegal content, quality traffic with no bots or incentivized traffic, and English or major language content. We review all applications within 24 hours.' },
    { question: 'What is the minimum deposit for advertisers?', answer: 'The minimum deposit is $100 USD. You can add funds via PayPal, credit card (Visa, MasterCard, Amex), Bitcoin, or USDT. There are no hidden fees, and unused funds are fully refundable anytime.' },
    { question: 'What targeting options are available for advertisers?', answer: 'We offer comprehensive targeting: Geographic (Country, City, State/Region), Device (Desktop, Mobile, Tablet), Technology (Browser, OS, Language), Connection Type (Wi-Fi, Mobile), and Time-based targeting.' },
    { question: 'When do publishers receive payouts?', answer: 'Publishers are paid weekly on Mondays for earnings from the previous week. Minimum payout threshold is $50. Payments are processed via PayPal, Wire Transfer, Bitcoin, or USDT.' },
    { question: 'Will ads slow down my website?', answer: 'No. Our ad code is asynchronously loaded (under 10KB) and does not block your page rendering. Google PageSpeed score typically remains unchanged.' },
    { question: 'How do you prevent click fraud?', answer: 'We use multi-layer fraud detection: real-time bot detection, IP filtering, click pattern analysis, manual review, and third-party fraud database integration.' },
    { question: 'Can I use MrPop.io with Google AdSense?', answer: 'Yes! MrPop.io is 100% compatible with Google AdSense and other ad networks. Our pop ad formats do not compete with display ads, so you can maximize revenue by using both simultaneously.' },
    { question: 'How quickly do campaigns go live?', answer: 'Most campaigns are approved and go live within 1-2 hours during business hours. We manually review all campaigns to ensure quality and compliance.' },
    { question: 'Do you have an API for integration?', answer: 'Yes, we offer a RESTful API for both publishers and advertisers. You can retrieve statistics, manage sites, create campaigns, and manage funds programmatically. Contact support for API access.' },
];

export const metadata = {
    title: 'FAQ — Frequently Asked Questions',
    description: "Answers to common questions about MrPop.io's ad network — publisher earnings, payout schedules, advertiser campaign setup, targeting options, and account management.",
    openGraph: {
        title: 'FAQ — Frequently Asked Questions | MrPop.io',
        description: "Answers to common questions about MrPop.io's ad network, publisher payments, campaign setup, and account management.",
        siteName: 'MrPop.io',
        type: 'website',
        url: 'https://mrpop.io/faq',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FAQ — Frequently Asked Questions | MrPop.io',
        description: "Answers to common questions about MrPop.io's ad network, publisher payments, campaign setup, and account management.",
    },
    alternates: {
        canonical: 'https://mrpop.io/faq',
    },
};

// FAQPage JSON-LD schema — enables Google "People Also Ask" rich results
function FAQSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_SCHEMA_DATA.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export default function Layout({ children }) {
    return (
        <>
            <FAQSchema />
            {children}
        </>
    );
}
