'use client';

import { useState, useEffect } from 'react';
import {
    ShoppingCart, Zap, Image, FlaskConical, TrendingUp, DollarSign,
    Calendar, Filter, RefreshCw, Loader2, Trash2, BarChart2,
    CheckCircle2, XCircle, AlertCircle, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';
import ConfirmModal from '@/components/ConfirmModal';

const STATUS_META = {
    SUCCESS:          { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle2 },
    DUPLICATE:        { color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  icon: AlertCircle },
    INVALID_CLICK_ID: { color: 'text-red-400',     bg: 'bg-red-400/10',     icon: XCircle },
    NO_CLICK_ID:      { color: 'text-orange-400',  bg: 'bg-orange-400/10',  icon: XCircle },
    NO_CLICK:         { color: 'text-orange-400',  bg: 'bg-orange-400/10',  icon: AlertCircle },
    RATE_LIMITED:     { color: 'text-red-500',     bg: 'bg-red-500/10',     icon: XCircle },
    EXPIRED:          { color: 'text-gray-400',    bg: 'bg-gray-400/10',    icon: Clock },
    INVALID_TOKEN:    { color: 'text-red-400',     bg: 'bg-red-400/10',     icon: XCircle },
    ERROR:            { color: 'text-red-500',     bg: 'bg-red-500/10',     icon: XCircle },
};

const PIE_COLORS = ['#34d399', '#38bdf8', '#a78bfa'];

export default function AdminConversionsPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [overview, setOverview] = useState(null);
    const [logs, setLogs] = useState([]);
    const [logsMeta, setLogsMeta] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [clearing, setClearing] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);

    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    const borderColor = d.isDark ? 'border-white/8' : 'border-gray-200';
    const gridColor = d.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const tooltipBg = d.isDark ? '#0D0D1A' : '#fff';
    const tooltipBorder = d.isDark ? '#ffffff15' : '#e5e7eb';

    const token = () => localStorage.getItem('token');
    const headers = () => ({ 'Authorization': `Bearer ${token()}` });

    useEffect(() => { fetchOverview(); }, []);
    useEffect(() => { fetchLogs(); }, [page, statusFilter]);

    const fetchOverview = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/conversions/overview', { headers: headers() });
            const data = await res.json();
            setOverview(data);
        } catch { } finally { setLoading(false); }
    };

    const fetchLogs = async () => {
        setLogsLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 50 });
            if (statusFilter) params.set('status', statusFilter);
            const res = await fetch(`/api/admin/conversions/postback-logs?${params}`, { headers: headers() });
            const data = await res.json();
            setLogs(data.logs || []);
            setLogsMeta(data.pagination || { page: 1, pages: 1, total: 0 });
        } catch { } finally { setLogsLoading(false); }
    };

    const clearTestConversions = async () => {
        setClearing(true);
        try {
            await fetch('/api/admin/conversions/test', { method: 'DELETE', headers: headers() });
            fetchOverview();
            fetchLogs();
        } catch { } finally { setClearing(false); }
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return new Date(dateStr).toLocaleDateString();
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className={`w-12 h-12 animate-spin ${d.loaderColor}`} />
        </div>
    );

    const kpis = overview?.kpis || {};
    const topCampaigns = overview?.topCampaigns || [];
    const dailyTrend = overview?.dailyTrend || [];
    const methodBreakdown = overview?.methodBreakdown || [];

    const KPIS = [
        { label: 'Total Conversions', value: kpis.totalAll?.toLocaleString() || '0', icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Today', value: kpis.totalToday?.toLocaleString() || '0', icon: Calendar, color: 'text-lime-400', bg: 'bg-lime-400/10' },
        { label: 'This Week', value: kpis.totalWeek?.toLocaleString() || '0', icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-400/10' },
        { label: 'S2S Postback', value: kpis.s2sCount?.toLocaleString() || '0', icon: Zap, color: 'text-violet-400', bg: 'bg-violet-400/10' },
        { label: 'Pixel', value: kpis.pixelCount?.toLocaleString() || '0', icon: Image, color: 'text-pink-400', bg: 'bg-pink-400/10' },
        { label: 'Total Payout', value: `$${kpis.totalPayout || '0.00'}`, icon: DollarSign, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    ];

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={confirmClear}
                onClose={() => setConfirmClear(false)}
                onConfirm={clearTestConversions}
                title="Clear All Test Conversions?"
                message="This will permanently delete all TEST conversion records. This action cannot be undone."
                confirmText="Clear Test Data"
                cancelText="Cancel"
                type="danger"
                d={d}
            />
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className={d.heading}>Conversion Tracking</h1>
                    <p className={`${d.subheading} mt-1`}>S2S Postback & Pixel conversion overview across all campaigns</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setConfirmClear(true)}
                        disabled={clearing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${borderColor} ${d.isDark ? 'bg-white/5 hover:bg-red-400/10 hover:border-red-400/30 hover:text-red-400 text-gray-300' : 'bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-600'} transition-all`}
                    >
                        {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Clear Test Data
                    </button>
                    <button onClick={() => { fetchOverview(); fetchLogs(); }} className={`${d.btnSecondary} p-2.5`}>
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {KPIS.map((k, i) => (
                    <div key={i} className={`${d.card} flex flex-col items-center text-center p-4 gap-2`}>
                        <div className={`p-2 rounded-lg ${k.bg}`}>
                            <k.icon className={`w-4 h-4 ${k.color}`} />
                        </div>
                        <div className={`text-xl font-black tracking-tighter ${headText}`}>{k.value}</div>
                        <div className={`text-[10px] uppercase tracking-widest font-medium ${subText}`}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Daily Trend */}
                <div className={`${d.card} lg:col-span-2`}>
                    <h2 className={`text-base font-bold ${headText} mb-4`}>14-Day Conversion Trend</h2>
                    {dailyTrend.length === 0 ? (
                        <div className={`text-center py-12 ${subText} text-sm`}>No conversion data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={dailyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: d.isDark ? '#6b7280' : '#9ca3af' }}
                                    tickFormatter={v => v.slice(5)} />
                                <YAxis tick={{ fontSize: 10, fill: d.isDark ? '#6b7280' : '#9ca3af' }} />
                                <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', fontSize: '12px' }} />
                                <Legend iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="s2s" name="S2S" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="pixel" name="Pixel" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Method Breakdown Pie */}
                <div className={d.card}>
                    <h2 className={`text-base font-bold ${headText} mb-4`}>Method Breakdown</h2>
                    {methodBreakdown.every(m => m.value === 0) ? (
                        <div className={`text-center py-12 ${subText} text-sm`}>No data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={methodBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                                    {methodBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', fontSize: '12px' }} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Top Converting Campaigns */}
            {topCampaigns.length > 0 && (
                <div className={d.card}>
                    <h2 className={`text-base font-bold ${headText} mb-4`}>Top Converting Campaigns</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`${subText} text-left border-b ${borderColor} text-xs`}>
                                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">Campaign</th>
                                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">Format</th>
                                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">Conversions</th>
                                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">Total Payout</th>
                                    <th className="pb-2 font-semibold uppercase tracking-wider">Last Conv.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topCampaigns.map((c, i) => (
                                    <tr key={c.id} className={`border-t ${borderColor}`}>
                                        <td className={`py-2.5 pr-4 font-medium ${headText} max-w-[200px] truncate`}>{c.name}</td>
                                        <td className={`py-2.5 pr-4 ${subText} text-xs`}>{c.adFormat}</td>
                                        <td className="py-2.5 pr-4">
                                            <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                                {c.conversions.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className={`py-2.5 pr-4 font-semibold ${headText}`}>${c.totalPayout}</td>
                                        <td className={`py-2.5 ${subText} text-xs`}>{c.lastConversion ? timeAgo(c.lastConversion) : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Postback Log Viewer */}
            <div className={d.card}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className={`text-base font-bold ${headText}`}>Postback Logs</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border ${borderColor} ${d.isDark ? 'bg-white/5 text-gray-300' : 'bg-white text-gray-700'} focus:outline-none`}
                        >
                            <option value="">All Statuses</option>
                            <option value="SUCCESS">SUCCESS</option>
                            <option value="DUPLICATE">DUPLICATE</option>
                            <option value="INVALID_CLICK_ID">INVALID_CLICK_ID</option>
                            <option value="NO_CLICK_ID">NO_CLICK_ID</option>
                            <option value="NO_CLICK">NO_CLICK</option>
                            <option value="RATE_LIMITED">RATE_LIMITED</option>
                            <option value="EXPIRED">EXPIRED</option>
                            <option value="ERROR">ERROR</option>
                        </select>
                        <button onClick={fetchLogs} className={`${d.btnSecondary} p-2`}>
                            <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {logsLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className={`w-6 h-6 animate-spin ${d.loaderColor}`} />
                    </div>
                ) : logs.length === 0 ? (
                    <div className={`text-center py-12 rounded-xl border border-dashed ${borderColor}`}>
                        <BarChart2 className={`w-10 h-10 ${subText} mx-auto mb-2 opacity-30`} />
                        <p className={`text-sm ${subText}`}>No postback logs found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className={`${subText} text-left border-b ${borderColor}`}>
                                        <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">Status</th>
                                        <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">Click ID</th>
                                        <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">IP</th>
                                        <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">Note</th>
                                        <th className="pb-2 font-semibold uppercase tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => {
                                        const meta = STATUS_META[log.status] || { color: 'text-gray-400', bg: 'bg-gray-400/10', icon: AlertCircle };
                                        const StatusIcon = meta.icon;
                                        return (
                                            <tr key={log.id} className={`border-t ${borderColor}`}>
                                                <td className="py-2 pr-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${meta.color} ${meta.bg}`}>
                                                        <StatusIcon className="w-2.5 h-2.5" />
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className={`py-2 pr-4 font-mono ${subText}`}>
                                                    {log.clickId ? (log.clickId === 'TEST' ? 'TEST' : `${log.clickId.slice(0, 12)}…`) : '—'}
                                                </td>
                                                <td className={`py-2 pr-4 font-mono ${subText}`}>{log.ip || '—'}</td>
                                                <td className={`py-2 pr-4 ${subText} max-w-[200px] truncate`}>{log.errorMsg || '—'}</td>
                                                <td className={`py-2 ${subText}`}>{timeAgo(log.createdAt)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {logsMeta.pages > 1 && (
                            <div className={`flex items-center justify-between mt-4 pt-4 border-t ${borderColor}`}>
                                <span className={`text-xs ${subText}`}>
                                    {logsMeta.total?.toLocaleString()} logs · Page {logsMeta.page} of {logsMeta.pages}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                        className={`${d.btnSecondary} p-2 disabled:opacity-30`}
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(logsMeta.pages, p + 1))}
                                        disabled={page >= logsMeta.pages}
                                        className={`${d.btnSecondary} p-2 disabled:opacity-30`}
                                    >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
