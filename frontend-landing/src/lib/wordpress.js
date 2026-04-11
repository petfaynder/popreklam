/**
 * WordPress REST API Client
 *
 * Local:      http://localhost:8080/wp-json/wp/v2
 * Production: https://blog.popreklam.com/wp-json/wp/v2
 *
 * Set NEXT_PUBLIC_WP_API_URL in .env.local to override
 */

const WP_API = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost:8080/wp-json/wp/v2';

function stripHtml(html) {
    return html?.replace(/<[^>]*>/g, '').trim() || '';
}

export function estimateReadTime(html) {
    const words = stripHtml(html).split(/\s+/).length;
    return `${Math.ceil(words / 220)} min read`;
}

export async function getPosts({ page = 1, perPage = 12, category = '', search = '' } = {}) {
    const params = new URLSearchParams({ _embed: 'true', status: 'publish', per_page: perPage, page, orderby: 'date', order: 'desc' });
    if (category) params.set('categories', category);
    if (search) params.set('search', search);
    try {
        const res = await fetch(`${WP_API}/posts?${params}`, { next: { revalidate: 3600 } });
        if (!res.ok) return { posts: [], total: 0, totalPages: 0 };
        const data = await res.json();
        return {
            posts: data.map(normalizePost),
            total: parseInt(res.headers.get('X-WP-Total') || '0'),
            totalPages: parseInt(res.headers.get('X-WP-TotalPages') || '0'),
        };
    } catch {
        return { posts: [], total: 0, totalPages: 0 };
    }
}

