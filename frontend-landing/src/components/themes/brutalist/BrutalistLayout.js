'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
    ArrowRight, MousePointer2, Smartphone, Layers, Cpu,
    BarChart3, Zap, Shield, Globe, DollarSign, Clock,
    CheckCircle, Users, TrendingUp, ChevronDown, Star,
    Menu, X, Twitter, Linkedin, Facebook
} from 'lucide-react';
import AuthNavButtons from '@/components/AuthNavButtons';

const navLinks = [
    { name: 'Advertisers', href: '/for-advertisers' },
    { name: 'Publishers', href: '/for-publishers' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
];

function BrutalistNav() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', h);
        return () => window.removeEventListener('scroll', h);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all border-b-2 ${scrolled ? 'bg-background border-foreground py-2' : 'bg-transparent border-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center font-bold transform -rotate-3 group-hover:rotate-0 transition-transform"><Zap className="w-6 h-6 fill-current" /></div>
                    <span className="text-2xl font-black tracking-tighter uppercase">PopReklam</span>
                </Link>
                <div className="hidden lg:flex items-center space-x-6">
                    {navLinks.map(l => <Link key={l.name} href={l.href} className={`text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-white px-2 py-1 transition-colors ${pathname === l.href ? 'bg-primary text-white' : 'text-foreground'}`}>{l.name}</Link>)}
                    <div className="w-0.5 h-6 bg-foreground mx-2"></div>
                    <AuthNavButtons
                        hrefCTA="/register"
                        labelCTA="Get Started"
                        btnClass="bg-accent text-accent-foreground px-5 py-2 font-black uppercase text-sm border-2 border-foreground hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black] transition-all flex items-center gap-1.5"
                        loginClass="text-sm font-bold uppercase hover:underline"
                    />
                </div>
                <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
            </div>
            {mobileOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-background border-b-2 border-foreground p-4 flex flex-col space-y-4">
                    {navLinks.map(l => <Link key={l.name} href={l.href} className="text-lg font-bold uppercase" onClick={() => setMobileOpen(false)}>{l.name}</Link>)}
                    <Link href="/login" className="text-lg font-bold uppercase" onClick={() => setMobileOpen(false)}>Login</Link>
                    <Link href="/register" className="bg-primary text-white text-center py-3 font-bold uppercase border-2 border-foreground" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </div>
            )}
        </nav>
    );
}

function BrutalistFooter() {
    const footerLinks = {
        platform: [
            { name: 'Publishers', href: '/for-publishers' },
            { name: 'Advertisers', href: '/for-advertisers' },
            { name: 'Ad Formats', href: '/ad-formats' },
            { name: 'Smart Link', href: '/smart-link' },
        ],
        resources: [
            { name: 'How It Works', href: '/how-it-works' },
            { name: 'Anti-Adblock', href: '/anti-adblock' },
            { name: 'Documentation', href: '/docs' },
            { name: 'Blog', href: '/blog' },
        ],
        company: [
            { name: 'Contact', href: '/contact' },
            { name: 'FAQ', href: '/faq' },
            { name: 'Status', href: '/status' },
        ],
        legal: [
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
        ],
    };

    return (
        <footer className="py-16 px-4 border-t-2 border-foreground bg-background text-foreground">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-5 gap-12 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2"><div className="w-10 h-10 bg-foreground text-background flex items-center justify-center"><Zap className="w-6 h-6 fill-current" /></div><span className="text-2xl font-black uppercase tracking-tighter">PopReklam</span></div>
                        <p className="font-medium text-sm leading-relaxed border-l-2 border-primary pl-4">The high-performance ad network for serious publishers and advertisers.</p>
                    </div>
                    {[['Platform', footerLinks.platform], ['Resources', footerLinks.resources], ['Company', footerLinks.company], ['Legal', footerLinks.legal]].map(([t, links]) => (
                        <div key={t}><h4 className="font-black uppercase mb-6 text-lg border-b-2 border-border inline-block pb-1">{t}</h4>
                            <ul className="space-y-3 text-sm font-bold">{links.map(l => <li key={l.name}><Link href={l.href} className="hover:text-primary hover:translate-x-1 inline-block transition-transform">{l.name}</Link></li>)}</ul></div>
                    ))}
                </div>
                <div className="pt-8 border-t-2 border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-bold uppercase">
                    <div>© {new Date().getFullYear()} POPREKLAM.</div>
                    <div className="flex gap-4">{[Twitter, Linkedin, Facebook].map((Icon, i) => <Link key={i} href="#" className="border-2 border-foreground p-2 hover:bg-foreground hover:text-background transition-colors"><Icon className="w-5 h-5" /></Link>)}</div>
                </div>
            </div>
        </footer>
    );
}

function FAQItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-2 border-foreground">
            <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center p-6 text-left font-bold text-lg uppercase tracking-wide hover:bg-secondary transition-colors">
                {question}
                <ChevronDown className={`w-6 h-6 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="px-6 pb-6 text-base opacity-80 border-t-2 border-foreground pt-4">{answer}</div>}
        </div>
    );
}

export default function BrutalistLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden theme-brutalist" data-theme="light">
            <BrutalistNav />

            {/* ══════════ HERO ══════════ */}
            <section className="relative pt-32 pb-20 min-h-[90vh] flex flex-col justify-center items-center px-4 overflow-hidden border-b-2 border-foreground">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none opacity-[0.03]">
                    <span className="text-[20vw] font-black leading-none uppercase">REVENUE</span>
                </div>

                <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8">
                    <div className="inline-block border-2 border-foreground px-4 py-1 font-bold uppercase tracking-widest bg-primary text-primary-foreground transform -rotate-2 shadow-[4px_4px_0px_0px_var(--color-foreground)]">
                        Trusted by 10,000+ Publishers
                    </div>

                    <h1 className="text-mega font-black tracking-tighter leading-[0.85] uppercase">
                        TRAFFIC <br />
                        <span className="text-primary italic">MEETS</span> <br />
                        MONEY
                    </h1>

                    <p className="text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed border-l-4 border-primary pl-6 text-left md:text-center md:border-l-0 md:pl-0">
                        The highest-paying ad network built for serious publishers. AI-driven targeting, 100% fill rate, weekly payouts.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                        <Link href="/register?role=publisher"
                            className="bg-foreground text-background text-xl font-bold px-10 py-5 hover:bg-primary hover:text-white transition-colors border-2 border-foreground shadow-[8px_8px_0px_0px_var(--color-accent)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none uppercase tracking-widest">
                            Start Earning →
                        </Link>
                        <Link href="/register?role=advertiser"
                            className="bg-transparent text-foreground text-xl font-bold px-10 py-5 border-2 border-foreground hover:bg-secondary transition-colors uppercase tracking-widest">
                            Launch Ads
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════ MARQUEE ══════════ */}
            <div className="bg-primary text-white py-4 border-y-2 border-foreground overflow-hidden whitespace-nowrap">
                <div className="inline-block animate-marquee">
                    <span className="text-3xl font-black mx-8 uppercase">★ HIGH CPM RATES</span>
                    <span className="text-3xl font-black mx-8 uppercase">★ WEEKLY PAYOUTS</span>
                    <span className="text-3xl font-black mx-8 uppercase">★ 100% FILL RATE</span>
                    <span className="text-3xl font-black mx-8 uppercase">★ ANTI-ADBLOCK</span>
                    <span className="text-3xl font-black mx-8 uppercase">★ REAL-TIME STATS</span>
                    <span className="text-3xl font-black mx-8 uppercase">★ 248 GEOs</span>
                    <span className="text-3xl font-black mx-8 uppercase">★ HIGH CPM RATES</span>
                    <span className="text-3xl font-black mx-8 uppercase">★ WEEKLY PAYOUTS</span>
                </div>
            </div>

            {/* ══════════ STATS ══════════ */}
            <section className="border-b-2 border-foreground">
                <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x-2 divide-foreground">
                    {[
                        { val: "100%", label: "Fill Rate", desc: "Every impression monetized, every country covered." },
                        { val: "$5+", label: "Avg CPM", desc: "Tier-1 traffic earns what it deserves." },
                        { val: "Weekly", label: "Payouts", desc: "BTC, USDT, PayPal, Wire. Always on time." },
                        { val: "248", label: "GEOs", desc: "Global coverage from direct advertisers." },
                    ].map((stat, i) => (
                        <div key={i} className="p-10 text-center group hover:bg-primary hover:text-white transition-colors duration-300">
                            <div className="text-5xl font-black mb-2 group-hover:scale-110 transition-transform">{stat.val}</div>
                            <div className="font-bold tracking-widest uppercase text-sm mb-2">{stat.label}</div>
                            <p className="text-sm opacity-70">{stat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════ WHO IS THIS FOR ══════════ */}
            <section className="py-24 px-4 border-b-2 border-foreground">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
                    <div className="border-2 border-foreground p-12 bg-card hover:bg-primary hover:text-white transition-colors group">
                        <div className="text-6xl font-black mb-6">FOR<br />PUBLISHERS</div>
                        <p className="text-lg mb-8 opacity-80">Maximize revenue from every impression. Our AI-optimized ad feed delivers the highest eCPM rates with clean, safe ads.</p>
                        <ul className="space-y-3 mb-8">
                            {["Up to 70% revenue share", "6 high-impact ad formats", "$5 minimum payout", "Dedicated account manager", "Anti-adblock solution"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-bold"><CheckCircle className="w-5 h-5 flex-shrink-0" /> {item}</li>
                            ))}
                        </ul>
                        <Link href="/register?role=publisher" className="inline-flex items-center gap-2 font-black uppercase tracking-widest border-b-4 border-current pb-1">
                            Join as Publisher <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="border-2 border-foreground border-l-0 p-12 bg-foreground text-background hover:bg-accent transition-colors group">
                        <div className="text-6xl font-black mb-6">FOR<br />ADVERTISERS</div>
                        <p className="text-lg mb-8 opacity-80">Reach high-intent audiences across 248 GEOs. 20+ targeting settings, smart bidding, and real-time analytics.</p>
                        <ul className="space-y-3 mb-8">
                            {["Direct publisher traffic", "Advanced GEO/Device/OS targeting", "Smart CPM & CPA Goal", "$100 minimum deposit", "3-level fraud protection"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-bold"><CheckCircle className="w-5 h-5 flex-shrink-0" /> {item}</li>
                            ))}
                        </ul>
                        <Link href="/register?role=advertiser" className="inline-flex items-center gap-2 font-black uppercase tracking-widest border-b-4 border-current pb-1">
                            Launch Campaign <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════ AD FORMATS ══════════ */}
            <section className="py-24 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <h2 className="text-6xl font-black leading-none uppercase tracking-tighter">
                            Ad Formats <br /><span className="text-outline text-foreground">That Convert</span>
                        </h2>
                        <p className="text-xl max-w-md font-medium border-l-4 border-foreground pl-4">
                            Non-intrusive, high-performing ad units serving 2B+ monthly impressions across all devices.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: "Popunder", desc: "Full-page ads behind the main window. Highest CPM rates, zero banner blindness.", icon: MousePointer2, cpm: "$2-8", color: "bg-primary" },
                            { title: "In-Page Push", desc: "Browser-friendly notifications. No opt-in required. 30X higher CTR than web push.", icon: Smartphone, cpm: "$1-5", color: "bg-accent" },
                            { title: "Interstitial", desc: "Full-screen coverage between pages. Maximum visual impact and engagement.", icon: Layers, cpm: "$1-6", color: "bg-green-500" },
                            { title: "Smart Link", desc: "AI auto-routes to highest-paying offer. Best for social and referral traffic.", icon: Cpu, cpm: "$0.5-3", color: "bg-purple-500" },
                            { title: "Native Ads", desc: "Blend seamlessly with site content. Publishers control colors, sizes, and placement.", icon: BarChart3, cpm: "$0.5-3", color: "bg-yellow-500" },
                            { title: "Banner Ads", desc: "Classic IAB standards. Stable profits for desktop and mobile. Complement any layout.", icon: Zap, cpm: "$0.3-2", color: "bg-orange-500" },
                        ].map((item, i) => (
                            <div key={i} className="border-2 border-foreground p-8 hover:-translate-y-2 transition-transform bg-card relative overflow-hidden group shadow-[8px_8px_0px_0px_var(--color-foreground)]">
                                <div className={`absolute top-0 right-0 w-24 h-24 ${item.color} rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500 opacity-100 border-b-2 border-l-2 border-foreground`}></div>
                                <item.icon className="w-12 h-12 mb-4 relative z-10" />
                                <h3 className="text-2xl font-bold uppercase mb-1 relative z-10">{item.title}</h3>
                                <div className="text-primary font-black text-lg mb-3 relative z-10">{item.cpm} CPM</div>
                                <p className="font-medium opacity-70 relative z-10 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ WHY CHOOSE US ══════════ */}
            <section className="py-24 px-4 bg-secondary border-y-2 border-foreground">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-16 text-center">Why 10,000+ Partners Trust Us</h2>
                    <div className="grid md:grid-cols-3 gap-0">
                        {[
                            { icon: Shield, title: "Ad Safety & Quality", desc: "3-level security system prevents malware, fraud, and bot traffic. Only clean, verified ads reach your users." },
                            { icon: Users, title: "Partner Care", desc: "Beyond support. Dedicated managers help optimize campaigns, improve monetization strategy, and grow your revenue." },
                            { icon: TrendingUp, title: "Performance Tools", desc: "Smart CPM, CPA Goal, Traffic Estimator. Automate bidding and let AI find the best-converting placements." },
                            { icon: Globe, title: "Global Coverage", desc: "Direct publishers from 248 GEOs. Premium traffic from Tier-1 to Tier-3 with competitive rates for every region." },
                            { icon: DollarSign, title: "Competitive eCPM", desc: "Our eCPM model rewards quality. More clicks and conversions = higher earnings. No ceiling on your income." },
                            { icon: Clock, title: "Fast Payouts", desc: "$5 minimum payout. Automated weekly payments via PayPal, USDT, Bitcoin, Wire Transfer, and more." },
                        ].map((item, i) => (
                            <div key={i} className="border-2 border-foreground p-8 -mt-[2px] -ml-[2px] group hover:bg-foreground hover:text-background transition-colors">
                                <item.icon className="w-10 h-10 mb-4 text-primary group-hover:text-accent" />
                                <h3 className="text-xl font-black uppercase mb-3">{item.title}</h3>
                                <p className="opacity-80 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ HOW IT WORKS ══════════ */}
            <section className="py-24 px-4 border-b-2 border-foreground">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-16 text-center">Start in 4 Steps</h2>
                    <div className="grid md:grid-cols-4 gap-0">
                        {[
                            { num: "01", title: "Sign Up", desc: "Create your account in under 2 minutes. No approval delays." },
                            { num: "02", title: "Add Your Site", desc: "Submit your website or traffic source for quick verification." },
                            { num: "03", title: "Get Ad Code", desc: "Copy our lightweight JavaScript tag. One line of code." },
                            { num: "04", title: "Earn Money", desc: "Watch revenue grow in real-time. Get paid weekly." },
                        ].map((step, i) => (
                            <div key={i} className="border-2 border-foreground p-8 -ml-[2px] text-center relative">
                                <div className="text-7xl font-black text-primary mb-4">{step.num}</div>
                                <h3 className="text-xl font-bold uppercase mb-2">{step.title}</h3>
                                <p className="text-sm opacity-70">{step.desc}</p>
                                {i < 3 && <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-primary z-10 bg-background" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ TESTIMONIALS ══════════ */}
            <section className="py-24 px-4 border-b-2 border-foreground">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-16 text-center">What Partners Say</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Alex M.", role: "Publisher • Gaming Niche", quote: "Switched from AdSense to PopReklam. My revenue literally tripled in the first month. The anti-adblock feature alone recovered 30% of lost income." },
                            { name: "Sarah K.", role: "Media Buyer • E-Commerce", quote: "The targeting granularity is insane. I can drill down to OS version and carrier. CPA Goal saved me thousands by auto-optimizing my campaigns." },
                            { name: "Dmitri V.", role: "Publisher • Tech Blog", quote: "Weekly payouts via USDT. No delays, no excuses. My account manager actually helped me optimize ad placements for 40% more revenue." },
                        ].map((t, i) => (
                            <div key={i} className="border-2 border-foreground p-8 shadow-[8px_8px_0px_0px_var(--color-foreground)]">
                                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 text-primary fill-current" />)}</div>
                                <p className="text-lg font-medium mb-6 italic">"{t.quote}"</p>
                                <div className="border-t-2 border-foreground pt-4">
                                    <div className="font-black uppercase">{t.name}</div>
                                    <div className="text-sm opacity-60">{t.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ FAQ ══════════ */}
            <section className="py-24 px-4 border-b-2 border-foreground bg-secondary">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-12 text-center">FAQ</h2>
                    <div className="space-y-0">
                        <FAQItem question="How much can I earn?" answer="Publisher earnings vary by traffic quality and GEO. Tier-1 traffic (US, UK, CA) can earn $5-8+ CPM. Our eCPM model rewards quality — more clicks and conversions mean higher earnings with no ceiling." />
                        <FAQItem question="What is the minimum payout?" answer="Just $5 via Paxum. Other methods like PayPal, Wire, and USDT have slightly higher minimums. Payments are processed weekly, always on time." />
                        <FAQItem question="What ad formats do you support?" answer="We support Popunder, In-Page Push, Interstitial, Smart Link, Native Ads, and Banner Ads. You can run multiple formats simultaneously for maximum revenue." />
                        <FAQItem question="How does fraud protection work?" answer="Our in-house 3-level security system detects and blocks bot traffic, malware, and fraudulent clicks in real-time. Only clean, verified impressions are counted." />
                        <FAQItem question="What targeting options are available?" answer="20+ targeting settings including Country, City, OS, Browser, Device Type, Carrier, Language, and more. Smart CPM automates bidding for best-converting placements." />
                    </div>
                </div>
            </section>

            {/* ══════════ CTA ══════════ */}
            <section className="py-32 text-center px-4 relative overflow-hidden bg-accent text-accent-foreground border-t-2 border-foreground">
                <h2 className="text-[12vw] leading-none font-black text-outline opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none select-none">
                    JOIN US NOW
                </h2>
                <div className="relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 tracking-tighter">
                        Ready to <span className="bg-background text-foreground px-2 border-2 border-foreground shadow-[4px_4px_0px_0px_black]">Dominate?</span>
                    </h2>
                    <p className="text-xl mb-8 opacity-80">Join 10,000+ publishers and advertisers already scaling with us.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register?role=publisher" className="inline-flex items-center gap-4 text-xl font-bold uppercase bg-background text-foreground px-8 py-4 border-2 border-foreground shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            Publisher Signup <ArrowRight className="w-6 h-6" />
                        </Link>
                        <Link href="/register?role=advertiser" className="inline-flex items-center gap-4 text-xl font-bold uppercase border-2 border-current px-8 py-4 hover:bg-background hover:text-foreground transition-colors">
                            Advertiser Signup <ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
            </section>

            <BrutalistFooter />
        </div>
    );
}
