const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');

const locales = ['tr', 'ru', 'pt', 'es', 'fr', 'id', 'ar', 'de'];

const brutalistData = {
    trustedBy: "Trusted by 10,000+ Publishers",
    heroTitleHtml: "TRAFFIC <br /> <span class=\"text-primary italic\">MEETS</span> <br /> MONEY",
    heroDesc: "The highest-paying ad network built for serious publishers. AI-driven targeting, 100% fill rate, weekly payouts.",
    startEarning: "Start Earning →",
    launchAds: "Launch Ads",
    marquee: {
        highCpm: "★ HIGH CPM RATES",
        weekly: "★ WEEKLY PAYOUTS",
        fill: "★ 100% FILL RATE",
        antiAdblock: "★ ANTI-ADBLOCK",
        realtime: "★ REAL-TIME STATS",
        geos: "★ 248 GEOs"
    },
    stats: {
        fillRate: { label: "Fill Rate", desc: "Every impression monetized, every country covered." },
        avgCpm: { label: "Avg CPM", desc: "Tier-1 traffic earns what it deserves." },
        payouts: { label: "Payouts", desc: "BTC, USDT, PayPal, Wire. Always on time." },
        geos: { label: "GEOs", desc: "Global coverage from direct advertisers." }
    },
    forPublishers: {
        titleHtml: "FOR<br />PUBLISHERS",
        desc: "Maximize revenue from every impression. Our AI-optimized ad feed delivers the highest eCPM rates with clean, safe ads.",
        b1: "Up to 70% revenue share",
        b2: "6 high-impact ad formats",
        b3: "$5 minimum payout",
        b4: "Dedicated account manager",
        b5: "Anti-adblock solution",
        cta: "Join as Publisher"
    },
    forAdvertisers: {
        titleHtml: "FOR<br />ADVERTISERS",
        desc: "Reach high-intent audiences across 248 GEOs. 20+ targeting settings, smart bidding, and real-time analytics.",
        b1: "Direct publisher traffic",
        b2: "Advanced GEO/Device/OS targeting",
        b3: "Smart CPM & CPA Goal",
        b4: "$100 minimum deposit",
        b5: "3-level fraud protection",
        cta: "Launch Campaign"
    },
    adFormats: {
        titleHtml: "Ad Formats <br /><span class=\"text-outline text-foreground\">That Convert</span>",
        desc: "Non-intrusive, high-performing ad units serving 2B+ monthly impressions across all devices.",
        popunder: { title: "Popunder", desc: "Full-page ads behind the main window. Highest CPM rates, zero banner blindness." },
        push: { title: "In-Page Push", desc: "Browser-friendly notifications. No opt-in required. 30X higher CTR than web push." },
        interstitial: { title: "Interstitial", desc: "Full-screen coverage between pages. Maximum visual impact and engagement." },
        smartLink: { title: "Smart Link", desc: "AI auto-routes to highest-paying offer. Best for social and referral traffic." },
        native: { title: "Native Ads", desc: "Blend seamlessly with site content. Publishers control colors, sizes, and placement." },
        banner: { title: "Banner Ads", desc: "Classic IAB standards. Stable profits for desktop and mobile. Complement any layout." }
    },
    whyUs: {
        title: "Why 10,000+ Partners Trust Us",
        safety: { title: "Ad Safety & Quality", desc: "3-level security system prevents malware, fraud, and bot traffic. Only clean, verified ads reach your users." },
        care: { title: "Partner Care", desc: "Beyond support. Dedicated managers help optimize campaigns, improve monetization strategy, and grow your revenue." },
        tools: { title: "Performance Tools", desc: "Smart CPM, CPA Goal, Traffic Estimator. Automate bidding and let AI find the best-converting placements." },
        global: { title: "Global Coverage", desc: "Direct publishers from 248 GEOs. Premium traffic from Tier-1 to Tier-3 with competitive rates for every region." },
        ecpm: { title: "Competitive eCPM", desc: "Our eCPM model rewards quality. More clicks and conversions = higher earnings. No ceiling on your income." },
        payouts: { title: "Fast Payouts", desc: "$5 minimum payout. Automated weekly payments via PayPal, USDT, Bitcoin, Wire Transfer, and more." }
    },
    steps: {
        title: "Start in 4 Steps",
        s1: { title: "Sign Up", desc: "Create your account in under 2 minutes. No approval delays." },
        s2: { title: "Add Your Site", desc: "Submit your website or traffic source for quick verification." },
        s3: { title: "Get Ad Code", "desc": "Copy our lightweight JavaScript tag. One line of code." },
        s4: { title: "Earn Money", desc: "Watch revenue grow in real-time. Get paid weekly." }
    },
    testimonials: {
        title: "What Partners Say",
        t1: { name: "Alex M.", role: "Publisher • Gaming Niche", quote: "Switched from AdSense to MrPop.io. My revenue literally tripled in the first month. The anti-adblock feature alone recovered 30% of lost income." },
        t2: { name: "Sarah K.", role: "Media Buyer • E-Commerce", quote: "The targeting granularity is insane. I can drill down to OS version and carrier. CPA Goal saved me thousands by auto-optimizing my campaigns." },
        t3: { name: "Dmitri V.", role: "Publisher • Tech Blog", quote: "Weekly payouts via USDT. No delays, no excuses. My account manager actually helped me optimize ad placements for 40% more revenue." }
    },
    faq: {
        title: "FAQ",
        q1: { q: "How much can I earn?", a: "Publisher earnings vary by traffic quality and GEO. Tier-1 traffic (US, UK, CA) can earn $5-8+ CPM. Our eCPM model rewards quality — more clicks and conversions mean higher earnings with no ceiling." },
        q2: { q: "What is the minimum payout?", a: "Just $5 via Paxum. Other methods like PayPal, Wire, and USDT have slightly higher minimums. Payments are processed weekly, always on time." },
        q3: { q: "What ad formats do you support?", a: "We support Popunder, In-Page Push, Interstitial, Smart Link, Native Ads, and Banner Ads. You can run multiple formats simultaneously for maximum revenue." },
        q4: { q: "How does fraud protection work?", a: "Our in-house 3-level security system detects and blocks bot traffic, malware, and fraudulent clicks in real-time. Only clean, verified impressions are counted." },
        q5: { q: "What targeting options are available?", a: "20+ targeting settings including Country, City, OS, Browser, Device Type, Carrier, Language, and more. Smart CPM automates bidding for best-converting placements." }
    },
    cta: {
        bgText: "JOIN US NOW",
        title1: "Ready to",
        title2: "Dominate?",
        subtitle: "Join 10,000+ publishers and advertisers already scaling with us.",
        publisher: "Publisher Signup",
        advertiser: "Advertiser Signup"
    }
};

