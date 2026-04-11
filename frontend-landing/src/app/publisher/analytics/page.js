'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    TrendingUp, DollarSign, Eye, MousePointerClick, Zap,
    Globe, Loader2, RefreshCw, BarChart2, ArrowUpRight, Info
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar
} from 'recharts';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

const REFRESH_INTERVAL = 60_000; // auto-refresh every 60s

export default function PublisherAnalyticsPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [realtime, setRealtime] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [view, setView] = useState('revenue'); // revenue | impressions | clicks

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

    const fetchData = useCallback(async () => {
        try {
            const [rtRes, sumRes] = await Promise.all([
                fetch('/api/publisher/analytics/realtime', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/publisher/analytics/summary', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            const rt = await rtRes.json();
            const sm = await sumRes.json();
            setRealtime(rt);
            setSummary(sm);
            setLastRefresh(new Date());
        } catch (err) {
            console.error('Analytics fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchData]);

    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    const gridColor = d.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
    const tooltipBg = d.isDark ? '#0D0D1A' : '#fff';
    const tooltipBorder = d.isDark ? '#ffffff15' : '#e5e7eb';

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className={`w-12 h-12 animate-spin ${subText}`} />
        </div>
    );

    const today = realtime?.today || {};
    const hourly = realtime?.hourly || [];
    const sites = realtime?.sites || [];
    const days30 = summary?.days || [];

    const METRICS = [
        { key: 'revenue', label: 'Revenue ($)', color: '#a3e635' },
        { key: 'impressions', label: 'Impressions', color: '#38bdf8' },
        { key: 'clicks', label: 'Clicks', color: '#fb923c' },
    ];
    const activeMetric = METRICS.find(m => m.key === view) || METRICS[0];

    const KPI = [
        { label: "Today's Revenue", value: `$${Number(today.revenue || 0).toFixed(4)}`, icon: DollarSign, color: 'text-lime-400', bg: 'bg-lime-400/10' },
        { label: 'Impressions', value: Number(today.impressions || 0).toLocaleString(), icon: Eye, color: 'text-sky-400', bg: 'bg-sky-400/10' },
        { label: 'Clicks', value: Number(today.clicks || 0).toLocaleString(), icon: MousePointerClick, color: 'text-orange-400', bg: 'bg-orange-400/10' },
        { label: 'eCPM', value: `$${today.eCPM || '0.0000'}`, icon: BarChart2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Last Hour', value: `$${Number(realtime?.lastHourRevenue || 0).toFixed(4)}`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        { label: 'Projected Daily', value: `$${realtime?.projectedDaily || '0.00'}`, icon: TrendingUp, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className={d.heading}>Real-Time Analytics</h1>
                    <p className={`${d.subheading} mt-0.5`}>
                        {lastRefresh ? `Last updated: ${lastRefresh.toLocaleTimeString()} · auto-refreshes every 60s` : 'Loading...'}
                    </p>
                </div>
                <button onClick={() => { setLoading(true); fetchData(); }}
                    className={`${d.btnSecondary} flex items-center gap-2 text-sm`}>
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {KPI.map((k, i) => (
                    <div key={i} className={`${d.card} flex flex-col items-center text-center p-4 gap-2`}>
                        <div className={`p-2 rounded-lg ${k.bg}`}>
                            <k.icon className={`w-4 h-4 ${k.color}`} />
                        </div>
                        <div className={`text-xl font-black tracking-tighter ${headText}`}>{k.value}</div>
                        <div className={`text-[10px] uppercase tracking-widest font-medium ${subText}`}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* Hourly Chart */}
            <div className={d.card}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className={`text-base font-bold ${headText}`}>24-Hour Breakdown</h2>
                    <div className="flex gap-2">
                        {METRICS.map(m => (
                            <button key={m.key} onClick={() => setView(m.key)}
                                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${view === m.key ? 'text-black' : `${subText} ${d.isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}`}
                                style={view === m.key ? { backgroundColor: m.color } : {}}>
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={hourly} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={activeMetric.color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={activeMetric.color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: d.isDark ? '#6b7280' : '#9ca3af' }} interval={3} />
                        <YAxis tick={{ fontSize: 10, fill: d.isDark ? '#6b7280' : '#9ca3af' }} />
                        <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey={view} stroke={activeMetric.color} strokeWidth={2} fill="url(#rtGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom: 30-day bar + site table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 30-day bar */}
                <div className={d.card}>
                    <h2 className={`text-base font-bold mb-4 ${headText}`}>30-Day Revenue History</h2>
                    {days30.length === 0 ? (
                        <div className={`text-sm text-center py-10 ${subText}`}>No data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={days30} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 9, fill: d.isDark ? '#6b7280' : '#9ca3af' }}
                                    tickFormatter={v => v.slice(5)} interval={4} />
                                <YAxis tick={{ fontSize: 10, fill: d.isDark ? '#6b7280' : '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', fontSize: '12px' }}
                                    formatter={(v) => [`$${Number(v).toFixed(4)}`, 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill="#a3e635" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Top Sites */}
                <div className={d.card}>
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className={`w-4 h-4 ${subText}`} />
                        <h2 className={`text-base font-bold ${headText}`}>Top Sites Today</h2>
                    </div>
                    {sites.length === 0 ? (
                        <div className={`text-sm text-center py-10 ${subText}`}>No impressions today yet</div>
                    ) : (
                        <div className="space-y-3">
                            {sites.map((s, i) => {
                                const maxRev = sites[0]?.revenue || 0;
                                const pct = maxRev > 0 ? (Number(s.revenue) / Number(maxRev)) * 100 : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className={`font-semibold truncate max-w-[160px] ${headText}`}>{s.domain}</span>
                                            <span className={`tabular-nums ${subText}`}>${Number(s.revenue).toFixed(4)} · {Number(s.impressions).toLocaleString()} imp</span>
                                        </div>
                                        <div className={`w-full h-1.5 rounded-full ${d.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                            <div className="h-1.5 rounded-full bg-lime-400" style={{ width: `${pct}%`, transition: 'width .5s' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Info footer */}
            <div className={`flex items-center gap-2 text-xs ${subText}`}>
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Revenue figures represent your publisher share after platform commission. Auto-refreshes every 60 seconds.
            </div>
        </div>
    );
}
