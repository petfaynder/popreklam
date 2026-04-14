'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    Zap, Target, Users, BarChart2, Globe2, Shield, ArrowRight, CheckCircle,
    ChevronDown, Star, TrendingUp, MousePointer2, Smartphone, Layers,
    Cpu, DollarSign, BarChart3, Crosshair, Play
} from 'lucide-react';
import AuthNavButtons from '@/components/AuthNavButtons';

function AdvFAQ({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/10">
            <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-5 text-left font-semibold text-base hover:text-sky-400 transition-colors">
                {question}
                <ChevronDown className={`w-5 h-5 transition-transform text-gray-500 ${open ? 'rotate-180 text-sky-400' : ''}`} />
            </button>
            {open && <div className="pb-5 text-gray-400 leading-relaxed text-sm">{answer}</div>}
        </div>
    );
}

export default function AdvertiserLayout() {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-sky-400 selection:text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>

            {/* ═══ NAVBAR ═══ */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)] group-hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all">
                            <Zap className="w-6 h-6 text-white fill-current" />
                        </div>
                        <span className="text-2xl font-bold">MrPop.io</span>
                    </div>
                    <div className="hidden md:flex gap-6 text-sm font-bold text-gray-400">
                        <Link href="/for-publishers" className="hover:text-sky-400 transition-colors">Publishers</Link>
                        <Link href="/for-advertisers" className="hover:text-sky-400 transition-colors">Advertisers</Link>
                        <Link href="/how-it-works" className="hover:text-sky-400 transition-colors">How It Works</Link>
                        <Link href="/faq" className="hover:text-sky-400 transition-colors">FAQ</Link>
                        <Link href="/contact" className="hover:text-sky-400 transition-colors">Contact</Link>
                    </div>
                    <AuthNavButtons
                        hrefCTA="/register?role=advertiser"
                        labelCTA="Launch Campaign"
                        btnClass="px-6 py-2.5 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all text-sm flex items-center gap-2"
                        loginClass="text-gray-400 hover:text-white transition-colors text-sm font-bold"
                    />
                </div>
            </nav>

            {/* ═══ BACKGROUND ═══ */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]"></div>
                <div style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)' }} className="absolute inset-0 bg-[size:60px_60px]"></div>
            </div>

            {/* ═══ HERO ═══ */}
            <section className="relative z-10 pt-40 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-sm font-medium mb-8">
                        <Globe2 className="w-4 h-4" />
                        <span>Access 2 Billion+ Monthly Impressions</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                        Scale Your Business <br />
                        With <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">Premium Traffic</span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Direct publisher traffic from 248 GEOs. 20+ targeting parameters.
                        AI-powered bidding that maximizes ROI. Start with just $100.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register?role=advertiser" className="px-8 py-4 bg-sky-500 text-white rounded-xl font-bold text-lg hover:bg-sky-400 shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] transition-all flex items-center gap-2">
                            <Target className="w-5 h-5" /> Create Campaign
                        </Link>
                        <Link href="/login" className="px-8 py-4 border border-white/20 rounded-xl font-bold text-lg hover:border-sky-500/50 hover:bg-sky-500/5 transition-all flex items-center gap-2">
                            <Play className="w-5 h-5" /> View Demo
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
                        {[
                            { val: "2B+", label: "Monthly Impressions" },
                            { val: "248", label: "GEOs Covered" },
                            { val: "$100", label: "Min Deposit" },
                            { val: "5 min", label: "Avg Approval" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-sky-500/50 transition-colors">
                                <div className="text-3xl font-bold text-sky-400 mb-1">{stat.val}</div>
                                <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ DASHBOARD PREVIEW ═══ */}
            <section className="relative z-10 -mt-10 mb-16 px-6">
                <div className="max-w-5xl mx-auto rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur shadow-2xl overflow-hidden p-2">
                    <div className="bg-slate-950 rounded-lg p-8 border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-3 items-center">
                                <div className="text-sm font-bold">Campaign Performance</div>
                                <span className="text-[10px] text-green-400 font-mono flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div> Real-time</span>
                            </div>
                            <div className="h-8 w-8 bg-sky-500 rounded-full flex items-center justify-center font-bold text-xs">AI</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            {[
                                { label: "Impressions", val: "2.4M" },
                                { label: "Clicks", val: "18.7K" },
                                { label: "CTR", val: "0.78%" },
                                { label: "Conversions", val: "1,247" },
                            ].map((m, i) => (
                                <div key={i} className="bg-white/5 rounded-lg p-4 text-center">
                                    <div className="text-xl font-bold">{m.val}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">{m.label}</div>
                                </div>
                            ))}
                        </div>
                        <div className="h-48 w-full flex items-end gap-1">
                            {[30, 45, 35, 60, 55, 80, 75, 90, 85, 100, 95, 80, 70, 85, 95, 100, 90, 80, 70, 75, 85, 90, 95, 88].map((h, i) => (
                                <div key={i} className="flex-1 bg-gradient-to-t from-sky-500/10 to-sky-500/60 rounded-t hover:to-sky-400 transition-all" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 text-[10px] text-gray-600 font-mono">
                            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ WHO BENEFITS ═══ */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Who Benefits From MrPop.io</h2>
                        <p className="text-gray-400 max-w-lg mx-auto">Whether you're a brand, agency, or affiliate — we have the traffic and tools you need.</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { title: "Brands", desc: "Drive awareness and conversions with precision-targeted campaigns across 248 markets.", icon: Target },
                            { title: "Agencies", desc: "Self-serve platform with white-label reporting. Scale client campaigns effortlessly.", icon: Users },
                            { title: "Affiliates", desc: "High-converting traffic for iGaming, VPN, Utilities, E-Commerce, and Dating verticals.", icon: TrendingUp },
                            { title: "DSPs (RTB)", desc: "Premium RTB inventory from verified publishers. OpenRTB 2.5+ compliant.", icon: Cpu },
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-2xl border border-white/10 hover:border-sky-500 bg-slate-950 hover:bg-slate-900 transition-all group text-center">
                                <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <item.icon className="w-8 h-8 text-sky-500" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TARGETING ═══ */}
            <section className="relative z-10 py-24 px-6 bg-slate-900/30 border-y border-white/5">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-8 leading-tight">
                            20+ Targeting <br />
                            <span className="text-sky-400">Parameters</span>
                        </h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Reach exactly the right audience. Combine multiple targeting parameters for surgical precision.
                            Our AI analyzes traffic patterns to optimize delivery in real-time.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: "Geographic", items: "Country, City, Region" },
                                { title: "Device", items: "Desktop, Mobile, Tablet" },
                                { title: "Technology", items: "Browser, OS, Language" },
                                { title: "Connection", items: "Carrier, IP Range, ISP" },
                            ].map((cat, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-sky-500/30 transition-colors">
                                    <h4 className="text-sky-400 font-bold text-sm mb-2">{cat.title}</h4>
                                    <p className="text-xs text-gray-400">{cat.items}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* CPM Table */}
                    <div className="bg-slate-950 border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">CPM Rates by Region</h3>
                        <div className="space-y-6">
                            {[
                                { geo: "Tier 1 — US, UK, CA, AU", range: "$3.00 – $8.00", pct: 90, desc: "Premium English-speaking markets" },
                                { geo: "Tier 2 — EU, JP, KR", range: "$1.50 – $4.00", pct: 60, desc: "Developed European & Asian" },
                                { geo: "Tier 3 — Worldwide", range: "$0.50 – $2.00", pct: 35, desc: "Maximum scale at low cost" },
                            ].map((t, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-sm font-medium">{t.geo}</span>
                                        <span className="text-sm font-bold text-sky-400">{t.range}</span>
                                    </div>
                                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-1">
                                        <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full" style={{ width: `${t.pct}%` }}></div>
                                    </div>
                                    <span className="text-[11px] text-gray-500">{t.desc}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-gray-500">
                            * Rates vary by ad format, targeting, and traffic quality. CPM/CPC/CPA models available.
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ AD FORMATS ═══ */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Ad Formats That Convert</h2>
                        <p className="text-gray-400 max-w-lg mx-auto">Choose the right format for your vertical. Run multiple formats for maximum reach.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: "Popunder", desc: "Full-page behind main window. Highest CPM. Zero banner blindness. Best for awareness campaigns.", icon: MousePointer2, cpm: "$2-8" },
                            { title: "In-Page Push", desc: "No opt-in needed. 30X higher CTR than web push. All OS and browsers supported.", icon: Smartphone, cpm: "$1-5" },
                            { title: "Interstitial", desc: "Full-screen takeover. Maximum visual impact. Template creatives available.", icon: Layers, cpm: "$1-6" },
                            { title: "Smart Link", desc: "AI auto-routes to highest-converting offer. Ideal for social media traffic.", icon: Cpu, cpm: "$0.5-3" },
                            { title: "Native Ads", desc: "Blend with editorial content. Higher engagement and trust from users.", icon: BarChart3, cpm: "$0.5-3" },
                            { title: "Banner Ads", desc: "Classic IAB standards. Desktop and mobile. Stable, predictable performance.", icon: Target, cpm: "$0.3-2" },
                        ].map((f, i) => (
                            <div key={i} className="group p-6 rounded-2xl border border-white/10 hover:border-sky-500/30 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                                        <f.icon className="w-6 h-6 text-sky-400" />
                                    </div>
                                    <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">{f.cpm} CPM</span>
                                </div>
                                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SMART TOOLS ═══ */}
            <section className="relative z-10 py-24 px-6 bg-slate-900/30 border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">Smart Tools for Smart Advertisers</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Crosshair, title: "Smart CPM", desc: "AI-optimized bidding automatically adjusts to win the best-converting placements at the fairest price. Save budget without sacrificing quality." },
                            { icon: DollarSign, title: "CPA Goal", desc: "Set your target CPA and let the system optimize. Only pay for conversions that matter. Automated rules filter low-performing sources." },
                            { icon: BarChart2, title: "Traffic Estimator", desc: "Evaluate competitors' bids and in-network traffic volumes before you spend. Plan campaigns with data, not guesswork." },
                            { icon: Shield, title: "3-Level Security", desc: "In-house anti-fraud and anti-bot solutions ensure pure traffic from verified sources. Real impressions, real users." },
                            { icon: TrendingUp, title: "Advanced Tracking", desc: "Pull all parameters needed for strategic decisions. Server-to-server postback integration. Real-time conversion tracking." },
                            { icon: Users, title: "Expert Partner Care", desc: "Vertical-specific account managers who understand your market. Strategy advice, campaign audit, and optimization support." },
                        ].map((item, i) => (
                            <div key={i} className="group">
                                <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-sky-500/20 transition-colors">
                                    <item.icon className="w-6 h-6 text-sky-400" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Launch Your First Campaign</h2>
                        <p className="text-gray-400">Start driving traffic in minutes</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { num: "01", title: "Create Account", desc: "Sign up as an advertiser. Takes under 2 minutes." },
                            { num: "02", title: "Add Funds", desc: "Deposit via PayPal, card, or cryptocurrency. $100 minimum." },
                            { num: "03", title: "Launch", desc: "Set targeting, budget, bid. We optimize delivery automatically." },
                            { num: "04", title: "Track ROI", desc: "Monitor performance in real-time. Scale what works." },
                        ].map((step, i) => (
                            <div key={i} className="text-center relative">
                                <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_30px_rgba(14,165,233,0.3)]">
                                    {step.num}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                <p className="text-gray-400 text-sm">{step.desc}</p>
                                {i < 3 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-sky-500/50 to-transparent"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section className="relative z-10 py-24 px-6 border-y border-white/5 bg-slate-900/30">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">What Advertisers Say</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: "Sarah K.", role: "Media Buyer · E-Commerce", quote: "CPA Goal is a game-changer. We set a target and the system auto-optimizes. ROAS improved by 140% in six weeks.", stars: 5 },
                            { name: "Marco L.", role: "Agency · iGaming", quote: "Traffic Estimator saved us from burning budget on bad GEOs. We now plan every campaign with hard data.", stars: 5 },
                            { name: "Laura W.", role: "Affiliate · VPN Offers", quote: "Smart CPM finds the sweet spot between volume and quality. Our conversion rate doubled after switching to MrPop.io.", stars: 5 },
                        ].map((t, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-sky-500/30 transition-colors">
                                <div className="flex gap-0.5 mb-4">{[...Array(t.stars)].map((_, j) => <Star key={j} className="w-4 h-4 text-sky-400 fill-current" />)}</div>
                                <p className="text-gray-300 leading-relaxed mb-6 text-sm">"{t.quote}"</p>
                                <div className="border-t border-white/10 pt-4">
                                    <div className="font-bold">{t.name}</div>
                                    <div className="text-xs text-gray-500">{t.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FAQ ═══ */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <AdvFAQ question="What is the minimum deposit?" answer="$100 minimum deposit via PayPal, Visa, Mastercard, Paxum, or cryptocurrency. We recommend at least $100 per test campaign." />
                    <AdvFAQ question="What targeting options are available?" answer="20+ parameters: Country, City, OS, Browser, Device, Carrier, Language, IP Range, and more. Combine multiple parameters for precision targeting." />
                    <AdvFAQ question="How does Smart CPM work?" answer="Smart CPM uses AI to automatically adjust your bids, competing for the best-converting placements at the fairest price. It saves budget without sacrificing quality." />
                    <AdvFAQ question="What is CPA Goal?" answer="CPA Goal lets you set a target cost-per-action. The system automatically optimizes traffic sources, pausing low-performers and scaling winners. Pay only for conversions." />
                    <AdvFAQ question="How fast is campaign approval?" answer="Most campaigns are approved within 5 minutes. Our automated moderation system reviews creatives and landing pages in real-time." />
                    <AdvFAQ question="Do you support server-to-server tracking?" answer="Yes. Full postback integration, conversion tracking pixels, and API access for programmatic campaign management." />
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="bg-gradient-to-br from-sky-500/10 to-transparent border border-sky-500/20 rounded-3xl p-12">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Scale Your Traffic?</h2>
                        <p className="text-xl text-gray-400 mb-8">Start your first campaign with just $100 minimum deposit</p>
                        <Link href="/register?role=advertiser" className="inline-flex items-center gap-2 px-10 py-5 bg-sky-500 text-white rounded-xl font-bold text-lg hover:bg-sky-400 shadow-[0_0_40px_rgba(14,165,233,0.4)] hover:shadow-[0_0_50px_rgba(14,165,233,0.6)] transition-all">
                            Create Advertiser Account <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="relative z-10 border-t border-white/10 py-12 px-6 bg-slate-950">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-5 gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center"><Zap className="w-4 h-4 text-white fill-current" /></div>
                                <span className="text-lg font-bold">MrPop.io</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">Premium ad network for performance-driven advertisers.</p>
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
                            },
                        ].map((col, i) => (
                            <div key={i}>
                                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">{col.title}</div>
                                <div className="space-y-2">
                                    {col.links.map((link, j) => <Link key={j} href={link.href} className="block text-sm text-gray-500 hover:text-sky-400 transition-colors">{link.name}</Link>)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between text-xs text-gray-600">
                        <p>© 2026 MrPop.io. All rights reserved.</p>
                        <p>Design Language: Azure v2.0</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
