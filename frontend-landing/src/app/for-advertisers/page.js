'use client';

import Link from 'next/link';
import { Target, Users, BarChart2, Globe2, Zap as Lightning, TrendingUp, Shield, ArrowRight, ChevronRight, CheckCircle } from 'lucide-react';
import ThemePageWrapper from '@/components/ThemePageWrapper';

const features = [
    { icon: Target, title: 'Advanced Targeting', description: 'Reach your ideal audience with GEO, device, browser, and OS targeting' },
    { icon: Users, title: 'Premium Traffic', description: 'Access millions of real users from verified, high-quality publisher sites' },
    { icon: BarChart2, title: 'Real-Time Analytics', description: 'Track impressions, clicks, and conversions with detailed reporting' },
    { icon: Shield, title: 'Fraud Protection', description: 'Advanced bot detection and traffic verification built-in' },
    { icon: Lightning, title: 'Instant Delivery', description: 'Campaigns go live within minutes after approval' },
    { icon: TrendingUp, title: 'Scale Infinitely', description: 'No traffic caps - scale your campaigns as much as you need' },
];

const steps = [
    { number: '01', title: 'Create Account', description: 'Sign up as an advertiser in under 2 minutes' },
    { number: '02', title: 'Add Funds', description: 'Deposit via PayPal, card, or cryptocurrency' },
    { number: '03', title: 'Launch Campaign', description: 'Set targeting, budget, and bid - we\'ll optimize delivery' },
    { number: '04', title: 'Track Results', description: 'Monitor performance and ROI in real-time' },
];

const pricingTiers = [
    { geo: 'Tier 1 (US, UK, CA)', cpm: '$3.00 - $8.00', description: 'Premium English-speaking markets' },
    { geo: 'Tier 2 (EU, AU, JP)', cpm: '$1.50 - $4.00', description: 'Developed European & Asian markets' },
    { geo: 'Tier 3 (Worldwide)', cpm: '$0.50 - $2.00', description: 'Global traffic at scale' },
];

const targetingOptions = [
    { title: 'Geographic', items: ['Country', 'City', 'State/Region'] },
    { title: 'Device', items: ['Desktop', 'Mobile', 'Tablet'] },
    { title: 'Technology', items: ['Browser', 'OS', 'Language'] },
];

const adFormats = [
    { name: 'Popunder', desc: 'Full-page ads behind main window' },
    { name: 'In-Page Push', desc: 'Native push notifications' },
    { name: 'Native Ads', desc: 'Blend with site content' },
];

