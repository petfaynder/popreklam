'use client';

import Link from 'next/link';
import { UserPlus, Globe, Code, Megaphone, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import ThemePageWrapper from '@/components/ThemePageWrapper';

const publisherSteps = [
    { icon: UserPlus, number: '1', title: 'Sign Up as Publisher', description: 'Create your free publisher account in under 2 minutes. No credit card required.' },
    { icon: Globe, number: '2', title: 'Add Your Website', description: 'Submit your website URL for quick approval. We review sites within 24 hours.' },
    { icon: Code, number: '3', title: 'Install Ad Code', description: 'Copy our lightweight JavaScript code and paste it into your website. No technical skills needed.' },
    { icon: DollarSign, number: '4', title: 'Start Earning', description: 'Earn money with every ad impression. Get paid weekly via PayPal, Wire, or Bitcoin.' },
];

const advertiserSteps = [
    { icon: UserPlus, number: '1', title: 'Create Advertiser Account', description: 'Sign up and complete your advertiser profile. Quick and easy setup process.' },
    { icon: DollarSign, number: '2', title: 'Deposit Funds', description: 'Add funds to your account via PayPal, credit card, or cryptocurrency. $100 minimum.' },
    { icon: Megaphone, number: '3', title: 'Create Campaign', description: 'Set your targeting (GEO, device, OS), budget, and bid. Upload your ad creative or landing page.' },
    { icon: TrendingUp, number: '4', title: 'Track & Optimize', description: 'Monitor impressions, clicks, and conversions in real-time. Adjust campaigns for maximum ROI.' },
];

const faqs = [
    { q: 'How much can I earn as a publisher?', a: 'Publishers earn up to 70% revenue share. Actual earnings depend on traffic quality, geography, and ad format. Top publishers earn $1,000-$10,000+ monthly.' },
    { q: "What's the minimum deposit for advertisers?", a: '$100 USD minimum deposit. You can add more funds anytime and unused balance is fully refundable.' },
    { q: 'How long does approval take?', a: 'Publisher sites are typically reviewed within 24 hours. Advertiser campaigns are approved within 1-2 hours after submission.' },
    { q: 'What payment methods are supported?', a: 'We support PayPal, Wire Transfer, Bitcoin, and major credit cards. Publishers receive payouts weekly once they reach $50 minimum.' },
];

export default function HowItWorksPage() {
    return (
        <ThemePageWrapper>
            {(theme) => {
                const isDark = theme !== 'theme-brutalist' && theme !== 'theme-editorial';
                const isEditorial = theme === 'theme-editorial';
                const isBrutalist = theme === 'theme-brutalist';
                const accentBg = theme === 'theme-luminous' ? 'bg-lime-400/10' : theme === 'theme-azure' ? 'bg-sky-500/10' : isEditorial ? 'bg-red-700/10' : isBrutalist ? 'bg-primary/10' : 'bg-white/5';
                const accentText = theme === 'theme-luminous' ? 'text-lime-400' : theme === 'theme-azure' ? 'text-sky-400' : isEditorial ? 'text-red-700' : isBrutalist ? 'text-primary' : 'text-white';
                const secondAccent = theme === 'theme-luminous' ? 'text-sky-400' : theme === 'theme-azure' ? 'text-purple-400' : isEditorial ? 'text-blue-700' : isBrutalist ? 'text-accent' : 'text-gray-200';
                const cardCls = isBrutalist ? 'border-2 border-foreground bg-card p-8 h-full hover:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all'
                    : isEditorial ? 'border border-gray-300 bg-white p-8 h-full hover:border-red-700/30 transition-all'
                        : 'bg-white/[0.03] border border-white/10 p-8 rounded-3xl h-full hover:border-white/20 transition-all backdrop-blur';
                const faqCard = isBrutalist ? 'border-2 border-foreground bg-card p-6'
                    : isEditorial ? 'border border-gray-300 bg-white p-6'
                        : 'bg-white/[0.03] border border-white/10 p-6 rounded-2xl';
                const btnPrimary = isBrutalist ? 'bg-foreground text-background font-black uppercase border-2 border-foreground hover:bg-primary hover:text-white'
                    : isEditorial ? 'bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700'
                        : theme === 'theme-luminous' ? 'bg-lime-400 text-slate-900 font-bold rounded-xl shadow-[0_0_20px_rgba(163,255,51,0.3)] hover:bg-lime-300'
                            : theme === 'theme-azure' ? 'bg-sky-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:bg-sky-400'
                                : 'bg-white text-black font-semibold rounded-xl hover:bg-gray-100';
                const btnSecondary = isBrutalist ? 'border-2 border-foreground text-foreground font-bold uppercase hover:border-accent hover:text-accent'
                    : isEditorial ? 'border border-gray-300 font-bold text-xs uppercase tracking-widest text-[#1A1A1A] hover:border-red-700 hover:text-red-700'
                        : 'border border-white/20 rounded-xl font-bold hover:border-white/40 hover:bg-white/5';

                const renderStepRow = (stepsArr, label, subLabel, accentCls, btn) => (
                    <section className="max-w-7xl mx-auto px-6 py-20">
                        <div className="text-center mb-16">
                            <span className={`${accentCls} font-bold tracking-widest uppercase text-sm`}>{label}</span>
                            <h2 className={`text-4xl font-bold mb-4 mt-2 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>{subLabel}</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {stepsArr.map((step, i) => (
                                <div key={i} className="group">
                                    <div className={cardCls}>
                                        <div className={`w-14 h-14 ${accentBg} rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 ${accentCls}`}>{step.number}</div>
                                        <step.icon className={`w-8 h-8 ${accentCls} mb-4`} />
                                        <h3 className={`text-xl font-bold mb-3 ${isBrutalist ? 'uppercase' : ''}`}>{step.title}</h3>
                                        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link href={btn.href} className={`px-8 py-4 text-lg inline-flex items-center gap-2 transition-all ${btn.cls}`}>{btn.label} <ArrowRight className="w-5 h-5" /></Link>
                        </div>
                    </section>
                );

                return (
                    <div className="relative z-10">
                        {/* Hero */}
                        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 ${accentBg} rounded-full mb-6`}>
                                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Simple & Transparent Process</span>
                            </div>
                            <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${isBrutalist ? 'uppercase tracking-tighter font-black' : 'tracking-tight'}`}>
                                How <span className={accentText}>MrPop.io</span> Works
                            </h1>
                            <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-gray-400' : isEditorial ? 'text-gray-500' : 'text-muted-foreground'}`}>
                                Whether you're a publisher looking to monetize or an advertiser seeking high-quality traffic, our platform makes it easy to succeed.
                            </p>
                        </section>

                        {/* Publisher Steps */}
                        {renderStepRow(publisherSteps, 'Monetization', 'For Publishers', accentText,
                            { href: '/register?role=publisher', label: 'Become a Publisher', cls: btnPrimary }
                        )}

                        {/* Divider */}
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className={`h-px ${isDark ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent' : isBrutalist ? 'bg-border' : 'bg-gray-200'}`}></div>
                        </div>

                        {/* Advertiser Steps */}
                        {renderStepRow(advertiserSteps, 'Growth', 'For Advertisers', secondAccent,
                            { href: '/register?role=advertiser', label: 'Start Advertising', cls: btnSecondary }
                        )}

                        {/* FAQ */}
                        <section className="max-w-4xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-16 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Frequently Asked Questions</h2>
                            <div className="space-y-6">
                                {faqs.map((faq, i) => (
                                    <div key={i} className={faqCard}>
                                        <h3 className={`text-lg font-bold mb-3 flex items-center gap-3 ${isBrutalist ? 'uppercase' : ''}`}>
                                            <span className={`${accentBg} ${accentText} w-6 h-6 rounded-full flex items-center justify-center text-sm`}>?</span>
                                            {faq.q}
                                        </h3>
                                        <p className={`pl-9 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-12">
                                <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Still have questions?</p>
                                <Link href="/contact" className={`${accentText} hover:underline font-bold text-lg inline-flex items-center gap-1`}>Contact Support <ArrowRight className="w-4 h-4" /></Link>
                            </div>
                        </section>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
