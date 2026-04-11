'use client';

import Link from 'next/link';
import { TrendingUp, DollarSign, Clock, Shield, BarChart3, Wallet, Globe, CheckCircle, ArrowRight, ChevronRight } from 'lucide-react';
import ThemePageWrapper from '@/components/ThemePageWrapper';

const features = [
    { icon: DollarSign, title: 'High Revenue Share', description: 'Earn up to 70% revenue share - one of the highest in the industry' },
    { icon: TrendingUp, title: 'Premium CPM Rates', description: 'Top-tier CPM rates varying by geography and traffic quality' },
    { icon: Clock, title: 'Weekly Payouts', description: 'Get paid weekly once you reach the $50 minimum threshold' },
    { icon: Shield, title: '100% Fill Rate', description: 'Never miss an impression with our extensive advertiser network' },
    { icon: BarChart3, title: 'Real-Time Analytics', description: 'Track your earnings, impressions, and performance in real-time' },
    { icon: Wallet, title: 'Multiple Payment Methods', description: 'PayPal, Wire Transfer, Bitcoin - choose what works for you' },
];

const steps = [
    { number: '01', title: 'Sign Up', description: 'Create your publisher account in under 2 minutes' },
    { number: '02', title: 'Add Your Site', description: 'Submit your website for quick approval' },
    { number: '03', title: 'Get Ad Code', description: 'Copy and paste our lightweight ad code' },
    { number: '04', title: 'Start Earning', description: 'Watch your revenue grow with every impression' },
];

const adFormats = [
    { name: 'Popunder', cpm: '$2-8 CPM', best: 'High-traffic sites' },
    { name: 'In-Page Push', cpm: '$1-5 CPM', best: 'Engaged audiences' },
    { name: 'Native Ads', cpm: '$0.5-3 CPM', best: 'Content sites' },
];

const requirements = [
    'Minimum 1,000 daily visitors', 'Legal, original content', 'No copyrighted material',
    'No adult/illegal content', 'Quality traffic (no bots)', 'English or major languages',
];

export default function ForPublishersPage() {
    return (
        <ThemePageWrapper>
            {(theme) => {
                const isDark = theme !== 'theme-brutalist' && theme !== 'theme-editorial';
                const isEditorial = theme === 'theme-editorial';
                const isBrutalist = theme === 'theme-brutalist';
                const accent = theme === 'theme-luminous' ? 'lime-400' : theme === 'theme-azure' ? 'sky-400' : isEditorial ? 'red-700' : isBrutalist ? 'primary' : 'white';
                const accentBg = theme === 'theme-luminous' ? 'bg-lime-400/10' : theme === 'theme-azure' ? 'bg-sky-500/10' : isEditorial ? 'bg-red-700/10' : isBrutalist ? 'bg-accent/10' : 'bg-white/5';
                const accentText = theme === 'theme-luminous' ? 'text-lime-400' : theme === 'theme-azure' ? 'text-sky-400' : isEditorial ? 'text-red-700' : isBrutalist ? 'text-primary' : 'text-white';
                const cardCls = isBrutalist ? 'border-2 border-foreground bg-card p-6 hover:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all'
                    : isEditorial ? 'border border-gray-300 bg-white p-6 hover:border-red-700/30 transition-all'
                        : `bg-white/[0.03] border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all backdrop-blur`;
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
                                <div className={`inline-flex items-center gap-2 px-4 py-2 ${accentBg} border border-current/20 rounded-full ${accentText} text-sm font-medium mb-6`}>
                                    <TrendingUp className="w-4 h-4" /> Join 10,000+ Publishers Earning Daily
                                </div>
                                <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${isBrutalist ? 'uppercase tracking-tighter font-black' : ''}`}>
                                    Turn Your Traffic Into <span className={accentText}>Revenue</span>
                                </h1>
                                <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : isEditorial ? 'text-gray-500' : 'text-muted-foreground'}`}>
                                    Monetize your website with premium pop ads. Earn up to 70% revenue share with the highest CPM rates in the market.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link href="/register?role=publisher" className={`px-8 py-4 text-lg flex items-center gap-2 transition-all ${btnPrimary}`}>Get Started Free <ArrowRight className="w-5 h-5" /></Link>
                                    <Link href="/login" className={`px-8 py-4 text-lg transition-all ${btnSecondary}`}>Sign In</Link>
                                </div>
                                <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
                                    {[['70%', 'Revenue Share'], ['$50', 'Min Payout'], ['24/7', 'Support']].map(([val, label]) => (
                                        <div key={label} className="text-center"><div className={`text-4xl font-bold ${accentText} mb-2`}>{val}</div><div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div></div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Features */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-16 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Why Choose PopReklam?</h2>
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
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Start Earning in 4 Simple Steps</h2>
                            <p className={`text-center mb-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No technical knowledge required</p>
                            <div className="grid md:grid-cols-4 gap-8">
                                {steps.map((s, i) => (
                                    <div key={i} className="text-center">
                                        <div className={`w-16 h-16 mx-auto mb-4 ${isBrutalist ? 'border-2 border-foreground bg-accent' : isEditorial ? 'border border-gray-300 bg-white' : `bg-gradient-to-br ${theme === 'theme-azure' ? 'from-sky-500 to-blue-600' : 'from-lime-400 to-green-500'}`} ${!isBrutalist && !isEditorial ? 'rounded-2xl shadow-lg' : ''} flex items-center justify-center font-bold text-2xl ${isDark && !isBrutalist ? 'text-slate-900' : ''}`}>{s.number}</div>
                                        <h3 className={`text-xl font-bold mb-2 ${isBrutalist ? 'uppercase' : ''}`}>{s.title}</h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{s.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Ad Formats */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-16 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Available Ad Formats</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {adFormats.map((f, i) => (
                                    <div key={i} className={`${cardCls} text-center`}>
                                        <Globe className={`w-12 h-12 ${accentText} mx-auto mb-4`} />
                                        <h3 className="text-2xl font-bold mb-2">{f.name}</h3>
                                        <div className={`text-3xl font-bold ${accentText} mb-2`}>{f.cpm}</div>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Best for: {f.best}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Requirements */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <div className={sectionCls}>
                                <h2 className={`text-3xl md:text-4xl font-bold mb-8 text-center ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Publisher Requirements</h2>
                                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                                    {requirements.map((r, i) => (
                                        <div key={i} className="flex items-center gap-3"><CheckCircle className={`w-5 h-5 ${accentText} flex-shrink-0`} /><span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{r}</span></div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* CTA */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <div className={`${sectionCls} text-center`}>
                                <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Ready to Start Earning?</h2>
                                <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Join thousands of publishers earning daily with PopReklam</p>
                                <Link href="/register?role=publisher" className={`inline-flex items-center gap-2 px-10 py-5 text-lg transition-all ${btnPrimary}`}>Create Publisher Account <ChevronRight className="w-5 h-5" /></Link>
                            </div>
                        </section>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
