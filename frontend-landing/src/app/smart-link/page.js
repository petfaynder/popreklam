'use client';

import Link from 'next/link';
import { Cpu, ArrowRight, CheckCircle, TrendingUp, Globe, Zap, BarChart3, Shield, Smartphone, DollarSign } from 'lucide-react';
import ThemePageWrapper from '@/components/ThemePageWrapper';

const benefits = [
    { icon: Cpu, title: 'AI-Powered Routing', description: 'Our algorithms analyze user data in real-time to route each click to the highest-paying offer automatically.' },
    { icon: TrendingUp, title: 'Auto-Optimization', description: 'Continuously learns and adapts. The longer you run, the higher your earnings climb.' },
    { icon: Globe, title: 'Global Coverage', description: 'Offers available for 248+ GEOs. Every click is monetized regardless of user location.' },
    { icon: DollarSign, title: 'High Conversion Rates', description: 'Smart matching between user intent and offer type delivers 3x higher conversion rates.' },
    { icon: Smartphone, title: 'Any Traffic Source', description: 'Works with social media, email, direct, organic — no website required to start earning.' },
    { icon: Shield, title: 'Clean Offers Only', description: 'All offers are vetted. No malware, no misleading content. Safe for your audience.' },
];

const steps = [
    { num: '01', title: 'Get Your Link', desc: 'Sign up and generate your unique Smart Link in seconds.' },
    { num: '02', title: 'Share Anywhere', desc: 'Post on social media, embed in emails, share in messages.' },
    { num: '03', title: 'AI Optimizes', desc: 'Our system routes each click to the best-paying offer.' },
    { num: '04', title: 'Earn Daily', desc: 'Watch your earnings grow in real-time. Get paid weekly.' },
];

const useCases = [
    'Social media influencers', 'Telegram channel owners', 'YouTube creators',
    'Email marketers', 'URL shortener services', 'Forum & community managers',
];

export default function SmartLinkPage() {
    return (
        <ThemePageWrapper>
            {(theme) => {
                const isDark = theme !== 'theme-brutalist' && theme !== 'theme-editorial';
                const isEditorial = theme === 'theme-editorial';
                const isBrutalist = theme === 'theme-brutalist';
                const accentText = theme === 'theme-luminous' ? 'text-lime-400' : theme === 'theme-azure' ? 'text-sky-400' : isEditorial ? 'text-red-700' : isBrutalist ? 'text-primary' : 'text-white';
                const accentBg = theme === 'theme-luminous' ? 'bg-lime-400/10' : theme === 'theme-azure' ? 'bg-sky-500/10' : isEditorial ? 'bg-red-700/10' : isBrutalist ? 'bg-accent/10' : 'bg-white/5';
                const cardCls = isBrutalist ? 'border-2 border-foreground bg-card p-8 hover:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all'
                    : isEditorial ? 'border border-gray-300 bg-white p-8 hover:border-red-700/30 transition-all'
                        : 'bg-white/[0.03] border border-white/10 p-8 rounded-2xl hover:border-white/20 transition-all backdrop-blur';
                const sectionCls = isBrutalist ? 'border-2 border-foreground bg-card p-12'
                    : isEditorial ? 'border border-gray-300 bg-white p-12'
                        : 'bg-white/[0.03] border border-white/10 p-12 rounded-3xl backdrop-blur';
                const btnPrimary = isBrutalist ? 'bg-foreground text-background font-black uppercase tracking-wider border-2 border-foreground hover:bg-accent hover:text-foreground'
                    : isEditorial ? 'bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700'
                        : theme === 'theme-luminous' ? 'bg-lime-400 text-slate-900 font-bold rounded-xl shadow-[0_0_30px_rgba(163,255,51,0.3)] hover:bg-lime-300'
                            : theme === 'theme-azure' ? 'bg-sky-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:bg-sky-400'
                                : 'bg-white text-black font-semibold rounded-xl hover:bg-gray-100';

                return (
                    <div className="relative z-10">
                        {/* Hero */}
                        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
                            <div className="max-w-4xl mx-auto">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 ${accentBg} border border-current/20 rounded-full ${accentText} text-sm font-medium mb-6`}>
                                    <Cpu className="w-4 h-4" /> AI-Powered Monetization
                                </div>
                                <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${isBrutalist ? 'uppercase tracking-tighter font-black' : ''}`}>
                                    One Link, <span className={accentText}>Maximum Revenue</span>
                                </h1>
                                <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : isEditorial ? 'text-gray-500' : 'text-muted-foreground'}`}>
                                    Smart Link uses AI to automatically route each visitor to the highest-paying offer. No website needed — monetize any traffic source instantly.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link href="/register?role=publisher" className={`px-8 py-4 text-lg flex items-center gap-2 transition-all ${btnPrimary}`}>Get Your Smart Link <ArrowRight className="w-5 h-5" /></Link>
                                </div>
                                <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
                                    {[['248+', 'GEOs Covered'], ['3X', 'Higher Conversions'], ['$0', 'Setup Cost']].map(([val, label]) => (
                                        <div key={label} className="text-center"><div className={`text-4xl font-bold ${accentText} mb-2`}>{val}</div><div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div></div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Benefits */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-16 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Why Smart Link?</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {benefits.map((b, i) => (
                                    <div key={i} className={cardCls}>
                                        <div className={`w-12 h-12 ${accentBg} ${isBrutalist ? '' : 'rounded-xl'} flex items-center justify-center mb-4`}><b.icon className={`w-6 h-6 ${accentText}`} /></div>
                                        <h3 className={`text-xl font-bold mb-2 ${isBrutalist ? 'uppercase' : ''}`}>{b.title}</h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{b.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* How It Works */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>How It Works</h2>
                            <p className={`text-center mb-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Start monetizing in under 2 minutes</p>
                            <div className="grid md:grid-cols-4 gap-8">
                                {steps.map((s, i) => (
                                    <div key={i} className="text-center">
                                        <div className={`w-16 h-16 mx-auto mb-4 ${isBrutalist ? 'border-2 border-foreground bg-accent' : isEditorial ? 'border border-gray-300 bg-white' : `bg-gradient-to-br ${theme === 'theme-azure' ? 'from-sky-500 to-blue-600' : 'from-lime-400 to-green-500'}`} ${!isBrutalist && !isEditorial ? 'rounded-2xl shadow-lg' : ''} flex items-center justify-center font-bold text-2xl ${isDark && !isBrutalist ? 'text-slate-900' : ''}`}>{s.num}</div>
                                        <h3 className={`text-xl font-bold mb-2 ${isBrutalist ? 'uppercase' : ''}`}>{s.title}</h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Use Cases */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <div className={sectionCls}>
                                <h2 className={`text-3xl md:text-4xl font-bold mb-8 text-center ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Perfect For</h2>
                                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                                    {useCases.map((c, i) => (
                                        <div key={i} className="flex items-center gap-3"><CheckCircle className={`w-5 h-5 ${accentText} flex-shrink-0`} /><span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{c}</span></div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* CTA */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <div className={`${sectionCls} text-center`}>
                                <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Get Your Smart Link Now</h2>
                                <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No website required. Start earning from any traffic source today.</p>
                                <Link href="/register?role=publisher" className={`inline-flex items-center gap-2 px-10 py-5 text-lg transition-all ${btnPrimary}`}>Create Free Account <ArrowRight className="w-5 h-5" /></Link>
                            </div>
                        </section>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
