'use client';

import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
    ArrowRight, MousePointer2, Smartphone, Layers, Cpu,
    BarChart3, Zap, Shield, Globe, DollarSign, Clock,
    CheckCircle, Users, TrendingUp, ChevronDown, Star,
    Menu, X, Twitter, Linkedin, Facebook
} from 'lucide-react';
import AuthNavButtons from '@/components/AuthNavButtons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

const navLinks = [
    { tKey: 'advertisers', href: '/for-advertisers' },
    { tKey: 'publishers', href: '/for-publishers' },
    { tKey: 'howItWorks', href: '/how-it-works' },
    { tKey: 'faq', href: '/faq' },
    { tKey: 'contact', href: '/contact' },
];

function BrutalistNav() {
    const t = useTranslations('nav');
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
                    <span className="text-2xl font-black tracking-tighter uppercase">MrPop.io</span>
                </Link>
                <div className="hidden lg:flex items-center space-x-6">
                    {navLinks.map(l => <Link key={l.tKey} href={l.href} className={`text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-white px-2 py-1 transition-colors ${pathname === l.href ? 'bg-primary text-white' : 'text-foreground'}`}>{t(l.tKey)}</Link>)}
                    <div className="w-0.5 h-6 bg-foreground mx-2"></div>
                    <LanguageSwitcher dark={false} />
                    <AuthNavButtons
                        hrefCTA="/register"
                        labelCTA={t('getStarted')}
                        btnClass="bg-accent text-accent-foreground px-5 py-2 font-black uppercase text-sm border-2 border-foreground hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black] transition-all flex items-center gap-1.5"
                        loginClass="text-sm font-bold uppercase hover:underline"
                    />
                </div>
                <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
            </div>
            {mobileOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-background border-b-2 border-foreground p-4 flex flex-col space-y-4">
                    {navLinks.map(l => <Link key={l.tKey} href={l.href} className="text-lg font-bold uppercase" onClick={() => setMobileOpen(false)}>{t(l.tKey)}</Link>)}
                    <Link href="/login" className="text-lg font-bold uppercase" onClick={() => setMobileOpen(false)}>{t('login')}</Link>
                    <Link href="/register" className="bg-primary text-white text-center py-3 font-bold uppercase border-2 border-foreground" onClick={() => setMobileOpen(false)}>{t('getStarted')}</Link>
                </div>
            )}
        </nav>
    );
}

