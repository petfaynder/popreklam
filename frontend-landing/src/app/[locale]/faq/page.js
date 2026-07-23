'use client';

import { Link } from '@/i18n/navigation';
import { ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import ThemePageWrapper from '@/components/ThemePageWrapper';
import { useTranslations } from 'next-intl';

const FAQ_DATA = [
    { id: 1, category: 'publishers', qKey: 'q1', aKey: 'a1' },
    { id: 2, category: 'publishers', qKey: 'q2', aKey: 'a2' },
    { id: 3, category: 'publishers', qKey: 'q3', aKey: 'a3' },
    { id: 4, category: 'publishers', qKey: 'q4', aKey: 'a4' },
    { id: 5, category: 'advertisers', qKey: 'q5', aKey: 'a5' },
    { id: 6, category: 'advertisers', qKey: 'q6', aKey: 'a6' },
    { id: 7, category: 'advertisers', qKey: 'q7', aKey: 'a7' },
    { id: 8, category: 'advertisers', qKey: 'q8', aKey: 'a8' },
    { id: 9, category: 'payments', qKey: 'q9', aKey: 'a9' },
    { id: 10, category: 'payments', qKey: 'q10', aKey: 'a10' },
    { id: 11, category: 'payments', qKey: 'q11', aKey: 'a11' },
    { id: 12, category: 'technical', qKey: 'q12', aKey: 'a12' },
    { id: 13, category: 'technical', qKey: 'q13', aKey: 'a13' },
    { id: 14, category: 'technical', qKey: 'q14', aKey: 'a14' },
    { id: 15, category: 'publishers', qKey: 'q15', aKey: 'a15' },
    { id: 16, category: 'advertisers', qKey: 'q16', aKey: 'a16' },
];

const CATEGORY_KEYS = ['all', 'publishers', 'advertisers', 'payments', 'technical'];

export default function FAQPage() {
    const t = useTranslations('faq');
    const [search, setSearch] = useState('');
    const [activeSection, setActiveSection] = useState('all');
    const [openQuestions, setOpenQuestions] = useState(new Set());

    const toggleQuestion = (id) => {
        const n = new Set(openQuestions); n.has(id) ? n.delete(id) : n.add(id); setOpenQuestions(n);
    };

    const faqs = FAQ_DATA.map(f => ({
        ...f,
        question: t(`questions.${f.qKey}`),
        answer: t(`questions.${f.aKey}`),
    }));

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
                        <div className="text-center mb-12">
                            <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${isBrutalist ? 'uppercase tracking-tighter font-black' : isEditorial ? 'tracking-tight' : ''}`}>
                                {isBrutalist ? t('titleBrutalist') : t('title')}
                            </h1>
                            <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : isEditorial ? 'text-gray-500' : 'text-muted-foreground'}`}>{t('subtitle')}</p>
                            <div className="relative max-w-2xl mx-auto">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                                <input type="text" placeholder={t('searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className={searchCls} />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center mb-12">
                            {CATEGORY_KEYS.map(s => (
                                <button key={s} onClick={() => setActiveSection(s)}
                                    className={`px-5 py-2.5 rounded-full transition-all ${activeSection === s ? pillActive : pillInactive}`}>
                                    {t(`categories.${s}`)}
                                </button>
                            ))}
                        </div>

                        {filtered.length === 0 ? (
                            <div className={`text-center py-12 ${cardCls} ${!isBrutalist && !isEditorial ? 'rounded-2xl' : ''}`}>
                                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('notFound')}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filtered.map(faq => (
                                    <div key={faq.id} className={`${cardCls} overflow-hidden`}>
                                        <button onClick={() => toggleQuestion(faq.id)} className={`w-full px-6 py-5 flex items-center justify-between text-left transition-colors ${isDark ? 'hover:bg-white/5' : isEditorial ? 'hover:bg-gray-50' : 'hover:bg-gray-100'}`}>
                                            <div className="flex-1">
                                                <div className={`inline-block mb-2 ${catBadge}`}>{t(`categories.${faq.category}`)}</div>
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

                        <div className={`mt-16 p-8 text-center ${isBrutalist ? 'border-2 border-foreground bg-card shadow-[8px_8px_0px_0px_var(--color-primary)]' : isEditorial ? 'border border-gray-300 bg-white' : 'bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur'}`}>
                            <h3 className={`text-2xl font-bold mb-2 ${isBrutalist ? 'uppercase' : ''}`}>{t('stillHaveQuestions')}</h3>
                            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('stillHaveQuestionsSubtitle')}</p>
                            <Link href="/contact" className={`inline-flex items-center gap-2 px-8 py-3 font-bold transition-all ${isBrutalist ? 'bg-foreground text-background hover:bg-primary hover:text-white border-2 border-foreground uppercase tracking-wider'
                                : isEditorial ? 'bg-[#1A1A1A] text-white hover:bg-red-700 text-xs uppercase tracking-widest px-10 py-3'
                                    : theme === 'theme-luminous' ? 'bg-lime-400 text-slate-900 rounded-xl shadow-[0_0_20px_rgba(163,255,51,0.3)] hover:bg-lime-300'
                                        : theme === 'theme-azure' ? 'bg-sky-500 text-white rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:bg-sky-400'
                                            : 'bg-white text-black rounded-xl hover:bg-gray-100'
                                }`}>{t('contactSupport')}</Link>
                        </div>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