export default function ForAdvertisersPage() {
    return (
        <ThemePageWrapper>
            {(theme) => {
                const isDark = theme !== 'theme-brutalist' && theme !== 'theme-editorial';
                const isEditorial = theme === 'theme-editorial';
                const isBrutalist = theme === 'theme-brutalist';
                const accentBg = theme === 'theme-luminous' ? 'bg-lime-400/10' : theme === 'theme-azure' ? 'bg-sky-500/10' : isEditorial ? 'bg-red-700/10' : isBrutalist ? 'bg-accent/10' : 'bg-white/5';
                const accentText = theme === 'theme-luminous' ? 'text-lime-400' : theme === 'theme-azure' ? 'text-sky-400' : isEditorial ? 'text-red-700' : isBrutalist ? 'text-primary' : 'text-white';
                const cardCls = isBrutalist ? 'border-2 border-foreground bg-card p-6 hover:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all'
                    : isEditorial ? 'border border-gray-300 bg-white p-6 hover:border-red-700/30 transition-all'
                        : 'bg-white/[0.03] border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all backdrop-blur';
                const sectionCls = isBrutalist ? 'border-2 border-foreground bg-card p-12'
                    : isEditorial ? 'border border-gray-300 bg-white p-12'
                        : 'bg-white/[0.03] border border-white/10 p-12 rounded-3xl backdrop-blur';
                const btnPrimary = isBrutalist ? 'bg-foreground text-background font-black uppercase tracking-wider border-2 border-foreground hover:bg-accent hover:text-foreground'
                    : isEditorial ? 'bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700'
                        : theme === 'theme-luminous' ? 'bg-lime-400 text-slate-900 font-bold rounded-xl shadow-[0_0_30px_rgba(163,255,51,0.3)] hover:bg-lime-300'
                            : theme === 'theme-azure' ? 'bg-sky-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:bg-sky-400'
                                : 'bg-white text-black font-semibold rounded-xl hover:bg-gray-100';
                const btnSecondary = isBrutalist ? 'border-2 border-foreground font-bold uppercase hover:bg-foreground hover:text-background'
                    : isEditorial ? 'border border-gray-300 font-bold text-xs uppercase tracking-widest hover:border-red-700'
                        : 'border border-white/20 rounded-xl font-bold hover:border-white/40 hover:bg-white/5';

                return (
                    <div className="relative z-10">
                        {/* Hero */}
                        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
                            <div className="max-w-4xl mx-auto">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 ${accentBg} rounded-full ${accentText} text-sm font-medium mb-6`}>
                                    <Globe2 className="w-4 h-4" /> Reach Millions of Users Worldwide
                                </div>
                                <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${isBrutalist ? 'uppercase tracking-tighter font-black' : ''}`}>
                                    Scale Your Business With <span className={accentText}>Premium Traffic</span>
                                </h1>
                                <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : isEditorial ? 'text-gray-500' : 'text-muted-foreground'}`}>
                                    Launch high-converting pop ad campaigns with advanced targeting. Pay only for real impressions from quality publishers.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link href="/register?role=advertiser" className={`px-8 py-4 text-lg flex items-center gap-2 transition-all ${btnPrimary}`}>Launch Campaign <ArrowRight className="w-5 h-5" /></Link>
                                    <Link href="/login" className={`px-8 py-4 text-lg transition-all ${btnSecondary}`}>Sign In</Link>
                                </div>
                                <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
                                    {[['5B+', 'Monthly Impressions'], ['$100', 'Min Deposit'], ['99.9%', 'Uptime']].map(([v, l]) => (
                                        <div key={l} className="text-center"><div className={`text-4xl font-bold ${accentText} mb-2`}>{v}</div><div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{l}</div></div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Features */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-16 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Why Advertisers Choose Us</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {features.map((f, i) => (
                                    <div key={i} className={`${cardCls} group`}>
                                        <div className={`w-12 h-12 ${accentBg} rounded-xl flex items-center justify-center mb-4`}><f.icon className={`w-6 h-6 ${accentText}`} /></div>
                                        <h3 className={`text-xl font-bold mb-2 ${isBrutalist ? 'uppercase' : ''}`}>{f.title}</h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{f.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Steps */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Launch Your First Campaign</h2>
                            <p className={`text-center mb-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Start driving traffic in minutes</p>
                            <div className="grid md:grid-cols-4 gap-8">
                                {steps.map((s, i) => (
                                    <div key={i} className="text-center">
                                        <div className={`w-16 h-16 mx-auto mb-4 ${isBrutalist ? 'border-2 border-foreground bg-accent' : isEditorial ? 'border border-gray-300 bg-white' : `bg-gradient-to-br ${theme === 'theme-azure' ? 'from-sky-500 to-blue-600' : 'from-lime-400 to-green-500'}`} ${!isBrutalist && !isEditorial ? 'rounded-2xl shadow-lg' : ''} flex items-center justify-center font-bold text-2xl ${isDark && !isBrutalist ? (theme === 'theme-azure' ? 'text-white' : 'text-slate-900') : ''}`}>{s.number}</div>
                                        <h3 className={`text-xl font-bold mb-2 ${isBrutalist ? 'uppercase' : ''}`}>{s.title}</h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{s.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Pricing */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Transparent CPM Pricing</h2>
                            <p className={`text-center mb-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pay only for real impressions</p>
                            <div className="grid md:grid-cols-3 gap-6">
                                {pricingTiers.map((t, i) => (
                                    <div key={i} className={cardCls}>
                                        <h3 className="text-xl font-bold mb-2">{t.geo}</h3>
                                        <div className={`text-4xl font-bold ${accentText} mb-2`}>{t.cpm}</div>
                                        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.description}</p>
                                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Per 1,000 impressions</div>
                                    </div>
                                ))}
                            </div>
                            <p className={`text-center mt-12 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>* Pricing varies based on targeting, ad format, and traffic quality</p>
                        </section>

                        {/* Targeting */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <div className={sectionCls}>
                                <h2 className={`text-3xl md:text-4xl font-bold mb-8 text-center ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Advanced Targeting Options</h2>
                                <div className="grid md:grid-cols-3 gap-x-8 gap-y-6 max-w-4xl mx-auto">
                                    {targetingOptions.map((cat, ci) => (
                                        <div key={ci}><h3 className={`text-lg font-bold ${accentText} mb-4 ${isBrutalist ? 'uppercase' : ''}`}>{cat.title}</h3>
                                            <div className="space-y-2">{cat.items.map((item, ii) => (
                                                <div key={ii} className="flex items-center gap-2"><CheckCircle className={`w-4 h-4 ${accentText} flex-shrink-0`} /><span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item}</span></div>
                                            ))}</div></div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Ad Formats */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-16 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Available Ad Formats</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {adFormats.map((f, i) => (
                                    <div key={i} className={`${cardCls} text-center`}>
                                        <div className={`w-16 h-16 ${accentBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}><Target className={`w-8 h-8 ${accentText}`} /></div>
                                        <h3 className="text-2xl font-bold mb-2">{f.name}</h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* CTA */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <div className={`${sectionCls} text-center`}>
                                <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Ready to Scale Your Traffic?</h2>
                                <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Start your first campaign with just $100 minimum deposit</p>
                                <Link href="/register?role=advertiser" className={`inline-flex items-center gap-2 px-10 py-5 text-lg transition-all ${btnPrimary}`}>Create Advertiser Account <ChevronRight className="w-5 h-5" /></Link>
                            </div>
                        </section>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