function BrutalistFooter() {
    const t = useTranslations('footer');
    
    // Fallback logic incase some keys aren't in footer namespace yet
    const safeT = (key, fallback) => {
        try { return t(key); } catch (e) { return fallback; }
    };

    const footerLinks = {
        platform: [
            { name: safeT('links.publishers', 'Publishers'), href: '/for-publishers' },
            { name: safeT('links.advertisers', 'Advertisers'), href: '/for-advertisers' },
            { name: safeT('links.adFormats', 'Ad Formats'), href: '/ad-formats' },
            { name: safeT('links.smartLink', 'Smart Link'), href: '/smart-link' },
        ],
        resources: [
            { name: safeT('links.howItWorks', 'How It Works'), href: '/how-it-works' },
            { name: safeT('links.antiAdblock', 'Anti-Adblock'), href: '/anti-adblock' },
            { name: safeT('links.docs', 'Documentation'), href: '/docs' },
            { name: safeT('links.blog', 'Blog'), href: '/blog' },
        ],
        company: [
            { name: safeT('links.contact', 'Contact'), href: '/contact' },
            { name: safeT('links.faq', 'FAQ'), href: '/faq' },
            { name: safeT('links.status', 'Status'), href: '/status' },
        ],
        legal: [
            { name: safeT('links.privacy', 'Privacy Policy'), href: '/privacy' },
            { name: safeT('links.terms', 'Terms of Service'), href: '/terms' },
        ],
    };

    return (
        <footer className="py-16 px-4 border-t-2 border-foreground bg-background text-foreground">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-5 gap-12 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2"><div className="w-10 h-10 bg-foreground text-background flex items-center justify-center"><Zap className="w-6 h-6 fill-current" /></div><span className="text-2xl font-black uppercase tracking-tighter">MrPop.io</span></div>
                        <p className="font-medium text-sm leading-relaxed border-l-2 border-primary pl-4">{safeT('tagline', 'The high-performance ad network for serious publishers and advertisers.')}</p>
                    </div>
                    {[[safeT('platform', 'Platform'), footerLinks.platform], [safeT('resources', 'Resources'), footerLinks.resources], [safeT('company', 'Company'), footerLinks.company], [safeT('legal', 'Legal'), footerLinks.legal]].map(([title, links]) => (
                        <div key={title}><h4 className="font-black uppercase mb-6 text-lg border-b-2 border-border inline-block pb-1">{title}</h4>
                            <ul className="space-y-3 text-sm font-bold">{links.map(l => <li key={l.name}><Link href={l.href} className="hover:text-primary hover:translate-x-1 inline-block transition-transform">{l.name}</Link></li>)}</ul></div>
                    ))}
                </div>
                <div className="pt-8 border-t-2 border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-bold uppercase">
                    <div>© {new Date().getFullYear()} MRPOP.IO</div>
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
    const t = useTranslations('themes.brutalist');

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
                        {t('trustedBy')}
                    </div>

                    <h1 
                        className="text-mega font-black tracking-tighter leading-[0.85] uppercase"
                        dangerouslySetInnerHTML={{ __html: t.raw('heroTitleHtml') || "TRAFFIC <br /> <span class=\"text-primary italic\">MEETS</span> <br /> MONEY" }}
                    />

                    <p className="text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed border-l-4 border-primary pl-6 text-left md:text-center md:border-l-0 md:pl-0">
                        {t('heroDesc')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                        <Link href="/register?role=publisher"
                            className="bg-foreground text-background text-xl font-bold px-10 py-5 hover:bg-primary hover:text-white transition-colors border-2 border-foreground shadow-[8px_8px_0px_0px_var(--color-accent)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none uppercase tracking-widest">
                            {t('startEarning')}
                        </Link>
                        <Link href="/register?role=advertiser"
                            className="bg-transparent text-foreground text-xl font-bold px-10 py-5 border-2 border-foreground hover:bg-secondary transition-colors uppercase tracking-widest">
                            {t('launchAds')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════ MARQUEE ══════════ */}
            <div className="bg-primary text-white py-4 border-y-2 border-foreground overflow-hidden whitespace-nowrap">
                <div className="inline-block animate-marquee">
                    <span className="text-3xl font-black mx-8 uppercase">{t('marquee.highCpm')}</span>
                    <span className="text-3xl font-black mx-8 uppercase">{t('marquee.weekly')}</span>
                    <span className="text-3xl font-black mx-8 uppercase">{t('marquee.fill')}</span>
                    <span className="text-3xl font-black mx-8 uppercase">{t('marquee.antiAdblock')}</span>
                    <span className="text-3xl font-black mx-8 uppercase">{t('marquee.realtime')}</span>
                    <span className="text-3xl font-black mx-8 uppercase">{t('marquee.geos')}</span>
                    <span className="text-3xl font-black mx-8 uppercase">{t('marquee.highCpm')}</span>
                    <span className="text-3xl font-black mx-8 uppercase">{t('marquee.weekly')}</span>
                </div>
            </div>

            {/* ══════════ STATS ══════════ */}
            <section className="border-b-2 border-foreground">
                <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x-2 divide-foreground">
                    {[
                        { val: "100%", label: t('stats.fillRate.label'), desc: t('stats.fillRate.desc') },
                        { val: "$5+", label: t('stats.avgCpm.label'), desc: t('stats.avgCpm.desc') },
                        { val: "Weekly", label: t('stats.payouts.label'), desc: t('stats.payouts.desc') },
                        { val: "248", label: t('stats.geos.label'), desc: t('stats.geos.desc') },
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
                        <div className="text-6xl font-black mb-6" dangerouslySetInnerHTML={{ __html: t.raw('forPublishers.titleHtml') }}></div>
                        <p className="text-lg mb-8 opacity-80">{t('forPublishers.desc')}</p>
                        <ul className="space-y-3 mb-8">
                            {[t('forPublishers.b1'), t('forPublishers.b2'), t('forPublishers.b3'), t('forPublishers.b4'), t('forPublishers.b5')].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-bold"><CheckCircle className="w-5 h-5 flex-shrink-0" /> {item}</li>
                            ))}
                        </ul>
                        <Link href="/register?role=publisher" className="inline-flex items-center gap-2 font-black uppercase tracking-widest border-b-4 border-current pb-1">
                            {t('forPublishers.cta')} <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="border-2 border-foreground border-l-0 p-12 bg-foreground text-background hover:bg-accent transition-colors group">
                        <div className="text-6xl font-black mb-6" dangerouslySetInnerHTML={{ __html: t.raw('forAdvertisers.titleHtml') }}></div>
                        <p className="text-lg mb-8 opacity-80">{t('forAdvertisers.desc')}</p>
                        <ul className="space-y-3 mb-8">
                            {[t('forAdvertisers.b1'), t('forAdvertisers.b2'), t('forAdvertisers.b3'), t('forAdvertisers.b4'), t('forAdvertisers.b5')].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-bold"><CheckCircle className="w-5 h-5 flex-shrink-0" /> {item}</li>
                            ))}
                        </ul>
                        <Link href="/register?role=advertiser" className="inline-flex items-center gap-2 font-black uppercase tracking-widest border-b-4 border-current pb-1">
                            {t('forAdvertisers.cta')} <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════ AD FORMATS ══════════ */}
            <section className="py-24 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <h2 className="text-6xl font-black leading-none uppercase tracking-tighter" dangerouslySetInnerHTML={{ __html: t.raw('adFormats.titleHtml') }}>
                        </h2>
                        <p className="text-xl max-w-md font-medium border-l-4 border-foreground pl-4">
                            {t('adFormats.desc')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: t('adFormats.popunder.title'), desc: t('adFormats.popunder.desc'), icon: MousePointer2, cpm: "$2-8", color: "bg-primary" },
                            { title: t('adFormats.push.title'), desc: t('adFormats.push.desc'), icon: Smartphone, cpm: "$1-5", color: "bg-accent" },
                            { title: t('adFormats.interstitial.title'), desc: t('adFormats.interstitial.desc'), icon: Layers, cpm: "$1-6", color: "bg-green-500" },
                            { title: t('adFormats.smartLink.title'), desc: t('adFormats.smartLink.desc'), icon: Cpu, cpm: "$0.5-3", color: "bg-purple-500" },
                            { title: t('adFormats.native.title'), desc: t('adFormats.native.desc'), icon: BarChart3, cpm: "$0.5-3", color: "bg-yellow-500" },
                            { title: t('adFormats.banner.title'), desc: t('adFormats.banner.desc'), icon: Zap, cpm: "$0.3-2", color: "bg-orange-500" },
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
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-16 text-center">{t('whyUs.title')}</h2>
                    <div className="grid md:grid-cols-3 gap-0">
                        {[
                            { icon: Shield, title: t('whyUs.safety.title'), desc: t('whyUs.safety.desc') },
                            { icon: Users, title: t('whyUs.care.title'), desc: t('whyUs.care.desc') },
                            { icon: TrendingUp, title: t('whyUs.tools.title'), desc: t('whyUs.tools.desc') },
                            { icon: Globe, title: t('whyUs.global.title'), desc: t('whyUs.global.desc') },
                            { icon: DollarSign, title: t('whyUs.ecpm.title'), desc: t('whyUs.ecpm.desc') },
                            { icon: Clock, title: t('whyUs.payouts.title'), desc: t('whyUs.payouts.desc') },
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
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-16 text-center">{t('steps.title')}</h2>
                    <div className="grid md:grid-cols-4 gap-0">
                        {[
                            { num: "01", title: t('steps.s1.title'), desc: t('steps.s1.desc') },
                            { num: "02", title: t('steps.s2.title'), desc: t('steps.s2.desc') },
                            { num: "03", title: t('steps.s3.title'), desc: t('steps.s3.desc') },
                            { num: "04", title: t('steps.s4.title'), desc: t('steps.s4.desc') },
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
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-16 text-center">{t('testimonials.title')}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: t('testimonials.t1.name'), role: t('testimonials.t1.role'), quote: t('testimonials.t1.quote') },
                            { name: t('testimonials.t2.name'), role: t('testimonials.t2.role'), quote: t('testimonials.t2.quote') },
                            { name: t('testimonials.t3.name'), role: t('testimonials.t3.role'), quote: t('testimonials.t3.quote') },
                        ].map((item, i) => (
                            <div key={i} className="border-2 border-foreground p-8 shadow-[8px_8px_0px_0px_var(--color-foreground)]">
                                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 text-primary fill-current" />)}</div>
                                <p className="text-lg font-medium mb-6 italic">"{item.quote}"</p>
                                <div className="border-t-2 border-foreground pt-4">
                                    <div className="font-black uppercase">{item.name}</div>
                                    <div className="text-sm opacity-60">{item.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ FAQ ══════════ */}
            <section className="py-24 px-4 border-b-2 border-foreground bg-secondary">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-12 text-center">{t('faq.title')}</h2>
                    <div className="space-y-0">
                        <FAQItem question={t('faq.q1.q')} answer={t('faq.q1.a')} />
                        <FAQItem question={t('faq.q2.q')} answer={t('faq.q2.a')} />
                        <FAQItem question={t('faq.q3.q')} answer={t('faq.q3.a')} />
                        <FAQItem question={t('faq.q4.q')} answer={t('faq.q4.a')} />
                        <FAQItem question={t('faq.q5.q')} answer={t('faq.q5.a')} />
                    </div>
                </div>
            </section>

            {/* ══════════ CTA ══════════ */}
            <section className="py-32 text-center px-4 relative overflow-hidden bg-accent text-accent-foreground border-t-2 border-foreground">
                <h2 className="text-[12vw] leading-none font-black text-outline opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none select-none">
                    {t('cta.bgText')}
                </h2>
                <div className="relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 tracking-tighter">
                        {t('cta.title1')} <span className="bg-background text-foreground px-2 border-2 border-foreground shadow-[4px_4px_0px_0px_black]">{t('cta.title2')}</span>
                    </h2>
                    <p className="text-xl mb-8 opacity-80">{t('cta.subtitle')}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register?role=publisher" className="inline-flex items-center gap-4 text-xl font-bold uppercase bg-background text-foreground px-8 py-4 border-2 border-foreground shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            {t('cta.publisher')} <ArrowRight className="w-6 h-6" />
                        </Link>
                        <Link href="/register?role=advertiser" className="inline-flex items-center gap-4 text-xl font-bold uppercase border-2 border-current px-8 py-4 hover:bg-background hover:text-foreground transition-colors">
                            {t('cta.advertiser')} <ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
            </section>

            <BrutalistFooter />
        </div>
    );
}
