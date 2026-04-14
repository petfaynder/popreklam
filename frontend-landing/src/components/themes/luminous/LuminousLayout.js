'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    Zap, TrendingUp, DollarSign, Clock, Shield, BarChart3,
    Wallet, ArrowRight, CheckCircle, Star, ChevronDown,
    MousePointer2, Smartphone, Layers, Cpu, Globe, Users
} from 'lucide-react';
import AuthNavButtons from '@/components/AuthNavButtons';

function PubFAQ({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/10">
            <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-5 text-left font-bold text-base hover:text-lime-400 transition-colors">
                {question}
                <ChevronDown className={`w-5 h-5 transition-transform text-gray-500 ${open ? 'rotate-180 text-lime-400' : ''}`} />
            </button>
            {open && <div className="pb-5 text-gray-400 leading-relaxed text-sm">{answer}</div>}
        </div>
    );
}

export default function PublisherLayout() {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-lime-400 selection:text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>

            {/* ═══ NAVBAR ═══ */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-lime-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(163,255,51,0.3)] group-hover:shadow-[0_0_30px_rgba(163,255,51,0.5)] transition-all">
                            <Zap className="w-6 h-6 text-slate-900 fill-current" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">MrPop.io</span>
                    </div>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
                        <Link href="/for-publishers" className="hover:text-lime-400 transition-colors">Publishers</Link>
                        <Link href="/for-advertisers" className="hover:text-lime-400 transition-colors">Advertisers</Link>
                        <Link href="/how-it-works" className="hover:text-lime-400 transition-colors">How It Works</Link>
                        <Link href="/faq" className="hover:text-lime-400 transition-colors">FAQ</Link>
                        <Link href="/contact" className="hover:text-lime-400 transition-colors">Contact</Link>
                    </div>
                    <AuthNavButtons
                        hrefCTA="/register?role=publisher"
                        labelCTA="Start Earning"
                        btnClass="px-6 py-2.5 bg-lime-400 text-slate-900 rounded-xl font-bold hover:bg-lime-300 shadow-[0_0_20px_rgba(163,255,51,0.3)] hover:shadow-[0_0_30px_rgba(163,255,51,0.5)] transition-all text-sm flex items-center gap-2"
                        loginClass="text-gray-400 hover:text-white transition-colors text-sm font-bold"
                    />
                </div>
            </nav>

            {/* ═══ BACKGROUND ═══ */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-lime-400/5 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-lime-400/10 rounded-full blur-[120px]"></div>
            </div>

            {/* ═══ HERO ═══ */}
            <section className="relative z-10 pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-400/10 border border-lime-400/20 rounded-full text-lime-400 text-sm font-bold mb-8">
                        <TrendingUp className="w-4 h-4" />
                        <span>Join 10,000+ Publishers Earning Daily</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[0.95] tracking-tight">
                        Turn Your Traffic <br />
                        Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-400 drop-shadow-[0_0_30px_rgba(163,255,51,0.2)]">Revenue</span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        AI-optimized monetization delivering the highest eCPM rates.
                        100% fill rate, clean ad feed, weekly payouts. Zero hassle.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register?role=publisher" className="px-8 py-4 bg-lime-400 text-slate-900 rounded-xl font-bold text-lg hover:bg-lime-300 shadow-[0_0_30px_rgba(163,255,51,0.4)] hover:shadow-[0_0_50px_rgba(163,255,51,0.6)] transition-all flex items-center gap-2">
                            <Zap className="w-5 h-5 fill-current" /> Start Monetizing
                        </Link>
                        <Link href="/login" className="px-8 py-4 border border-white/20 rounded-xl font-bold text-lg hover:border-lime-400/50 hover:bg-lime-400/5 transition-all">
                            Sign In
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
                        {[
                            { val: "70%", label: "Revenue Share" },
                            { val: "$5", label: "Min Payout" },
                            { val: "100%", label: "Fill Rate" },
                            { val: "Weekly", label: "Payouts" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-lime-400/50 transition-colors">
                                <div className="text-3xl font-bold text-lime-400 mb-1">{stat.val}</div>
                                <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ AD FORMATS ═══ */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">6 High-Impact Ad Formats</h2>
                        <p className="text-gray-400 max-w-lg mx-auto">Non-intrusive formats serving 2B+ impressions monthly. Pick what works for your traffic.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: "Popunder", desc: "Full-page behind main window. Zero banner blindness. Industry's highest CPM format.", icon: MousePointer2, cpm: "$2-8 CPM" },
                            { title: "In-Page Push", desc: "No opt-in needed. 30X higher CTR than web push. Runs on all OS and browsers.", icon: Smartphone, cpm: "$1-5 CPM" },
                            { title: "Interstitial", desc: "Full-screen takeover between page loads. Maximum visual impact and engagement.", icon: Layers, cpm: "$1-6 CPM" },
                            { title: "Smart Link", desc: "AI auto-routes to the highest-paying offer. Perfect for social and referral traffic.", icon: Cpu, cpm: "$0.5-3 CPM" },
                            { title: "Native Ads", desc: "Blend with your content naturally. Full control over colors, sizes, and placement.", icon: BarChart3, cpm: "$0.5-3 CPM" },
                            { title: "Banner Ads", desc: "Classic IAB standards. Stable, predictable revenue stream for any site layout.", icon: Globe, cpm: "$0.3-2 CPM" },
                        ].map((f, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-lime-400/30 hover:shadow-[0_0_30px_rgba(163,255,51,0.1)] transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700">
                                    <f.icon className="w-32 h-32 text-lime-400" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-lime-400/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-lime-400/20 transition-colors">
                                        <f.icon className="w-7 h-7 text-lime-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{f.title}</h3>
                                    <div className="text-lime-400 font-bold text-sm mb-3">{f.cpm}</div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ WHY US (Split) ═══ */}
            <section className="relative z-10 py-24 px-6 bg-slate-900/50 border-y border-white/5">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-8 leading-tight">
                            Why 10,000+ Publishers <br />
                            <span className="text-lime-400">Choose Us</span>
                        </h2>
                        <div className="space-y-6">
                            {[
                                { icon: Shield, title: "Clean Ad Feed", desc: "3-level security prevents malware, fraud, and bot traffic. Only safe, verified ads." },
                                { icon: DollarSign, title: "eCPM Model", desc: "Performance-based rates. More clicks and conversions = higher earnings. No ceiling." },
                                { icon: Users, title: "Partner Care", desc: "Dedicated manager helps optimize placements, improve strategy, and scale revenue." },
                                { icon: Clock, title: "Fast Payouts", desc: "$5 minimum. Weekly via PayPal, USDT, BTC, Wire Transfer. Always on time." },
                                { icon: TrendingUp, title: "Anti-AdBlock", desc: "Recover up to 40% of lost revenue with our bypass technology." },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 bg-lime-400/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-lime-400/20 transition-colors">
                                        <item.icon className="w-5 h-5 text-lime-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Dashboard Mock */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-lime-400/10 blur-[100px] rounded-full"></div>
                        <div className="relative bg-slate-950 border border-white/10 rounded-2xl p-8 shadow-2xl">
                            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                                <span className="text-gray-400 font-bold text-sm">Publisher Dashboard</span>
                                <span className="text-lime-400 font-bold text-xs flex items-center gap-2"><div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div> Live</span>
                            </div>
                            <div className="text-5xl font-bold mb-2">$12,450.80</div>
                            <div className="text-sm text-green-400 font-bold mb-8">+ $450.20 today (+3.7%)</div>
                            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="text-xl font-bold">847K</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Impressions</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="text-xl font-bold">$5.24</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">eCPM</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="text-xl font-bold">100%</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Fill Rate</div>
                                </div>
                            </div>
                            <div className="h-32 flex items-end gap-1.5">
                                {[35, 50, 45, 65, 55, 75, 60, 85, 70, 100, 80, 90].map((h, i) => (
                                    <div key={i} className="flex-1 bg-lime-400/20 hover:bg-lime-400 transition-colors rounded-t" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-gray-600 font-mono">
                                <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Start Earning in 4 Steps</h2>
                        <p className="text-gray-400">No technical knowledge required. 2 minutes to set up.</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { num: "01", title: "Sign Up", desc: "Create your publisher account. Instant approval, no waiting." },
                            { num: "02", title: "Add Site", desc: "Submit your website or traffic source for quick verification." },
                            { num: "03", title: "Get Code", desc: "Copy our lightweight JavaScript tag. One line of code." },
                            { num: "04", title: "Earn", desc: "Watch revenue grow in real-time. Get paid weekly." },
                        ].map((step, i) => (
                            <div key={i} className="text-center relative">
                                <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl flex items-center justify-center text-slate-900 font-bold text-2xl shadow-[0_0_30px_rgba(163,255,51,0.3)]">
                                    {step.num}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                <p className="text-gray-400 text-sm">{step.desc}</p>
                                {i < 3 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-lime-400/50 to-transparent"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section className="relative z-10 py-24 px-6 border-y border-white/5 bg-slate-900/30">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">What Publishers Say</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: "Alex M.", role: "Gaming · 500K daily", quote: "Switched from AdSense. Revenue tripled in month one. Anti-adblock recovered 30% of lost income.", stars: 5 },
                            { name: "Priya S.", role: "News · 2M daily", quote: "Smart Link monetizes our social traffic that no other network could. $3 eCPM on referral traffic.", stars: 5 },
                            { name: "Dmitri V.", role: "Tech Blog · 200K daily", quote: "Weekly USDT payouts. My account manager helped restructure placements for 40% more revenue.", stars: 5 },
                        ].map((t, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-lime-400/30 transition-colors">
                                <div className="flex gap-0.5 mb-4">{[...Array(t.stars)].map((_, j) => <Star key={j} className="w-4 h-4 text-lime-400 fill-current" />)}</div>
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

            {/* ═══ REQUIREMENTS ═══ */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-12">
                        <h2 className="text-3xl font-bold text-center mb-10">Publisher Requirements</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                "Minimum 1,000 daily visitors",
                                "Legal, original content only",
                                "No copyrighted material",
                                "No adult or illegal content",
                                "Quality traffic (no bots)",
                                "English or major languages"
                            ].map((req, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
                                    <span className="text-gray-300 font-medium">{req}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ FAQ ═══ */}
            <section className="relative z-10 py-24 px-6 bg-slate-900/30 border-y border-white/5">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <PubFAQ question="How much can I earn?" answer="Earnings depend on traffic quality and GEO. Tier-1 traffic earns $5-8+ CPM. Our eCPM model has no ceiling — better traffic performance means higher rates automatically." />
                    <PubFAQ question="What is the minimum payout?" answer="$5 via Paxum. PayPal, Wire Transfer, BTC, and USDT also available with slightly higher minimums. Payouts processed weekly." />
                    <PubFAQ question="Do you support anti-adblock?" answer="Yes. Our anti-adblock solution recovers up to 40% of lost impressions from users running ad blockers, without degrading user experience." />
                    <PubFAQ question="How fast is site approval?" answer="Most sites are approved within minutes. Our automated system checks content quality and traffic patterns in real-time." />
                    <PubFAQ question="Can I use multiple ad formats?" answer="Absolutely. Running multiple formats (e.g., Popunder + In-Page Push) maximizes your revenue per visitor without hurting UX." />
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="bg-gradient-to-br from-lime-400/10 to-transparent border border-lime-400/20 rounded-3xl p-12">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Maximize Revenue?</h2>
                        <p className="text-xl text-gray-400 mb-8">Join 10,000+ publishers earning daily with MrPop.io</p>
                        <Link href="/register?role=publisher" className="inline-flex items-center gap-2 px-10 py-5 bg-lime-400 text-slate-900 rounded-xl font-bold text-lg hover:bg-lime-300 shadow-[0_0_40px_rgba(163,255,51,0.4)] hover:shadow-[0_0_50px_rgba(163,255,51,0.6)] transition-all">
                            Create Publisher Account <ArrowRight className="w-5 h-5" />
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
                                <div className="w-8 h-8 bg-lime-400 rounded-xl flex items-center justify-center"><Zap className="w-4 h-4 text-slate-900 fill-current" /></div>
                                <span className="text-lg font-bold">MrPop.io</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">The highest-paying ad network for serious publishers.</p>
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
                                    {col.links.map((link, j) => <Link key={j} href={link.href} className="block text-sm text-gray-500 hover:text-lime-400 transition-colors">{link.name}</Link>)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between text-xs text-gray-600">
                        <p>© 2026 MrPop.io. All rights reserved.</p>
                        <p>Design Language: Luminous v2.0</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
