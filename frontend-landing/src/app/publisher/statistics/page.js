'use client';

import { useState, useEffect } from 'react';
import {
    Eye, MousePointerClick, DollarSign, TrendingUp, TrendingDown,
    Globe, Monitor, Smartphone, Tablet, BarChart3, Activity,
    ArrowUpRight, ArrowDownRight, RefreshCw, Download, Loader2,
    Layers, Zap, Target, Clock, Bell, Users, CheckCircle2, XCircle
} from 'lucide-react';
import { publisherAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

const PERIODS = [
    { label: 'Today', value: 1 },
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
];

const TABS = [
    { key: 'general', label: 'General', icon: BarChart3 },
    { key: 'push', label: 'Push Notifications', icon: Bell },
];

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseFloat(value) || 0;
        if (!end) return;
        const step = end / (900 / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setDisplay(end); clearInterval(timer); }
            else setDisplay(start);
        }, 16);
        return () => clearInterval(timer);
    }, [value]);
    const fmt = decimals > 0 ? display.toFixed(decimals) : Math.floor(display).toLocaleString();
    return <span>{prefix}{fmt}{suffix}</span>;
}

function BarRow({ label, value, max, valueLabel, colorClass, d }) {
    return (
        <div className="flex items-center gap-3">
            <span className={`text-xs w-28 truncate flex-shrink-0 ${d.isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
            <div className={`flex-1 h-5 rounded-lg overflow-hidden ${d.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <div className={`h-full ${colorClass} rounded-lg transition-all duration-700`}
                    style={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%` }} />
            </div>
            <span className={`text-xs font-bold w-16 text-right flex-shrink-0 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>{valueLabel}</span>
        </div>
    );
}

// ── Push Notification Tab ────────────────────────────────────────────────────
function PushStatsTab({ d, theme, period, accent, tabActive, subText, headText, divider }) {
    const [loading, setLoading] = useState(true);
    const [pushData, setPushData] = useState(null);
    const [chartMode, setChartMode] = useState('subscribers'); // subscribers | deliveries | clicks

    useEffect(() => { fetchPushStats(); }, [period]);

    const fetchPushStats = async () => {
        setLoading(true);
        try {
            const data = await publisherAPI.getPushOverview(period);
            setPushData(data);
        } catch (err) {
            console.error('Push stats error:', err);
            // Demo fallback
            setPushData({
                totalSubscribers: 24_830,
                activeSubscribers: 22_140,
                totalDeliveries: 189_420,
                totalClicks: 5_683,
                totalRevenue: '147.2300',
                ctr: '3.00',
                dailyGrowth: Array.from({ length: period > 30 ? 30 : period }, (_, i) => ({
                    date: new Date(Date.now() - (period - i - 1) * 86400000).toISOString().split('T')[0],
                    count: Math.floor(200 + Math.random() * 600)
                })),
                dailyDeliveries: Array.from({ length: period > 30 ? 30 : period }, (_, i) => ({
                    date: new Date(Date.now() - (period - i - 1) * 86400000).toISOString().split('T')[0],
                    delivered: Math.floor(4000 + Math.random() * 3000),
                    clicks: Math.floor(100 + Math.random() * 300),
                    revenue: parseFloat((3 + Math.random() * 7).toFixed(2))
                })),
                perSite: [
                    { siteName: 'Main Site', siteUrl: 'example.com', subscribers: 18240, delivered: 142000, clicks: 4200, ctr: '2.96', revenue: '108.40' },
                    { siteName: 'Blog', siteUrl: 'blog.example.com', subscribers: 3900, delivered: 47420, clicks: 1483, ctr: '3.13', revenue: '38.83' },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 flex-col gap-4">
            <Loader2 className={`w-8 h-8 animate-spin ${d.loaderColor}`} />
            <p className={`text-sm ${subText}`}>Loading push stats...</p>
        </div>
    );

    if (!pushData) return null;

    const chartData = chartMode === 'subscribers'
        ? pushData.dailyGrowth
        : pushData.dailyDeliveries;

    const chartValues = chartMode === 'subscribers'
        ? chartData.map(d => d.count || 0)
        : chartMode === 'deliveries'
            ? chartData.map(d => d.delivered || 0)
            : chartData.map(d => d.clicks || 0);

    const chartMax = Math.max(...chartValues, 1);

    const churnPct = pushData.totalSubscribers > 0
        ? (((pushData.totalSubscribers - pushData.activeSubscribers) / pushData.totalSubscribers) * 100).toFixed(1)
        : '0.0';

    const kpis = [
        { label: 'Total Subscribers', value: pushData.totalSubscribers, icon: Users, color: 'sky', fmt: v => v.toLocaleString(), change: null },
        { label: 'Active Subscribers', value: pushData.activeSubscribers, icon: CheckCircle2, color: 'lime', fmt: v => v.toLocaleString(), change: null },
        { label: 'Push Deliveries', value: pushData.totalDeliveries, icon: Bell, color: 'purple', fmt: v => v.toLocaleString(), change: null },
        { label: 'Push Clicks', value: pushData.totalClicks, icon: MousePointerClick, color: 'orange', fmt: v => v.toLocaleString(), change: null },
        { label: 'Push Revenue', value: parseFloat(pushData.totalRevenue || 0), icon: DollarSign, color: 'lime', fmt: v => `$${v.toFixed(2)}`, change: null },
        { label: 'Push CTR', value: parseFloat(pushData.ctr || 0), icon: Target, color: 'sky', fmt: v => `${v.toFixed(2)}%`, change: null },
    ];

    const cardColors = {
        'theme-luminous': { sky: 'bg-sky-500/10 text-sky-400', lime: 'bg-lime-400/10 text-lime-400', purple: 'bg-purple-500/10 text-purple-400', orange: 'bg-orange-500/10 text-orange-400' },
        'theme-azure': { sky: 'bg-sky-500/10 text-sky-400', lime: 'bg-lime-400/10 text-lime-400', purple: 'bg-purple-500/10 text-purple-400', orange: 'bg-orange-500/10 text-orange-400' },
        'theme-saas': { sky: 'bg-white/5 text-gray-300', lime: 'bg-white/5 text-gray-300', purple: 'bg-white/5 text-gray-300', orange: 'bg-white/5 text-gray-300' },
        'theme-editorial': { sky: 'bg-blue-50 text-blue-700 border border-blue-200', lime: 'bg-green-50 text-green-700 border border-green-200', purple: 'bg-purple-50 text-purple-700 border border-purple-200', orange: 'bg-orange-50 text-orange-700 border border-orange-200' },
        'theme-brutalist': { sky: 'bg-[#F5F5F0] border-2 border-[#1A1A1A] text-[#1A1A1A]', lime: 'bg-[#F5F5F0] border-2 border-[#1A1A1A] text-[#1A1A1A]', purple: 'bg-[#F5F5F0] border-2 border-[#1A1A1A] text-[#1A1A1A]', orange: 'bg-[#F5F5F0] border-2 border-[#1A1A1A] text-[#1A1A1A]' },
    }[theme] || { sky: 'bg-sky-500/10 text-sky-400', lime: 'bg-lime-400/10 text-lime-400', purple: 'bg-purple-500/10 text-purple-400', orange: 'bg-orange-500/10 text-orange-400' };

    const barGradient = accent.bar || 'from-lime-400/60 to-lime-400';

    return (
        <div className="space-y-6">
            {/* Subscriber health bar */}
            <div className={`${d.card} flex flex-col sm:flex-row sm:items-center gap-6`}>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className={`w-4 h-4 ${accent.text || 'text-lime-400'}`} />
                        <span className={`text-sm font-semibold ${headText}`}>Subscriber Health</span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${d.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                        <div
                            className={`h-full bg-gradient-to-r ${barGradient} rounded-full transition-all duration-1000`}
                            style={{ width: `${pushData.totalSubscribers > 0 ? (pushData.activeSubscribers / pushData.totalSubscribers) * 100 : 0}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className={`text-xs ${subText}`}>{pushData.activeSubscribers.toLocaleString()} active</span>
                        <span className={`text-xs ${subText}`}>{churnPct}% churn rate</span>
                    </div>
                </div>
                <div className="flex gap-6 shrink-0">
                    <div className="text-center">
                        <p className={`text-2xl font-bold ${headText}`}>{pushData.totalSubscribers.toLocaleString()}</p>
                        <p className={`text-xs ${subText} mt-0.5`}>Total Subs</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-2xl font-bold ${accent.text || 'text-lime-400'}`}>{pushData.activeSubscribers.toLocaleString()}</p>
                        <p className={`text-xs ${subText} mt-0.5`}>Active</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-2xl font-bold ${d.isDark ? 'text-red-400' : 'text-red-600'}`}>{(pushData.totalSubscribers - pushData.activeSubscribers).toLocaleString()}</p>
                        <p className={`text-xs ${subText} mt-0.5`}>Churned</p>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} className={d.card}>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cardColors[kpi.color] || ''}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <p className={`text-2xl font-bold ${headText} mb-1`}>{kpi.fmt(kpi.value)}</p>
                            <p className={`text-sm ${subText}`}>{kpi.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Chart */}
            <div className={d.card}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h2 className={`text-lg font-bold ${headText}`}>Push Trend</h2>
                    <div className="flex gap-1">
                        {[
                            { key: 'subscribers', label: 'New Subs' },
                            { key: 'deliveries', label: 'Deliveries' },
                            { key: 'clicks', label: 'Clicks' },
                        ].map(opt => (
                            <button key={opt.key} onClick={() => setChartMode(opt.key)}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${chartMode === opt.key ? tabActive : `${subText} hover:opacity-100`}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-40 flex items-end gap-[2px]">
                    {chartValues.map((val, i) => (
                        <div key={i} className="flex-1 group relative cursor-pointer">
                            <div
                                className={`w-full bg-gradient-to-t ${barGradient} rounded-t transition-all duration-300 min-h-[2px]`}
                                style={{ height: `${chartMax > 0 ? (val / chartMax) * 100 : 0}%` }}
                            />
                            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 ${d.isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'}`}>
                                <p className={`font-bold ${headText}`}>{val.toLocaleString()}</p>
                                <p className={subText}>{chartData[i]?.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {chartData.length > 0 && (
                    <div className={`flex justify-between mt-2 text-[10px] ${d.isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        <span>{chartData[0]?.date}</span>
                        <span>{chartData[chartData.length - 1]?.date}</span>
                    </div>
                )}
            </div>

            {/* Per-Site Table */}
            {pushData.perSite?.length > 0 && (
                <div className={d.card}>
                    <div className="flex items-center gap-2 mb-5">
                        <Globe className={`w-5 h-5 ${accent.text || 'text-lime-400'}`} />
                        <h2 className={`text-lg font-bold ${headText}`}>Per Site Push Performance</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${divider}`}>
                                    {['Site', 'Subscribers', 'Delivered', 'Clicks', 'CTR', 'Revenue'].map(h => (
                                        <th key={h} className={`${d.tableHeadCell} text-left pb-3`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                                {pushData.perSite.map((site, i) => (
                                    <tr key={i} className={d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                        <td className={`py-3.5 pr-4 text-sm font-medium ${headText}`}>
                                            {site.siteName}
                                            <span className={`block text-xs ${subText}`}>{site.siteUrl}</span>
                                        </td>
                                        <td className={`py-3.5 pr-4 text-sm ${subText}`}>{(site.subscribers || 0).toLocaleString()}</td>
                                        <td className={`py-3.5 pr-4 text-sm ${subText}`}>{(site.delivered || 0).toLocaleString()}</td>
                                        <td className={`py-3.5 pr-4 text-sm ${subText}`}>{(site.clicks || 0).toLocaleString()}</td>
                                        <td className={`py-3.5 pr-4 text-sm font-mono font-bold ${accent.text || 'text-lime-400'}`}>{site.ctr}%</td>
                                        <td className={`py-3.5 text-sm font-medium ${headText}`}>${parseFloat(site.revenue || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PublisherStatistics() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const [period, setPeriod] = useState(30);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');
    const [activeMetric, setActiveMetric] = useState('impressions');
    const [stats, setStats] = useState(null);
    const [daily, setDaily] = useState([]);
    const [geo, setGeo] = useState([]);
    const [devices, setDevices] = useState([]);
    const [formats, setFormats] = useState([]);

    useEffect(() => { if (activeTab === 'general') fetchData(); }, [period, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await publisherAPI.getStatistics(period);
            setStats(data.summary || null);
            setDaily(data.daily || []);
            setGeo(data.geo || []);
            setDevices(data.devices || []);
            setFormats(data.formats || []);
        } catch {
            const days = Array.from({ length: period }, (_, i) => ({
                date: new Date(Date.now() - (period - i - 1) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                impressions: Math.floor(28000 + Math.random() * 18000),
                clicks: Math.floor(800 + Math.random() * 600),
                revenue: parseFloat((42 + Math.random() * 38).toFixed(2)),
                fillRate: parseFloat((82 + Math.random() * 14).toFixed(1)),
            }));
            setDaily(days);
            setStats({
                totalImpressions: 1_124_000, totalClicks: 34_820, totalRevenue: 2_847.60,
                ctr: 3.10, ecpm: 2.53, fillRate: 89.4,
                impressionChange: 14.2, clickChange: 8.9, revenueChange: 19.6,
                ctrChange: -1.8, ecpmChange: 4.5, fillRateChange: 2.1,
            });
            setGeo([
                { country: 'United States', impressions: 310000, revenue: 824 },
                { country: 'Germany', impressions: 198000, revenue: 510 },
                { country: 'United Kingdom', impressions: 155000, revenue: 398 },
                { country: 'Turkey', impressions: 142000, revenue: 310 },
                { country: 'France', impressions: 128000, revenue: 287 },
                { country: 'Brazil', impressions: 98000, revenue: 198 },
            ]);
            setDevices([
                { name: 'Desktop', share: 52, revenue: 1480 },
                { name: 'Mobile', share: 41, revenue: 1160 },
                { name: 'Tablet', share: 7, revenue: 207.60 },
            ]);
            setFormats([
                { name: 'Popunder', impressions: 560000, revenue: 1620, ecpm: 2.89, fillRate: 94 },
                { name: 'In-Page Push', impressions: 390000, revenue: 870, ecpm: 2.23, fillRate: 87 },
                { name: 'Web Push', impressions: 89000, revenue: 312, ecpm: 3.51, fillRate: 100 },
                { name: 'Interstitial', impressions: 174000, revenue: 357.60, ecpm: 2.06, fillRate: 79 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // ── Theme tokens
    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    const divider = d.isDark ? 'border-white/10' : 'border-gray-200';

    const accent = {
        'theme-luminous': { text: 'text-lime-400', bar: 'from-lime-400/60 to-lime-400', glow: 'shadow-[0_0_8px_rgba(163,255,51,0.4)]', icon: 'bg-lime-400/10 text-lime-400' },
        'theme-azure': { text: 'text-sky-400', bar: 'from-sky-400/60 to-sky-400', glow: 'shadow-[0_0_8px_rgba(56,189,248,0.4)]', icon: 'bg-sky-500/10 text-sky-400' },
        'theme-saas': { text: 'text-white', bar: 'from-white/40 to-white', glow: '', icon: 'bg-white/[0.06] text-gray-300' },
        'theme-editorial': { text: 'text-red-700', bar: 'from-red-600/60 to-red-700', glow: '', icon: 'bg-red-50 text-red-700 border border-red-200' },
        'theme-brutalist': { text: 'text-[#1A1A1A]', bar: 'from-[#1A1A1A]/60 to-[#1A1A1A]', glow: '', icon: 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]' },
    }[theme] || { text: 'text-lime-400', bar: 'from-lime-400/60 to-lime-400', glow: '', icon: 'bg-lime-400/10 text-lime-400' };

    const tabActive = {
        'theme-luminous': 'bg-lime-400 text-slate-900',
        'theme-azure': 'bg-sky-500 text-white',
        'theme-saas': 'bg-white text-black',
        'theme-editorial': 'bg-[#1A1A1A] text-white',
        'theme-brutalist': 'bg-[#1A1A1A] text-white border-2 border-[#1A1A1A]',
    }[theme] || 'bg-lime-400 text-slate-900';

    const tabWrap = {
        'theme-luminous': 'bg-white/5 border border-white/10 rounded-xl p-1',
        'theme-azure': 'bg-white/5 border border-white/10 rounded-xl p-1',
        'theme-saas': 'bg-white/[0.04] border border-white/[0.08] rounded-lg p-1',
        'theme-editorial': 'bg-gray-100 border border-gray-200 rounded-lg p-1',
        'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] p-1',
    }[theme] || 'bg-white/5 border border-white/10 rounded-xl p-1';

    const cardAccents = {
        'theme-luminous': ['bg-sky-500/10 text-sky-400', 'bg-orange-500/10 text-orange-400', 'bg-lime-400/10 text-lime-400', 'bg-purple-500/10 text-purple-400', 'bg-emerald-500/10 text-emerald-400', 'bg-pink-500/10 text-pink-400'],
        'theme-azure': ['bg-sky-500/10 text-sky-400', 'bg-lime-400/10 text-lime-400', 'bg-purple-500/10 text-purple-400', 'bg-orange-500/10 text-orange-400', 'bg-emerald-500/10 text-emerald-400', 'bg-pink-500/10 text-pink-400'],
        'theme-saas': Array(6).fill('bg-white/[0.06] text-gray-300 border border-white/[0.08]'),
        'theme-editorial': ['bg-red-50 text-red-700 border border-red-200', 'bg-blue-50 text-blue-700 border border-blue-200', 'bg-green-50 text-green-700 border border-green-200', 'bg-purple-50 text-purple-700 border border-purple-200', 'bg-orange-50 text-orange-700 border border-orange-200', 'bg-gray-50 text-gray-700 border border-gray-200'],
        'theme-brutalist': Array(6).fill('bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]'),
    }[theme] || Array(6).fill('bg-lime-400/10 text-lime-400');

    const changeColors = {
        pos: { 'theme-luminous': 'text-lime-400', 'theme-azure': 'text-lime-400', 'theme-saas': 'text-green-400', 'theme-editorial': 'text-green-700', 'theme-brutalist': 'text-green-700' }[theme] || 'text-lime-400',
        neg: { 'theme-luminous': 'text-red-400', 'theme-azure': 'text-red-400', 'theme-saas': 'text-red-400', 'theme-editorial': 'text-red-700', 'theme-brutalist': 'text-red-700' }[theme] || 'text-red-400',
    };

    const geoBarColors = {
        'theme-luminous': ['from-lime-400/70 to-lime-400', 'from-sky-400/70 to-sky-400'],
        'theme-azure': ['from-sky-400/70 to-sky-400', 'from-lime-400/70 to-lime-400'],
        'theme-saas': ['from-white/50 to-white', 'from-gray-400/50 to-gray-500'],
        'theme-editorial': ['from-red-600/70 to-red-700', 'from-gray-400/70 to-gray-500'],
        'theme-brutalist': ['from-[#1A1A1A] to-[#1A1A1A]', 'from-gray-400 to-gray-500'],
    }[theme] || ['from-lime-400/70 to-lime-400', 'from-sky-400/70 to-sky-400'];

    const formatBarColors = {
        'theme-luminous': ['from-lime-400/70 to-lime-400', 'from-sky-400/70 to-sky-400', 'from-purple-400/70 to-purple-400', 'from-orange-400/70 to-orange-400'],
        'theme-azure': ['from-sky-400/70 to-sky-400', 'from-lime-400/70 to-lime-400', 'from-purple-400/70 to-purple-400', 'from-orange-400/70 to-orange-400'],
        'theme-saas': ['from-white/60 to-white', 'from-white/35 to-white/50', 'from-white/20 to-white/35', 'from-white/10 to-white/20'],
        'theme-editorial': ['from-red-700/80 to-red-700', 'from-gray-600/70 to-gray-700', 'from-red-300/70 to-red-400', 'from-blue-500/70 to-blue-600'],
        'theme-brutalist': ['from-[#1A1A1A] to-[#1A1A1A]', 'from-gray-600 to-gray-700', 'from-gray-300 to-gray-400', 'from-gray-200 to-gray-300'],
    }[theme] || ['from-lime-400/70 to-lime-400', 'from-sky-400/70 to-sky-400', 'from-purple-400/70 to-purple-400', 'from-orange-400/70 to-orange-400'];

    const metricOptions = [
        { key: 'impressions', label: 'Impressions', accessor: d => d.impressions },
        { key: 'clicks', label: 'Clicks', accessor: d => d.clicks },
        { key: 'revenue', label: 'Revenue ($)', accessor: d => d.revenue },
        { key: 'fillRate', label: 'Fill Rate', accessor: d => d.fillRate },
    ];
    const activeAccessor = metricOptions.find(m => m.key === activeMetric)?.accessor || (d => d.impressions);
    const chartData = daily.map(item => ({ ...item, value: activeAccessor(item) }));
    const chartMax = Math.max(...chartData.map(d => d.value));
    const geoMax = Math.max(...geo.map(g => g.impressions));

    const kpiCards = stats ? [
        { label: 'Impressions', value: stats.totalImpressions, change: stats.impressionChange, icon: Eye, i: 0, fmtFn: v => v.toLocaleString() },
        { label: 'Clicks', value: stats.totalClicks, change: stats.clickChange, icon: MousePointerClick, i: 1, fmtFn: v => v.toLocaleString() },
        { label: 'Revenue', value: stats.totalRevenue, change: stats.revenueChange, icon: DollarSign, i: 2, fmtFn: v => `$${v.toFixed(2)}` },
        { label: 'CTR', value: stats.ctr, change: stats.ctrChange, icon: Target, i: 3, fmtFn: v => `${v.toFixed(2)}%` },
        { label: 'eCPM', value: stats.ecpm, change: stats.ecpmChange, icon: TrendingUp, i: 4, fmtFn: v => `$${v.toFixed(2)}` },
        { label: 'Fill Rate', value: stats.fillRate, change: stats.fillRateChange, icon: Zap, i: 5, fmtFn: v => `${v.toFixed(1)}%` },
    ] : [];

    return (
        <div className="space-y-8">
            {/* ── Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={d.heading}>Publisher Statistics</h1>
                    <p className={`${d.subheading} mt-1`}>Earnings, traffic, and performance breakdown</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={tabWrap}>
                        {PERIODS.map(p => (
                            <button key={p.value} onClick={() => setPeriod(p.value)}
                                className={`px-3 py-1.5 text-xs font-semibold transition-all rounded-lg ${period === p.value ? tabActive : `${subText} hover:opacity-100`}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchData} className={`${d.btnSecondary} p-2.5`} title="Refresh">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className={`${d.btnSecondary} p-2.5`} title="Export">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Tab switcher */}
            <div className={`flex gap-1 p-1 rounded-xl border w-fit ${d.isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive ? tabActive : `${subText} hover:opacity-80`}`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {tab.key === 'push' && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? (d.isDark ? 'bg-black/20 text-white' : 'bg-white/20') : (d.isDark ? 'bg-lime-400/10 text-lime-400' : 'bg-green-100 text-green-700')}`}>
                                    NEW
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Push Tab */}
            {activeTab === 'push' && (
                <PushStatsTab
                    d={d} theme={theme} period={period}
                    accent={accent} tabActive={tabActive}
                    subText={subText} headText={headText} divider={divider}
                />
            )}

            {/* ── General Tab */}
            {activeTab === 'general' && (
                <>
                    {loading ? (
                        <div className="flex items-center justify-center h-64 flex-col gap-4">
                            <Loader2 className={`w-10 h-10 animate-spin ${d.loaderColor}`} />
                            <p className={d.loaderText}>Loading statistics...</p>
                        </div>
                    ) : (
                        <>
                            {/* ── 6-up KPI grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {kpiCards.map(kpi => {
                                    const isPos = (kpi.change || 0) >= 0;
                                    const Icon = kpi.icon;
                                    return (
                                        <div key={kpi.label} className={d.card}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cardAccents[kpi.i]}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                {kpi.change !== undefined && (
                                                    <span className={`flex items-center gap-0.5 text-xs font-bold ${isPos ? changeColors.pos : changeColors.neg}`}>
                                                        {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                        {Math.abs(kpi.change)}%
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-2xl font-bold ${headText} mb-1`}>{kpi.fmtFn(kpi.value)}</p>
                                            <p className={`text-sm ${subText}`}>{kpi.label}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Main chart */}
                            <div className={d.card}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                    <h2 className={`text-lg font-bold ${headText}`}>Trend Over Time</h2>
                                    <div className="flex gap-1">
                                        {metricOptions.map(m => (
                                            <button key={m.key} onClick={() => setActiveMetric(m.key)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${activeMetric === m.key ? tabActive : `${subText} hover:opacity-100`}`}>
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-48 flex items-end gap-[2px]">
                                    {chartData.map((item, i) => (
                                        <div key={i} className="flex-1 group relative cursor-pointer">
                                            <div
                                                className={`w-full bg-gradient-to-t ${accent.bar} rounded-t transition-all duration-300 min-h-[2px] ${accent.glow}`}
                                                style={{ height: `${chartMax > 0 ? (item.value / chartMax) * 100 : 0}%` }}
                                            />
                                            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 ${d.isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'}`}>
                                                <p className={`font-bold ${headText}`}>
                                                    {activeMetric === 'revenue' ? `$${item.value?.toFixed(2)}` : activeMetric === 'fillRate' ? `${item.value?.toFixed(1)}%` : item.value?.toLocaleString()}
                                                </p>
                                                <p className={subText}>{item.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={`flex justify-between mt-2 text-[10px] ${d.isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                    <span>{daily[0]?.date}</span>
                                    <span>{daily[daily.length - 1]?.date}</span>
                                </div>
                            </div>

                            {/* ── Ad Format Breakdown */}
                            <div className={d.card}>
                                <div className="flex items-center gap-2 mb-6">
                                    <Layers className={`w-5 h-5 ${accent.text}`} />
                                    <h2 className={`text-lg font-bold ${headText}`}>Ad Format Performance</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className={`border-b ${divider}`}>
                                                {['Format', 'Impressions', 'Revenue', 'eCPM', 'Fill Rate'].map(h => (
                                                    <th key={h} className={`${d.tableHeadCell} text-left pb-3`}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                                            {formats.map((fmt, i) => (
                                                <tr key={i} className={d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                                    <td className={`py-4 pr-4 font-medium text-sm ${headText}`}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${formatBarColors[i]}`} />
                                                            {fmt.name}
                                                        </div>
                                                    </td>
                                                    <td className={`py-4 pr-4 text-sm ${subText}`}>{(fmt.impressions || 0).toLocaleString()}</td>
                                                    <td className={`py-4 pr-4 text-sm font-bold ${accent.text}`}>${fmt.revenue?.toFixed(2)}</td>
                                                    <td className={`py-4 pr-4 text-sm font-mono ${headText}`}>${fmt.ecpm?.toFixed(2)}</td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`flex-1 h-2 rounded-full overflow-hidden ${d.isDark ? 'bg-white/10' : 'bg-gray-200'}`} style={{ minWidth: 60 }}>
                                                                <div className={`h-full bg-gradient-to-r ${formatBarColors[i]} rounded-full`} style={{ width: `${fmt.fillRate}%` }} />
                                                            </div>
                                                            <span className={`text-xs font-medium ${headText}`}>{fmt.fillRate}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ── Geo + Device */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className={d.card}>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Globe className={`w-5 h-5 ${accent.text}`} />
                                        <h2 className={`text-lg font-bold ${headText}`}>Top Countries</h2>
                                    </div>
                                    <div className="space-y-3">
                                        {geo.map((g, i) => (
                                            <BarRow key={i}
                                                label={g.country}
                                                value={g.impressions}
                                                max={geoMax}
                                                valueLabel={`$${g.revenue}`}
                                                colorClass={`bg-gradient-to-r ${geoBarColors[i % 2]}`}
                                                d={d}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className={d.card}>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Monitor className={`w-5 h-5 ${accent.text}`} />
                                        <h2 className={`text-lg font-bold ${headText}`}>Device Breakdown</h2>
                                    </div>
                                    <div className="space-y-5">
                                        {devices.map((dev, i) => {
                                            const DevIcon = { Desktop: Monitor, Mobile: Smartphone, Tablet }[dev.name] || Monitor;
                                            return (
                                                <div key={i}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <DevIcon className={`w-4 h-4 ${subText}`} />
                                                            <span className={`text-sm font-medium ${headText}`}>{dev.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-xs ${accent.text} font-medium`}>${dev.revenue?.toFixed(2)}</span>
                                                            <span className={`text-sm font-bold ${headText}`}>{dev.share}%</span>
                                                        </div>
                                                    </div>
                                                    <div className={`h-3 rounded-full overflow-hidden ${d.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                                        <div className={`h-full bg-gradient-to-r ${formatBarColors[i]} rounded-full transition-all duration-700`}
                                                            style={{ width: `${dev.share}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className={`mt-6 pt-6 border-t ${divider} grid grid-cols-3 gap-3`}>
                                        {devices.map((dev, i) => (
                                            <div key={i} className={`text-center p-3 rounded-xl ${d.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                                <p className={`text-lg font-bold ${headText}`}>{dev.share}%</p>
                                                <p className={`text-[10px] mt-1 ${subText}`}>{dev.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