async function translateObj(obj, lang) {
    let translatedObj = {};
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
            translatedObj[key] = await translateObj(obj[key], lang);
        } else {
            try {
                // If the key has "Html" in it, we translate with format 'html' to preserve tags
                const format = key.includes('Html') ? 'html' : 'text';
                const res = await translate(obj[key], { to: lang, format: format });
                translatedObj[key] = res.text;
                // Add a small delay to avoid rate limits
                await new Promise(r => setTimeout(r, 3000));
            } catch (err) {
                console.error(`Error translating ${obj[key]} to ${lang}:`, err.message);
                translatedObj[key] = obj[key]; // fallback to english
            }
        }
    }
    return translatedObj;
}

async function main() {
    // Write English first
    const enPath = path.join(__dirname, 'messages', 'en.json');
    let enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    enJson.themes = enJson.themes || {};
    enJson.themes.brutalist = brutalistData;
    fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2));
    console.log('✅ English updated');

    for (let lang of locales) {
        console.log(`\n🌍 Translating to ${lang}...`);
        const targetPath = path.join(__dirname, 'messages', `${lang}.json`);
        let langJson = {};
        if (fs.existsSync(targetPath)) {
            langJson = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        }

        langJson.themes = langJson.themes || {};
        const translatedData = await translateObj(brutalistData, lang);
        langJson.themes.brutalist = translatedData;

        fs.writeFileSync(targetPath, JSON.stringify(langJson, null, 2));
        console.log(`✅ Saved ${lang}.json`);
    }
    
    console.log('\n🎉 All translations completed!');
}

main();
