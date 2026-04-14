'use client';

import Link from 'next/link';
import { ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import ThemePageWrapper from '@/components/ThemePageWrapper';

const faqs = [
    { id: 1, category: 'publishers', question: 'How much can I earn as a publisher?', answer: 'Publisher earnings vary based on traffic quality, geography, and ad formats. Our publishers earn between $0.50 to $8.00 CPM depending on these factors. Top publishers with Tier 1 traffic (US, UK, CA) earn $3-8 CPM. With 100,000 daily visitors, you could earn $3,000-$24,000 monthly. We offer up to 70% revenue share, one of the highest in the industry.' },
    { id: 2, category: 'publishers', question: 'What are the minimum requirements to join?', answer: 'To join as a publisher, you need: (1) Minimum 1,000 daily visitors, (2) Original, legal content with no copyright violations, (3) No adult, illegal, or malicious content, (4) Quality traffic (no bots or incentivized traffic), (5) English or major language content. We review all applications within 24 hours.' },
    { id: 3, category: 'publishers', question: 'How do I install the ad code?', answer: 'After your site is approved, log in to your dashboard and navigate to "Sites" → "Ad Code". Copy the JavaScript snippet provided and paste it before the closing </body> tag on your website. The code is lightweight (under 10KB) and won\'t affect your site speed.' },
    { id: 4, category: 'publishers', question: 'Can I use MrPop.io with Google AdSense?', answer: 'Yes! MrPop.io is 100% compatible with Google AdSense and other ad networks. Our pop ad formats don\'t compete with display ads, so you can maximize revenue by using both simultaneously.' },
    { id: 5, category: 'advertisers', question: 'What is the minimum deposit for advertisers?', answer: 'The minimum deposit is $100 USD. You can add funds via PayPal, credit card (Visa, MasterCard, Amex), Bitcoin, or USDT. There are no hidden fees, and unused funds are fully refundable anytime.' },
    { id: 6, category: 'advertisers', question: 'What targeting options are available?', answer: 'We offer comprehensive targeting: Geographic (Country, City, State/Region), Device (Desktop, Mobile, Tablet), Technology (Browser, OS, Language), Connection Type (Wi-Fi, Mobile), and Time-based targeting.' },
    { id: 7, category: 'advertisers', question: 'How quickly do campaigns go live?', answer: 'Most campaigns are approved and go live within 1-2 hours during business hours. We manually review all campaigns to ensure quality and compliance.' },
    { id: 8, category: 'advertisers', question: 'What ad formats are available?', answer: 'We offer Popunder, In-Page Push, Interstitial, Smart Link, Banner Ads, and Multi-Tag. Each format has different CPM rates and performance characteristics.' },
    { id: 9, category: 'payments', question: 'When do I receive payouts?', answer: 'Publishers are paid weekly on Mondays for earnings from the previous week. Minimum payout threshold is $50. Payments are processed via PayPal, Wire Transfer, Bitcoin, or USDT.' },
    { id: 10, category: 'payments', question: 'Are there any payment fees?', answer: 'PayPal and cryptocurrency payments are free for publishers. Wire transfers have a $25 fee. For advertisers, processing fees are included in your deposit.' },
    { id: 11, category: 'payments', question: 'Do I need to provide tax information?', answer: 'For payouts over $600/year, US-based publishers need to submit a W-9 form. Non-US publishers need a W-8BEN form.' },
    { id: 12, category: 'technical', question: 'Will ads slow down my website?', answer: 'No. Our ad code is asynchronously loaded (under 10KB) and doesn\'t block your page rendering. Google PageSpeed score typically remains unchanged.' },
    { id: 13, category: 'technical', question: 'Do you have an API for integration?', answer: 'Yes! We offer a RESTful API for both publishers and advertisers. Retrieve statistics, manage sites, create campaigns, and manage funds. Contact support for API access.' },
    { id: 14, category: 'technical', question: 'How do you prevent click fraud?', answer: 'We use multi-layer fraud detection: real-time bot detection, IP filtering, click pattern analysis, manual review, and third-party fraud database integration.' },
    { id: 15, category: 'publishers', question: 'Can I use MrPop.io on mobile apps?', answer: 'Currently, MrPop.io is designed for websites only. However, our ads work perfectly on mobile-optimized websites and PWAs.' },
    { id: 16, category: 'advertisers', question: 'Can I track conversions?', answer: 'Yes! We support conversion tracking via S2S postback URLs or JavaScript pixel. Track CPA, ROAS, and conversion rates directly in your dashboard.' },
];

const sections = ['all', 'publishers', 'advertisers', 'payments', 'technical'];

export default function FAQPage() {
    const [search, setSearch] = useState('');
    const [activeSection, setActiveSection] = useState('all');
    const [openQuestions, setOpenQuestions] = useState(new Set());

    const toggleQuestion = (id) => {
        const n = new Set(openQuestions); n.has(id) ? n.delete(id) : n.add(id); setOpenQuestions(n);
    };

    const filtered = faqs.filter(f => {
        const s = f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
        return s && (activeSection === 'all' || f.category === activeSection);
    });

    return (
        <ThemePageWrapper>
            {(theme) => {
                const isDark = theme !== 'theme-brutalist' && theme !== 'theme-editorial';
                const isEditorial = theme === 'theme-editorial';
                const isBrutalist = theme === 'theme-brutalist';
                const accentColor = theme === 'theme-luminous' ? 'lime-400' : theme === 'theme-azure' ? 'sky-400' : isEditorial ? 'red-700' : isBrutalist ? 'primary' : 'white';

                const searchCls = isBrutalist ? 'w-full pl-12 pr-4 py-4 border-2 border-foreground bg-background font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary'
                    : isEditorial ? 'w-full pl-12 pr-4 py-4 border border-gray-300 bg-white text-sm focus:outline-none focus:border-red-700 transition-all'
                        : 'w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-all';

                const pillActive = isBrutalist ? 'bg-foreground text-background font-black uppercase'
                    : isEditorial ? 'bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest'
                        : theme === 'theme-luminous' ? `bg-lime-400 text-slate-900 font-bold shadow-[0_0_20px_rgba(163,255,51,0.3)]`
                            : theme === 'theme-azure' ? `bg-sky-500 text-white font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)]`
                                : 'bg-white text-black font-semibold';
                const pillInactive = isBrutalist ? 'border-2 border-foreground font-bold uppercase hover:bg-foreground hover:text-background'
                    : isEditorial ? 'border border-gray-300 text-gray-500 text-xs uppercase tracking-widest font-bold hover:border-red-700 hover:text-[#1A1A1A]'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20';

                const cardCls = isBrutalist ? 'border-2 border-foreground bg-card hover:shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all'
                    : isEditorial ? 'border border-gray-300 bg-white hover:border-red-700/30 transition-all'
                        : 'bg-white/[0.03] border border-white/10 rounded-2xl hover:border-white/20 transition-all';

                const catBadge = isBrutalist ? 'bg-accent/20 text-accent-foreground font-bold uppercase text-xs px-2 py-1'
                    : isEditorial ? 'text-red-700 font-bold uppercase text-xs tracking-widest'
                        : theme === 'theme-luminous' ? 'bg-lime-400/10 text-lime-400 text-xs font-medium px-2 py-1 rounded-full'
                            : theme === 'theme-azure' ? 'bg-sky-500/10 text-sky-400 text-xs font-medium px-2 py-1 rounded-full'
                                : 'bg-white/10 text-white text-xs font-medium px-2 py-1 rounded-full';

                return (
                    <div className="max-w-4xl mx-auto px-6 py-20">
                        {/* Hero */}
                        <div className="text-center mb-12">
                            <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${isBrutalist ? 'uppercase tracking-tighter font-black' : isEditorial ? 'tracking-tight' : ''}`}>
                                {isBrutalist ? 'F.A.Q.' : 'Frequently Asked Questions'}
                            </h1>
                            <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : isEditorial ? 'text-gray-500' : 'text-muted-foreground'}`}>Find answers to common questions about MrPop.io</p>
                            <div className="relative max-w-2xl mx-auto">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                                <input type="text" placeholder="Search for answers..." value={search} onChange={(e) => setSearch(e.target.value)} className={searchCls} />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3 justify-center mb-12">
                            {sections.map(s => (
                                <button key={s} onClick={() => setActiveSection(s)}
                                    className={`px-5 py-2.5 rounded-full transition-all ${activeSection === s ? pillActive : pillInactive}`}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* FAQ List */}
                        {filtered.length === 0 ? (
                            <div className={`text-center py-12 ${cardCls} ${!isBrutalist && !isEditorial ? 'rounded-2xl' : ''}`}>
                                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No questions found matching your search.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filtered.map(faq => (
                                    <div key={faq.id} className={`${cardCls} overflow-hidden`}>
                                        <button onClick={() => toggleQuestion(faq.id)} className={`w-full px-6 py-5 flex items-center justify-between text-left transition-colors ${isDark ? 'hover:bg-white/5' : isEditorial ? 'hover:bg-gray-50' : 'hover:bg-gray-100'}`}>
                                            <div className="flex-1">
                                                <div className={`inline-block mb-2 ${catBadge}`}>{faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}</div>
                                                <h3 className={`text-lg font-bold ${isBrutalist ? 'uppercase' : ''}`}>{faq.question}</h3>
                                            </div>
                                            <ChevronDown className={`w-5 h-5 flex-shrink-0 ml-4 transition-transform ${isDark ? 'text-gray-400' : 'text-gray-500'} ${openQuestions.has(faq.id) ? 'rotate-180' : ''}`} />
                                        </button>
                                        {openQuestions.has(faq.id) && (
                                            <div className="px-6 pb-5">
                                                <div className={`leading-relaxed border-t pt-4 ${isDark ? 'text-gray-300 border-white/5' : isEditorial ? 'text-gray-600 border-gray-200' : 'text-gray-600 border-border'}`}>{faq.answer}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* CTA */}
                        <div className={`mt-16 p-8 text-center ${isBrutalist ? 'border-2 border-foreground bg-card shadow-[8px_8px_0px_0px_var(--color-primary)]' : isEditorial ? 'border border-gray-300 bg-white' : 'bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur'}`}>
                            <h3 className={`text-2xl font-bold mb-2 ${isBrutalist ? 'uppercase' : ''}`}>Still Have Questions?</h3>
                            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Can't find the answer you're looking for? Our support team is here to help.</p>
                            <Link href="/contact" className={`inline-flex items-center gap-2 px-8 py-3 font-bold transition-all ${isBrutalist ? 'bg-foreground text-background hover:bg-primary hover:text-white border-2 border-foreground uppercase tracking-wider'
                                    : isEditorial ? 'bg-[#1A1A1A] text-white hover:bg-red-700 text-xs uppercase tracking-widest px-10 py-3'
                                        : theme === 'theme-luminous' ? 'bg-lime-400 text-slate-900 rounded-xl shadow-[0_0_20px_rgba(163,255,51,0.3)] hover:bg-lime-300'
                                            : theme === 'theme-azure' ? 'bg-sky-500 text-white rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:bg-sky-400'
                                                : 'bg-white text-black rounded-xl hover:bg-gray-100'
                                }`}>Contact Support →</Link>
                        </div>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
