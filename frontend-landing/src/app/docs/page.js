'use client';

import Link from 'next/link';
import { Book, ArrowRight, CheckCircle, Code, Copy, Terminal, Zap, Globe, Shield } from 'lucide-react';
import ThemePageWrapper from '@/components/ThemePageWrapper';

const quickStart = [
    { num: '01', title: 'Sign Up', desc: 'Create your publisher account at PopReklam and get approved.' },
    { num: '02', title: 'Get Your Code', desc: 'Navigate to Ad Codes section and copy your unique integration script.' },
    { num: '03', title: 'Add to Site', desc: 'Paste the script tag before the closing </head> tag of your website.' },
    { num: '04', title: 'Go Live', desc: 'Ads will start serving immediately. Monitor earnings in real-time.' },
];

const codeExamples = [
    {
        title: 'Basic Integration',
        language: 'html',
        desc: 'Add this single script to your website\'s <head> section',
        code: `<script async src="https://cdn.popreklam.com/sdk.js"></script>
<script>
  PopAd.init({
    pubId: "PUB-XXXXXX",
    format: "popunder",
    antiAdblock: true
  });
</script>`,
    },
    {
        title: 'Multiple Formats',
        language: 'html',
        desc: 'Run multiple ad formats simultaneously for maximum revenue',
        code: `<script>
  PopAd.init({
    pubId: "PUB-XXXXXX",
    formats: ["popunder", "inpage-push", "native"],
    antiAdblock: true,
    frequency: { popunder: 1, push: 3 }
  });
</script>`,
    },
    {
        title: 'Advanced Configuration',
        language: 'html',
        desc: 'Fine-tune ad behavior with advanced options',
        code: `<script>
  PopAd.init({
    pubId: "PUB-XXXXXX",
    format: "popunder",
    antiAdblock: true,
    fallback: "inpage-push",
    delay: 5000,
    cap: { daily: 3 },
    exclude: ["/checkout", "/payment"]
  });
</script>`,
    },
];

const sdkMethods = [
    { method: 'PopAd.init(config)', desc: 'Initialize the SDK with your publisher ID and ad configuration.' },
    { method: 'PopAd.destroy()', desc: 'Remove all ad placements and clean up event listeners.' },
    { method: 'PopAd.pause()', desc: 'Temporarily pause ad serving without removing placements.' },
    { method: 'PopAd.resume()', desc: 'Resume ad serving after a pause.' },
    { method: 'PopAd.on(event, fn)', desc: 'Listen for SDK events like "impression", "click", "error".' },
    { method: 'PopAd.getStats()', desc: 'Returns current session stats: impressions, clicks, revenue.' },
];

export default function DocsPage() {
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
                const codeBg = isBrutalist ? 'bg-foreground text-background border-2 border-foreground'
                    : isEditorial ? 'bg-[#1A1A1A] text-gray-100 border border-gray-300'
                        : 'bg-black/60 text-gray-100 border border-white/10 rounded-xl';
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
                                    <Book className="w-4 h-4" /> Developer Documentation
                                </div>
                                <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${isBrutalist ? 'uppercase tracking-tighter font-black' : ''}`}>
                                    Integration <span className={accentText}>Guide</span>
                                </h1>
                                <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : isEditorial ? 'text-gray-500' : 'text-muted-foreground'}`}>
                                    Get up and running with PopReklam in minutes. Two lines of code is all you need to start monetizing.
                                </p>
                            </div>
                        </section>

                        {/* Quick Start */}
                        <section className="max-w-7xl mx-auto px-6 py-16">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Quick Start</h2>
                            <p className={`text-center mb-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>4 steps to monetize your website</p>
                            <div className="grid md:grid-cols-4 gap-8">
                                {quickStart.map((s, i) => (
                                    <div key={i} className="text-center">
                                        <div className={`w-16 h-16 mx-auto mb-4 ${isBrutalist ? 'border-2 border-foreground bg-accent' : isEditorial ? 'border border-gray-300 bg-white' : `bg-gradient-to-br ${theme === 'theme-azure' ? 'from-sky-500 to-blue-600' : 'from-lime-400 to-green-500'}`} ${!isBrutalist && !isEditorial ? 'rounded-2xl shadow-lg' : ''} flex items-center justify-center font-bold text-2xl ${isDark && !isBrutalist ? 'text-slate-900' : ''}`}>{s.num}</div>
                                        <h3 className={`text-xl font-bold mb-2 ${isBrutalist ? 'uppercase' : ''}`}>{s.title}</h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Code Examples */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-16 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Code Examples</h2>
                            <div className="space-y-8">
                                {codeExamples.map((ex, i) => (
                                    <div key={i} className={cardCls}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Code className={`w-5 h-5 ${accentText}`} />
                                            <h3 className={`text-xl font-bold ${isBrutalist ? 'uppercase' : ''}`}>{ex.title}</h3>
                                        </div>
                                        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{ex.desc}</p>
                                        <div className={`${codeBg} p-6 font-mono text-sm overflow-x-auto`}>
                                            <pre className="whitespace-pre">{ex.code}</pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SDK Methods */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>SDK Reference</h2>
                            <div className={cardCls}>
                                <div className="space-y-0">
                                    {sdkMethods.map((m, i) => (
                                        <div key={i} className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-6 py-4 ${i > 0 ? `border-t ${isBrutalist ? 'border-foreground/30' : isEditorial ? 'border-gray-200' : 'border-white/5'}` : ''}`}>
                                            <code className={`font-mono font-bold text-sm ${accentText} md:w-64 flex-shrink-0`}>{m.method}</code>
                                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{m.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* CTA */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <div className={`${cardCls} text-center !p-12`}>
                                <Terminal className={`w-16 h-16 ${accentText} mx-auto mb-4`} />
                                <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Ready to Integrate?</h2>
                                <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Create your account and get your integration code in seconds</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/register?role=publisher" className={`inline-flex items-center gap-2 px-10 py-5 text-lg transition-all ${btnPrimary}`}>Create Publisher Account <ArrowRight className="w-5 h-5" /></Link>
                                    <Link href="/api-docs" className={`inline-flex items-center gap-2 px-10 py-5 text-lg transition-all ${isBrutalist ? 'border-2 border-foreground font-bold uppercase hover:bg-foreground hover:text-background' : isEditorial ? 'border border-gray-300 font-bold text-xs uppercase tracking-widest hover:border-red-700' : 'border border-white/20 rounded-xl font-bold hover:border-white/40 hover:bg-white/5'}`}>API Reference <ArrowRight className="w-5 h-5" /></Link>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
