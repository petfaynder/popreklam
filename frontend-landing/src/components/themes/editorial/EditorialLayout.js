'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    TrendingUp, TrendingDown, Menu, ArrowRight, CheckCircle,
    ChevronDown, Star, BarChart3, Shield, Globe, DollarSign,
    Clock, Users, Zap, MousePointer2
} from 'lucide-react';
import AuthNavButtons from '@/components/AuthNavButtons';

function EditorialFAQ({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-300">
            <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-5 text-left font-bold text-base hover:text-red-700 transition-colors">
                {question}
                <ChevronDown className={`w-5 h-5 transition-transform text-gray-400 ${open ? 'rotate-180 text-red-600' : ''}`} />
            </button>
            {open && <div className="pb-5 text-gray-600 leading-relaxed text-sm">{answer}</div>}
        </div>
    );
}

export default function EditorialLayout() {
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-[#FBF9F6] text-[#1A1A1A] selection:bg-red-200" style={{ fontFamily: 'var(--font-serif)' }}>

            {/* ═══ TICKER ═══ */}
            <div className="bg-[#1A1A1A] text-white text-[10px] py-2 overflow-hidden whitespace-nowrap border-b border-gray-800" style={{ fontFamily: 'var(--font-sans)' }}>
                <div className="inline-block animate-marquee">
                    <span className="mx-6">Global CPM Index: <span className="text-green-400">▲ 2.4%</span></span>
                    <span className="mx-6">US Weighted Avg: <span className="text-green-400">$8.42</span></span>
                    <span className="mx-6">EU Aggregate: <span className="text-green-400">$4.15</span></span>
                    <span className="mx-6">APAC Region: <span className="text-red-400">▼ 0.8%</span></span>
                    <span className="mx-6">Crypto Vertical: <span className="text-green-400">▲ 15%</span></span>
                    <span className="mx-6">Mobile Traffic Share: <span className="text-green-400">72.3%</span></span>
                    <span className="mx-6">Ad Fraud Rate: <span className="text-green-400">▼ 1.2% (industry low)</span></span>
                    <span className="mx-6">Global CPM Index: <span className="text-green-400">▲ 2.4%</span></span>
                    <span className="mx-6">US Weighted Avg: <span className="text-green-400">$8.42</span></span>
                </div>
            </div>

            {/* ═══ MASTHEAD ═══ */}
            <header className="border-b-2 border-[#1A1A1A] py-6 px-6 bg-[#FBF9F6] sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button className="md:hidden"><Menu className="w-6 h-6" /></button>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] hidden md:block border border-[#1A1A1A] px-2 py-1" style={{ fontFamily: 'var(--font-sans)' }}>Est. 2026</div>
                        </div>
                        <div className="text-center">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">The PR Journal</h1>
                            <p className="text-[10px] uppercase tracking-[0.3em] mt-1.5 text-gray-500" style={{ fontFamily: 'var(--font-sans)' }}>Market Intelligence for Digital Publishers & Advertisers</p>
                        </div>
                        <div className="flex items-center gap-4" style={{ fontFamily: 'var(--font-sans)' }}>
                            <AuthNavButtons
                                hrefCTA="/register"
                                labelCTA="Subscribe"
                                btnClass="bg-[#1A1A1A] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center gap-1.5"
                                loginClass="text-xs font-bold uppercase tracking-widest hover:underline hidden md:block"
                            />
                        </div>
                    </div>
                    {/* Nav Bar */}
                    <nav className="hidden md:flex justify-center gap-8 mt-4 pt-4 border-t border-gray-300 text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-sans)' }}>
                        <Link href="/for-publishers" className="hover:text-red-700 transition-colors">Publishers</Link>
                        <Link href="/for-advertisers" className="hover:text-red-700 transition-colors">Advertisers</Link>
                        <Link href="/how-it-works" className="hover:text-red-700 transition-colors">How It Works</Link>
                        <Link href="/faq" className="hover:text-red-700 transition-colors">FAQ</Link>
                        <Link href="/contact" className="hover:text-red-700 transition-colors">Contact</Link>
                    </nav>
                </div>
            </header>

            {/* ═══ DATE BAR ═══ */}
            <div className="bg-white border-b border-gray-200 py-2 px-6" style={{ fontFamily: 'var(--font-sans)' }}>
                <div className="max-w-[1400px] mx-auto flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                    <span>{currentDate}</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Live Market Data</span>
                </div>
            </div>

            {/* ═══ MAIN CONTENT GRID ═══ */}
            <main className="max-w-[1400px] mx-auto grid md:grid-cols-12 border-l border-r border-[#1A1A1A] bg-white">

                {/* LEAD ARTICLE */}
                <section className="col-span-12 md:col-span-8 p-8 md:p-12 border-b md:border-b-0 md:border-r border-[#1A1A1A]">
                    <span className="text-xs font-bold text-red-700 uppercase tracking-widest mb-4 block" style={{ fontFamily: 'var(--font-sans)' }}>Lead Story</span>

                    <h2 className="text-4xl md:text-6xl font-bold leading-[1.1] mb-6">
                        AI-Driven Ad Yields Surge as Premium Networks
                        Reshape the Open Web Economy
                    </h2>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 border-y border-gray-200 py-4" style={{ fontFamily: 'var(--font-sans)' }}>
                        <span className="font-bold text-[#1A1A1A]">Editorial Desk</span>
                        <span>•</span>
                        <span>8 min read</span>
                        <span>•</span>
                        <span>Updated 2h ago</span>
                    </div>

                    <div className="text-lg leading-relaxed space-y-6 text-gray-800">
                        <p className="first-letter:text-7xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none">
                            The digital advertising landscape is undergoing its most significant transformation since the programmatic revolution.
                            Networks leveraging AI-optimized targeting are reporting <strong>CPM increases of 40-60%</strong> year-over-year,
                            driven by machine learning algorithms that match advertisers with high-intent audiences in real-time.
                        </p>
                        <p>
                            MrPop.io, a rapidly growing ad network serving <strong>2 billion monthly impressions</strong> across 248 GEOs,
                            represents this new wave. Unlike legacy networks relying on contextual matching, MrPop.io's proprietary AI
                            analyzes 20+ user signals to deliver premium CPM rates — with publishers reporting an average <strong>3X revenue increase</strong> within their first 90 days.
                        </p>
                        <p>
                            "The old model of blasting ads and hoping for clicks is dead," says industry analyst Maria Chen.
                            "Networks that invest in machine learning and fraud prevention are capturing a disproportionate share of advertiser budgets.
                            The winners are those offering both quality traffic and transparent pricing."
                        </p>
                    </div>

                    {/* Inline Data Card */}
                    <div className="mt-10 bg-[#F5F3EF] border border-gray-300 p-8">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-red-700" style={{ fontFamily: 'var(--font-sans)' }}>Key Market Data</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6" style={{ fontFamily: 'var(--font-sans)' }}>
                            {[
                                { val: "100%", label: "Fill Rate", trend: "up" },
                                { val: "$5+", label: "Avg CPM (T1)", trend: "up" },
                                { val: "248", label: "Active GEOs", trend: "neutral" },
                                { val: "15K+", label: "Advertisers", trend: "up" },
                            ].map((d, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl font-bold mb-1">{d.val}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider flex items-center justify-center gap-1">
                                        {d.label}
                                        {d.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SIDEBAR */}
                <aside className="col-span-12 md:col-span-4 bg-[#F9F7F5]">
                    {/* Market Movers */}
                    <div className="p-8 border-b border-[#1A1A1A]">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-6" style={{ fontFamily: 'var(--font-sans)' }}>Market Movers</h3>
                        <div className="space-y-5">
                            {[
                                { name: "Crypto & Fintech", cpm: "$12 CPM", trend: "up", change: "+18%" },
                                { name: "iGaming", cpm: "$9 CPM", trend: "up", change: "+12%" },
                                { name: "E-Commerce", cpm: "$6 CPM", trend: "up", change: "+5%" },
                                { name: "VPN & Utilities", cpm: "$7 CPM", trend: "down", change: "-3%" },
                                { name: "Dating", cpm: "$4 CPM", trend: "up", change: "+8%" },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center group cursor-pointer">
                                    <div>
                                        <div className="font-bold text-base group-hover:underline">{item.name}</div>
                                        <div className="text-[11px] text-gray-500" style={{ fontFamily: 'var(--font-sans)' }}>{item.cpm} · {item.change}</div>
                                    </div>
                                    {item.trend === 'up' ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Why MrPop.io */}
                    <div className="p-8 border-b border-[#1A1A1A]">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ fontFamily: 'var(--font-sans)' }}>Why Publishers Choose Us</h3>
                        <div className="space-y-3" style={{ fontFamily: 'var(--font-sans)' }}>
                            {[
                                "Up to 70% revenue share",
                                "6 high-impact ad formats",
                                "$5 minimum payout",
                                "Anti-adblock technology",
                                "AI-optimized ad feed",
                                "Dedicated account manager"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                        <Link href="/register?role=publisher" className="mt-6 block bg-[#1A1A1A] text-white text-center py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">
                            Start Earning Now →
                        </Link>
                    </div>

                    {/* Opinion Column */}
                    <div className="p-8">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-red-700" style={{ fontFamily: 'var(--font-sans)' }}>Opinion</h3>
                        <div className="space-y-6">
                            {[
                                { title: "Why eCPM Beats Flat-Rate CPM for Smart Publishers", author: "A. Morrison" },
                                { title: "The Anti-Adblock Question: Revenue Recovery Without User Hostility", author: "K. Nakamura" },
                                { title: "Smart CPM: How AI Bidding Is Redefining Advertiser ROI", author: "D. Petrov" },
                            ].map((article, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <h4 className="font-bold text-base leading-snug group-hover:text-red-700 transition-colors">{article.title}</h4>
                                    <span className="text-xs text-gray-500 mt-1 block" style={{ fontFamily: 'var(--font-sans)' }}>By {article.author}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>

            {/* ═══ AD FORMATS SECTION ═══ */}
            <section className="max-w-[1400px] mx-auto border-x border-b border-[#1A1A1A] bg-white p-8 md:p-12">
                <div className="text-center mb-12">
                    <span className="text-xs font-bold text-red-700 uppercase tracking-widest block mb-2" style={{ fontFamily: 'var(--font-sans)' }}>Coverage Report</span>
                    <h2 className="text-4xl font-bold">Available Ad Formats & CPM Rates</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-px bg-gray-300">
                    {[
                        { title: "Popunder", cpm: "$2–8 CPM", desc: "Full-page behind main window. Zero banner blindness. Industry's highest CPM format.", icon: MousePointer2 },
                        { title: "In-Page Push", cpm: "$1–5 CPM", desc: "No opt-in needed. 30X higher CTR than web push. All OS and browsers.", icon: Zap },
                        { title: "Interstitial", cpm: "$1–6 CPM", desc: "Full-screen takeover. Maximum visual impact for brand campaigns.", icon: BarChart3 },
                        { title: "Smart Link", cpm: "$0.5–3 CPM", desc: "AI routes to highest-paying offer automatically. Ideal for social traffic.", icon: Globe },
                        { title: "Native Ads", cpm: "$0.5–3 CPM", desc: "Blends with editorial content. Publisher controls colors and sizes.", icon: Users },
                        { title: "Banner Ads", cpm: "$0.3–2 CPM", desc: "Classic IAB standards. Stable, predictable revenue for any layout.", icon: Shield },
                    ].map((f, i) => (
                        <div key={i} className="bg-white p-8 group hover:bg-[#F5F3EF] transition-colors">
                            <f.icon className="w-8 h-8 mb-4 text-gray-400 group-hover:text-red-700 transition-colors" />
                            <h3 className="text-xl font-bold mb-1">{f.title}</h3>
                            <div className="text-red-700 font-bold text-sm mb-3" style={{ fontFamily: 'var(--font-sans)' }}>{f.cpm}</div>
                            <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ FOR ADVERTISERS SECTION ═══ */}
            <section className="max-w-[1400px] mx-auto border-x border-b border-[#1A1A1A] bg-[#F5F3EF] p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-12">
                    <div>
                        <span className="text-xs font-bold text-red-700 uppercase tracking-widest mb-4 block" style={{ fontFamily: 'var(--font-sans)' }}>For Advertisers</span>
                        <h2 className="text-4xl font-bold mb-6 leading-tight">Precision Targeting Across 248 Markets</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
                            Access 2B+ monthly impressions from 36K+ direct publishers. 20+ targeting parameters including
                            GEO, OS, Device, Browser, and Carrier. Smart CPM automates bidding for optimal ROI.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-8" style={{ fontFamily: 'var(--font-sans)' }}>
                            {[
                                "20+ targeting settings",
                                "Smart CPM bidding",
                                "CPA Goal optimization",
                                "Traffic Estimator",
                                "3-level fraud protection",
                                "Real-time analytics"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                        <Link href="/register?role=advertiser" className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors" style={{ fontFamily: 'var(--font-sans)' }}>
                            Launch Campaign <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)' }}>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-6">CPM Rates by Region</h3>
                        <div className="space-y-6">
                            {[
                                { geo: "Tier 1 — US, UK, CA, AU", range: "$3.00 – $8.00", pct: 90, desc: "Premium English-speaking markets" },
                                { geo: "Tier 2 — EU, JP, KR", range: "$1.50 – $4.00", pct: 60, desc: "Developed European & Asian markets" },
                                { geo: "Tier 3 — Worldwide", range: "$0.50 – $2.00", pct: 35, desc: "Maximum scale at competitive rates" },
                            ].map((t, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-sm">{t.geo}</span>
                                        <span className="font-bold text-red-700 text-sm">{t.range}</span>
                                    </div>
                                    <div className="h-3 bg-gray-200 mb-1">
                                        <div className="h-full bg-[#1A1A1A]" style={{ width: `${t.pct}%` }}></div>
                                    </div>
                                    <span className="text-xs text-gray-500">{t.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section className="max-w-[1400px] mx-auto border-x border-b border-[#1A1A1A] bg-white p-8 md:p-12">
                <span className="text-xs font-bold text-red-700 uppercase tracking-widest mb-2 block text-center" style={{ fontFamily: 'var(--font-sans)' }}>Partner Voices</span>
                <h2 className="text-4xl font-bold text-center mb-12">What Our Partners Report</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { name: "Alex M.", role: "Publisher · Gaming Vertical", quote: "Switched from AdSense. Revenue tripled in the first month. The anti-adblock feature recovered 30% of lost income we didn't even know we were missing." },
                        { name: "Sarah K.", role: "Media Buyer · E-Commerce", quote: "CPA Goal is a game-changer. We set a target CPA and the system auto-optimizes. Our ROAS improved by 140% in six weeks." },
                        { name: "Dmitri V.", role: "Publisher · Technology", quote: "Weekly USDT payouts, no delays. Our dedicated manager restructured our ad placements and we saw a 40% revenue increase." },
                    ].map((t, i) => (
                        <div key={i} className="border border-gray-300 p-8">
                            <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-500 fill-current" />)}</div>
                            <p className="text-base leading-relaxed mb-6 italic">"{t.quote}"</p>
                            <div className="border-t border-gray-200 pt-4" style={{ fontFamily: 'var(--font-sans)' }}>
                                <div className="font-bold text-sm">{t.name}</div>
                                <div className="text-xs text-gray-500">{t.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ FAQ ═══ */}
            <section className="max-w-[1400px] mx-auto border-x border-b border-[#1A1A1A] bg-[#F9F7F5] p-8 md:p-12">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
                    <div style={{ fontFamily: 'var(--font-sans)' }}>
                        <EditorialFAQ question="How much can publishers earn?" answer="Earnings vary by traffic quality and GEO. Tier-1 traffic earns $5-8+ CPM. Our eCPM model rewards quality — more conversions mean higher rates with no ceiling on earnings." />
                        <EditorialFAQ question="What is the minimum payout?" answer="$5 via Paxum. PayPal, Wire Transfer, BTC, and USDT also available. Payments processed weekly, always on time." />
                        <EditorialFAQ question="How does fraud protection work?" answer="Our 3-level security system detects and blocks bot traffic, malware, and fraudulent clicks in real-time. Only clean, verified impressions count." />
                        <EditorialFAQ question="What targeting options are available for advertisers?" answer="20+ parameters: Country, City, OS, Browser, Device, Carrier, Language, and more. Smart CPM automates bidding. CPA Goal optimizes for actual conversions." />
                        <EditorialFAQ question="How fast is campaign approval?" answer="Publisher sites approved within minutes. Advertiser campaigns go live within 5 minutes of submission." />
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="max-w-[1400px] mx-auto border-x border-b border-[#1A1A1A] bg-[#1A1A1A] text-white p-8 md:p-16 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Join the Network. Start Today.</h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto" style={{ fontFamily: 'var(--font-sans)' }}>10,000+ publishers and advertisers are already scaling with MrPop.io. Your competition is here.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ fontFamily: 'var(--font-sans)' }}>
                    <Link href="/register?role=publisher" className="px-8 py-4 bg-white text-[#1A1A1A] text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors">
                        Publisher Signup
                    </Link>
                    <Link href="/register?role=advertiser" className="px-8 py-4 border border-white/30 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#1A1A1A] transition-colors">
                        Advertiser Signup
                    </Link>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="max-w-[1400px] mx-auto border-x border-b border-[#1A1A1A] bg-[#F9F7F5] p-8">
                <div className="grid md:grid-cols-5 gap-8 mb-8" style={{ fontFamily: 'var(--font-sans)' }}>
                    <div>
                        <div className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>The PR Journal</div>
                        <p className="text-xs text-gray-500 leading-relaxed">Market intelligence for digital publishers and advertisers. Powered by MrPop.io.</p>
                    </div>
                    {[
                        {
                            title: "Platform", links: [
                                { name: 'Publishers', href: '/for-publishers' },
                                { name: 'Advertisers', href: '/for-advertisers' },
                                { name: 'Ad Formats', href: '/ad-formats' },
                                { name: 'Smart Link', href: '/smart-link' },
                            ]
                        },
                        {
                            title: "Resources", links: [
                                { name: 'How It Works', href: '/how-it-works' },
                                { name: 'Anti-Adblock', href: '/anti-adblock' },
                                { name: 'Documentation', href: '/docs' },
                                { name: 'Blog', href: '/blog' },
                            ]
                        },
                        {
                            title: "Company", links: [
                                { name: 'Contact', href: '/contact' },
                                { name: 'FAQ', href: '/faq' },
                                { name: 'Status', href: '/status' },
                            ]
                        },
                        {
                            title: "Legal", links: [
                                { name: 'Privacy Policy', href: '/privacy' },
                                { name: 'Terms of Service', href: '/terms' },
                            ]
                        }
                    ].map((col, i) => (
                        <div key={i}>
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">{col.title}</div>
                            <div className="space-y-1.5">
                                {col.links.map((link, j) => <Link key={j} href={link.href} className="block text-xs text-gray-500 hover:text-red-700 transition-colors">{link.name}</Link>)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-300 pt-6 flex flex-col md:flex-row justify-between text-[10px] text-gray-400" style={{ fontFamily: 'var(--font-sans)' }}>
                    <p>© 2026 The PR Journal / MrPop.io. All rights reserved.</p>
                    <p>Design Language: Editorial v2.0</p>
                </div>
            </footer>
        </div>
    );
}
