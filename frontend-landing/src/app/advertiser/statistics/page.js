'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    BarChart3, TrendingUp, TrendingDown, Eye, MousePointerClick,
    DollarSign, Globe, Monitor, Smartphone, Tablet,
    ArrowUpRight, ArrowDownRight, Filter, Download, Loader2,
    Target, Zap, Activity, RefreshCw, Bell, Users, CheckCircle2,
    Calendar, Search, ChevronDown, ChevronUp, X, Settings2,
    LayoutGrid, Layers, Chrome, Cpu, Clock, CalendarDays,
    CalendarRange, SlidersHorizontal
} from 'lucide-react';
import { advertiserAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';
import toast from 'react-hot-toast';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Constants
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const TABS = [
    { key: 'general', label: 'All Formats', icon: BarChart3 },
    { key: 'popunder', label: 'Popunder', icon: Layers },
    { key: 'inpage', label: 'In-Page Push', icon: LayoutGrid },
    { key: 'push', label: 'Push Notifications', icon: Bell },
];

const PRESET_RANGES = [
    { label: 'Today', days: 1 },
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
];

const GRANULARITY = [
    { key: 'hour', label: 'Hours', icon: Clock },
    { key: 'day', label: 'Days', icon: CalendarDays },
    { key: 'month', label: 'Months', icon: CalendarRange },
];

const AD_FORMATS = [
    { value: 'ALL', label: 'All Formats' },
    { value: 'POPUNDER', label: 'Popunder' },
    { value: 'POPUP', label: 'Popup' },
    { value: 'DIRECT_LINK', label: 'Direct Link' },
    { value: 'BANNER_300x250', label: 'Banner 300Ã—250' },
    { value: 'BANNER_728x90', label: 'Banner 728Ã—90' },
    { value: 'BANNER_468x60', label: 'Banner 468Ã—60' },
    { value: 'BANNER_160x600', label: 'Banner 160Ã—600' },
    { value: 'IN_PAGE_PUSH', label: 'In-Page Push' },
    { value: 'NATIVE', label: 'Native' },
    { value: 'PUSH_NOTIFICATION', label: 'Push Notification' },
];

const DIMENSION_TABS = [
    { key: 'campaigns', label: 'Campaigns', icon: Layers },
    { key: 'countries', label: 'Countries', icon: Globe },
    { key: 'devices', label: 'Devices', icon: Monitor },
    { key: 'browsers', label: 'Browsers', icon: Chrome },
    { key: 'os', label: 'OS', icon: Cpu },
    { key: 'zones', label: 'Zones', icon: Target },
];

const DEFAULT_COLUMNS = {
    id: true, name: true, format: true, status: true,
    impressions: true, clicks: true, ctr: true, cpm: true,
    spend: true, conversions: true, cpa: true,
    dailyBudget: true, totalBudget: true, startDate: true,
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Helpers
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function dateToStr(d) {
    return d.toISOString().split('T')[0];
}

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
}

// â”€â”€ Animated counter
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseFloat(value) || 0;
        if (end === 0) { setDisplay(0); return; }
        const duration = 900;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setDisplay(end); clearInterval(timer); }
            else setDisplay(start);
        }, 16);
        return () => clearInterval(timer);
    }, [value]);
    const formatted = decimals > 0 ? display.toFixed(decimals) : Math.floor(display).toLocaleString();
    return <span>{prefix}{formatted}{suffix}</span>;
}

