'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Eye, MousePointerClick, TrendingUp, DollarSign,
    Loader2, Globe, Smartphone, Copy, CheckCheck, BarChart2, Target,
    ShoppingCart, Percent, Activity, Code2, ChevronDown, ChevronUp,
    Info, CheckCircle2, Clock, Hash
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

const DEVICE_COLORS = ['#a3e635', '#38bdf8', '#f472b6', '#fb923c', '#818cf8'];

export default function CampaignAnalyticsPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const params = useParams();
    const router = useRouter();
    const campaignId = params?.id;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [conversionTag, setConversionTag] = useState(null);
    const [tagLoading, setTagLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [metric, setMetric] = useState('impressions');
    const [error, setError] = useState(null);
    const [showPixelGuide, setShowPixelGuide] = useState(false);
    const [showConversions, setShowConversions] = useState(false);

    useEffect(() => {
        if (!campaignId) return;
        fetchAnalytics();
    }, [campaignId]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/advertiser/campaigns/${campaignId}/analytics`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) throw new Error('Failed to fetch analytics');
            const result = await res.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchConversionTag = async () => {
        try {
            setTagLoading(true);
            const res = await fetch(`/api/advertiser/campaigns/${campaignId}/conversion-tag`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await res.json();
            setConversionTag(result.tag);
            setShowPixelGuide(true);
        } catch { } finally { setTagLoading(false); }
    };

    const copyTag = () => {
        navigator.clipboard.writeText(conversionTag || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    const gridColor = d.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const tooltipBg = d.isDark ? '#0D0D1A' : '#fff';
    const tooltipBorder = d.isDark ? '#ffffff15' : '#e5e7eb';
    const mutedBg = d.isDark ? 'bg-white/5' : 'bg-gray-50';
    const borderColor = d.isDark ? 'border-white/8' : 'border-gray-200';

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className={`w-12 h-12 ${d.loaderColor} animate-spin`} />
        </div>
    );

    if (error || !data) return (
        <div className={`${d.card} text-center py-16`}>
            <p className={subText}>Failed to load analytics. <button onClick={fetchAnalytics} className="text-lime-400 underline">Retry</button></p>
        </div>
    );

    const { campaign, summary, hourly, countries, devices, recentConversions = [] } = data;
    const hasConversions = summary.conversions > 0;

    // KPI stats
    const STATS = [
        { label: 'Impressions', value: summary.impressions.toLocaleString(), icon: Eye, color: 'text-sky-400', bg: 'bg-sky-400/10' },
        { label: 'Clicks', value: summary.clicks.toLocaleString(), icon: MousePointerClick, color: 'text-orange-400', bg: 'bg-orange-400/10' },
        { label: 'CTR', value: `${summary.ctr}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Spent', value: `$${summary.spent.toFixed(2)}`, icon: DollarSign, color: 'text-lime-400', bg: 'bg-lime-400/10' },
        { label: 'eCPM', value: `$${summary.eCPM}`, icon: BarChart2, color: 'text-pink-400', bg: 'bg-pink-400/10' },
        { label: 'Budget Left', value: `$${(summary.budget - summary.spent).toFixed(2)}`, icon: Target, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    ];

    // Conversion KPIs
    const CONVERSION_STATS = [
        {
            label: 'Total Conversions',
            value: summary.conversions.toLocaleString(),
            icon: ShoppingCart,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            desc: 'Verified purchase/signup events'
        },
        {
            label: 'Conv. Rate',
            value: `${summary.conversionRate}%`,
            icon: Percent,
            color: 'text-violet-400',
            bg: 'bg-violet-400/10',
            desc: 'Conversions ÷ Clicks'
        },
        {
            label: 'CPA',
            value: summary.cpa ? `$${summary.cpa}` : '—',
            icon: Activity,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            desc: 'Cost per acquisition'
        },
    ];

    const METRIC_OPTIONS = [
        { key: 'impressions', label: 'Impressions', color: '#38bdf8' },
        { key: 'clicks', label: 'Clicks', color: '#fb923c' },
        { key: 'spent', label: 'Spent ($)', color: '#a3e635' },
        { key: 'conversions', label: 'Conversions', color: '#34d399' },
    ];

    const activeMetricColor = METRIC_OPTIONS.find(m => m.key === metric)?.color || '#a3e635';

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className={`${d.btnSecondary} p-2.5`}>
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className={d.heading}>{campaign.name}</h1>
                    <p className={`${d.subheading} mt-0.5`}>{campaign.adFormat} · {campaign.status} — All-time Performance</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {STATS.map((stat, i) => (
                    <div key={i} className={`${d.card} flex flex-col items-center text-center p-4 gap-2`}>
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div className={`text-xl font-black tracking-tighter ${headText}`}>{stat.value}</div>
                        <div className={`text-[10px] uppercase tracking-widest font-medium ${subText}`}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* ─── CONVERSION TRACKING BANNER ─── */}
            <div className={`rounded-2xl border ${borderColor} overflow-hidden`}
                style={{
                    background: d.isDark
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(139,92,246,0.06) 100%)'
                        : 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(139,92,246,0.04) 100%)'
                }}>

                {/* Top bar */}
                <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-400/15">
                            <ShoppingCart className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className={`text-base font-bold ${headText}`}>Conversion Tracking</h2>
                            <p className={`text-xs ${subText}`}>
                                {hasConversions
                                    ? `${summary.conversions} verified conversions · ${summary.conversionRate}% conv. rate`
                                    : 'No conversions recorded yet — set up your pixel below'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasConversions && (
                            <button
                                onClick={() => setShowConversions(!showConversions)}
                                className={`${d.btnSecondary} flex items-center gap-1.5 text-xs px-3 py-2`}
                            >
                                <Clock className="w-3.5 h-3.5" />
                                Recent
                                {showConversions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                        )}
                        <button
                            onClick={conversionTag ? () => setShowPixelGuide(!showPixelGuide) : fetchConversionTag}
                            disabled={tagLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-500 hover:bg-emerald-400 text-white"
                        >
                            {tagLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code2 className="w-4 h-4" />}
                            {conversionTag ? (showPixelGuide ? 'Hide Pixel' : 'Show Pixel') : 'Get Pixel Code'}
                        </button>
                    </div>
                </div>

                {/* Conversion KPI row */}
                {hasConversions && (
                    <div className={`grid grid-cols-3 divide-x ${d.isDark ? 'divide-white/8 border-t border-white/8' : 'divide-gray-200 border-t border-gray-200'}`}>
                        {CONVERSION_STATS.map((stat, i) => (
                            <div key={i} className="px-5 py-4 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${stat.bg} flex-shrink-0`}>
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                                <div>
                                    <div className={`text-lg font-black tracking-tighter ${headText}`}>{stat.value}</div>
                                    <div className={`text-[10px] uppercase tracking-widest font-medium ${subText}`}>{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Conversion Pixel Setup Guide */}
                {showPixelGuide && conversionTag && (
                    <div className={`border-t ${d.isDark ? 'border-white/8' : 'border-gray-200'} p-5 space-y-4`}>

                        {/* How it works */}
                        <div className={`rounded-xl p-4 ${d.isDark ? 'bg-sky-400/8 border border-sky-400/15' : 'bg-sky-50 border border-sky-200'}`}>
                            <div className="flex items-start gap-3">
                                <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className={`text-sm font-semibold ${d.isDark ? 'text-sky-300' : 'text-sky-700'} mb-2`}>Nasıl Çalışır? (How it works)</p>
                                    <ol className={`text-xs space-y-1.5 ${d.isDark ? 'text-sky-200/70' : 'text-sky-800/70'}`}>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-sky-400 flex-shrink-0">1.</span>
                                            Kullanıcı reklamınıza tıklar → URL'nize <code className="bg-sky-400/10 px-1 rounded font-mono">?click_id=abc123</code> eklenir
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-sky-400 flex-shrink-0">2.</span>
                                            Kullanıcı sitenizde satın alma / kayıt işlemini tamamlar
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-sky-400 flex-shrink-0">3.</span>
                                            "Teşekkürler" sayfanıza koyduğunuz pixel → click_id'yi okur → PopReklam'a conversion bildirir
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-sky-400 flex-shrink-0">4.</span>
                                            Dashboardunuzda conversion sayısı ve CPA güncellenir ✓
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* Step 1: Backend */}
                        <div>
                            <p className={`text-[11px] font-bold uppercase tracking-wider ${subText} mb-2`}>Step 1 — Read click_id in your backend</p>
                            <div className={`relative rounded-xl border ${borderColor} overflow-hidden`}>
                                <pre className={`text-xs p-4 overflow-x-auto font-mono ${d.isDark ? 'bg-black/40 text-gray-300' : 'bg-gray-950 text-gray-300'}`}>
{`// PHP örneği:
$click_id = $_GET['click_id'] ?? '';

// Node.js örneği:
const clickId = req.query.click_id || '';

// Python (Flask):
click_id = request.args.get('click_id', '')`}
                                </pre>
                            </div>
                        </div>

                        {/* Step 2: Pixel */}
                        <div>
                            <p className={`text-[11px] font-bold uppercase tracking-wider ${subText} mb-2`}>Step 2 — Place pixel on Thank You page</p>
                            <div className={`relative rounded-xl border ${borderColor} overflow-hidden`}>
                                <pre className={`text-xs p-4 overflow-x-auto font-mono ${d.isDark ? 'bg-black/40 text-gray-300' : 'bg-gray-950 text-gray-300'} whitespace-pre-wrap`}>
                                    {conversionTag}
                                </pre>
                                <button
                                    onClick={copyTag}
                                    className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${copied
                                            ? 'bg-emerald-400/20 text-emerald-400'
                                            : d.isDark ? 'bg-white/8 text-gray-300 hover:bg-white/15' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                        }`}
                                >
                                    {copied ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                                </button>
                            </div>
                        </div>

                        {/* Replace note */}
                        <div className={`flex items-start gap-2 text-xs ${subText}`}>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>
                                <code className={`px-1.5 py-0.5 rounded font-mono text-yellow-400 ${d.isDark ? 'bg-yellow-400/10' : 'bg-yellow-50 border border-yellow-200'}`}>{'{CLICK_ID}'}</code>
                                {' '}yerine kendi backend'inizden okuduğunuz <code className="font-mono">click_id</code> değerini koyun.
                                Örnek: <code className={`px-1 rounded font-mono ${d.isDark ? 'text-gray-300' : 'text-gray-600'}`}>{`src="/api/serve/pixel/<?php echo $click_id; ?>"`}</code>
                            </span>
                        </div>
                    </div>
                )}

                {/* Recent Conversions Table */}
                {showConversions && recentConversions.length > 0 && (
                    <div className={`border-t ${d.isDark ? 'border-white/8' : 'border-gray-200'} p-5`}>
                        <p className={`text-[11px] font-bold uppercase tracking-wider ${subText} mb-3`}>Recent Conversions (last 20)</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className={`${d.isDark ? 'text-gray-500' : 'text-gray-400'} text-left`}>
                                        <th className="pb-2 font-semibold uppercase tracking-wider pr-4">
                                            <div className="flex items-center gap-1"><Hash className="w-3 h-3" /> ID</div>
                                        </th>
                                        <th className="pb-2 font-semibold uppercase tracking-wider pr-4">Click ID</th>
                                        <th className="pb-2 font-semibold uppercase tracking-wider pr-4">IP</th>
                                        <th className="pb-2 font-semibold uppercase tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="space-y-1">
                                    {recentConversions.map((conv, i) => (
                                        <tr key={conv.id} className={`border-t ${d.isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                            <td className={`py-2 pr-4 font-mono ${headText}`}>{conv.id.slice(0, 8)}…</td>
                                            <td className={`py-2 pr-4 font-mono ${subText}`}>{conv.impressionId.slice(0, 12)}…</td>
                                            <td className={`py-2 pr-4 font-mono ${subText}`}>{conv.ip}</td>
                                            <td className={`py-2 ${subText}`}>{timeAgo(conv.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Hourly/Metric Chart */}
            <div className={d.card}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className={`text-base font-bold ${headText}`}>24-Hour Traffic Timeline</h2>
                    <div className="flex gap-2 flex-wrap">
                        {METRIC_OPTIONS.map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => setMetric(opt.key)}
                                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${metric === opt.key
                                        ? 'text-black'
                                        : `${subText} ${d.isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`
                                    }`}
                                style={metric === opt.key ? { backgroundColor: opt.color } : {}}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={hourly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={activeMetricColor} stopOpacity={0.25} />
                                <stop offset="95%" stopColor={activeMetricColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: d.isDark ? '#6b7280' : '#9ca3af' }}
                            tickFormatter={v => v.split(' ')[2] || v}
                            interval={2}
                        />
                        <YAxis tick={{ fontSize: 10, fill: d.isDark ? '#6b7280' : '#9ca3af' }} />
                        <Tooltip
                            contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', fontSize: '12px' }}
                            labelStyle={{ color: d.isDark ? '#e5e7eb' : '#111827', fontWeight: 600 }}
                        />
                        <Area
                            type="monotone"
                            dataKey={metric}
                            stroke={activeMetricColor}
                            strokeWidth={2}
                            fill="url(#metricGrad)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Grid: Countries + Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Country Table */}
                <div className={d.card}>
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className={`w-4 h-4 ${subText}`} />
                        <h2 className={`text-base font-bold ${headText}`}>Top Countries</h2>
                    </div>
                    {countries.length === 0 ? (
                        <p className={`text-sm text-center py-8 ${subText}`}>No geo data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {countries.map((c, i) => {
                                const pct = countries[0].impressions > 0 ? (c.impressions / countries[0].impressions) * 100 : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className={`font-semibold ${headText}`}>{c.country}</span>
                                            <span className={subText}>{c.impressions.toLocaleString()} imp · {c.ctr}% CTR</span>
                                        </div>
                                        <div className={`w-full h-1.5 rounded-full ${d.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                            <div className="h-1.5 rounded-full bg-gradient-to-r from-lime-400 to-sky-400" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Device Pie */}
                <div className={d.card}>
                    <div className="flex items-center gap-2 mb-4">
                        <Smartphone className={`w-4 h-4 ${subText}`} />
                        <h2 className={`text-base font-bold ${headText}`}>Device Breakdown</h2>
                    </div>
                    {devices.length === 0 ? (
                        <p className={`text-sm text-center py-8 ${subText}`}>No device data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={devices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                                    {devices.map((_, i) => (
                                        <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', fontSize: '12px' }} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
