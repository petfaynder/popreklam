'use client';

import Link from 'next/link';
import { MousePointer2, Smartphone, Layers, Cpu, BarChart3, Zap, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import ThemePageWrapper from '@/components/ThemePageWrapper';

const formats = [
    {
        icon: MousePointer2,
        title: 'Popunder',
        cpm: '$2 – $8',
        description: 'Full-page ads that open behind the main browser window. Zero banner blindness with the highest CPM rates in the industry.',
        features: ['Highest revenue per impression', 'Works on all browsers', '100% viewability', 'Anti-adblock compatible'],
        bestFor: 'High-traffic websites, download sites, streaming platforms',
        color: 'from-red-500 to-rose-600',
    },
    {
        icon: Smartphone,
        title: 'In-Page Push',
        cpm: '$1 – $5',
        description: 'Browser-style notification ads that appear directly on the page. No opt-in required, 30X higher CTR than traditional web push.',
        features: ['No subscription needed', 'Works on iOS & Safari', 'Native look & feel', 'Customizable design'],
        bestFor: 'News sites, blogs, content publishers',
        color: 'from-blue-500 to-cyan-600',
    },
    {
        icon: Layers,
        title: 'Interstitial',
        cpm: '$1 – $6',
        description: 'Full-screen overlay ads displayed between page transitions. Maximum visual impact with premium advertiser demand.',
        features: ['Full-screen coverage', 'High engagement rates', 'Smooth user experience', 'Frequency capping'],
        bestFor: 'Apps, games, content with natural break points',
        color: 'from-green-500 to-emerald-600',
    },
    {
        icon: Cpu,
        title: 'Smart Link',
        cpm: '$0.5 – $3',
        description: 'AI-powered monetization links that automatically route traffic to the highest-paying offer based on user data.',
        features: ['AI auto-optimization', 'Best for social traffic', 'No website required', 'Direct link monetization'],
        bestFor: 'Social media traffic, referral links, email campaigns',
        color: 'from-purple-500 to-violet-600',
    },
    {
        icon: BarChart3,
        title: 'Native Ads',
        cpm: '$0.5 – $3',
        description: 'Ads that blend seamlessly with your site content. Publishers control colors, sizing, and placement for a natural look.',
        features: ['Matches site design', 'Non-intrusive format', 'High user acceptance', 'Custom styling options'],
        bestFor: 'Content sites, blogs, editorial platforms',
        color: 'from-yellow-500 to-amber-600',
    },
    {
        icon: Zap,
        title: 'Banner Ads',
        cpm: '$0.3 – $2',
        description: 'Classic IAB standard display banners. Stable, predictable revenue that complements any website layout and design.',
        features: ['IAB standard sizes', 'Desktop & mobile', 'Easy implementation', 'Steady revenue stream'],
        bestFor: 'Any website, forums, directories',
        color: 'from-orange-500 to-red-600',
    },
];

const comparison = [
    { format: 'Popunder', cpmRange: '$2–$8', ctr: 'N/A', setup: 'Easy', bestTraffic: 'Tier 1' },
    { format: 'In-Page Push', cpmRange: '$1–$5', ctr: '2–5%', setup: 'Easy', bestTraffic: 'All Tiers' },
    { format: 'Interstitial', cpmRange: '$1–$6', ctr: '3–8%', setup: 'Medium', bestTraffic: 'Tier 1-2' },
    { format: 'Smart Link', cpmRange: '$0.5–$3', ctr: '1–3%', setup: 'Minimal', bestTraffic: 'All Tiers' },
    { format: 'Native Ads', cpmRange: '$0.5–$3', ctr: '0.5–2%', setup: 'Medium', bestTraffic: 'Tier 1-2' },
    { format: 'Banner Ads', cpmRange: '$0.3–$2', ctr: '0.1–0.5%', setup: 'Easy', bestTraffic: 'All Tiers' },
];

export default function AdFormatsPage() {
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
                                    <Layers className="w-4 h-4" /> 6 High-Performance Ad Formats
                                </div>
                                <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${isBrutalist ? 'uppercase tracking-tighter font-black' : ''}`}>
                                    Ad Formats That <span className={accentText}>Convert</span>
                                </h1>
                                <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : isEditorial ? 'text-gray-500' : 'text-muted-foreground'}`}>
                                    Non-intrusive, high-performing ad units serving 2B+ monthly impressions across all devices and geographies.
                                </p>
                            </div>
                        </section>

                        {/* Format Cards */}
                        <section className="max-w-7xl mx-auto px-6 py-16">
                            <div className="space-y-12">
                                {formats.map((f, i) => (
                                    <div key={i} className={`${cardCls} grid md:grid-cols-5 gap-8 items-center`}>
                                        <div className="md:col-span-3">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`w-14 h-14 ${accentBg} ${isBrutalist ? '' : 'rounded-xl'} flex items-center justify-center`}>
                                                    <f.icon className={`w-7 h-7 ${accentText}`} />
                                                </div>
                                                <div>
                                                    <h2 className={`text-2xl font-bold ${isBrutalist ? 'uppercase' : ''}`}>{f.title}</h2>
                                                    <span className={`text-lg font-bold ${accentText}`}>{f.cpm} CPM</span>
                                                </div>
                                            </div>
                                            <p className={`text-base mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{f.description}</p>
                                            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Best for: {f.bestFor}</div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="space-y-3">
                                                {f.features.map((feat, j) => (
                                                    <div key={j} className="flex items-center gap-3">
                                                        <CheckCircle className={`w-5 h-5 ${accentText} flex-shrink-0`} />
                                                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{feat}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Comparison Table */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Quick Comparison</h2>
                            <div className={`overflow-x-auto ${cardCls}`}>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className={`border-b ${isBrutalist ? 'border-foreground' : isEditorial ? 'border-gray-300' : 'border-white/10'}`}>
                                            {['Format', 'CPM Range', 'Avg. CTR', 'Setup', 'Best Traffic'].map(h => (
                                                <th key={h} className={`py-4 px-4 font-bold text-sm ${isBrutalist ? 'uppercase tracking-wider' : ''}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparison.map((row, i) => (
                                            <tr key={i} className={`border-b last:border-b-0 ${isBrutalist ? 'border-foreground/30' : isEditorial ? 'border-gray-200' : 'border-white/5'}`}>
                                                <td className="py-3 px-4 font-bold">{row.format}</td>
                                                <td className={`py-3 px-4 font-bold ${accentText}`}>{row.cpmRange}</td>
                                                <td className="py-3 px-4">{row.ctr}</td>
                                                <td className="py-3 px-4">{row.setup}</td>
                                                <td className="py-3 px-4">{row.bestTraffic}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* CTA */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <div className={`${cardCls} text-center !p-12`}>
                                <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>
                                    Ready to Monetize?
                                </h2>
                                <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Start earning with any combination of our 6 ad formats today
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/register?role=publisher" className={`inline-flex items-center gap-2 px-10 py-5 text-lg transition-all ${btnPrimary}`}>
                                        Publisher Signup <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="/register?role=advertiser" className={`inline-flex items-center gap-2 px-10 py-5 text-lg transition-all ${isBrutalist ? 'border-2 border-foreground font-bold uppercase hover:bg-foreground hover:text-background' : isEditorial ? 'border border-gray-300 font-bold text-xs uppercase tracking-widest hover:border-red-700' : 'border border-white/20 rounded-xl font-bold hover:border-white/40 hover:bg-white/5'}`}>
                                        Advertiser Signup <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