// â”€â”€ SparkBars
function SparkBars({ data, color }) {
    if (!data?.length) return null;
    const max = Math.max(...data.map(x => x.value || 0));
    return (
        <div className="flex items-end gap-[2px] h-10">
            {data.slice(-20).map((item, i) => (
                <div key={i} className="flex-1 relative group">
                    <div
                        className={`w-full rounded-sm transition-all duration-300 ${color} opacity-60 group-hover:opacity-100 min-h-[2px]`}
                        style={{ height: `${max > 0 ? (item.value / max) * 40 : 2}px` }}
                    />
                </div>
            ))}
        </div>
    );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Metric Card
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function MetricCard({ label, value, prefix, suffix, decimals, change, icon: Icon, colorKey, sparkData, d, theme }) {
    const isPositive = (change || 0) >= 0;
    const iconBg = {
        'theme-luminous': { lime: 'bg-lime-400/10 shadow-lime-400/20', sky: 'bg-sky-500/10 shadow-sky-400/20', purple: 'bg-purple-500/10 shadow-purple-400/20', orange: 'bg-orange-500/10 shadow-orange-400/20' }[colorKey] || 'bg-lime-400/10',
        'theme-azure': { sky: 'bg-sky-500/10', lime: 'bg-lime-400/10', purple: 'bg-purple-500/10', orange: 'bg-orange-500/10' }[colorKey] || 'bg-sky-500/10',
        'theme-saas': 'bg-white/[0.06] border border-white/[0.08]',
        'theme-editorial': { lime: 'bg-green-50 border border-green-200', sky: 'bg-blue-50 border border-blue-200', purple: 'bg-purple-50 border border-purple-200', orange: 'bg-orange-50 border border-orange-200' }[colorKey] || 'bg-red-50 border border-red-200',
        'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]',
    }[theme] || 'bg-white/5';

    const iconColor = {
        'theme-luminous': { lime: 'text-lime-400', sky: 'text-sky-400', purple: 'text-purple-400', orange: 'text-orange-400' }[colorKey] || 'text-lime-400',
        'theme-azure': { sky: 'text-sky-400', lime: 'text-lime-400', purple: 'text-purple-400', orange: 'text-orange-400' }[colorKey] || 'text-sky-400',
        'theme-saas': 'text-gray-300',
        'theme-editorial': { lime: 'text-green-700', sky: 'text-blue-700', purple: 'text-purple-700', orange: 'text-orange-700' }[colorKey] || 'text-red-700',
        'theme-brutalist': 'text-[#1A1A1A]',
    }[theme] || 'text-lime-400';

    const sparkColor = {
        'theme-luminous': { lime: 'bg-lime-400', sky: 'bg-sky-400', purple: 'bg-purple-400', orange: 'bg-orange-400' }[colorKey] || 'bg-lime-400',
        'theme-azure': { sky: 'bg-sky-400', lime: 'bg-lime-400', purple: 'bg-purple-400', orange: 'bg-orange-400' }[colorKey] || 'bg-sky-400',
        'theme-saas': 'bg-white',
        'theme-editorial': 'bg-red-700',
        'theme-brutalist': 'bg-[#1A1A1A]',
    }[theme] || 'bg-lime-400';

    return (
        <div className={`${d.card} group relative overflow-hidden`}>
            {d.isDark && (
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${theme === 'theme-luminous'
                    ? { lime: 'bg-gradient-to-br from-lime-400/5 to-transparent', sky: 'bg-gradient-to-br from-sky-400/5 to-transparent', purple: 'bg-gradient-to-br from-purple-400/5 to-transparent', orange: 'bg-gradient-to-br from-orange-400/5 to-transparent' }[colorKey]
                    : theme === 'theme-azure'
                        ? { sky: 'bg-gradient-to-br from-sky-400/5 to-transparent', lime: 'bg-gradient-to-br from-lime-400/5 to-transparent', purple: 'bg-gradient-to-br from-purple-400/5 to-transparent', orange: 'bg-gradient-to-br from-orange-400/5 to-transparent' }[colorKey]
                        : ''
                    } pointer-events-none`} />
            )}
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${iconBg}`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    {change !== undefined && (
                        <span className={d.statChange(isPositive)}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                            {' '}{Math.abs(change)}%
                        </span>
                    )}
                </div>
                <p className={`${d.statValue} mb-1`}>
                    <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
                </p>
                <p className={d.statTitle}>{label}</p>
                {sparkData && (
                    <div className="mt-3">
                        <SparkBars data={sparkData} color={sparkColor} />
                    </div>
                )}
            </div>
        </div>
    );
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Column Visibility Menu
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function ColumnVisibilityMenu({ columns, setColumns, d }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const allCols = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Campaign' },
        { key: 'format', label: 'Format' },
        { key: 'status', label: 'Status' },
        { key: 'impressions', label: 'Impressions' },
        { key: 'clicks', label: 'Clicks' },
        { key: 'ctr', label: 'CTR' },
        { key: 'cpm', label: 'CPM' },
        { key: 'spend', label: 'Spend' },
        { key: 'conversions', label: 'Conversions' },
        { key: 'cpa', label: 'CPA' },
        { key: 'dailyBudget', label: 'Daily Budget' },
        { key: 'totalBudget', label: 'Total Budget' },
        { key: 'startDate', label: 'Start Date' },
    ];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className={`p-2 rounded-xl transition-all ${d.isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`}
                title="Column visibility"
            >
                <Settings2 className="w-4 h-4" />
            </button>
            {open && (
                <div className={`absolute right-0 top-full mt-2 z-50 w-56 rounded-xl shadow-2xl border p-3 ${d.isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'}`}>
                    <p className={`text-xs font-bold mb-3 ${d.isDark ? 'text-gray-400' : 'text-gray-500'}`}>VISIBLE COLUMNS</p>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                        {allCols.map(col => (
                            <label key={col.key} className={`flex items-center gap-2.5 py-1 px-2 rounded-lg cursor-pointer transition-all text-sm ${d.isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}>
                                <input
                                    type="checkbox"
                                    checked={columns[col.key] !== false}
                                    onChange={() => setColumns(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                                    className="w-4 h-4 rounded accent-lime-400"
                                />
                                {col.label}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Push Analytics Tab
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function PushAnalyticsTab({ d, theme, dateRange, accent, secAccent, tabActive, subText, headText, divider }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [chartMode, setChartMode] = useState('deliveries');
    const [selectedCampaign, setSelectedCampaign] = useState('');

    useEffect(() => { fetchPushStats(); }, [dateRange, selectedCampaign]);

    const fetchPushStats = async () => {
        setLoading(true);
        try {
            const params = { startDate: dateToStr(dateRange.start), endDate: dateToStr(dateRange.end) };
            if (selectedCampaign) params.campaignId = selectedCampaign;
            const result = await advertiserAPI.getPushStats(params);
            setData(result);
        } catch (err) {
            console.error('Push advertiser stats error:', err);
            setData({
                campaigns: [],
                summary: { totalDeliveries: 0, totalClicks: 0, totalRevenue: '0.00', ctr: '0.00', avgCpc: '0.0000' },
                dailyDeliveries: [],
                deviceBreakdown: [],
                countryBreakdown: [],
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 flex-col gap-4">
            <Loader2 className={`w-8 h-8 animate-spin ${d.loaderColor}`} />
            <p className={`text-sm ${subText}`}>Loading push analytics...</p>
        </div>
    );
    if (!data) return null;

    const summary = data.summary || {};
    const chartValues = data.dailyDeliveries?.map(r =>
        chartMode === 'deliveries' ? r.delivered :
            chartMode === 'clicks' ? r.clicks : r.revenue
    ) || [];
    const chartMax = Math.max(...chartValues, 1);

    const barColor = accent.bar || 'from-lime-400/60 to-lime-400';
    const geoDeviceColors = [
        'bg-gradient-to-r from-lime-400/70 to-lime-400',
        'bg-gradient-to-r from-sky-400/70 to-sky-400',
        'bg-gradient-to-r from-purple-400/70 to-purple-400',
        'bg-gradient-to-r from-orange-400/70 to-orange-400',
        'bg-gradient-to-r from-pink-400/70 to-pink-400',
    ];

    const kpis = [
        { label: 'Total Deliveries', value: Number(summary.totalDeliveries || 0), fmt: v => v.toLocaleString(), icon: Bell },
        { label: 'Total Clicks', value: Number(summary.totalClicks || 0), fmt: v => v.toLocaleString(), icon: MousePointerClick },
        { label: 'Push Revenue', value: parseFloat(summary.totalRevenue || 0), fmt: v => `$${v.toFixed(2)}`, icon: DollarSign },
        { label: 'Click-Through Rate', value: parseFloat(summary.ctr || 0), fmt: v => `${v.toFixed(2)}%`, icon: Target },
        { label: 'Avg Cost/Click', value: parseFloat(summary.avgCpc || 0), fmt: v => `$${v.toFixed(4)}`, icon: Zap },
        { label: 'Active Campaigns', value: data.campaigns?.filter(c => c.status === 'ACTIVE').length || 0, fmt: v => v.toString(), icon: CheckCircle2 },
    ];

    const statusColor = s => ({
        ACTIVE: d.isDark ? 'bg-lime-500/20 text-lime-400' : 'bg-green-100 text-green-700',
        PAUSED: d.isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700',
        PENDING_APPROVAL: d.isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-blue-100 text-blue-700',
    }[s] || 'bg-gray-500/20 text-gray-400');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className={`text-sm ${subText}`}>{data.campaigns?.length || 0} push campaign{data.campaigns?.length !== 1 ? 's' : ''} found</p>
                <select value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}
                    className={`text-sm px-3 py-2 rounded-xl transition-all cursor-pointer ${d.isDark ? 'bg-white/5 border border-white/10 text-white focus:border-white/30' : 'bg-white border border-gray-200 text-[#1A1A1A] focus:border-gray-400'} focus:outline-none`}>
                    <option value="">All Push Campaigns</option>
                    {data.campaigns?.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi, i) => {
                    const Icon = kpi.icon;
                    const colors = ['bg-purple-500/10 text-purple-400', 'bg-orange-500/10 text-orange-400', 'bg-lime-400/10 text-lime-400', 'bg-sky-500/10 text-sky-400', 'bg-pink-500/10 text-pink-400', 'bg-emerald-500/10 text-emerald-400'];
                    return (
                        <div key={i} className={d.card}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${d.isDark ? colors[i] : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <p className={`text-2xl font-bold ${headText} mb-1`}>{kpi.fmt(kpi.value)}</p>
                            <p className={`text-sm ${subText}`}>{kpi.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className={d.card}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h2 className={`text-lg font-bold ${headText}`}>Push Delivery Trend</h2>
                    <div className="flex gap-1">
                        {[{ key: 'deliveries', label: 'Deliveries' }, { key: 'clicks', label: 'Clicks' }, { key: 'revenue', label: 'Revenue' }].map(opt => (
                            <button key={opt.key} onClick={() => setChartMode(opt.key)}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${chartMode === opt.key ? tabActive : `${subText} hover:opacity-100`}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                {chartValues.some(v => v > 0) ? (
                    <div className="h-40 flex items-end gap-[2px]">
                        {(data.dailyDeliveries || []).map((item, i) => (
                            <div key={i} className="flex-1 group relative cursor-pointer">
                                <div className={`w-full bg-gradient-to-t ${barColor} rounded-t transition-all duration-300 min-h-[2px]`}
                                    style={{ height: `${chartMax > 0 ? (chartValues[i] / chartMax) * 100 : 0}%` }} />
                                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 ${d.isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'}`}>
                                    <p className={`font-bold ${headText}`}>{chartMode === 'revenue' ? `$${chartValues[i]?.toFixed(2)}` : chartValues[i]?.toLocaleString()}</p>
                                    <p className={subText}>{item.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center">
                        <div className="text-center">
                            <Bell className={`w-10 h-10 mx-auto mb-2 ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={`text-sm ${subText}`}>No push delivery data for this period</p>
                            <p className={`text-xs mt-1 ${d.isDark ? 'text-gray-600' : 'text-gray-400'}`}>Data appears once push campaigns start delivering</p>
                        </div>
                    </div>
                )}
            </div>

            {data.campaigns?.length > 0 && (
                <div className={d.card}>
                    <div className="flex items-center gap-2 mb-5">
                        <Bell className={`w-5 h-5 ${accent.text || 'text-lime-400'}`} />
                        <h2 className={`text-lg font-bold ${headText}`}>Push Campaign Breakdown</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${divider}`}>
                                    {['Campaign', 'Status', 'Title', 'Deliveries', 'Clicks', 'CTR', 'Revenue', 'Budget Used'].map(h => (
                                        <th key={h} className={`${d.tableHeadCell} text-left pb-3`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                                {data.campaigns.map(camp => (
                                    <tr key={camp.id} className={d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                        <td className={`py-3.5 pr-4 text-sm font-medium ${headText} max-w-[160px] truncate`}>{camp.name}</td>
                                        <td className="py-3.5 pr-4">
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColor(camp.status)}`}>{camp.status}</span>
                                        </td>
                                        <td className={`py-3.5 pr-4 text-xs ${subText} max-w-[140px] truncate`}>{camp.pushTitle || '--'}</td>
                                        <td className={`py-3.5 pr-4 text-sm ${subText}`}>{(camp.deliveries || 0).toLocaleString()}</td>
                                        <td className={`py-3.5 pr-4 text-sm ${subText}`}>{(camp.clicks || 0).toLocaleString()}</td>
                                        <td className={`py-3.5 pr-4 text-sm font-mono font-bold ${accent.text || 'text-lime-400'}`}>{camp.ctr}%</td>
                                        <td className={`py-3.5 pr-4 text-sm font-medium ${headText}`}>${parseFloat(camp.revenue || 0).toFixed(2)}</td>
                                        <td className="py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-16 h-1.5 rounded-full overflow-hidden ${d.isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                                    <div className={`h-full bg-gradient-to-r ${barColor} rounded-full`}
                                                        style={{ width: `${Math.min((camp.totalSpent / Math.max(camp.totalBudget, 0.01)) * 100, 100)}%` }} />
                                                </div>
                                                <span className={`text-xs ${subText}`}>{((camp.totalSpent / Math.max(camp.totalBudget, 0.01)) * 100).toFixed(0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={d.card}>
                    <div className="flex items-center gap-2 mb-5">
                        <Monitor className={`w-5 h-5 ${accent.text || 'text-lime-400'}`} />
                        <h2 className={`text-lg font-bold ${headText}`}>Device Breakdown</h2>
                    </div>
                    {(data.deviceBreakdown || []).length > 0 ? (
                        <div className="space-y-3">
                        {(data.deviceBreakdown || []).map((dev, i) => {
                            const DevIcon = { desktop: Monitor, mobile: Smartphone, tablet: Tablet }[dev.device] || Monitor;
                            const ctr = dev.deliveries > 0 ? ((dev.clicks / dev.deliveries) * 100).toFixed(2) : '0.00';
                            const devMax = Math.max(...(data.deviceBreakdown?.map(d => d.deliveries) || [1]));
                            return (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <DevIcon className={`w-4 h-4 ${subText}`} />
                                            <span className={`text-sm font-medium capitalize ${headText}`}>{dev.device}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs ${subText}`}>{dev.deliveries.toLocaleString()} sent</span>
                                            <span className={`text-xs font-bold ${accent.text || 'text-lime-400'}`}>{ctr}% CTR</span>
                                        </div>
                                    </div>
                                    <div className={`h-2 rounded-full overflow-hidden ${d.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                        <div className={`h-full ${geoDeviceColors[i]} rounded-full transition-all duration-700`}
                                            style={{ width: `${devMax > 0 ? (dev.deliveries / devMax) * 100 : 0}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    ) : (
                        <p className={`text-sm py-4 text-center ${subText}`}>No device data available</p>
                    )}
                </div>
                <div className={d.card}>
                    <div className="flex items-center gap-2 mb-5">
                        <Globe className={`w-5 h-5 ${accent.text || 'text-lime-400'}`} />
                        <h2 className={`text-lg font-bold ${headText}`}>Top Countries</h2>
                    </div>
                    {(data.countryBreakdown || []).length > 0 ? (
                        <div className="space-y-3">
                        {(data.countryBreakdown || []).map((c, i) => {
                            const maxDel = Math.max(...(data.countryBreakdown?.map(x => x.deliveries) || [1]));
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <span className={`text-xs w-8 flex-shrink-0 font-bold font-mono ${headText}`}>{c.country}</span>
                                    <div className={`flex-1 h-5 rounded-lg overflow-hidden ${d.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                        <div className={`h-full ${geoDeviceColors[i % geoDeviceColors.length]} rounded-lg transition-all duration-700`}
                                            style={{ width: `${maxDel > 0 ? (c.deliveries / maxDel) * 100 : 0}%` }} />
                                    </div>
                                    <span className={`text-xs font-bold w-20 text-right flex-shrink-0 ${subText}`}>{c.deliveries.toLocaleString()}</span>
                                </div>
                            );
                        })}
                        </div>
                    ) : (
                        <p className={`text-sm py-4 text-center ${subText}`}>No country data available</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Popunder Tab -- full stats for POPUNDER format only
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function PopunderTab({ d, theme, dateRange, groupBy, accent, tabActive, subText, headText, divider }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [chartMode, setChartMode] = useState('impressions');
    const [dimTab, setDimTab] = useState('countries');

    useEffect(() => { fetchData(); }, [dateRange, groupBy]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { startDate: dateToStr(dateRange.start), endDate: dateToStr(dateRange.end), groupBy, format: 'POPUNDER' };
            const [perf, geo, devices, browsers, os, zones] = await Promise.allSettled([
                advertiserAPI.getCampaignPerformance(params),
                advertiserAPI.getGeographicPerformance(params),
                advertiserAPI.getDevicePerformance(params),
                advertiserAPI.getBrowserPerformance(params),
                advertiserAPI.getOSPerformance(params),
                advertiserAPI.getZonePerformance(params),
            ]);
            setData({
                summary: perf.status === 'fulfilled' ? perf.value?.summary : null,
                campaigns: perf.status === 'fulfilled' ? perf.value?.campaigns || [] : [],
                daily: perf.status === 'fulfilled' ? perf.value?.daily || [] : [],
                countries: geo.status === 'fulfilled' ? geo.value?.countries || [] : [],
                devices: devices.status === 'fulfilled' ? devices.value?.devices || [] : [],
                browsers: browsers.status === 'fulfilled' ? browsers.value?.browsers || [] : [],
                os: os.status === 'fulfilled' ? os.value?.operatingSystems || [] : [],
                zones: zones.status === 'fulfilled' ? zones.value?.zones || [] : [],
            });
        } catch (err) {
            console.error('Popunder stats error:', err);
            setData({ summary: null, campaigns: [], daily: [], countries: [], devices: [], browsers: [], os: [], zones: [] });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 flex-col gap-4">
            <Loader2 className={`w-8 h-8 animate-spin ${d.loaderColor}`} />
            <p className={`text-sm ${subText}`}>Loading popunder analytics...</p>
        </div>
    );
    if (!data) return null;

    const s = data.summary || {};
    const chartValues = data.daily?.map(r => chartMode === 'impressions' ? r.impressions : chartMode === 'clicks' ? r.clicks : r.spend) || [];
    const chartMax = Math.max(...chartValues, 1);
    const barColor = accent.bar || 'from-lime-400/60 to-lime-400';

    const kpis = [
        { label: 'Impressions', value: s.totalImpressions || 0, fmt: v => v.toLocaleString(), icon: Eye, color: 'bg-sky-500/10 text-sky-400' },
        { label: 'Clicks', value: s.totalClicks || 0, fmt: v => v.toLocaleString(), icon: MousePointerClick, color: 'bg-orange-500/10 text-orange-400' },
        { label: 'Total Spend', value: s.totalSpend || 0, fmt: v => `$${parseFloat(v).toFixed(2)}`, icon: DollarSign, color: 'bg-lime-400/10 text-lime-400' },
        { label: 'CTR', value: s.ctr || 0, fmt: v => `${parseFloat(v).toFixed(2)}%`, icon: Activity, color: 'bg-purple-500/10 text-purple-400' },
        { label: 'CPM', value: s.cpm || 0, fmt: v => `$${parseFloat(v).toFixed(2)}`, icon: BarChart3, color: 'bg-pink-500/10 text-pink-400' },
        { label: 'Active Campaigns', value: s.activeCampaigns || data.campaigns.filter(c => c.status === 'ACTIVE').length, fmt: v => v.toString(), icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-400' },
        { label: 'CPA', value: s.cpa || 0, fmt: v => `$${parseFloat(v).toFixed(2)}`, icon: Zap, color: 'bg-yellow-500/10 text-yellow-400' },
        { label: 'ROI', value: s.roi || 0, fmt: v => `${parseFloat(v).toFixed(1)}%`, icon: TrendingUp, color: 'bg-rose-500/10 text-rose-400' },
    ];

    const statusColor = s2 => ({
        ACTIVE: d.isDark ? 'bg-lime-500/20 text-lime-400' : 'bg-green-100 text-green-700',
        PAUSED: d.isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700',
        PENDING_APPROVAL: d.isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-blue-100 text-blue-700',
    }[s2] || 'bg-gray-500/20 text-gray-400');

    const DIM_TABS = [
        { key: 'countries', label: 'Countries', data: data.countries, col1: 'name', col1Label: 'Country' },
        { key: 'devices', label: 'Devices', data: data.devices, col1: 'name', col1Label: 'Device' },
        { key: 'browsers', label: 'Browsers', data: data.browsers, col1: 'name', col1Label: 'Browser' },
        { key: 'os', label: 'OS', data: data.os, col1: 'name', col1Label: 'OS' },
        { key: 'zones', label: 'Zones', data: data.zones, col1: 'shortId', col1Label: 'Zone' },
    ];

    const activeDimData = DIM_TABS.find(t => t.key === dimTab);

    return (
        <div className="space-y-6">
            {/* 8 KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} className={d.card}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${d.isDark ? kpi.color : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <p className={`text-2xl font-bold ${headText} mb-1`}>{kpi.fmt(kpi.value)}</p>
                            <p className={`text-sm ${subText}`}>{kpi.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Performance Chart */}
            <div className={d.card}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h2 className={`text-lg font-bold ${headText}`}>Popunder Performance Over Time</h2>
                    <div className="flex gap-1">
                        {[{ key: 'impressions', label: 'Impressions' }, { key: 'clicks', label: 'Clicks' }, { key: 'spend', label: 'Spend' }].map(opt => (
                            <button key={opt.key} onClick={() => setChartMode(opt.key)}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${chartMode === opt.key ? tabActive : `${subText} hover:opacity-100`}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                {chartValues.some(v => v > 0) ? (
                    <>
                        <div className="h-48 flex items-end gap-[2px]">
                            {data.daily.map((item, i) => (
                                <div key={i} className="flex-1 group relative cursor-pointer">
                                    <div className={`w-full bg-gradient-to-t ${barColor} rounded-t transition-all duration-300 min-h-[2px]`}
                                        style={{ height: `${chartMax > 0 ? (chartValues[i] / chartMax) * 100 : 0}%` }} />
                                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 ${d.isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'}`}>
                                        <p className={`font-bold ${headText}`}>{chartMode === 'spend' ? `$${chartValues[i]?.toFixed(2)}` : chartValues[i]?.toLocaleString()}</p>
                                        <p className={subText}>{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={`flex justify-between mt-2 text-[10px] ${d.isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            <span>{data.daily[0]?.date}</span>
                            <span>{data.daily[data.daily.length - 1]?.date}</span>
                        </div>
                    </>
                ) : (
                    <div className="h-48 flex items-center justify-center">
                        <div className="text-center">
                            <Layers className={`w-10 h-10 mx-auto mb-2 ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={`text-sm ${subText}`}>No popunder traffic data for this period</p>
                            <p className={`text-xs mt-1 ${d.isDark ? 'text-gray-600' : 'text-gray-400'}`}>Data appears once popunder campaigns start receiving traffic</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Campaign Breakdown Table */}
            <div className={d.card}>
                <div className="flex items-center gap-2 mb-5">
                    <Layers className={`w-5 h-5 ${accent.text || 'text-lime-400'}`} />
                    <h2 className={`text-lg font-bold ${headText}`}>Popunder Campaigns</h2>
                    <span className={`ml-auto text-xs ${subText}`}>{data.campaigns.length} campaign{data.campaigns.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={`border-b ${divider}`}>
                                {['Campaign', 'Status', 'Impressions', 'Clicks', 'CTR', 'CPM', 'Spend', 'Daily Budget', 'Total Budget'].map(h => (
                                    <th key={h} className={`${d.tableHeadCell} text-left pb-3 whitespace-nowrap`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                            {data.campaigns.length > 0 ? data.campaigns.map(camp => (
                                <tr key={camp.id} className={d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                    <td className={`py-3.5 pr-4 text-sm font-medium ${headText} max-w-[180px] truncate`}>{camp.name}</td>
                                    <td className="py-3.5 pr-4">
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColor(camp.status)}`}>{camp.status}</span>
                                    </td>
                                    <td className={`py-3.5 pr-4 text-sm ${subText}`}>{camp.impressions.toLocaleString()}</td>
                                    <td className={`py-3.5 pr-4 text-sm ${subText}`}>{camp.clicks.toLocaleString()}</td>
                                    <td className={`py-3.5 pr-4 text-sm font-mono font-bold ${accent.text || 'text-lime-400'}`}>{camp.ctr.toFixed(2)}%</td>
                                    <td className={`py-3.5 pr-4 text-sm font-mono ${subText}`}>${camp.cpm.toFixed(2)}</td>
                                    <td className={`py-3.5 pr-4 text-sm font-medium ${headText}`}>${camp.spend.toFixed(2)}</td>
                                    <td className={`py-3.5 pr-4 text-sm ${subText}`}>{camp.dailyBudget > 0 ? `$${camp.dailyBudget.toFixed(2)}` : '--'}</td>
                                    <td className={`py-3.5 text-sm ${subText}`}>${camp.totalBudget.toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={9} className={`py-10 text-center text-sm ${subText}`}>No popunder campaigns found for this period</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dimension Breakdown */}
            <div className={d.card}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h2 className={`text-lg font-bold ${headText}`}>Breakdown by Dimension</h2>
                    <div className={`flex gap-1 flex-wrap bg-white/5 border border-white/10 rounded-xl p-1 ${!d.isDark && 'bg-gray-100 border-gray-200'}`}>
                        {DIM_TABS.map(t => (
                            <button key={t.key} onClick={() => setDimTab(t.key)}
                                className={`px-3 py-1.5 text-xs font-semibold transition-all rounded-lg ${dimTab === t.key ? tabActive : `${subText} hover:opacity-80`}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={`border-b ${divider}`}>
                                <th className={`${d.tableHeadCell} text-left pb-3`}>{activeDimData?.col1Label}</th>
                                {dimTab === 'zones' && <th className={`${d.tableHeadCell} text-left pb-3`}>Site</th>}
                                <th className={`${d.tableHeadCell} text-left pb-3`}>Impressions</th>
                                <th className={`${d.tableHeadCell} text-left pb-3`}>Clicks</th>
                                <th className={`${d.tableHeadCell} text-left pb-3`}>CTR</th>
                                <th className={`${d.tableHeadCell} text-left pb-3`}>CPM</th>
                                <th className={`${d.tableHeadCell} text-left pb-3`}>Spend</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                            {(activeDimData?.data || []).length > 0 ? (activeDimData?.data || []).map((row, i) => (
                                <tr key={i} className={d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                    <td className={`py-3.5 pr-4 text-sm font-medium ${headText}`}>{row[activeDimData.col1] || '--'}</td>
                                    {dimTab === 'zones' && <td className={`py-3.5 pr-4 text-sm ${subText}`}>{row.siteName || '--'}</td>}
                                    <td className={`py-3.5 pr-4 text-sm ${subText}`}>{Number(row.impressions || 0).toLocaleString()}</td>
                                    <td className={`py-3.5 pr-4 text-sm ${subText}`}>{Number(row.clicks || 0).toLocaleString()}</td>
                                    <td className={`py-3.5 pr-4 text-sm font-mono font-bold ${accent.text}`}>{parseFloat(row.ctr || 0).toFixed(2)}%</td>
                                    <td className={`py-3.5 pr-4 text-sm font-mono ${subText}`}>${parseFloat(row.cpm || row.spend || 0).toFixed(2)}</td>
                                    <td className={`py-3.5 text-sm font-medium ${headText}`}>${parseFloat(row.spent || row.spend || 0).toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={dimTab === 'zones' ? 7 : 6} className={`py-10 text-center text-sm ${subText}`}>No {activeDimData?.label.toLowerCase()} data available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// In-Page Push Tab -- full stats for IN_PAGE_PUSH format
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function InPagePushTab({ d, theme, dateRange, groupBy, accent, tabActive, subText, headText, divider }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [chartMode, setChartMode] = useState('impressions');
    const [dimTab, setDimTab] = useState('countries');

    useEffect(() => { fetchData(); }, [dateRange, groupBy]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { startDate: dateToStr(dateRange.start), endDate: dateToStr(dateRange.end), groupBy, format: 'IN_PAGE_PUSH' };
            const [inpage, geo, devices, browsers, os] = await Promise.allSettled([
                advertiserAPI.getInPagePushStats({ startDate: dateToStr(dateRange.start), endDate: dateToStr(dateRange.end), groupBy }),
                advertiserAPI.getGeographicPerformance(params),
                advertiserAPI.getDevicePerformance(params),
                advertiserAPI.getBrowserPerformance(params),
                advertiserAPI.getOSPerformance(params),
            ]);
            const base = inpage.status === 'fulfilled' ? inpage.value : { summary: null, campaigns: [], daily: [] };
            setData({
                ...base,
                countries: geo.status === 'fulfilled' ? geo.value?.countries || [] : [],
                devices: devices.status === 'fulfilled' ? devices.value?.devices || [] : [],
                browsers: browsers.status === 'fulfilled' ? browsers.value?.browsers || [] : [],
                os: os.status === 'fulfilled' ? os.value?.operatingSystems || [] : [],
            });
        } catch (err) {
            console.error('In-page push stats error:', err);
            setData({ campaigns: [], summary: { totalImpressions: 0, totalClicks: 0, totalSpend: 0, ctr: 0, cpm: 0, activeCampaigns: 0 }, daily: [], countries: [], devices: [], browsers: [], os: [] });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 flex-col gap-4">
            <Loader2 className={`w-8 h-8 animate-spin ${d.loaderColor}`} />
            <p className={`text-sm ${subText}`}>Loading in-page push analytics...</p>
        </div>
    );
    if (!data) return null;

    const summary = data.summary || {};
    const chartValues = data.daily?.map(r => chartMode === 'impressions' ? r.impressions : chartMode === 'clicks' ? r.clicks : r.spend) || [];
    const chartMax = Math.max(...chartValues, 1);
    const barColor = accent.bar || 'from-lime-400/60 to-lime-400';

    const kpis = [
        { label: 'Impressions', value: summary.totalImpressions || 0, fmt: v => v.toLocaleString(), icon: Eye, color: 'bg-sky-500/10 text-sky-400' },
        { label: 'Clicks', value: summary.totalClicks || 0, fmt: v => v.toLocaleString(), icon: MousePointerClick, color: 'bg-orange-500/10 text-orange-400' },
        { label: 'Total Spend', value: summary.totalSpend || 0, fmt: v => `$${parseFloat(v).toFixed(2)}`, icon: DollarSign, color: 'bg-lime-400/10 text-lime-400' },
        { label: 'CTR', value: summary.ctr || 0, fmt: v => `${parseFloat(v).toFixed(2)}%`, icon: Activity, color: 'bg-purple-500/10 text-purple-400' },
        { label: 'CPM', value: summary.cpm || 0, fmt: v => `$${parseFloat(v).toFixed(2)}`, icon: BarChart3, color: 'bg-pink-500/10 text-pink-400' },
        { label: 'Active Campaigns', value: summary.activeCampaigns || 0, fmt: v => v.toString(), icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-400' },
    ];

    const statusColor = s => ({
        ACTIVE: d.isDark ? 'bg-lime-500/20 text-lime-400' : 'bg-green-100 text-green-700',
        PAUSED: d.isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700',
        PENDING_APPROVAL: d.isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-blue-100 text-blue-700',
    }[s] || 'bg-gray-500/20 text-gray-400');

    const DIM_TABS = [
        { key: 'countries', label: 'Countries', data: data.countries, col1: 'name', col1Label: 'Country' },
        { key: 'devices', label: 'Devices', data: data.devices, col1: 'name', col1Label: 'Device' },
        { key: 'browsers', label: 'Browsers', data: data.browsers, col1: 'name', col1Label: 'Browser' },
        { key: 'os', label: 'OS', data: data.os, col1: 'name', col1Label: 'OS' },
    ];
    const activeDimData = DIM_TABS.find(t => t.key === dimTab);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} className={d.card}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${d.isDark ? kpi.color : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <p className={`text-2xl font-bold ${headText} mb-1`}>{kpi.fmt(kpi.value)}</p>
                            <p className={`text-sm ${subText}`}>{kpi.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className={d.card}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h2 className={`text-lg font-bold ${headText}`}>In-Page Push Performance</h2>
                    <div className="flex gap-1">
                        {[{ key: 'impressions', label: 'Impressions' }, { key: 'clicks', label: 'Clicks' }, { key: 'spend', label: 'Spend' }].map(opt => (
                            <button key={opt.key} onClick={() => setChartMode(opt.key)}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${chartMode === opt.key ? tabActive : `${subText} hover:opacity-100`}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                {chartValues.length > 0 ? (
                    <>
                        <div className="h-40 flex items-end gap-[2px]">
                            {data.daily.map((item, i) => (
                                <div key={i} className="flex-1 group relative cursor-pointer">
                                    <div className={`w-full bg-gradient-to-t ${barColor} rounded-t transition-all duration-300 min-h-[2px]`}
                                        style={{ height: `${chartMax > 0 ? (chartValues[i] / chartMax) * 100 : 0}%` }} />
                                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 ${d.isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'}`}>
                                        <p className={`font-bold ${headText}`}>{chartMode === 'spend' ? `$${chartValues[i]?.toFixed(2)}` : chartValues[i]?.toLocaleString()}</p>
                                        <p className={subText}>{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="h-40 flex items-center justify-center">
                        <div className="text-center">
                            <LayoutGrid className={`w-10 h-10 mx-auto mb-2 ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={`text-sm ${subText}`}>No in-page push data for this period</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Campaign table */}
            <div className={d.card}>
                <div className="flex items-center gap-2 mb-5">
                    <LayoutGrid className={`w-5 h-5 ${accent.text || 'text-lime-400'}`} />
                    <h2 className={`text-lg font-bold ${headText}`}>In-Page Push Campaigns</h2>
                    <span className={`ml-auto text-xs ${subText}`}>{data.campaigns?.length || 0} campaign{data.campaigns?.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={`border-b ${divider}`}>
                                {['Campaign', 'Status', 'Impressions', 'Clicks', 'CTR', 'CPM', 'Spend'].map(h => (
                                    <th key={h} className={`${d.tableHeadCell} text-left pb-3`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                            {data.campaigns?.length > 0 ? data.campaigns.map(camp => (
                                <tr key={camp.id} className={d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                    <td className={`py-3.5 pr-4 text-sm font-medium ${headText} max-w-[180px] truncate`}>{camp.name}</td>
                                    <td className="py-3.5 pr-4">
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColor(camp.status)}`}>{camp.status}</span>
                                    </td>
                                    <td className={`py-3.5 pr-4 text-sm ${subText}`}>{camp.impressions.toLocaleString()}</td>
                                    <td className={`py-3.5 pr-4 text-sm ${subText}`}>{camp.clicks.toLocaleString()}</td>
                                    <td className={`py-3.5 pr-4 text-sm font-mono font-bold ${accent.text || 'text-lime-400'}`}>{parseFloat(camp.ctr || 0).toFixed(2)}%</td>
                                    <td className={`py-3.5 pr-4 text-sm font-mono ${subText}`}>${parseFloat(camp.cpm || 0).toFixed(2)}</td>
                                    <td className={`py-3.5 text-sm font-medium ${headText}`}>${parseFloat(camp.spent || camp.spend || 0).toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className={`py-10 text-center text-sm ${subText}`}>No in-page push campaigns found for this period</td></tr>
                            )}
                            {data.campaigns?.length > 0 && (
                                <tr className={`font-bold border-t-2 ${d.isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'}`}>
                                    <td className={`py-3 pr-4 text-sm ${headText}`} colSpan={2}>TOTAL</td>
                                    <td className={`py-3 pr-4 text-sm ${headText}`}>{summary.totalImpressions?.toLocaleString()}</td>
                                    <td className={`py-3 pr-4 text-sm ${headText}`}>{summary.totalClicks?.toLocaleString()}</td>
                                    <td className={`py-3 pr-4 text-sm font-mono ${accent.text || 'text-lime-400'}`}>{parseFloat(summary.ctr || 0).toFixed(2)}%</td>
                                    <td className={`py-3 pr-4 text-sm font-mono ${subText}`}>${parseFloat(summary.cpm || 0).toFixed(2)}</td>
                                    <td className={`py-3 text-sm ${headText}`}>${parseFloat(summary.totalSpend || 0).toFixed(2)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Breakdown by dimension */}
            <div className={d.card}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h2 className={`text-lg font-bold ${headText}`}>Breakdown by Dimension</h2>
                    <div className={`flex gap-1 flex-wrap bg-white/5 border border-white/10 rounded-xl p-1 ${!d.isDark && 'bg-gray-100 border-gray-200'}`}>
                        {DIM_TABS.map(t => (
                            <button key={t.key} onClick={() => setDimTab(t.key)}
                                className={`px-3 py-1.5 text-xs font-semibold transition-all rounded-lg ${dimTab === t.key ? tabActive : `${subText} hover:opacity-80`}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={`border-b ${divider}`}>
                                <th className={`${d.tableHeadCell} text-left pb-3`}>{activeDimData?.col1Label}</th>
                                <th className={`${d.tableHeadCell} text-left pb-3`}>Impressions</th>
                                <th className={`${d.tableHeadCell} text-left pb-3`}>Clicks</th>
                                <th className={`${d.tableHeadCell} text-left pb-3`}>CTR</th>
                                <th className={`${d.tableHeadCell} text-left pb-3`}>CPM</th>
                                <th className={`${d.tableHeadCell} text-left pb-3`}>Spend</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                            {(activeDimData?.data || []).length > 0 ? (activeDimData?.data || []).map((row, i) => (
                                <tr key={i} className={d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                    <td className={`py-3.5 pr-4 text-sm font-medium ${headText}`}>{row[activeDimData.col1] || '--'}</td>
                                    <td className={`py-3.5 pr-4 text-sm ${subText}`}>{Number(row.impressions || 0).toLocaleString()}</td>
                                    <td className={`py-3.5 pr-4 text-sm ${subText}`}>{Number(row.clicks || 0).toLocaleString()}</td>
                                    <td className={`py-3.5 pr-4 text-sm font-mono font-bold ${accent.text}`}>{parseFloat(row.ctr || 0).toFixed(2)}%</td>
                                    <td className={`py-3.5 pr-4 text-sm font-mono ${subText}`}>${parseFloat(row.cpm || 0).toFixed(2)}</td>
                                    <td className={`py-3.5 text-sm font-medium ${headText}`}>${parseFloat(row.spent || row.spend || 0).toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className={`py-10 text-center text-sm ${subText}`}>No {activeDimData?.label.toLowerCase()} data available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function AdvertiserStatistics() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    // Date range state
    const [dateRange, setDateRange] = useState({ start: daysAgo(30), end: new Date() });
    const [startInput, setStartInput] = useState(dateToStr(daysAgo(30)));
    const [endInput, setEndInput] = useState(dateToStr(new Date()));
    const [activePreset, setActivePreset] = useState(30);

    // Tab, granularity, filters
    const [activeTab, setActiveTab] = useState('general');
    const [groupBy, setGroupBy] = useState('day');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({ format: 'ALL', countries: '', device: 'ALL', browser: 'ALL', os: 'ALL', campaignIds: '' });
    const [filterOptions, setFilterOptions] = useState({ countries: [], browsers: [], operatingSystems: [], devices: [] });
    const [selectedCampaignFilters, setSelectedCampaignFilters] = useState([]);

    // General tab data
    const [loading, setLoading] = useState(true);
    const [activeMetric, setActiveMetric] = useState('impressions');
    const [stats, setStats] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [daily, setDaily] = useState([]);
    const [geo, setGeo] = useState([]);
    const [devices, setDevices] = useState([]);
    const [browsers, setBrowsers] = useState([]);
    const [operatingSystems, setOperatingSystems] = useState([]);
    const [zones, setZones] = useState([]);
    const [campaignList, setCampaignList] = useState([]);

    // Campaign table state
    const [campSearch, setCampSearch] = useState('');
    const [campSort, setCampSort] = useState({ key: 'spend', dir: 'desc' });
    const [campPage, setCampPage] = useState(0);
    const [campPerPage, setCampPerPage] = useState(25);
    const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);

    // Dimension tabs
    const [activeDimension, setActiveDimension] = useState('campaigns');

    // Zone state
    const [zoneCampaignFilter, setZoneCampaignFilter] = useState('');
    const [zoneSort, setZoneSort] = useState({ key: 'spent', dir: 'desc' });

    // â”€â”€ Apply date range from inputs
    const applyDateRange = useCallback(() => {
        const s = new Date(startInput); const e = new Date(endInput);
        if (!isNaN(s) && !isNaN(e) && s <= e) {
            setDateRange({ start: s, end: e });
            setActivePreset(null);
        }
    }, [startInput, endInput]);

    // â”€â”€ Preset shortcuts
    const applyPreset = useCallback((days) => {
        const s = daysAgo(days); const e = new Date();
        setStartInput(dateToStr(s)); setEndInput(dateToStr(e));
        setDateRange({ start: s, end: e });
        setActivePreset(days);
    }, []);

    // â”€â”€ Build common params for API calls
    const buildParams = useCallback(() => {
        const p = { startDate: dateToStr(dateRange.start), endDate: dateToStr(dateRange.end), groupBy };
        if (filters.format !== 'ALL') p.format = filters.format;
        if (filters.countries) p.countries = filters.countries;
        if (filters.device !== 'ALL') p.device = filters.device;
        if (filters.browser !== 'ALL') p.browser = filters.browser;
        if (filters.os !== 'ALL') p.os = filters.os;
        if (selectedCampaignFilters.length > 0) p.campaignIds = selectedCampaignFilters.join(',');
        return p;
    }, [dateRange, groupBy, filters, selectedCampaignFilters]);

    // â”€â”€ Fetch data
    useEffect(() => { if (activeTab === 'general') fetchGeneralData(); }, [dateRange, groupBy, filters, selectedCampaignFilters, zoneCampaignFilter]);

    useEffect(() => { fetchFilterOptions(); }, []);

    const fetchFilterOptions = async () => {
        try {
            const opts = await advertiserAPI.getFilterOptions();
            setFilterOptions(opts);
        } catch (e) { console.error('Filter options error:', e); }
    };

    const fetchGeneralData = async () => {
        setLoading(true);
        try {
            const params = buildParams();
            const zoneParams = { ...params };
            if (zoneCampaignFilter) zoneParams.campaignId = zoneCampaignFilter;

            const results = await Promise.allSettled([
                advertiserAPI.getCampaignPerformance(params),
                advertiserAPI.getGeographicPerformance(params),
                advertiserAPI.getDevicePerformance(params),
                advertiserAPI.getZonePerformance(zoneParams),
                advertiserAPI.getCampaigns(),
                advertiserAPI.getBrowserPerformance(params),
                advertiserAPI.getOSPerformance(params),
            ]);

            const [perfResult, geoResult, deviceResult, zoneResult, campListResult, browserResult, osResult] = results;

            if (perfResult.status === 'fulfilled' && perfResult.value) {
                setStats(perfResult.value.summary || null);
                setCampaigns(perfResult.value.campaigns || []);
                setDaily(perfResult.value.daily || []);
            }
            if (geoResult.status === 'fulfilled' && geoResult.value) setGeo(geoResult.value.countries || []);
            if (deviceResult.status === 'fulfilled' && deviceResult.value) setDevices(deviceResult.value.devices || []);
            if (zoneResult.status === 'fulfilled' && zoneResult.value) setZones(zoneResult.value.zones || []);
            if (campListResult.status === 'fulfilled') {
                const cl = Array.isArray(campListResult.value) ? campListResult.value : (campListResult.value?.campaigns || []);
                setCampaignList(cl);
            }
            if (browserResult.status === 'fulfilled' && browserResult.value) setBrowsers(browserResult.value.browsers || []);
            if (osResult.status === 'fulfilled' && osResult.value) setOperatingSystems(osResult.value.operatingSystems || []);
        } catch (err) {
            console.error('Statistics fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // â”€â”€ Theme tokens
    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    const divider = d.isDark ? 'border-white/10' : 'border-gray-200';

    const accent = {
        'theme-luminous': { primary: 'bg-lime-400', bar: 'from-lime-400/60 to-lime-400', text: 'text-lime-400', glow: 'shadow-[0_0_8px_rgba(163,255,51,0.4)]' },
        'theme-azure': { primary: 'bg-sky-400', bar: 'from-sky-400/60 to-sky-400', text: 'text-sky-400', glow: 'shadow-[0_0_8px_rgba(56,189,248,0.4)]' },
        'theme-saas': { primary: 'bg-white', bar: 'from-white/40 to-white', text: 'text-white', glow: '' },
        'theme-editorial': { primary: 'bg-red-700', bar: 'from-red-600/60 to-red-700', text: 'text-red-700', glow: '' },
        'theme-brutalist': { primary: 'bg-[#1A1A1A]', bar: 'from-[#1A1A1A]/60 to-[#1A1A1A]', text: 'text-[#1A1A1A]', glow: '' },
    }[theme] || { primary: 'bg-lime-400', bar: 'from-lime-400/60 to-lime-400', text: 'text-lime-400', glow: '' };

    const secAccent = {
        'theme-luminous': { bar: 'from-sky-400/60 to-sky-400', text: 'text-sky-400' },
        'theme-azure': { bar: 'from-lime-400/60 to-lime-400', text: 'text-lime-400' },
        'theme-saas': { bar: 'from-gray-400/60 to-gray-400', text: 'text-gray-400' },
        'theme-editorial': { bar: 'from-blue-500/60 to-blue-600', text: 'text-blue-700' },
        'theme-brutalist': { bar: 'from-gray-400/60 to-gray-500', text: 'text-gray-500' },
    }[theme] || { bar: 'from-sky-400/60 to-sky-400', text: 'text-sky-400' };

    const tabActive = {
        'theme-luminous': 'bg-lime-400 text-slate-900',
        'theme-azure': 'bg-sky-500 text-white',
        'theme-saas': 'bg-white text-black',
        'theme-editorial': 'bg-[#1A1A1A] text-white',
        'theme-brutalist': 'bg-[#1A1A1A] text-white shadow-[2px_2px_0px_0px_var(--color-primary)] border-2 border-[#1A1A1A]',
    }[theme] || 'bg-lime-400 text-slate-900';

    const tabWrap = {
        'theme-luminous': 'bg-white/5 border border-white/10 rounded-xl p-1',
        'theme-azure': 'bg-white/5 border border-white/10 rounded-xl p-1',
        'theme-saas': 'bg-white/[0.04] border border-white/[0.08] rounded-lg p-1',
        'theme-editorial': 'bg-gray-100 border border-gray-200 rounded-lg p-1',
        'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] p-1',
    }[theme] || 'bg-white/5 border border-white/10 rounded-xl p-1';

    // Chart data
    const metricOptions = [
        { key: 'impressions', label: 'Impressions', accessor: d => d.impressions },
        { key: 'clicks', label: 'Clicks', accessor: d => d.clicks },
        { key: 'spend', label: 'Spend ($)', accessor: d => d.spend },
        { key: 'conversions', label: 'Conv.', accessor: d => d.conversions },
    ];
    const activeAccessor = metricOptions.find(m => m.key === activeMetric)?.accessor || (d => d.impressions);
    const chartData = daily.map(d => ({ ...d, value: activeAccessor(d) }));
    const chartMax = Math.max(...chartData.map(d => d.value), 1);

    const deviceColors = {
        'theme-luminous': ['from-lime-400/70 to-lime-400', 'from-sky-400/70 to-sky-400', 'from-purple-400/70 to-purple-400'],
        'theme-azure': ['from-sky-400/70 to-sky-400', 'from-lime-400/70 to-lime-400', 'from-purple-400/70 to-purple-400'],
        'theme-saas': ['from-white/60 to-white', 'from-white/30 to-white/50', 'from-white/15 to-white/30'],
        'theme-editorial': ['from-red-600/70 to-red-700', 'from-gray-500/70 to-gray-600', 'from-red-300/70 to-red-400'],
        'theme-brutalist': ['from-[#1A1A1A] to-[#1A1A1A]', 'from-gray-500 to-gray-600', 'from-gray-300 to-gray-400'],
    }[theme] || ['from-lime-400/70 to-lime-400', 'from-sky-400/70 to-sky-400', 'from-purple-400/70 to-purple-400'];

    // Campaign table: search, sort, paginate
    const filteredCampaigns = useMemo(() => {
        let list = [...campaigns];
        if (campSearch) list = list.filter(c => c.name.toLowerCase().includes(campSearch.toLowerCase()));
        list.sort((a, b) => {
            const av = a[campSort.key] ?? 0; const bv = b[campSort.key] ?? 0;
            if (typeof av === 'number') return campSort.dir === 'desc' ? bv - av : av - bv;
            return campSort.dir === 'desc' ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
        });
        return list;
    }, [campaigns, campSearch, campSort]);

    const pagedCampaigns = filteredCampaigns.slice(campPage * campPerPage, (campPage + 1) * campPerPage);
    const totalPages = Math.ceil(filteredCampaigns.length / campPerPage);

    // Summary row totals
    const totals = useMemo(() => ({
        impressions: filteredCampaigns.reduce((s, c) => s + c.impressions, 0),
        clicks: filteredCampaigns.reduce((s, c) => s + c.clicks, 0),
        spent: filteredCampaigns.reduce((s, c) => s + c.spent, 0),
        conversions: filteredCampaigns.reduce((s, c) => s + c.conversions, 0),
    }), [filteredCampaigns]);

    const statusColor = s => ({
        ACTIVE: d.isDark ? 'bg-lime-500/20 text-lime-400' : 'bg-green-100 text-green-700',
        PAUSED: d.isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700',
        PENDING: d.isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-blue-100 text-blue-700',
        PENDING_APPROVAL: d.isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-blue-100 text-blue-700',
    }[s] || 'bg-gray-500/20 text-gray-400');

    // â”€â”€ CSV Export
    const handleExport = () => {
        const params = buildParams();
        const url = advertiserAPI.exportCSV(params);
        window.open(url, '_blank');
    };

    // â”€â”€ Select inputs styling
    const selectCls = `text-sm px-3 py-2 rounded-xl transition-all cursor-pointer ${d.isDark ? 'bg-white/5 border border-white/10 text-white focus:border-white/30' : 'bg-white border border-gray-200 text-[#1A1A1A] focus:border-gray-400'} focus:outline-none`;
    const inputCls = `text-sm px-3 py-2 rounded-xl transition-all ${d.isDark ? 'bg-white/5 border border-white/10 text-white focus:border-white/30  [color-scheme:dark]' : 'bg-white border border-gray-200 text-[#1A1A1A] focus:border-gray-400'} focus:outline-none`;

    if (loading && activeTab === 'general') return (
        <div className="flex items-center justify-center h-96 flex-col gap-4">
            <Loader2 className={`w-10 h-10 animate-spin ${d.loaderColor}`} />
            <p className={d.loaderText}>Loading analytics...</p>
        </div>
    );

    const geoMax = Math.max(...geo.map(g => g.impressions), 1);

    // â”€â”€ Dimension table helper
    const DimensionTable = ({ data, columns, sortState, setSortState }) => {
        const sorted = [...data].sort((a, b) => {
            const av = a[sortState.key] ?? ''; const bv = b[sortState.key] ?? '';
            if (typeof av === 'number') return sortState.dir === 'desc' ? bv - av : av - bv;
            return sortState.dir === 'desc' ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
        });
        const dimTotals = {};
        columns.filter(c => c.numeric).forEach(c => {
            dimTotals[c.key] = sorted.reduce((s, r) => s + (Number(r[c.key]) || 0), 0);
        });

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className={`border-b ${divider}`}>
                            {columns.map(col => (
                                <th key={col.key}
                                    onClick={() => setSortState(prev => ({ key: col.key, dir: prev.key === col.key && prev.dir === 'desc' ? 'asc' : 'desc' }))}
                                    className={`${d.tableHeadCell} text-left pb-3 cursor-pointer select-none hover:opacity-80 transition-opacity`}>
                                    <span className="flex items-center gap-1">
                                        {col.label}
                                        {sortState.key === col.key && <span className={`text-[10px] ${accent.text}`}>{sortState.dir === 'desc' ? 'v' : '^'}</span>}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                        {sorted.length > 0 ? sorted.map((row, i) => (
                            <tr key={i} className={d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                {columns.map(col => (
                                    <td key={col.key} className={`py-3.5 pr-4 text-sm ${col.accent ? `font-mono font-bold ${accent.text}` : col.bold ? `font-medium ${headText}` : subText}`}>
                                        {col.fmt ? col.fmt(row[col.key], row) : (typeof row[col.key] === 'number' ? row[col.key].toLocaleString() : (row[col.key] || '--'))}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr><td colSpan={columns.length} className={`py-10 text-center text-sm ${subText}`}>No data available</td></tr>
                        )}
                        {/* Summary row */}
                        {sorted.length > 0 && (
                            <tr className={`font-bold border-t-2 ${d.isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'}`}>
                                {columns.map((col, ci) => (
                                    <td key={col.key} className={`py-3 pr-4 text-sm ${col.accent ? `font-mono ${accent.text}` : headText}`}>
                                        {ci === 0 ? 'TOTAL' : (col.numeric ? (col.fmt ? col.fmt(dimTotals[col.key] || 0) : (dimTotals[col.key] || 0).toLocaleString()) : '')}
                                    </td>
                                ))}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="relative z-10 space-y-6">
            {/* â”€â”€ Header + Date Range */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className={d.heading}>Campaign Analytics</h1>
                        <p className={`${d.subheading} mt-1`}>In-depth performance across all your campaigns</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => { if (activeTab === 'general') fetchGeneralData(); }} className={`${d.btnSecondary} p-2.5`} title="Refresh">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={handleExport} className={`${d.btnSecondary} p-2.5`} title="Export CSV">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* â”€â”€ Date Range Section */}
                <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border ${d.isDark ? 'bg-white/[0.02] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${subText}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${subText}`}>Date Range</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <input type="date" value={startInput} onChange={e => setStartInput(e.target.value)} className={inputCls} />
                        <span className={`text-xs ${subText}`}>--</span>
                        <input type="date" value={endInput} onChange={e => setEndInput(e.target.value)} className={inputCls} />
                        <button onClick={applyDateRange}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${tabActive}`}>
                            Apply
                        </button>
                    </div>
                    <div className={`flex gap-1 ${tabWrap} ml-auto`}>
                        {PRESET_RANGES.map(p => (
                            <button key={p.days} onClick={() => applyPreset(p.days)}
                                className={`px-3 py-1.5 text-xs font-semibold transition-all rounded-lg ${activePreset === p.days ? tabActive : `${subText} hover:opacity-80`}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* â”€â”€ Tab Switcher + Granularity */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className={`flex gap-1 p-1 rounded-xl border w-fit ${d.isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive ? tabActive : `${subText} hover:opacity-80`}`}>
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-2">
                    {/* Granularity */}
                    <div className={`flex gap-1 ${tabWrap}`}>
                        {GRANULARITY.map(g => (
                            <button key={g.key} onClick={() => setGroupBy(g.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all rounded-lg ${groupBy === g.key ? tabActive : `${subText} hover:opacity-80`}`}>
                                <g.icon className="w-3 h-3" />
                                {g.label}
                            </button>
                        ))}
                    </div>
                    {/* Filter toggle */}
                    <button onClick={() => setFiltersOpen(!filtersOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filtersOpen ? tabActive : `${d.isDark ? 'bg-white/5 border border-white/10 text-gray-400 hover:text-white' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-800'}`}`}>
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {(filters.format !== 'ALL' || filters.countries || filters.device !== 'ALL' || filters.browser !== 'ALL' || filters.os !== 'ALL' || selectedCampaignFilters.length > 0) && (
                            <span className={`w-2 h-2 rounded-full ${accent.primary}`} />
                        )}
                    </button>
                </div>
            </div>

            {/* â”€â”€ Filters Panel */}
            {filtersOpen && (
                <div className={`p-5 rounded-2xl border space-y-4 ${d.isDark ? 'bg-white/[0.02] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <div>
                            <label className={`text-xs font-semibold block mb-1.5 ${subText}`}>Format</label>
                            <select value={filters.format} onChange={e => setFilters(p => ({ ...p, format: e.target.value }))} className={selectCls + ' w-full'}>
                                {AD_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={`text-xs font-semibold block mb-1.5 ${subText}`}>Device</label>
                            <select value={filters.device} onChange={e => setFilters(p => ({ ...p, device: e.target.value }))} className={selectCls + ' w-full'}>
                                <option value="ALL">All Devices</option>
                                {filterOptions.devices.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={`text-xs font-semibold block mb-1.5 ${subText}`}>Browser</label>
                            <select value={filters.browser} onChange={e => setFilters(p => ({ ...p, browser: e.target.value }))} className={selectCls + ' w-full'}>
                                <option value="ALL">All Browsers</option>
                                {filterOptions.browsers.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={`text-xs font-semibold block mb-1.5 ${subText}`}>OS</label>
                            <select value={filters.os} onChange={e => setFilters(p => ({ ...p, os: e.target.value }))} className={selectCls + ' w-full'}>
                                <option value="ALL">All OS</option>
                                {filterOptions.operatingSystems.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={`text-xs font-semibold block mb-1.5 ${subText}`}>Country</label>
                            <select value={filters.countries} onChange={e => setFilters(p => ({ ...p, countries: e.target.value }))} className={selectCls + ' w-full'}>
                                <option value="">All Countries</option>
                                {filterOptions.countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={`text-xs font-semibold block mb-1.5 ${subText}`}>Campaigns</label>
                        <div className="flex flex-wrap items-center gap-2">
                            {selectedCampaignFilters.map(id => {
                                const c = campaignList.find(x => x.id === id);
                                return (
                                    <span key={id} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${d.isDark ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                        {c?.name || id.substring(0, 8)}
                                        <button onClick={() => setSelectedCampaignFilters(prev => prev.filter(x => x !== id))}><X className="w-3 h-3" /></button>
                                    </span>
                                );
                            })}
                            <select
                                value=""
                                onChange={e => { if (e.target.value && !selectedCampaignFilters.includes(e.target.value)) setSelectedCampaignFilters(prev => [...prev, e.target.value]); }}
                                className={selectCls}
                            >
                                <option value="">+ Add campaign</option>
                                {campaignList.filter(c => !selectedCampaignFilters.includes(c.id)).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <button onClick={() => { setFilters({ format: 'ALL', countries: '', device: 'ALL', browser: 'ALL', os: 'ALL' }); setSelectedCampaignFilters([]); }}
                            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${d.isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}>
                            <X className="w-4 h-4 inline mr-1.5" />Clear All
                        </button>
                    </div>
                </div>
            )}

            {/* â”€â”€ Push Tab */}
            {activeTab === 'push' && (
                <PushAnalyticsTab d={d} theme={theme} dateRange={dateRange} accent={accent} secAccent={secAccent}
                    tabActive={tabActive} subText={subText} headText={headText} divider={divider} />
            )}

            {/* â”€â”€ In-Page Push Tab */}
            {activeTab === 'inpage' && (
                <InPagePushTab d={d} theme={theme} dateRange={dateRange} groupBy={groupBy} accent={accent}
                    tabActive={tabActive} subText={subText} headText={headText} divider={divider} />
            )}

            {/* -- Popunder Tab */}
            {activeTab === 'popunder' && (
                <PopunderTab d={d} theme={theme} dateRange={dateRange} groupBy={groupBy} accent={accent}
                    tabActive={tabActive} subText={subText} headText={headText} divider={divider} />
            )}

            {/* â”€â”€ General Tab */}
            {activeTab === 'general' && (
                <>
                    {/* Primary KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard label="Impressions" value={stats?.totalImpressions || 0} change={stats?.impressionChange || 0} icon={Eye} colorKey="sky" sparkData={daily.map(d => ({ value: d.impressions }))} d={d} theme={theme} />
                        <MetricCard label="Clicks" value={stats?.totalClicks || 0} change={stats?.clickChange || 0} icon={MousePointerClick} colorKey="orange" sparkData={daily.map(d => ({ value: d.clicks }))} d={d} theme={theme} />
                        <MetricCard label="Total Spend" value={stats?.totalSpend || 0} prefix="$" decimals={2} change={stats?.spendChange || 0} icon={DollarSign} colorKey="lime" sparkData={daily.map(d => ({ value: d.spend }))} d={d} theme={theme} />
                        <MetricCard label="Conversions" value={stats?.totalConversions || 0} change={stats?.conversionChange || 0} icon={Target} colorKey="purple" sparkData={daily.map(d => ({ value: d.conversions || 0 }))} d={d} theme={theme} />
                    </div>

                    {/* Secondary KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'CTR', value: `${stats?.ctr || 0}%`, icon: Activity, sub: 'Click-through rate' },
                            { label: 'CPM', value: `$${stats?.cpm || 0}`, icon: BarChart3, sub: 'Cost per 1000 impressions' },
                            { label: 'CPA', value: `$${stats?.cpa || 0}`, icon: Zap, sub: 'Cost per acquisition' },
                            { label: 'ROI', value: `${stats?.roi || 0}%`, icon: TrendingUp, sub: 'Return on investment', positive: true },
                        ].map((kpi, i) => (
                            <div key={i} className={d.card}>
                                <div className="flex items-center gap-2 mb-3">
                                    <kpi.icon className={`w-4 h-4 ${accent.text}`} />
                                    <span className={`text-xs ${subText}`}>{kpi.sub}</span>
                                </div>
                                <p className={`text-2xl font-bold ${kpi.positive ? accent.text : headText}`}>{kpi.value}</p>
                                <p className={`text-sm ${subText} mt-1`}>{kpi.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* â”€â”€ Main Chart */}
                    <div className={d.card}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <h2 className={`text-lg font-bold ${headText}`}>Performance Over Time</h2>
                            <div className="flex gap-1">
                                {metricOptions.map(m => (
                                    <button key={m.key} onClick={() => setActiveMetric(m.key)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${activeMetric === m.key ? tabActive : `${subText} hover:opacity-80`}`}>
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {chartData.some(d => d.value > 0) ? (
                            <>
                                <div className="h-48 flex items-end gap-[2px]">
                                    {chartData.map((item, i) => (
                                        <div key={i} className="flex-1 group relative cursor-pointer">
                                            <div className={`w-full bg-gradient-to-t ${accent.bar} rounded-t transition-all duration-300 min-h-[2px] ${accent.glow}`}
                                                style={{ height: `${chartMax > 0 ? (item.value / chartMax) * 100 : 0}%` }} />
                                            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 ${d.isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'}`}>
                                                <p className={`font-bold ${headText}`}>{typeof item.value === 'number' && activeMetric === 'spend' ? `$${item.value.toFixed(2)}` : item.value?.toLocaleString()}</p>
                                                <p className={subText}>{item.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={`flex justify-between mt-2 text-[10px] ${d.isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                    <span>{daily[0]?.date}</span>
                                    <span>{daily[daily.length - 1]?.date}</span>
                                </div>
                            </>
                        ) : (
                            <div className="h-48 flex items-center justify-center">
                                <div className="text-center">
                                    <BarChart3 className={`w-10 h-10 mx-auto mb-2 ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                    <p className={`text-sm ${subText}`}>No performance data yet for this period</p>
                                    <p className={`text-xs mt-1 ${d.isDark ? 'text-gray-600' : 'text-gray-400'}`}>Data will appear once your campaigns start receiving traffic</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* â”€â”€ Campaign Breakdown Table (Enhanced) */}
                    <div className={d.card}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <h2 className={`text-lg font-bold ${headText}`}>Campaign Breakdown</h2>
                            <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${d.isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                                    <Search className={`w-4 h-4 ${subText}`} />
                                    <input type="text" placeholder="Search campaigns..." value={campSearch} onChange={e => { setCampSearch(e.target.value); setCampPage(0); }}
                                        className={`bg-transparent text-sm outline-none w-40 ${headText} placeholder:${subText}`} />
                                </div>
                                <ColumnVisibilityMenu columns={visibleColumns} setColumns={setVisibleColumns} d={d} />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`border-b ${divider}`}>
                                        {[
                                            visibleColumns.id && { key: 'shortId', label: 'ID' },
                                            visibleColumns.name && { key: 'name', label: 'Campaign' },
                                            visibleColumns.format && { key: 'adFormat', label: 'Format' },
                                            visibleColumns.status && { key: 'status', label: 'Status' },
                                            visibleColumns.impressions && { key: 'impressions', label: 'Impressions' },
                                            visibleColumns.clicks && { key: 'clicks', label: 'Clicks' },
                                            visibleColumns.ctr && { key: 'ctr', label: 'CTR' },
                                            visibleColumns.cpm && { key: 'cpm', label: 'CPM' },
                                            visibleColumns.spend && { key: 'spend', label: 'Spend' },
                                            visibleColumns.conversions && { key: 'conversions', label: 'Conv.' },
                                            visibleColumns.cpa && { key: 'cpa', label: 'CPA' },
                                            visibleColumns.dailyBudget && { key: 'dailyBudget', label: 'Daily Budget' },
                                            visibleColumns.totalBudget && { key: 'totalBudget', label: 'Total Budget' },
                                            visibleColumns.startDate && { key: 'startDate', label: 'Start Date' },
                                        ].filter(Boolean).map(col => (
                                            <th key={col.key}
                                                onClick={() => setCampSort(prev => ({ key: col.key, dir: prev.key === col.key && prev.dir === 'desc' ? 'asc' : 'desc' }))}
                                                className={`${d.tableHeadCell} text-left pb-3 cursor-pointer select-none hover:opacity-80 transition-opacity whitespace-nowrap`}>
                                                <span className="flex items-center gap-1">
                                                    {col.label}
                                                    {campSort.key === col.key && <span className={`text-[10px] ${accent.text}`}>{campSort.dir === 'desc' ? '\u25BC' : '\u25B2'}</span>}

                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                                    {pagedCampaigns.length > 0 ? pagedCampaigns.map(camp => (
                                        <tr key={camp.id} className={d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                            {visibleColumns.id && <td className={`py-3.5 pr-3 font-mono text-xs ${accent.text}`}>{camp.shortId}</td>}
                                            {visibleColumns.name && <td className={`py-3.5 pr-4 font-medium text-sm ${headText} max-w-[180px] truncate`}>{camp.name}</td>}
                                            {visibleColumns.format && <td className="py-3.5 pr-4">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${d.isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                                    {(camp.adFormat || '').replace(/_/g, ' ')}
                                                </span>
                                            </td>}
                                            {visibleColumns.status && <td className="py-3.5 pr-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor(camp.status)}`}>{camp.status}</span>
                                            </td>}
                                            {visibleColumns.impressions && <td className={`py-3.5 pr-4 text-sm ${subText}`}>{camp.impressions.toLocaleString()}</td>}
                                            {visibleColumns.clicks && <td className={`py-3.5 pr-4 text-sm ${subText}`}>{camp.clicks.toLocaleString()}</td>}
                                            {visibleColumns.ctr && <td className={`py-3.5 pr-4 text-sm font-mono ${accent.text}`}>{camp.ctr.toFixed(2)}%</td>}
                                            {visibleColumns.cpm && <td className={`py-3.5 pr-4 text-sm font-mono ${subText}`}>${camp.cpm.toFixed(2)}</td>}
                                            {visibleColumns.spend && <td className={`py-3.5 pr-4 text-sm font-medium ${headText}`}>${camp.spend.toFixed(2)}</td>}
                                            {visibleColumns.conversions && <td className={`py-3.5 pr-4 text-sm ${subText}`}>{camp.conversions}</td>}
                                            {visibleColumns.cpa && <td className={`py-3.5 pr-4 text-sm font-mono ${headText}`}>${camp.cpa.toFixed(2)}</td>}
                                            {visibleColumns.dailyBudget && <td className={`py-3.5 pr-4 text-sm ${subText}`}>{camp.dailyBudget > 0 ? `$${camp.dailyBudget.toFixed(2)}` : '--'}</td>}
                                            {visibleColumns.totalBudget && <td className={`py-3.5 pr-4 text-sm ${subText}`}>${camp.totalBudget.toFixed(2)}</td>}
                                            {visibleColumns.startDate && <td className={`py-3.5 text-sm ${subText}`}>{camp.startDate ? new Date(camp.startDate).toLocaleDateString() : '--'}</td>}
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={14} className={`py-10 text-center text-sm ${subText}`}>No campaigns found</td></tr>
                                    )}
                                    {/* Summary row */}
                                    {pagedCampaigns.length > 0 && (
                                        <tr className={`font-bold border-t-2 ${d.isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'}`}>
                                            {visibleColumns.id && <td className={`py-3 pr-3 text-sm ${headText}`}></td>}
                                            {visibleColumns.name && <td className={`py-3 pr-4 text-sm ${headText}`}>TOTAL ({filteredCampaigns.length})</td>}
                                            {visibleColumns.format && <td className="py-3 pr-4"></td>}
                                            {visibleColumns.status && <td className="py-3 pr-4"></td>}
                                            {visibleColumns.impressions && <td className={`py-3 pr-4 text-sm ${headText}`}>{totals.impressions.toLocaleString()}</td>}
                                            {visibleColumns.clicks && <td className={`py-3 pr-4 text-sm ${headText}`}>{totals.clicks.toLocaleString()}</td>}
                                            {visibleColumns.ctr && <td className={`py-3 pr-4 text-sm font-mono ${accent.text}`}>{totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : '0.00'}%</td>}
                                            {visibleColumns.cpm && <td className={`py-3 pr-4 text-sm font-mono ${subText}`}>${totals.impressions > 0 ? ((totals.spent / totals.impressions) * 1000).toFixed(2) : '0.00'}</td>}
                                            {visibleColumns.spend && <td className={`py-3 pr-4 text-sm ${headText}`}>${totals.spent.toFixed(2)}</td>}
                                            {visibleColumns.conversions && <td className={`py-3 pr-4 text-sm ${subText}`}>{totals.conversions}</td>}
                                            {visibleColumns.cpa && <td className={`py-3 pr-4 text-sm font-mono ${headText}`}>${totals.conversions > 0 ? (totals.spent / totals.conversions).toFixed(2) : '0.00'}</td>}
                                            {visibleColumns.dailyBudget && <td className="py-3 pr-4"></td>}
                                            {visibleColumns.totalBudget && <td className="py-3 pr-4"></td>}
                                            {visibleColumns.startDate && <td className="py-3"></td>}
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={`flex items-center justify-between mt-4 pt-4 border-t ${divider}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs ${subText}`}>Show:</span>
                                    <select value={campPerPage} onChange={e => { setCampPerPage(Number(e.target.value)); setCampPage(0); }} className={selectCls}>
                                        {[25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs ${subText}`}>{campPage * campPerPage + 1} - {Math.min((campPage + 1) * campPerPage, filteredCampaigns.length)} of {filteredCampaigns.length}</span>
                                    <button disabled={campPage === 0} onClick={() => setCampPage(p => p - 1)}
                                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-30 ${d.isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>&lsaquo; Prev</button>
                                    <button disabled={campPage >= totalPages - 1} onClick={() => setCampPage(p => p + 1)}
                                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-30 ${d.isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>Next &rsaquo;</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* â”€â”€ Dimension Breakdown Tabs */}
                    <div className={d.card}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <h2 className={`text-lg font-bold ${headText}`}>Breakdown by Dimension</h2>
                            <div className={`flex gap-1 flex-wrap ${tabWrap}`}>
                                {DIMENSION_TABS.map(dt => {
                                    const Icon = dt.icon;
                                    return (
                                        <button key={dt.key} onClick={() => setActiveDimension(dt.key)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all rounded-lg ${activeDimension === dt.key ? tabActive : `${subText} hover:opacity-80`}`}>
                                            <Icon className="w-3 h-3" />
                                            {dt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Campaigns dimension */}
                        {activeDimension === 'campaigns' && (
                            <DimensionTable data={campaigns} sortState={campSort} setSortState={setCampSort}
                                columns={[
                                    { key: 'name', label: 'Campaign', bold: true },
                                    { key: 'impressions', label: 'Impressions', numeric: true },
                                    { key: 'clicks', label: 'Clicks', numeric: true },
                                    { key: 'ctr', label: 'CTR', accent: true, fmt: v => `${(v || 0).toFixed(2)}%` },
                                    { key: 'cpm', label: 'CPM', fmt: v => `$${(v || 0).toFixed(2)}` },
                                    { key: 'spend', label: 'Spend', bold: true, numeric: true, fmt: v => `$${(v || 0).toFixed(2)}` },
                                ]} />
                        )}

                        {/* Countries dimension */}
                        {activeDimension === 'countries' && (
                            <DimensionTable data={geo} sortState={{ key: 'impressions', dir: 'desc' }} setSortState={() => { }}
                                columns={[
                                    { key: 'name', label: 'Country', bold: true },
                                    { key: 'impressions', label: 'Impressions', numeric: true },
                                    { key: 'clicks', label: 'Clicks', numeric: true },
                                    { key: 'ctr', label: 'CTR', accent: true, fmt: v => `${(v || 0).toFixed(2)}%` },
                                    { key: 'spend', label: 'Spend', bold: true, numeric: true, fmt: v => `$${(v || 0).toFixed(2)}` },
                                ]} />
                        )}

                        {/* Devices dimension */}
                        {activeDimension === 'devices' && (
                            <DimensionTable data={devices} sortState={{ key: 'impressions', dir: 'desc' }} setSortState={() => { }}
                                columns={[
                                    { key: 'name', label: 'Device', bold: true },
                                    { key: 'impressions', label: 'Impressions', numeric: true },
                                    { key: 'clicks', label: 'Clicks', numeric: true },
                                    { key: 'share', label: 'Share', accent: true, fmt: v => `${(v || 0).toFixed(1)}%` },
                                    { key: 'spent', label: 'Spend', bold: true, numeric: true, fmt: v => `$${(v || 0).toFixed(2)}` },
                                ]} />
                        )}

                        {/* Browsers dimension */}
                        {activeDimension === 'browsers' && (
                            <DimensionTable data={browsers} sortState={{ key: 'impressions', dir: 'desc' }} setSortState={() => { }}
                                columns={[
                                    { key: 'name', label: 'Browser', bold: true },
                                    { key: 'impressions', label: 'Impressions', numeric: true },
                                    { key: 'clicks', label: 'Clicks', numeric: true },
                                    { key: 'ctr', label: 'CTR', accent: true, fmt: v => `${(v || 0).toFixed(2)}%` },
                                    { key: 'cpm', label: 'CPM', fmt: v => `$${(v || 0).toFixed(2)}` },
                                    { key: 'spent', label: 'Spend', bold: true, numeric: true, fmt: v => `$${(v || 0).toFixed(2)}` },
                                ]} />
                        )}

                        {/* OS dimension */}
                        {activeDimension === 'os' && (
                            <DimensionTable data={operatingSystems} sortState={{ key: 'impressions', dir: 'desc' }} setSortState={() => { }}
                                columns={[
                                    { key: 'name', label: 'Operating System', bold: true },
                                    { key: 'impressions', label: 'Impressions', numeric: true },
                                    { key: 'clicks', label: 'Clicks', numeric: true },
                                    { key: 'ctr', label: 'CTR', accent: true, fmt: v => `${(v || 0).toFixed(2)}%` },
                                    { key: 'cpm', label: 'CPM', fmt: v => `$${(v || 0).toFixed(2)}` },
                                    { key: 'spent', label: 'Spend', bold: true, numeric: true, fmt: v => `$${(v || 0).toFixed(2)}` },
                                ]} />
                        )}

                        {/* Zones dimension */}
                        {activeDimension === 'zones' && (() => {
                            const sorted = [...zones].sort((a, b) => {
                                const aVal = a[zoneSort.key] ?? ''; const bVal = b[zoneSort.key] ?? '';
                                if (typeof aVal === 'number') return zoneSort.dir === 'desc' ? bVal - aVal : aVal - bVal;
                                return zoneSort.dir === 'desc' ? String(bVal).localeCompare(String(aVal)) : String(aVal).localeCompare(String(bVal));
                            });
                            return (
                                <>
                                    <div className="flex items-center justify-end mb-4">
                                        <select value={zoneCampaignFilter} onChange={e => setZoneCampaignFilter(e.target.value)} className={selectCls + ' min-w-[200px]'}>
                                            <option value="">All Campaigns</option>
                                            {campaignList.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                        </select>
                                    </div>
                                    {sorted.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Target className={`w-12 h-12 mx-auto mb-3 ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                            <p className={`text-sm ${subText}`}>No zone data available yet.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className={`border-b ${divider}`}>
                                                        {[
                                                            { key: 'shortId', label: 'Zone ID' }, { key: 'siteName', label: 'Site' },
                                                            { key: 'impressions', label: 'Impressions' }, { key: 'clicks', label: 'Clicks' },
                                                            { key: 'ctr', label: 'CTR' }, { key: 'cpm', label: 'CPM' }, { key: 'spent', label: 'Spend' },
                                                        ].map(col => (
                                                            <th key={col.key}
                                                                onClick={() => setZoneSort(prev => ({ key: col.key, dir: prev.key === col.key && prev.dir === 'desc' ? 'asc' : 'desc' }))}
                                                                className={`${d.tableHeadCell} text-left pb-3 cursor-pointer select-none hover:opacity-80 transition-opacity`}>
                                                                <span className="flex items-center gap-1">
                                                                    {col.label}
                                                                    {zoneSort.key === col.key && <span className={`text-[10px] ${accent.text}`}>{zoneSort.dir === 'desc' ? 'v' : '^'}</span>}
                                                                </span>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                                                    {sorted.map((z, i) => (
                                                        <tr key={z.zoneId || i} className={d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                                            <td className={`py-3.5 pr-4 font-mono text-sm font-bold ${accent.text}`}>{z.shortId}</td>
                                                            <td className={`py-3.5 pr-4 text-sm ${headText}`}>
                                                                <span className="block truncate max-w-[200px]">{z.siteName}</span>
                                                                {z.zoneName !== 'Unknown Zone' && (<span className={`block text-xs mt-0.5 ${subText}`}>{z.zoneName}</span>)}
                                                            </td>
                                                            <td className={`py-3.5 pr-4 text-sm ${subText}`}>{z.impressions.toLocaleString()}</td>
                                                            <td className={`py-3.5 pr-4 text-sm ${subText}`}>{z.clicks.toLocaleString()}</td>
                                                            <td className={`py-3.5 pr-4 text-sm font-mono ${accent.text}`}>{z.ctr.toFixed(2)}%</td>
                                                            <td className={`py-3.5 pr-4 text-sm font-mono ${subText}`}>${z.cpm.toFixed(2)}</td>
                                                            <td className={`py-3.5 text-sm font-medium ${headText}`}>${z.spent.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                    {/* Summary row */}
                                                    <tr className={`font-bold border-t-2 ${d.isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'}`}>
                                                        <td className={`py-3 pr-4 text-sm ${headText}`} colSpan={2}>TOTAL ({sorted.length})</td>
                                                        <td className={`py-3 pr-4 text-sm ${headText}`}>{sorted.reduce((s, z) => s + z.impressions, 0).toLocaleString()}</td>
                                                        <td className={`py-3 pr-4 text-sm ${headText}`}>{sorted.reduce((s, z) => s + z.clicks, 0).toLocaleString()}</td>
                                                        <td className={`py-3 pr-4 text-sm font-mono ${accent.text}`}>{(() => { const ti = sorted.reduce((s, z) => s + z.impressions, 0); const tc = sorted.reduce((s, z) => s + z.clicks, 0); return ti > 0 ? ((tc / ti) * 100).toFixed(2) : '0.00'; })()}%</td>
                                                        <td className={`py-3 pr-4 text-sm font-mono ${subText}`}>${(() => { const ti = sorted.reduce((s, z) => s + z.impressions, 0); const ts = sorted.reduce((s, z) => s + z.spent, 0); return ti > 0 ? ((ts / ti) * 1000).toFixed(2) : '0.00'; })()}</td>
                                                        <td className={`py-3 text-sm ${headText}`}>${sorted.reduce((s, z) => s + z.spent, 0).toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </>
            )}
        </div>
    );
}
