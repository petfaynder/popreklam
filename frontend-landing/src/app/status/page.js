'use client';

import Link from 'next/link';
import { Activity, CheckCircle, AlertTriangle, Clock, Server, Globe, Shield, Zap, BarChart3 } from 'lucide-react';
import ThemePageWrapper from '@/components/ThemePageWrapper';

const services = [
    { name: 'Ad Serving Network', status: 'operational', uptime: '99.99%', responseTime: '12ms' },
    { name: 'Publisher Dashboard', status: 'operational', uptime: '99.98%', responseTime: '145ms' },
    { name: 'Advertiser Dashboard', status: 'operational', uptime: '99.98%', responseTime: '152ms' },
    { name: 'Real-Time Reporting API', status: 'operational', uptime: '99.97%', responseTime: '89ms' },
    { name: 'Payment Processing', status: 'operational', uptime: '99.99%', responseTime: '210ms' },
    { name: 'Smart Link Routing', status: 'operational', uptime: '99.99%', responseTime: '8ms' },
    { name: 'Anti-Adblock CDN', status: 'operational', uptime: '99.99%', responseTime: '15ms' },
    { name: 'Campaign Targeting Engine', status: 'operational', uptime: '99.97%', responseTime: '45ms' },
];

const metrics = [
    { label: 'Overall Uptime', value: '99.98%', icon: Activity, desc: 'Last 90 days' },
    { label: 'Avg Response Time', value: '84ms', icon: Zap, desc: 'Across all services' },
    { label: 'Incidents (30d)', value: '0', icon: Shield, desc: 'Zero downtime events' },
    { label: 'Regions', value: '12', icon: Globe, desc: 'Global CDN coverage' },
];

const recentEvents = [
    { date: 'Feb 14, 2026', title: 'Scheduled Maintenance Complete', desc: 'Database optimization completed. No impact to services.', type: 'maintenance' },
    { date: 'Feb 10, 2026', title: 'CDN Expansion — South America', desc: 'Added new edge nodes in São Paulo and Buenos Aires for lower latency.', type: 'improvement' },
    { date: 'Feb 5, 2026', title: 'API v1.3 Release', desc: 'New webhook endpoints and improved rate limiting. See API docs for details.', type: 'improvement' },
    { date: 'Jan 28, 2026', title: 'Dashboard Performance Upgrade', desc: 'Publisher and advertiser dashboards now load 40% faster with optimized queries.', type: 'improvement' },
];

export default function StatusPage() {
    return (
        <ThemePageWrapper>
            {(theme) => {
                const isDark = theme !== 'theme-brutalist' && theme !== 'theme-editorial';
                const isEditorial = theme === 'theme-editorial';
                const isBrutalist = theme === 'theme-brutalist';
                const accentText = theme === 'theme-luminous' ? 'text-lime-400' : theme === 'theme-azure' ? 'text-sky-400' : isEditorial ? 'text-red-700' : isBrutalist ? 'text-primary' : 'text-white';
                const accentBg = theme === 'theme-luminous' ? 'bg-lime-400/10' : theme === 'theme-azure' ? 'bg-sky-500/10' : isEditorial ? 'bg-red-700/10' : isBrutalist ? 'bg-accent/10' : 'bg-white/5';
                const cardCls = isBrutalist ? 'border-2 border-foreground bg-card p-8'
                    : isEditorial ? 'border border-gray-300 bg-white p-8'
                        : 'bg-white/[0.03] border border-white/10 p-8 rounded-2xl backdrop-blur';
                const greenDot = isBrutalist ? 'bg-green-600' : 'bg-green-400';
                const greenText = isBrutalist ? 'text-green-700' : isEditorial ? 'text-green-700' : 'text-green-400';

                return (
                    <div className="relative z-10">
                        {/* Hero */}
                        <section className="max-w-7xl mx-auto px-6 pt-20 pb-10 text-center">
                            <div className="max-w-4xl mx-auto">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-sm font-medium mb-6 ${greenText}`}>
                                    <div className={`w-2 h-2 ${greenDot} rounded-full animate-pulse`}></div> All Systems Operational
                                </div>
                                <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${isBrutalist ? 'uppercase tracking-tighter font-black' : ''}`}>
                                    System <span className={accentText}>Status</span>
                                </h1>
                                <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : isEditorial ? 'text-gray-500' : 'text-muted-foreground'}`}>
                                    Real-time monitoring of all MrPop.io services and infrastructure.
                                </p>
                            </div>
                        </section>

                        {/* Metrics */}
                        <section className="max-w-7xl mx-auto px-6 py-12">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {metrics.map((m, i) => (
                                    <div key={i} className={`${cardCls} text-center`}>
                                        <m.icon className={`w-8 h-8 ${accentText} mx-auto mb-3`} />
                                        <div className="text-3xl font-bold mb-1">{m.value}</div>
                                        <div className={`text-sm font-bold mb-1 ${isBrutalist ? 'uppercase' : ''}`}>{m.label}</div>
                                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{m.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Services */}
                        <section className="max-w-7xl mx-auto px-6 py-16">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Service Status</h2>
                            <div className={cardCls}>
                                <div className="space-y-0">
                                    {services.map((svc, i) => (
                                        <div key={i} className={`flex items-center justify-between py-4 ${i > 0 ? `border-t ${isBrutalist ? 'border-foreground/30' : isEditorial ? 'border-gray-200' : 'border-white/5'}` : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 ${greenDot} rounded-full`}></div>
                                                <span className={`font-bold ${isBrutalist ? 'uppercase text-sm' : ''}`}>{svc.name}</span>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} hidden md:block`}>{svc.responseTime}</span>
                                                <span className={`text-xs font-bold ${greenText} hidden sm:block`}>{svc.uptime}</span>
                                                <span className={`text-xs font-bold px-3 py-1 ${isBrutalist ? 'bg-green-100 text-green-800 border border-green-800' : isEditorial ? 'bg-green-50 text-green-700 border border-green-300' : 'bg-green-500/10 text-green-400 rounded-full'}`}>
                                                    Operational
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Recent Events */}
                        <section className="max-w-7xl mx-auto px-6 py-16">
                            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isBrutalist ? 'uppercase tracking-tighter' : ''}`}>Recent Updates</h2>
                            <div className="max-w-3xl mx-auto space-y-4">
                                {recentEvents.map((evt, i) => (
                                    <div key={i} className={cardCls}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center ${evt.type === 'maintenance' ? (isBrutalist ? 'bg-yellow-100' : isEditorial ? 'bg-yellow-50' : 'bg-yellow-500/10') : accentBg} ${isBrutalist ? '' : 'rounded-xl'}`}>
                                                {evt.type === 'maintenance' ? <Clock className="w-5 h-5 text-yellow-600" /> : <CheckCircle className={`w-5 h-5 ${accentText}`} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className={`font-bold ${isBrutalist ? 'uppercase' : ''}`}>{evt.title}</h3>
                                                </div>
                                                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{evt.desc}</p>
                                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{evt.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
