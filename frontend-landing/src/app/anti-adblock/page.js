'use client';

import Link from 'next/link';
import { Shield, ArrowRight, CheckCircle, TrendingUp, Lock, Eye, Zap, BarChart3, DollarSign } from 'lucide-react';
import ThemePageWrapper from '@/components/ThemePageWrapper';

const features = [
    { icon: Shield, title: 'Bypass Adblock Detection', description: 'Our technology detects adblock users and serves ads through alternative channels that bypass all major adblockers.' },
    { icon: TrendingUp, title: 'Recover 30%+ Revenue', description: 'Publishers typically recover 25–40% of previously lost ad revenue from adblock users immediately.' },
    { icon: Eye, title: 'Non-Intrusive Delivery', description: 'Ads are delivered seamlessly without affecting page load speed or degrading user experience.' },
    { icon: Lock, title: 'Always Updated', description: 'Our anti-adblock scripts are updated daily to stay ahead of new adblock filters and browser updates.' },
    { icon: Zap, title: 'Zero Setup Required', description: 'Works automatically with our standard ad code. No additional integration or configuration needed.' },
    { icon: BarChart3, title: 'Transparent Reporting', description: 'See exactly how many adblock impressions are recovered and revenue generated in your dashboard.' },
];

const stats = [
    { value: '42%', label: 'Of global users use adblockers', desc: 'That\'s nearly half your traffic that generates zero revenue without our solution.' },
    { value: '30%+', label: 'Revenue recovered', desc: 'Average additional revenue publishers earn after enabling our anti-adblock technology.' },
    { value: '0ms', label: 'Additional load time', desc: 'Our solution adds zero latency to your page load — users won\'t notice any difference.' },
];

const faqItems = [
    { q: 'Will this affect my users\' experience?', a: 'No. Our anti-adblock solution delivers ads through non-intrusive methods. Users experience the same page performance as before.' },
    { q: 'Is this legal?', a: 'Yes. Serving ads on your own website is your right as a publisher. Our technology simply ensures ads reach all visitors.' },
    { q: 'Does it work with all adblockers?', a: 'Our solution bypasses all major adblockers including AdBlock, AdBlock Plus, uBlock Origin, and browser-built-in blockers.' },
    { q: 'How do I enable it?', a: 'Simply toggle the "Anti-Adblock" option to ON in your publisher dashboard. It works with your existing ad code automatically.' },
];

export default function AntiAdblockPage() {
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
                                    <Shield className="w-4 h-4" /> Recover Lost Revenue
                                </div>
                                <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${isBrutalist ? 'uppercase tracking-tighter font-black' : ''}`}>
                                    Stop Losing <span className={accentText}>Revenue</span> to Adblockers
                                </h1>
                                <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : isEditorial ? 'text-gray-500' : 'text-muted-foreground'}`}>
                                    42% of internet users run adblockers. Our anti-adblock technology recovers that lost revenue automatically — with zero impact on user experience.
                                </p>
                                <Link href="/register?role=publisher" className={`inline-flex items-center gap-2 px-8 py-4 text-lg transition-all ${btnPrimary}`}>Start Recovering Revenue <ArrowRight className="w-5 h-5" /></Link>
                            </div>
                        </section>

                        {/* Stats */}
                        <section className="max-w-7xl mx-auto px-6 py-16">
                            <div className="grid md:grid-cols-3 gap-8">
                                {stats.map((s, i) => (
                                    <div key={i} className={`${cardCls} text-center`}>
                                        <div className={`text-5xl font-bold ${accentText} mb-2`}>{s.value}</div>
                                        <div className="text-lg font-bold mb-2">{s.label}</div>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Features */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-16 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>How Our Anti-Adblock Works</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {features.map((f, i) => (
                                    <div key={i} className={cardCls}>
                                        <div className={`w-12 h-12 ${accentBg} ${isBrutalist ? '' : 'rounded-xl'} flex items-center justify-center mb-4`}><f.icon className={`w-6 h-6 ${accentText}`} /></div>
                                        <h3 className={`text-xl font-bold mb-2 ${isBrutalist ? 'uppercase' : ''}`}>{f.title}</h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{f.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* FAQ */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Common Questions</h2>
                            <div className="max-w-3xl mx-auto space-y-4">
                                {faqItems.map((item, i) => (
                                    <div key={i} className={cardCls}>
                                        <h3 className={`text-lg font-bold mb-2 ${isBrutalist ? 'uppercase' : ''}`}>{item.q}</h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* CTA */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <div className={`${sectionCls} text-center`}>
                                <DollarSign className={`w-16 h-16 ${accentText} mx-auto mb-4`} />
                                <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Stop Leaving Money on the Table</h2>
                                <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Enable anti-adblock with one click and start recovering revenue today</p>
                                <Link href="/register?role=publisher" className={`inline-flex items-center gap-2 px-10 py-5 text-lg transition-all ${btnPrimary}`}>Get Started Free <ArrowRight className="w-5 h-5" /></Link>
                            </div>
                        </section>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
