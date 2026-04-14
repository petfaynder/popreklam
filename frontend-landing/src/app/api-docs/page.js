'use client';

import Link from 'next/link';
import { Code, ArrowRight, Lock, Globe, Zap, BarChart3, Shield, Terminal, Key, Database, Server, Webhook } from 'lucide-react';
import ThemePageWrapper from '@/components/ThemePageWrapper';

const endpoints = [
    { method: 'GET', path: '/api/v1/stats', desc: 'Retrieve earnings, impressions, clicks, and CTR for a given date range.' },
    { method: 'GET', path: '/api/v1/campaigns', desc: 'List all active campaigns with targeting details and budgets.' },
    { method: 'POST', path: '/api/v1/campaigns', desc: 'Create a new advertising campaign with targeting and creative.' },
    { method: 'GET', path: '/api/v1/sites', desc: 'List all publisher sites with approval status and ad settings.' },
    { method: 'POST', path: '/api/v1/sites', desc: 'Register a new publisher site for monetization.' },
    { method: 'GET', path: '/api/v1/payments', desc: 'Retrieve payment history with amounts, dates, and status.' },
    { method: 'PUT', path: '/api/v1/campaigns/:id', desc: 'Update campaign settings, budget, targeting, or creative.' },
    { method: 'DELETE', path: '/api/v1/campaigns/:id', desc: 'Pause or delete an existing campaign.' },
];

const features = [
    { icon: Lock, title: 'API Key Authentication', description: 'Secure Bearer token authentication. Generate and rotate API keys from your dashboard.' },
    { icon: Globe, title: 'RESTful Design', description: 'Standard REST conventions with JSON responses. Easy to integrate with any language.' },
    { icon: Zap, title: 'Rate Limiting', description: '1000 requests per minute per API key. Sufficient for real-time monitoring and automation.' },
    { icon: Shield, title: 'HTTPS Only', description: 'All API communication is encrypted via TLS 1.3. No unencrypted requests accepted.' },
    { icon: Webhook, title: 'Webhooks', description: 'Real-time event notifications for conversions, payments, and campaign status changes.' },
    { icon: Database, title: 'Sandbox Mode', description: 'Test your integration with sandbox API keys — no real money, no real ads served.' },
];

const codeExample = `// Authentication
const API_KEY = "your_api_key_here";

// Fetch earnings for last 7 days  
const response = await fetch(
  "https://api.mrpop.io/v1/stats?period=7d",
  {
    headers: {
      "Authorization": \`Bearer \${API_KEY}\`,
      "Content-Type": "application/json"
    }
  }
);

const data = await response.json();
// { earnings: "$1,234.56", impressions: 456789, ... }`;

export default function ApiDocsPage() {
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
                const methodColors = { GET: 'bg-green-500/20 text-green-400', POST: 'bg-blue-500/20 text-blue-400', PUT: 'bg-yellow-500/20 text-yellow-400', DELETE: 'bg-red-500/20 text-red-400' };
                const methodColorsBrt = { GET: 'bg-green-100 text-green-800', POST: 'bg-blue-100 text-blue-800', PUT: 'bg-yellow-100 text-yellow-800', DELETE: 'bg-red-100 text-red-800' };

                return (
                    <div className="relative z-10">
                        {/* Hero */}
                        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
                            <div className="max-w-4xl mx-auto">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 ${accentBg} border border-current/20 rounded-full ${accentText} text-sm font-medium mb-6`}>
                                    <Code className="w-4 h-4" /> REST API v1
                                </div>
                                <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${isBrutalist ? 'uppercase tracking-tighter font-black' : ''}`}>
                                    API <span className={accentText}>Reference</span>
                                </h1>
                                <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : isEditorial ? 'text-gray-500' : 'text-muted-foreground'}`}>
                                    Programmatically manage campaigns, retrieve stats, and automate your ad operations with our RESTful API.
                                </p>
                                <div className={`inline-flex items-center gap-3 px-6 py-3 font-mono text-sm ${codeBg}`}>
                                    <Server className="w-4 h-4" /> Base URL: https://api.mrpop.io/v1
                                </div>
                            </div>
                        </section>

                        {/* Features */}
                        <section className="max-w-7xl mx-auto px-6 py-16">
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

                        {/* Endpoints */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Endpoints</h2>
                            <div className={cardCls}>
                                <div className="space-y-0">
                                    {endpoints.map((ep, i) => (
                                        <div key={i} className={`flex flex-col md:flex-row md:items-center gap-3 py-4 ${i > 0 ? `border-t ${isBrutalist ? 'border-foreground/30' : isEditorial ? 'border-gray-200' : 'border-white/5'}` : ''}`}>
                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-bold ${isBrutalist || isEditorial ? methodColorsBrt[ep.method] : methodColors[ep.method]} ${isBrutalist ? '' : 'rounded'} w-20 justify-center flex-shrink-0`}>{ep.method}</span>
                                            <code className={`font-mono font-bold text-sm ${accentText} md:w-56 flex-shrink-0`}>{ep.path}</code>
                                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{ep.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Code Example */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Example Request</h2>
                            <div className={`${codeBg} p-8 font-mono text-sm overflow-x-auto`}>
                                <pre className="whitespace-pre">{codeExample}</pre>
                            </div>
                        </section>

                        {/* CTA */}
                        <section className="max-w-7xl mx-auto px-6 py-20">
                            <div className={`${cardCls} text-center !p-12`}>
                                <Key className={`w-16 h-16 ${accentText} mx-auto mb-4`} />
                                <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Get Your API Key</h2>
                                <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sign up and generate your API key from the dashboard</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/register" className={`inline-flex items-center gap-2 px-10 py-5 text-lg transition-all ${isBrutalist ? 'bg-foreground text-background font-black uppercase tracking-wider border-2 border-foreground hover:bg-accent hover:text-foreground' : isEditorial ? 'bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700' : theme === 'theme-luminous' ? 'bg-lime-400 text-slate-900 font-bold rounded-xl' : theme === 'theme-azure' ? 'bg-sky-500 text-white font-bold rounded-xl' : 'bg-white text-black font-semibold rounded-xl hover:bg-gray-100'}`}>Create Account <ArrowRight className="w-5 h-5" /></Link>
                                    <Link href="/docs" className={`inline-flex items-center gap-2 px-10 py-5 text-lg transition-all ${isBrutalist ? 'border-2 border-foreground font-bold uppercase hover:bg-foreground hover:text-background' : isEditorial ? 'border border-gray-300 font-bold text-xs uppercase tracking-widest hover:border-red-700' : 'border border-white/20 rounded-xl font-bold hover:border-white/40 hover:bg-white/5'}`}>SDK Documentation <ArrowRight className="w-5 h-5" /></Link>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