export async function getPostBySlug(slug) {
    try {
        const res = await fetch(`${WP_API}/posts?slug=${slug}&_embed=true`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const posts = await res.json();
        return posts.length ? normalizePost(posts[0]) : null;
    } catch { return null; }
}

export async function getCategories() {
    try {
        const res = await fetch(`${WP_API}/categories?per_page=50&hide_empty=true`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        return (await res.json()).map(c => ({ id: c.id, name: c.name, slug: c.slug, count: c.count }));
    } catch { return []; }
}

export async function getRelatedPosts(categoryId, excludeId, count = 3) {
    try {
        const res = await fetch(`${WP_API}/posts?categories=${categoryId}&exclude=${excludeId}&per_page=${count}&_embed=true`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        return (await res.json()).map(normalizePost);
    } catch { return []; }
}

function normalizePost(post) {
    const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
    const author = post._embedded?.author?.[0];
    const categories = post._embedded?.['wp:term']?.[0] || [];
    return {
        id: post.id,
        slug: post.slug,
        title: post.title?.rendered || '',
        excerpt: stripHtml(post.excerpt?.rendered || '').slice(0, 200),
        content: post.content?.rendered || '',
        coverImage: featuredMedia?.source_url || null,
        coverImageAlt: featuredMedia?.alt_text || '',
        author: author?.name || 'PopReklam Team',
        authorAvatar: author?.avatar_urls?.['96'] || null,
        date: post.date,
        dateFormatted: new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        readTime: estimateReadTime(post.content?.rendered || ''),
        categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
        primaryCategory: categories[0]?.name || 'General',
        primaryCategorySlug: categories[0]?.slug || 'general',
        primaryCategoryId: categories[0]?.id || null,
        tags: (post._embedded?.['wp:term']?.[1] || []).map(t => t.name),
        modified: post.modified,
        link: post.link,
    };
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
// 14 PropellerAds-style articles across 5 categories
// Remove once WordPress is live at NEXT_PUBLIC_WP_API_URL

export const MOCK_POSTS = [

    // ── PUBLISHER TIPS ────────────────────────────────────────────────────────
    {
        id: 1,
        slug: 'maximize-cpm-rates-2026',
        title: 'How to Maximize Your CPM Rates in 2026',
        excerpt: 'Learn proven strategies for optimizing ad placements, choosing the right formats, and improving traffic quality to earn the highest CPM rates on the market.',
        coverImage: '/blog-images/cpm-rates.png',
        content: `
<p>As digital advertising evolves, publishers are constantly seeking ways to increase their CPM rates. In 2026, the landscape has shifted significantly with AI-driven bidding, privacy-first targeting, and new ad formats leading the charge.</p>

<h2>1. Optimize Your Ad Placements</h2>
<p>Ad placement remains the single most impactful factor in CPM rates. Above-the-fold placements consistently earn 2-3x more than below-the-fold positions. Use heatmaps to understand where your users actually look and place your highest-performing ad zones there.</p>
<ul>
<li><strong>Above-the-fold</strong> — always reserve for highest-paying formats</li>
<li><strong>In-content placements</strong> — between paragraphs perform 40% better than sidebars</li>
<li><strong>Exit-intent zones</strong> — popunders triggered on exit capture otherwise lost revenue</li>
</ul>

<h2>2. Diversify Your Ad Formats</h2>
<p>Don't rely on a single ad format. Combine popunders with native ads and push notifications to maximize revenue per pageview. Our data shows publishers using 3+ formats earn 45% more on average than those using only one.</p>

<h2>3. Focus on Tier 1 Traffic</h2>
<p>Traffic from the US, UK, Germany, Canada, and Australia consistently commands the highest CPMs. Focus your content strategy on attracting organic traffic from these regions through SEO and quality content creation.</p>

<h2>4. Enable Anti-AdBlock</h2>
<p>With 42% of internet users running ad blockers, enabling anti-adblock technology can recover 30-40% of otherwise lost revenue. Our solution works transparently without frustrating your users.</p>

<h2>5. Monitor and Iterate Daily</h2>
<p>Use your Statistics dashboard to track performance daily. Identify underperforming ad zones and make data-driven decisions. Small optimizations compound over time into significant revenue increases.</p>
        `,
        author: 'PopReklam Team',
        authorAvatar: null,
        date: '2026-02-12T00:00:00',
        dateFormatted: 'Feb 12, 2026',
        readTime: '5 min read',
        categories: [{ id: 1, name: 'Publisher Tips', slug: 'publisher-tips' }],
        primaryCategory: 'Publisher Tips',
        primaryCategorySlug: 'publisher-tips',
        primaryCategoryId: 1,
        tags: ['CPM', 'Monetization', 'Publishers'],
    },
    {
        id: 2,
        slug: 'push-notifications-complete-guide',
        title: 'Push Notification Ads: The Complete Publisher Guide',
        excerpt: 'Push notification ads are one of the highest-CPM formats available. This guide covers everything from setup to subscriber list growth and monetization best practices.',
        coverImage: '/blog-images/push-notifications.png',
        content: `
<p>Push notification ads have rapidly become one of the most lucrative formats for publishers. With CTR rates 2-10x higher than traditional display ads and no viewability concerns, they represent a significant revenue opportunity that many publishers are still leaving on the table.</p>

<h2>What Are Push Notification Ads?</h2>
<p>Push notification ads are clickable messages sent directly to a user's browser or device, even when they're not on your website. Users must opt-in to receive them, making your subscriber list a highly engaged, valuable audience.</p>

<h2>How to Grow Your Subscriber List</h2>
<p>The key to push notification revenue is list size. Here's how to grow it effectively:</p>
<ul>
<li><strong>Opt-in timing</strong> — trigger the permission request after 30-60 seconds on the page, when users have shown interest</li>
<li><strong>Custom permission prompts</strong> — a pre-permission dialog explaining the value increases opt-in rates by 3-5x</li>
<li><strong>Mobile optimization</strong> — mobile users opt in at higher rates; prioritize mobile UX</li>
</ul>

<h2>CPM Benchmarks by Geo</h2>
<p>Push notification CPMs vary significantly by geography. Tier 1 countries (US, UK, CA, AU, DE) deliver $3-8 CPM on average, while Tier 2 markets provide $0.5-2 CPM. Smart geo-targeting can significantly impact your revenue.</p>

<h2>Best Practices for Higher Revenue</h2>
<p>Segment your subscriber list by time zone to send notifications during peak engagement hours. Lists segmented by activity recency (last 30 days vs. older) monetize at significantly different CPM rates.</p>
        `,
        author: 'Sarah Kim',
        authorAvatar: null,
        date: '2026-02-05T00:00:00',
        dateFormatted: 'Feb 5, 2026',
        readTime: '7 min read',
        categories: [{ id: 1, name: 'Publisher Tips', slug: 'publisher-tips' }],
        primaryCategory: 'Publisher Tips',
        primaryCategorySlug: 'publisher-tips',
        primaryCategoryId: 1,
        tags: ['Push Notifications', 'Monetization', 'Subscribers'],
    },
    {
        id: 3,
        slug: 'diversification-without-chaos',
        title: 'Diversification Without Chaos: Managing Multiple Ad Networks',
        excerpt: 'Running multiple ad networks simultaneously can dramatically increase revenue — but only if done right. Here is our step-by-step framework for smart ad stack diversification.',
        coverImage: '/blog-images/traffic-diversification.png',
        content: `
<p>Most successful publishers work with 2-4 ad networks simultaneously. This diversification strategy protects revenue during fill rate fluctuations and allows you to route traffic to the highest-paying network at any given time.</p>

<h2>Why Diversify Your Ad Stack?</h2>
<p>Single-network dependency is a revenue risk. Networks experience fill rate drops, algorithm changes, and policy updates that can slash your income overnight. A diversified stack acts as insurance while also maximizing revenue through competition.</p>

<h2>The Right Way to Layer Networks</h2>
<p>Think of your ad stack as a waterfall:</p>
<ol>
<li><strong>Primary network</strong> — your highest-CPM partner for Tier 1 traffic</li>
<li><strong>Secondary network</strong> — fills gaps and lower-value inventory</li>
<li><strong>House ads</strong> — never show empty ad zones; use them to cross-promote your own content</li>
</ol>

<h2>Measuring True Performance</h2>
<p>The key metric is revenue per thousand visitors (RPM), not CPM alone. A network with $5 CPM and 70% fill rate outperforms one with $8 CPM and 40% fill. Calculate your effective RPM across networks to make accurate comparisons.</p>
        `,
        author: 'PopReklam Team',
        authorAvatar: null,
        date: '2026-01-28T00:00:00',
        dateFormatted: 'Jan 28, 2026',
        readTime: '6 min read',
        categories: [{ id: 1, name: 'Publisher Tips', slug: 'publisher-tips' }],
        primaryCategory: 'Publisher Tips',
        primaryCategorySlug: 'publisher-tips',
        primaryCategoryId: 1,
        tags: ['Revenue', 'Ad Networks', 'Strategy'],
    },

    // ── ADVERTISER GUIDE ──────────────────────────────────────────────────────
    {
        id: 4,
        slug: 'understanding-smart-cpm',
        title: 'Understanding Smart CPM: The Future of Bid Optimization',
        excerpt: 'Deep dive into how Smart CPM works, why it outperforms manual bidding, and how advertisers can leverage AI to reduce costs while increasing conversions.',
        coverImage: '/blog-images/smart-cpm.png',
        content: `
<p>Smart CPM is PopReklam's AI-powered bidding strategy that automatically adjusts your bids in real-time to win impressions at the optimal price point. Advertisers using Smart CPM see an average 23% reduction in cost per conversion.</p>

<h2>How Smart CPM Works</h2>
<p>When your campaign is live, our algorithm analyzes hundreds of signals for each impression opportunity: user device, browser, OS, geographic location, time of day, day of week, and historical conversion data from similar campaigns. In milliseconds, it calculates the optimal bid to win that impression profitably.</p>

<h2>Smart CPM vs. Manual Bidding: A Real Comparison</h2>
<p>In our internal study of 200+ campaigns:</p>
<ul>
<li><strong>Spend efficiency</strong>: Smart CPM campaigns wasted 31% less budget on non-converting traffic</li>
<li><strong>Conversion volume</strong>: 18% more conversions at the same budget</li>
<li><strong>Time savings</strong>: 5+ hours per week saved on manual bid adjustments</li>
</ul>

<h2>When to Use Smart CPM</h2>
<p>Smart CPM performs best when your campaign has at least 30 days of conversion data and a stable daily budget of $50+. For new campaigns, start with manual CPM for the first 2 weeks to gather baseline data, then switch to Smart CPM for optimization.</p>

<h2>Getting Started</h2>
<p>Navigate to your campaign settings, select Smart CPM as your bidding strategy, and set your target CPA. The algorithm needs 3-5 days to fully optimize — resist the urge to make changes during this learning period.</p>
        `,
        author: 'Mark Chen',
        authorAvatar: null,
        date: '2026-02-08T00:00:00',
        dateFormatted: 'Feb 8, 2026',
        readTime: '7 min read',
        categories: [{ id: 2, name: 'Advertiser Guide', slug: 'advertiser-guide' }],
        primaryCategory: 'Advertiser Guide',
        primaryCategorySlug: 'advertiser-guide',
        primaryCategoryId: 2,
        tags: ['Smart CPM', 'Bidding', 'ROI'],
    },
    {
        id: 5,
        slug: 'complete-guide-cpa-goal-campaigns',
        title: 'Complete Guide to CPA Goal Campaigns',
        excerpt: 'Step-by-step guide to setting up CPA Goal campaigns that automatically optimize for conversions. Scale your affiliate offers while keeping costs under control.',
        coverImage: '/blog-images/cpa-goal.png',
        content: `
<p>CPA Goal campaigns represent the most sophisticated form of performance-based advertising available on PopReklam. You set the price you're willing to pay per conversion, and our AI does the rest.</p>

<h2>What Makes CPA Goal Different</h2>
<p>Unlike CPM or CPC campaigns where you pay per impression or click, CPA Goal campaigns only succeed when your defined conversion event occurs. This fundamentally changes the risk profile — the algorithm is incentivized to find traffic that actually converts.</p>

<h2>Setting Your Target CPA</h2>
<p>Your target CPA should be set at 70-80% of your actual offer payout to maintain profitability. For example, if your affiliate offer pays $5 per lead, set your target CPA at $3.50-4.00. This gives you a 20-30% margin to account for tracking discrepancies and testing costs.</p>

<h2>The Learning Phase</h2>
<p>Every CPA Goal campaign goes through a learning phase of approximately 50 conversions. During this time, the algorithm explores different traffic sources and user segments. Budget more generously during this phase — restrict it too tightly and the campaign will never exit the learning phase.</p>

<h2>Scaling What Works</h2>
<p>Once your campaign consistently hits your target CPA, increase your daily budget by 20-30% every 3-5 days. Larger jumps reset the learning phase. Use blacklists to exclude traffic sources with high click volume but zero conversions.</p>
        `,
        author: 'PopReklam Team',
        authorAvatar: null,
        date: '2026-01-20T00:00:00',
        dateFormatted: 'Jan 20, 2026',
        readTime: '8 min read',
        categories: [{ id: 2, name: 'Advertiser Guide', slug: 'advertiser-guide' }],
        primaryCategory: 'Advertiser Guide',
        primaryCategorySlug: 'advertiser-guide',
        primaryCategoryId: 2,
        tags: ['CPA', 'Campaigns', 'Optimization'],
    },
    {
        id: 6,
        slug: 'ad-creatives-that-convert',
        title: 'How to Create Ad Creatives That Actually Convert',
        excerpt: 'Your bid strategy can be perfect, but bad creatives will kill your campaign. This guide breaks down what separates high-converting ad creatives from wasted spend.',
        coverImage: '/blog-images/ad-creatives.png',
        content: `
<p>Media buyers often obsess over bidding algorithms and traffic sources while neglecting the single biggest conversion variable: the creative. In split tests, the same campaign with different creatives routinely shows 3-10x differences in conversion rates.</p>

<h2>The Anatomy of a High-Converting Push Ad</h2>
<p>A push notification ad has four elements — all must work together:</p>
<ul>
<li><strong>Icon (32x32px)</strong> — high-contrast, recognizable, relevant. Avoid generic stock icons.</li>
<li><strong>Title (up to 50 chars)</strong> — the hook. Ask a question, state a benefit, create urgency.</li>
<li><strong>Description (up to 125 chars)</strong> — expand on the title, add social proof or scarcity.</li>
<li><strong>Main image (492x328px)</strong> — for image push, this is 80% of your CTR. Use bright, emotional imagery.</li>
</ul>

<h2>The 3-Second Rule</h2>
<p>Your creative has roughly 3 seconds to communicate value before a user dismisses or ignores it. Lead with the benefit, not the product. "Save $400/year on insurance" beats "New insurance offer" every time.</p>

<h2>A/B Testing Framework</h2>
<p>Never run a campaign with one creative. Launch with 3-5 variations, let each get 500+ impressions, then cut underperformers. Keep the winner and create 3 new challengers. This continuous testing cycle typically improves CTR by 40-80% within 2-3 rounds.</p>
        `,
        author: 'Alex Torres',
        authorAvatar: null,
        date: '2026-01-12T00:00:00',
        dateFormatted: 'Jan 12, 2026',
        readTime: '6 min read',
        categories: [{ id: 2, name: 'Advertiser Guide', slug: 'advertiser-guide' }],
        primaryCategory: 'Advertiser Guide',
        primaryCategorySlug: 'advertiser-guide',
        primaryCategoryId: 2,
        tags: ['Creatives', 'CTR', 'A/B Testing'],
    },

    // ── TECHNOLOGY ────────────────────────────────────────────────────────────
    {
        id: 7,
        slug: 'anti-adblock-recovering-lost-revenue',
        title: 'Anti-Adblock Technology: Recovering Lost Revenue',
        excerpt: 'With 42% of users running adblockers, publishers lose billions annually. Here is how PopReklam\'s anti-adblock solution works and what you can realistically recover.',
        coverImage: '/blog-images/antiadblock.png',
        content: `
<p>Ad blockers have become one of the biggest challenges facing digital publishers. With global adoption rates exceeding 42% — and over 60% in tech-focused, gaming, and young-adult demographics — the revenue impact is substantial and growing.</p>

<h2>The True Cost of Ad Blocking</h2>
<p>For a publisher earning $10,000/month, ad blockers could mean $4,200 in lost revenue. Over a year, that's $50,400. Over five years, that's a quarter million dollars in preventable losses.</p>

<h2>How PopReklam's Anti-Adblock Works</h2>
<p>Our solution uses three complementary techniques:</p>
<ol>
<li><strong>First-party delivery</strong> — ads served from your own domain avoid most blocklist patterns</li>
<li><strong>Obfuscated ad calls</strong> — request patterns that don't match known ad network signatures</li>
<li><strong>Compliant ad formats</strong> — non-intrusive creatives that pass the Coalition for Better Ads standards</li>
</ol>

<h2>What Publishers Actually Recover</h2>
<p>In our publisher network, sites enabling anti-adblock recover between 15-35% of their blocked revenue on average. Recovery rates are higher for tech (28%), gaming (32%), and news (24%) sites where blockers are most common.</p>

<h2>Implementation: 5-Minute Setup</h2>
<p>Anti-adblock is a single toggle in your Site Settings dashboard. No code changes required. Our system automatically begins serving compliant ads to previously-blocked users within 24 hours of activation.</p>
        `,
        author: 'PopReklam Team',
        authorAvatar: null,
        date: '2026-02-03T00:00:00',
        dateFormatted: 'Feb 3, 2026',
        readTime: '4 min read',
        categories: [{ id: 3, name: 'Technology', slug: 'technology' }],
        primaryCategory: 'Technology',
        primaryCategorySlug: 'technology',
        primaryCategoryId: 3,
        tags: ['Anti-Adblock', 'Revenue', 'Technology'],
    },
    {
        id: 8,
        slug: 'interactive-ads-new-format',
        title: '[NEW Format] Interactive Ads: Get Clicks From Your Most Engaged Users',
        excerpt: 'Interactive ads are the next evolution of digital advertising. With engagement rates 3-7x higher than static creatives, they represent a major opportunity for forward-thinking advertisers.',
        coverImage: '/blog-images/interactive-ads.png',
        content: `
<p>PopReklam is proud to announce the launch of Interactive Ads — a revolutionary ad format that turns passive viewers into active participants. Early beta testers are reporting CTRs of 8-15%, compared to the 0.5-2% typical of static display ads.</p>

<h2>What Are Interactive Ads?</h2>
<p>Interactive ads invite users to engage with the creative before clicking through to the landing page. Types include:</p>
<ul>
<li><strong>Mini-games</strong> — scratch cards, spin wheels, simple puzzles</li>
<li><strong>Quizzes</strong> — "Which plan is right for you?" style engagement</li>
<li><strong>Calculators</strong> — "How much could you save?" immediate personalization</li>
<li><strong>Swipe galleries</strong> — product showcases with swipeable image carousels</li>
</ul>

<h2>Why Interactive Ads Convert Better</h2>
<p>When a user actively engages with an ad creative — even for 5-10 seconds — they've invested attention and effort. This increases the cognitive commitment to the brand and makes conversion significantly more likely. The psychology is well-established: effort justifies interest.</p>

<h2>Getting Access</h2>
<p>Interactive Ads are currently available to all advertisers with an account balance of $200+. Contact your account manager to enable the format on your existing campaigns.</p>
        `,
        author: 'PopReklam Team',
        authorAvatar: null,
        date: '2026-02-15T00:00:00',
        dateFormatted: 'Feb 15, 2026',
        readTime: '5 min read',
        categories: [{ id: 3, name: 'Technology', slug: 'technology' }],
        primaryCategory: 'Technology',
        primaryCategorySlug: 'technology',
        primaryCategoryId: 3,
        tags: ['Interactive Ads', 'New Format', 'CTR'],
    },

    // ── INDUSTRY INSIGHTS ─────────────────────────────────────────────────────
    {
        id: 9,
        slug: 'top-10-verticals-pop-traffic',
        title: 'Top 10 Verticals for Pop Traffic in 2026',
        excerpt: 'Analysis of the highest-converting verticals for popunder and in-page push traffic, including sweepstakes, utilities, finance, and gaming with real ROI benchmarks.',
        coverImage: '/blog-images/pop-traffic.png',
        content: `
<p>Not all traffic is created equal. When it comes to pop and push ads, certain verticals consistently outperform others. Here is our definitive 2026 ranking based on aggregated performance data from 10,000+ active campaigns.</p>

<h2>The 2026 Vertical Rankings</h2>
<ol>
<li><strong>Sweepstakes & Giveaways</strong> — Avg. ROI: 180-350% | Conversion rate: 2-8%</li>
<li><strong>Utilities & Software (VPN, Antivirus)</strong> — Avg. ROI: 140-280% | Conversion rate: 1-4%</li>
<li><strong>Finance & Insurance</strong> — Avg. ROI: 120-400% | High payout offsets low conversion</li>
<li><strong>iGaming</strong> — Avg. ROI: 200-500% | High variance, geo-restricted</li>
<li><strong>E-Commerce (Impulse Buys)</strong> — Avg. ROI: 80-200% | High volume, low margins</li>
<li><strong>Dating & Lifestyle</strong> — Avg. ROI: 150-300% | Strong mobile performance</li>
<li><strong>Health & Wellness (Nutraceuticals)</strong> — Avg. ROI: 200-600% | Compliance critical</li>
<li><strong>Gaming (Mobile & Desktop)</strong> — Avg. ROI: 100-250% | Free-to-play installs</li>
<li><strong>Crypto & Finance Education</strong> — Avg. ROI: 150-400% | Volatile, geo-dependent</li>
<li><strong>Travel & Hospitality</strong> — Avg. ROI: 80-180% | Seasonal spikes</li>
</ol>

<h2>What Changed in 2026</h2>
<p>iGaming overtook utilities as the #4 vertical due to major market openings in Brazil and several Southeast Asian countries. Crypto offers rebounded strongly after regulatory clarity in the EU. Travel recovered to pre-2020 levels with strong performance in LATAM.</p>
        `,
        author: 'Research Team',
        authorAvatar: null,
        date: '2026-01-28T00:00:00',
        dateFormatted: 'Jan 28, 2026',
        readTime: '6 min read',
        categories: [{ id: 4, name: 'Industry Insights', slug: 'industry-insights' }],
        primaryCategory: 'Industry Insights',
        primaryCategorySlug: 'industry-insights',
        primaryCategoryId: 4,
        tags: ['Verticals', 'Traffic', 'ROI'],
    },
    {
        id: 10,
        slug: 'igaming-influencer-led-content-pre-funnel',
        title: 'How Influencer-Led Content Becomes the Pre-Funnel in iGaming',
        excerpt: 'The most successful iGaming advertisers are using influencer content as traffic warming before popunder campaigns. This pre-funnel approach is changing conversion economics.',
        coverImage: '/blog-images/igaming-trends.png',
        content: `
<p>The traditional iGaming acquisition funnel — run traffic directly to a casino landing page — is becoming increasingly expensive and less effective. Forward-thinking operators are adopting a two-stage approach that uses influencer content to warm audiences before retargeting them with direct response ads.</p>

<h2>The Pre-Funnel Concept</h2>
<p>Instead of cold traffic hitting an unfamiliar casino brand, the pre-funnel approach works like this:</p>
<ol>
<li>User watches/reads influencer content about the casino (slots reviews, big win compilations, bonus explainers)</li>
<li>User is tagged for retargeting upon content engagement</li>
<li>Retargeting campaigns (push, in-page push) hit warmed audience</li>
<li>Warmed users convert at 2-4x the rate of cold traffic</li>
</ol>

<h2>The Numbers</h2>
<p>In case studies across our iGaming advertiser pool, the pre-funnel approach reduced cost per first deposit (CPFD) by 35-60% compared to cold traffic campaigns. The additional overhead of influencer content was offset within the first month in 8 out of 10 campaigns.</p>

<h2>Implementing This on PopReklam</h2>
<p>Use our audience segmentation tool to create custom segments based on traffic source and engagement level. Create separate campaigns for your warmed audience with higher daily caps, as their conversion probability justifies premium bid prices.</p>
        `,
        author: 'David Park',
        authorAvatar: null,
        date: '2026-02-18T00:00:00',
        dateFormatted: 'Feb 18, 2026',
        readTime: '7 min read',
        categories: [{ id: 4, name: 'Industry Insights', slug: 'industry-insights' }],
        primaryCategory: 'Industry Insights',
        primaryCategorySlug: 'industry-insights',
        primaryCategoryId: 4,
        tags: ['iGaming', 'Influencer', 'Pre-Funnel'],
    },
    {
        id: 11,
        slug: 'sweepstakes-media-buying-guide',
        title: 'The Definitive Sweepstakes Media Buying Guide for 2026',
        excerpt: 'Sweepstakes remain the #1 converting vertical for pop traffic. This guide covers everything: offer selection, geo targeting, creative strategy, and scaling to $1,000/day profit.',
        coverImage: '/blog-images/sweepstakes.png',
        content: `
<p>Sweepstakes have dominated pop traffic performance charts for over a decade — and for good reason. They convert broadly, work across virtually all GEOs, and offer both CPA and revenue share payout models that accommodate different budget levels.</p>

<h2>Choosing the Right Offer</h2>
<p>Not all sweepstakes are created equal. Key variables to evaluate:</p>
<ul>
<li><strong>Payout type</strong> — SOI (single opt-in) converts easier but pays less; DOI (double opt-in) is harder but pays 2-4x more</li>
<li><strong>Vertical theme</strong> — gift cards, electronics, and cash prizes outperform niche prizes</li>
<li><strong>Landing page quality</strong> — test the offer's LP on mobile before committing budget</li>
</ul>

<h2>GEO Strategy</h2>
<p>Tier 1 GEOs (US, UK, AU, CA) offer the highest payouts but also the highest competition. For beginners, Tier 2 markets like Poland, Czech Republic, Romania, and Mexico offer excellent payouts with less competition and lower bid minimums.</p>

<h2>Scaling from $100/day to $1,000/day</h2>
<p>Once you find a profitable GEO/offer combination, scale by: (1) increasing daily budget by 25% every 48 hours, (2) duplicating the campaign to test new GEOs, and (3) creating landing page variations to improve conversion rates. Never scale and change creatives simultaneously — isolate variables.</p>
        `,
        author: 'PopReklam Team',
        authorAvatar: null,
        date: '2026-01-15T00:00:00',
        dateFormatted: 'Jan 15, 2026',
        readTime: '9 min read',
        categories: [{ id: 4, name: 'Industry Insights', slug: 'industry-insights' }],
        primaryCategory: 'Industry Insights',
        primaryCategorySlug: 'industry-insights',
        primaryCategoryId: 4,
        tags: ['Sweepstakes', 'Media Buying', 'Scaling'],
    },

    // ── CASE STUDY ────────────────────────────────────────────────────────────
    {
        id: 12,
        slug: 'publisher-success-story-gaming-niche',
        title: 'Case Study: Gaming Site Goes from $2K to $15K/Month',
        excerpt: "How Alex M. transformed his gaming review site's revenue by implementing a multi-format ad stack, enabling anti-adblock, and following PopReklam's optimization playbook.",
        coverImage: '/blog-images/success-story.png',
        content: `
<p>When Alex M. joined PopReklam in early 2025, his gaming review site was generating approximately $2,000/month from a competing ad network. 800,000 monthly pageviews, but CPMs stuck at $0.80. Nine months later, the same site generates $15,200/month. Here's exactly how.</p>

<h2>The Starting Situation</h2>
<p>Alex's site profile: primarily US and UK traffic (73%), desktop-heavy (68%), with a 26-34 male demographic. The audience was ideal. The monetization strategy was not.</p>
<ul>
<li>Single ad format: banner only</li>
<li>No anti-adblock (31% of his audience was blocking ads)</li>
<li>Ad zones placed in sub-optimal positions (footer-heavy)</li>
</ul>

<h2>Month 1-2: Foundation</h2>
<p>The first step was adding popunder ads on a frequency cap of 1 per 24 hours. Revenue jumped to $4,800/month. Enabling anti-adblock added another $1,200/month in recovered revenue. New total: $6,000/month — a 200% improvement before any optimization.</p>

<h2>Month 3-6: Optimization</h2>
<p>Working with our account team, Alex repositioned in-content ad zones, added in-page push subscription, and launched a push notification list. By month 6: $11,400/month.</p>

<h2>Month 7-9: Scaling</h2>
<p>With Smart CPM enabled on his push notification list, revenue per subscriber increased by 34%. Adding a native ad widget in the related articles section completed the stack. Final result: $15,200/month, sustained for 3+ months.</p>
        `,
        author: 'PopReklam Team',
        authorAvatar: null,
        date: '2026-01-15T00:00:00',
        dateFormatted: 'Jan 15, 2026',
        readTime: '6 min read',
        categories: [{ id: 5, name: 'Case Study', slug: 'case-study' }],
        primaryCategory: 'Case Study',
        primaryCategorySlug: 'case-study',
        primaryCategoryId: 5,
        tags: ['Success Story', 'Gaming', 'Revenue Growth'],
    },
    {
        id: 13,
        slug: 'affiliate-vpn-offer-3x-roi',
        title: 'How Maria Scaled a VPN Offer to 3x ROI Using Pop Ads',
        excerpt: 'Affiliate marketer Maria S. shares her exact playbook for running VPN offers on popunder traffic: the GEOs, the bids, the creatives, and the optimization decisions that drove 300% ROI.',
        coverImage: '/blog-images/vpn-utilities.png',
        content: `
<p>VPN offers are one of the most reliable verticals on pop traffic — high payouts ($3-15 per install), worldwide availability, and an audience that's actively looking for security solutions. Maria S. turned this into a systematic, scalable business.</p>

<h2>Campaign Setup</h2>
<p>Maria's initial setup for testing:</p>
<ul>
<li><strong>Budget</strong>: $300 test budget per GEO</li>
<li><strong>GEOs tested</strong>: US, UK, DE, FR, IT</li>
<li><strong>Bid strategy</strong>: Manual CPM at $1.50-2.00 for Tier 1</li>
<li><strong>Offer payout</strong>: $7.50 per install (revshare structure with $35 CPA cap)</li>
</ul>

<h2>The Optimization Decisions</h2>
<p>After 72 hours of data: Germany emerged as the clear winner with 4.2% conversion rate vs. 1.8% average across other GEOs. Maria consolidated budget into DE and UK, scaled to $500/day, and switched to Smart CPM. ROI stabilized at 280-340% over the following month.</p>

<h2>What Made It Work</h2>
<p>The VP offer's landing page was localized (German copy, German payment options). This single factor — landing page language matching — accounted for roughly half of the conversion rate difference. Always test localized LPs before scaling international VPN campaigns.</p>
        `,
        author: 'PopReklam Team',
        authorAvatar: null,
        date: '2026-01-08T00:00:00',
        dateFormatted: 'Jan 8, 2026',
        readTime: '5 min read',
        categories: [{ id: 5, name: 'Case Study', slug: 'case-study' }],
        primaryCategory: 'Case Study',
        primaryCategorySlug: 'case-study',
        primaryCategoryId: 5,
        tags: ['VPN', 'Case Study', 'ROI'],
    },
    {
        id: 14,
        slug: 'affiliate-marketing-beginners-guide-2026',
        title: 'Affiliate Marketing Beginner\'s Guide: Your First $1,000 with Pop Ads',
        excerpt: 'Think you need a huge budget to start affiliate marketing? Think again. This step-by-step guide shows how to go from zero to your first $1,000 profit using popunder ads.',
        coverImage: '/blog-images/affiliate-guide.png',
        content: `
<p>Every successful media buyer started as a beginner with a modest budget and a lot to learn. This guide distills the most important lessons into a practical roadmap for your first profitable campaign.</p>

<h2>Your First $200: The Testing Budget</h2>
<p>Beginners should think of their first $200 as tuition, not profit. The goal is to learn what works in your target vertical and GEO, not to make money immediately. Choose a single offer, a single GEO, and run until you have 50,000 impressions of data.</p>

<h2>Picking Your First Vertical</h2>
<p>For beginners, sweepstakes and utilities (VPN, antivirus) are the most forgiving verticals:</p>
<ul>
<li>Broad audience appeal — no demographic targeting required</li>
<li>Clear conversion events — one form submit or one install</li>
<li>Stable payouts — not subject to seasonal swings</li>
<li>Widely available offers — dozens of options on major affiliate networks</li>
</ul>

<h2>The Beginner's GEO Strategy</h2>
<p>Start with Tier 2 countries: Poland, Romania, Czech Republic, Mexico, Brazil. The traffic costs 3-5x less than Tier 1, giving you more data per dollar. Once you understand how campaigns work, layer in Tier 1 GEOs where the real profits live.</p>

<h2>Your First Profitable Day</h2>
<p>Most beginners see their first profitable day during week 3-4 of testing. Don't expect it earlier. The learning curve is real, but it's finite. Every data point makes your next campaign 10% smarter than your last.</p>
        `,
        author: 'PopReklam Team',
        authorAvatar: null,
        date: '2026-01-03T00:00:00',
        dateFormatted: 'Jan 3, 2026',
        readTime: '8 min read',
        categories: [{ id: 4, name: 'Industry Insights', slug: 'industry-insights' }],
        primaryCategory: 'Industry Insights',
        primaryCategorySlug: 'industry-insights',
        primaryCategoryId: 4,
        tags: ['Affiliate Marketing', 'Beginners', 'Pop Ads'],
    },
];

export const MOCK_CATEGORIES = [
    { id: 1, name: 'Publisher Tips',    slug: 'publisher-tips',    count: 3 },
    { id: 2, name: 'Advertiser Guide',  slug: 'advertiser-guide',  count: 3 },
    { id: 3, name: 'Technology',        slug: 'technology',        count: 2 },
    { id: 4, name: 'Industry Insights', slug: 'industry-insights', count: 4 },
    { id: 5, name: 'Case Study',        slug: 'case-study',        count: 2 },
];
