'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    Zap, ArrowRight, MousePointer2, Smartphone, Layers, Cpu,
    BarChart3, Shield, Globe, ChevronDown, CheckCircle, Star,
    TrendingUp, Users, DollarSign, Target, Code, Play
} from 'lucide-react';
import AuthNavButtons from '@/components/AuthNavButtons';

function SaaSFAQ({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/10">
            <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-6 text-left font-semibold hover:text-white transition-colors text-gray-300">
                {question}
                <ChevronDown className={`w-5 h-5 transition-transform text-gray-500 ${open ? 'rotate-180 text-white' : ''}`} />
            </button>
            {open && <div className="pb-6 text-gray-400 leading-relaxed">{answer}</div>}
        </div>
    );
}

export default function SaaSLayout() {
    const [activeTab, setActiveTab] = useState('publishers');

    return (
        <div className="min-h-screen bg-[#09090B] text-white selection:bg-white/20" style={{ fontFamily: 'var(--font-sans)' }}>

            {/* ═══ NAVBAR ═══ */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/5 bg-[#09090B]/80">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                                <div className="w-3.5 h-3.5 bg-[#09090B] rounded-sm"></div>
                            </div>
                            <span className="text-[15px] font-semibold tracking-tight">PopReklam</span>
                        </div>
                        <div className="hidden md:flex gap-6 text-[13px] text-gray-500 font-medium">
                            <Link href="/for-publishers" className="hover:text-white transition-colors">Publishers</Link>
                            <Link href="/for-advertisers" className="hover:text-white transition-colors">Advertisers</Link>
                            <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
                            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
                            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                        </div>
                    </div>
                    <AuthNavButtons
                        hrefCTA="/register"
                        labelCTA="Get Started"
                        btnClass="px-3 py-1.5 text-[13px] font-medium bg-white text-black rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                        loginClass="px-3 py-1.5 text-[13px] font-medium text-gray-400 hover:text-white transition-colors"
                    />
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
            <section className="relative pt-40 pb-24 px-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[12px] text-gray-400 font-medium mb-8">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        Serving 2B+ impressions monthly
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                        The ad network <br />
                        <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">built for performance</span>
                    </h1>

                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        AI-powered targeting, real-time bidding, and premium demand from 15K+ direct advertisers.
                        Monetize smarter. Advertise better.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/register" className="px-6 py-3 bg-white text-black rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2">
                            Start for Free <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/login" className="px-6 py-3 border border-white/10 rounded-lg font-semibold text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
                            <Play className="w-4 h-4" /> View Demo
                        </Link>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-sm">
                        {[
                            { val: "2B+", label: "Monthly Impressions" },
                            { val: "248", label: "GEOs Covered" },
                            { val: "15K+", label: "Active Advertisers" },
                            { val: "99.9%", label: "Uptime SLA" },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-white">{s.val}</span>
                                <span className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</span>
                                {i < 3 && <div className="w-px h-6 bg-white/10 ml-5 hidden sm:block"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CODE SNIPPET ═══ */}
            <section className="relative z-10 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="rounded-xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur overflow-hidden shadow-2xl shadow-black/50">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                            </div>
                            <span className="text-[11px] text-gray-500 font-mono ml-2">integration.js — 2 lines to monetize</span>
                        </div>
                        <div className="p-6 font-mono text-[13px] leading-relaxed text-gray-400">
                            <div><span className="text-gray-600">1</span> <span className="text-gray-500">{'// Add to your <head> — that\'s it.'}</span></div>
                            <div><span className="text-gray-600">2</span> <span className="text-blue-400">{'<script'}</span> <span className="text-green-400">async</span> <span className="text-purple-300">src</span><span className="text-gray-500">={'\"'}</span><span className="text-orange-300">https://cdn.popreklam.com/sdk.js</span><span className="text-gray-500">{'\"'}</span><span className="text-blue-400">{'>'}</span><span className="text-blue-400">{'</script>'}</span></div>
                            <div><span className="text-gray-600">3</span> <span className="text-blue-400">{'<script>'}</span></div>
                            <div><span className="text-gray-600">4</span>   <span className="text-yellow-200">PopAd</span><span className="text-gray-500">.</span><span className="text-blue-300">init</span><span className="text-gray-500">{'({'}</span></div>
                            <div><span className="text-gray-600">5</span>     <span className="text-blue-300">pubId</span><span className="text-gray-500">:</span> <span className="text-orange-300">"PUB-XXXXXX"</span><span className="text-gray-500">,</span></div>
                            <div><span className="text-gray-600">6</span>     <span className="text-blue-300">format</span><span className="text-gray-500">:</span> <span className="text-orange-300">"popunder"</span><span className="text-gray-500">,</span></div>
                            <div><span className="text-gray-600">7</span>     <span className="text-blue-300">antiAdblock</span><span className="text-gray-500">:</span> <span className="text-purple-400">true</span></div>
                            <div><span className="text-gray-600">8</span>   <span className="text-gray-500">{'});'}</span></div>
                            <div><span className="text-gray-600">9</span> <span className="text-blue-400">{'</script>'}</span></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ DUAL AUDIENCE ═══ */}
            <section className="py-24 px-6 border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center gap-2 mb-12">
                        {['publishers', 'advertisers'].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                For {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'publishers' ? (
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl font-bold tracking-tight mb-6">Grow your revenue with AI-optimized monetization</h2>
                                <p className="text-gray-400 mb-8 leading-relaxed">Our algorithms analyze traffic patterns in real-time, serving the highest-paying ads to each impression. No manual optimization needed.</p>
                                <div className="space-y-4">
                                    {[
                                        "Up to 70% revenue share",
                                        "6 ad formats — Pops, Push, Native, Smart Link, Interstitial, Banners",
                                        "$5 minimum payout — BTC, USDT, PayPal, Wire",
                                        "Anti-adblock: recover 30%+ lost revenue",
                                        "Dedicated account manager for top publishers",
                                        "Clean ad feed — zero malware, zero redirects"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300 text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/register?role=publisher" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-gray-300 transition-colors">
                                    Start monetizing <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-sm text-gray-400 font-medium">Earnings Dashboard</span>
                                    <span className="text-xs text-green-400 font-mono flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div> Live</span>
                                </div>
                                <div className="text-4xl font-bold mb-1">$12,847.30</div>
                                <div className="text-sm text-green-400 font-medium mb-8">+$847.20 today (+7.1%)</div>
                                <div className="h-40 flex items-end gap-1">
                                    {[35, 45, 40, 55, 50, 65, 60, 75, 70, 85, 80, 90].map((h, i) => (
                                        <div key={i} className="flex-1 bg-gradient-to-t from-white/5 to-white/20 rounded-t hover:to-white/40 transition-all" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-3 text-[10px] text-gray-600 font-mono">
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl font-bold tracking-tight mb-6">Precision targeting at global scale</h2>
                                <p className="text-gray-400 mb-8 leading-relaxed">Access 2B+ monthly impressions from 36K+ direct publishers. 20+ targeting parameters. Smart bidding that saves budget.</p>
                                <div className="space-y-4">
                                    {[
                                        "36K+ direct publishers — no middlemen",
                                        "20+ targeting settings — GEO, OS, Device, Browser, Carrier",
                                        "Smart CPM — AI-optimized bidding",
                                        "CPA Goal — pay only for conversions",
                                        "Traffic Estimator — plan before you spend",
                                        "3-level fraud protection — real traffic only"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300 text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/register?role=advertiser" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-gray-300 transition-colors">
                                    Launch campaign <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-8">
                                <div className="text-sm text-gray-400 font-medium mb-6">CPM by Region</div>
                                <div className="space-y-4">
                                    {[
                                        { geo: "Tier 1 — US, UK, CA, AU", cpm: "$3.00 – $8.00", pct: 90 },
                                        { geo: "Tier 2 — EU, JP, KR", cpm: "$1.50 – $4.00", pct: 65 },
                                        { geo: "Tier 3 — Worldwide", cpm: "$0.50 – $2.00", pct: 40 },
                                    ].map((t, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="text-gray-300">{t.geo}</span>
                                                <span className="font-mono text-white font-medium">{t.cpm}</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${t.pct}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
                                    <div><div className="text-xl font-bold">$100</div><div className="text-[11px] text-gray-500">Min Deposit</div></div>
                                    <div><div className="text-xl font-bold">248</div><div className="text-[11px] text-gray-500">GEOs</div></div>
                                    <div><div className="text-xl font-bold">5 min</div><div className="text-[11px] text-gray-500">Approval</div></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ AD FORMATS ═══ */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold tracking-tight mb-4">Ad formats that convert</h2>
                        <p className="text-gray-500 max-w-lg mx-auto">Non-intrusive formats delivering 2B+ impressions monthly. Pick the right format for your traffic.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { title: "Popunder", desc: "Full-page behind main window. Zero banner blindness. Highest CPM.", icon: MousePointer2, cpm: "$2–8" },
                            { title: "In-Page Push", desc: "No opt-in needed. 30X higher CTR than web push. All browsers.", icon: Smartphone, cpm: "$1–5" },
                            { title: "Interstitial", desc: "Full-screen between pages. Maximum visual impact.", icon: Layers, cpm: "$1–6" },
                            { title: "Smart Link", desc: "AI routes to highest-paying offer. Perfect for social traffic.", icon: Cpu, cpm: "$0.5–3" },
                            { title: "Native Ads", desc: "Blend with content. Publisher controls colors and sizing.", icon: BarChart3, cpm: "$0.5–3" },
                            { title: "Banner Ads", desc: "Classic IAB standards. Stable revenue for any layout.", icon: Target, cpm: "$0.3–2" },
                        ].map((f, i) => (
                            <div key={i} className="group p-6 rounded-xl border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <f.icon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">{f.cpm}</span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TRUST SECTION ═══ */}
            <section className="py-24 px-6 border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold tracking-tight text-center mb-16">Why teams choose PopReklam</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: "Ad Safety", desc: "In-house 3-level security prevents malware, fraud, and bot traffic. Only clean, verified impressions count." },
                            { icon: Users, title: "Partner Care", desc: "Beyond customer support. Expert managers help you optimize strategy, improve placements, and scale revenue." },
                            { icon: TrendingUp, title: "Smart Bidding", desc: "Smart CPM automates bid optimization. CPA Goal lets you pay only for conversions. Traffic Estimator plans your budget." },
                            { icon: Globe, title: "248 GEOs", desc: "Direct publishers worldwide. Premium Tier-1 traffic alongside cost-effective global coverage for every campaign." },
                            { icon: DollarSign, title: "eCPM Model", desc: "Performance-based rates reward quality traffic. More clicks and conversions = higher earnings with no ceiling." },
                            { icon: Zap, title: "Instant Setup", desc: "2 lines of code for publishers. 5-minute campaign setup for advertisers. Start making money today." },
                        ].map((item, i) => (
                            <div key={i} className="group">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                                    <item.icon className="w-5 h-5 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold tracking-tight text-center mb-16">Trusted by performance marketers</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: "Alex M.", role: "Publisher · Gaming", quote: "Moved from AdSense. Revenue tripled in month one. The anti-adblock feature alone recovered 30% of lost income.", stars: 5 },
                            { name: "Sarah K.", role: "Media Buyer · E-Commerce", quote: "CPA Goal saved us thousands. We set a target CPA and the system auto-optimizes. Hands-off scaling.", stars: 5 },
                            { name: "Dmitri V.", role: "Publisher · Tech Blog", quote: "Weekly USDT payouts. No delays. My account manager helped me restructure ad placements for 40% more revenue.", stars: 5 },
                        ].map((t, i) => (
                            <div key={i} className="p-6 rounded-xl border border-white/5 bg-white/[0.02]">
                                <div className="flex gap-0.5 mb-4">{[...Array(t.stars)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />)}</div>
                                <p className="text-sm text-gray-300 leading-relaxed mb-6">"{t.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xs font-bold">{t.name[0]}</div>
                                    <div>
                                        <div className="text-sm font-semibold">{t.name}</div>
                                        <div className="text-xs text-gray-500">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FAQ ═══ */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Frequently asked questions</h2>
                    <SaaSFAQ question="How much can publishers earn?" answer="Earnings depend on traffic quality and GEO. Tier-1 traffic earns $5-8+ CPM. Our eCPM model has no earning ceiling — better traffic performance means higher rates automatically." />
                    <SaaSFAQ question="What is the minimum payout?" answer="$5 via Paxum. PayPal, Wire Transfer, BTC, and USDT are also available with slightly higher minimums. Payouts are processed weekly, always on time." />
                    <SaaSFAQ question="How does targeting work for advertisers?" answer="20+ targeting parameters: Country, City, OS, Browser, Device, Carrier, Language, and more. Smart CPM automates bidding. CPA Goal optimizes for conversions." />
                    <SaaSFAQ question="How is ad quality maintained?" answer="Our in-house 3-level security system blocks malware, fraud, and bot traffic in real-time. Only clean, verified ads reach your users." />
                    <SaaSFAQ question="How long does approval take?" answer="Publisher sites are typically approved within minutes. Advertiser campaigns go live within 5 minutes after submission." />
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Start scaling today</h2>
                    <p className="text-gray-400 mb-8">Join 10,000+ publishers and advertisers already growing with PopReklam.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/register?role=publisher" className="px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Publisher Signup
                        </Link>
                        <Link href="/register?role=advertiser" className="px-8 py-4 border border-white/10 rounded-lg font-semibold text-gray-300 hover:text-white hover:border-white/20 transition-all">
                            Advertiser Signup
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-5 gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-[#0A0A0F] fill-current" /></div>
                                <span className="text-sm font-semibold">PopReklam</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">The highest-paying ad network for publishers. AI-driven targeting for advertisers.</p>
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
                                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">{col.title}</div>
                                <div className="space-y-2">
                                    {col.links.map((link, j) => <Link key={j} href={link.href} className="block text-sm text-gray-500 hover:text-white transition-colors">{link.name}</Link>)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
                        <p>© 2026 PopReklam. All rights reserved.</p>
                        <p>Design Language: Ethereal SaaS v2.0</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
