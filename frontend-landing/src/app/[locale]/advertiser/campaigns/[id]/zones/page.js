'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Crosshair, Loader2, Search, X, Shield, ShieldOff,
    ShieldCheck, Eye, MousePointerClick, DollarSign, TrendingUp,
    CheckCircle2, AlertCircle, ArrowUpDown, RefreshCw, Filter
} from 'lucide-react';
import { advertiserAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

function Toast({ type, message, onClose, d }) {
    if (!message) return null;
    return (
        <div className={`flex items-start gap-3 px-5 py-4 rounded-xl border text-sm animate-fade-in ${type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            {type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <p className="flex-1">{message}</p>
            <button onClick={onClose}><X className="w-4 h-4 opacity-60 hover:opacity-100" /></button>
        </div>
    );
}

export default function ZoneOptimizationPage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const campaignId = params?.id;

    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState(null);
    const [zones, setZones] = useState([]);
    const [toast, setToast] = useState({ type: '', msg: '' });
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState({ key: 'spent', dir: 'desc' });
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, EXCLUDED, INCLUDED

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast({ type: '', msg: '' }), 4000);
    };

    // Targeting data — parsed from campaign.targeting
    const getTargetingZones = (camp) => {
        const t = camp?.targeting || {};
        const parseZoneList = (raw) => {
            if (Array.isArray(raw)) return raw.filter(Boolean);
            if (typeof raw === 'string' && raw.trim()) return raw.split(',').map(s => s.trim()).filter(Boolean);
            return [];
        };
        return {
            includes: parseZoneList(t.includeZones),
            excludes: parseZoneList(t.excludeZones),
        };
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [campList, zoneData] = await Promise.all([
                advertiserAPI.getCampaigns(),
                advertiserAPI.getZonePerformance({ campaignId }),
            ]);
            const campaigns = Array.isArray(campList) ? campList : (campList?.campaigns || []);
            const camp = campaigns.find(c => c.id === campaignId);
            if (!camp) {
                showToast('error', 'Campaign not found');
                setLoading(false);
                return;
            }
            setCampaign(camp);
            setZones(zoneData?.zones || []);
        } catch (e) {
            showToast('error', 'Failed to load data: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (campaignId) fetchData(); }, [campaignId]);

    // Current whitelist/blacklist
    const targeting = useMemo(() => getTargetingZones(campaign), [campaign]);

    // Determine zone status
    const getZoneStatus = (zoneId) => {
        if (targeting.excludes.includes(zoneId)) return 'EXCLUDED';
        if (targeting.includes.length > 0 && targeting.includes.includes(zoneId)) return 'INCLUDED';
        if (targeting.includes.length > 0 && !targeting.includes.includes(zoneId)) return 'NOT_IN_WHITELIST';
        return 'ACTIVE'; // Default — no whitelist or blacklist
    };

    // Update targeting
    const updateZoneTargeting = async (zoneId, action) => {
        if (!campaign) return;
        setActionLoading(zoneId);
        try {
            const t = campaign.targeting || {};
            let newIncludes = [...targeting.includes];
            let newExcludes = [...targeting.excludes];

            if (action === 'exclude') {
                // Add to excludes, remove from includes
                if (!newExcludes.includes(zoneId)) newExcludes.push(zoneId);
                newIncludes = newIncludes.filter(id => id !== zoneId);
            } else if (action === 'include') {
                // Add to includes, remove from excludes
                if (!newIncludes.includes(zoneId)) newIncludes.push(zoneId);
                newExcludes = newExcludes.filter(id => id !== zoneId);
            } else if (action === 'remove') {
                // Remove from both lists (reset to neutral)
                newIncludes = newIncludes.filter(id => id !== zoneId);
                newExcludes = newExcludes.filter(id => id !== zoneId);
            }

            await advertiserAPI.updateCampaign(campaignId, {
                targeting: {
                    ...t,
                    includeZones: newIncludes.join(','),
                    excludeZones: newExcludes.join(','),
                },
            });

            // Update local state
            setCampaign(prev => ({
                ...prev,
                targeting: {
                    ...(prev?.targeting || {}),
                    includeZones: newIncludes.join(','),
                    excludeZones: newExcludes.join(','),
                },
            }));

            const labels = { exclude: 'excluded (blacklisted)', include: 'included (whitelisted)', remove: 'reset to neutral' };
            showToast('success', `Zone ${zoneId.substring(0, 8)} ${labels[action]}`);
        } catch (e) {
            showToast('error', 'Failed to update zone: ' + e.message);
        } finally {
            setActionLoading(null);
        }
    };

    // Filter + sort
    const filtered = useMemo(() => {
        let list = [...zones];

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(z =>
                z.shortId?.toLowerCase().includes(q) ||
                z.zoneName?.toLowerCase().includes(q) ||
                z.siteName?.toLowerCase().includes(q) ||
                z.zoneId?.toLowerCase().includes(q)
            );
        }

        // Status filter
        if (statusFilter !== 'ALL') {
            list = list.filter(z => getZoneStatus(z.zoneId) === statusFilter);
        }

        // Sort
        list.sort((a, b) => {
            const aVal = a[sort.key] ?? '';
            const bVal = b[sort.key] ?? '';
            if (typeof aVal === 'number') return sort.dir === 'desc' ? bVal - aVal : aVal - bVal;
            return sort.dir === 'desc' ? String(bVal).localeCompare(String(aVal)) : String(aVal).localeCompare(String(bVal));
        });

        return list;
    }, [zones, search, statusFilter, sort, targeting]);

    // Theme tokens
    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    const divider = d.isDark ? 'border-white/10' : 'border-gray-200';

    const accent = {
        'theme-luminous': { text: 'text-lime-400', bg: 'bg-lime-400', bar: 'from-lime-400/60 to-lime-400' },
        'theme-azure': { text: 'text-sky-400', bg: 'bg-sky-400', bar: 'from-sky-400/60 to-sky-400' },
        'theme-saas': { text: 'text-white', bg: 'bg-white', bar: 'from-white/40 to-white' },
        'theme-editorial': { text: 'text-red-700', bg: 'bg-red-700', bar: 'from-red-600/60 to-red-700' },
        'theme-brutalist': { text: 'text-[#1A1A1A]', bg: 'bg-[#1A1A1A]', bar: 'from-[#1A1A1A]/60 to-[#1A1A1A]' },
    }[theme] || { text: 'text-lime-400', bg: 'bg-lime-400', bar: 'from-lime-400/60 to-lime-400' };

    const tabActive = {
        'theme-luminous': 'bg-lime-400 text-slate-900',
        'theme-azure': 'bg-sky-500 text-white',
        'theme-saas': 'bg-white text-black',
        'theme-editorial': 'bg-[#1A1A1A] text-white',
        'theme-brutalist': 'bg-[#1A1A1A] text-white border-2 border-[#1A1A1A]',
    }[theme] || 'bg-lime-400 text-slate-900';

    const inputCls = `h-10 px-4 text-sm focus:outline-none transition-all ${theme === 'theme-brutalist'
        ? 'border-2 border-[#1A1A1A] rounded bg-[#F5F5F0] text-[#1A1A1A] placeholder-gray-400'
        : d.isDark
            ? 'bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-white/30'
            : 'bg-white border border-gray-200 rounded-xl text-[#1A1A1A] placeholder-gray-400 focus:border-gray-400'
        }`;

    // Summary KPIs
    const totalImpressions = zones.reduce((s, z) => s + z.impressions, 0);
    const totalClicks = zones.reduce((s, z) => s + z.clicks, 0);
    const totalSpent = zones.reduce((s, z) => s + z.spent, 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    const statusCounts = useMemo(() => {
        const counts = { ALL: zones.length, ACTIVE: 0, EXCLUDED: 0, INCLUDED: 0 };
        zones.forEach(z => {
            const st = getZoneStatus(z.zoneId);
            if (st === 'EXCLUDED') counts.EXCLUDED++;
            else if (st === 'INCLUDED') counts.INCLUDED++;
            else counts.ACTIVE++;
        });
        return counts;
    }, [zones, targeting]);

    if (loading) return (
        <div className="flex items-center justify-center h-96 flex-col gap-4">
            <Loader2 className={`w-10 h-10 animate-spin ${d.loaderColor}`} />
            <p className={d.loaderText}>Loading zone data...</p>
        </div>
    );

    return (
        <div className="relative z-10 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button onClick={() => router.back()} className={`flex items-center gap-2 mb-2 text-sm font-medium hover:underline ${subText}`}>
                        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
                    </button>
                    <h1 className={d.heading}>Zone Optimization</h1>
                    <p className={`${d.subheading} mt-1`}>
                        {campaign?.name} &middot; Manage zone whitelist &amp; blacklist
                    </p>
                </div>
                <button onClick={fetchData} className={`${d.btnSecondary} p-2.5`} title="Refresh">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Toast */}
            {toast.msg && <Toast type={toast.type} message={toast.msg} onClose={() => setToast({ type: '', msg: '' })} d={d} />}

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Zones', value: zones.length.toLocaleString(), icon: Crosshair, color: accent.text },
                    { label: 'Impressions', value: totalImpressions.toLocaleString(), icon: Eye, color: 'text-sky-400' },
                    { label: 'Clicks', value: totalClicks.toLocaleString(), icon: MousePointerClick, color: 'text-orange-400' },
                    { label: 'Avg CTR', value: `${avgCtr.toFixed(2)}%`, icon: TrendingUp, color: 'text-purple-400' },
                ].map((kpi, i) => (
                    <div key={i} className={d.card}>
                        <div className="flex items-center gap-2 mb-2">
                            <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                            <span className={`text-xs ${subText}`}>{kpi.label}</span>
                        </div>
                        <p className={`text-2xl font-bold ${headText}`}>{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Info card about excluded/included counts */}
            {(targeting.excludes.length > 0 || targeting.includes.length > 0) && (
                <div className={`px-5 py-4 rounded-xl border flex items-start gap-3 ${
                    d.isDark ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50 border-orange-200'
                }`}>
                    <Shield className={`w-5 h-5 flex-shrink-0 mt-0.5 ${d.isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                    <div className={`text-sm ${d.isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                        <strong>Active Targeting:</strong>{' '}
                        {targeting.excludes.length > 0 && <span>{targeting.excludes.length} zone{targeting.excludes.length !== 1 ? 's' : ''} blacklisted</span>}
                        {targeting.excludes.length > 0 && targeting.includes.length > 0 && ' · '}
                        {targeting.includes.length > 0 && <span>{targeting.includes.length} zone{targeting.includes.length !== 1 ? 's' : ''} whitelisted</span>}
                        <span className={`block mt-1 ${d.isDark ? 'text-orange-400/60' : 'text-orange-500'}`}>
                            These changes are synced with the campaign targeting settings.
                        </span>
                    </div>
                </div>
            )}

            {/* Search + Status Tabs */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subText}`} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by Zone ID, Site or Zone name…"
                        className={`${inputCls} w-full pl-10`}
                    />
                    {search && (
                        <button onClick={() => setSearch('')}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${subText} hover:opacity-100`}>
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-2 flex-wrap">
                {['ALL', 'ACTIVE', 'EXCLUDED', 'INCLUDED'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${statusFilter === s ? tabActive : `${subText} ${d.isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`
                            }`}>
                        {s === 'ALL' && 'All Zones'}
                        {s === 'ACTIVE' && 'Active'}
                        {s === 'EXCLUDED' && '🚫 Excluded'}
                        {s === 'INCLUDED' && '✅ Included'}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${statusFilter === s ? 'bg-black/15' : d.isDark ? 'bg-white/10' : 'bg-white/60'}`}>
                            {statusCounts[s] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* Zone Table */}
            <div className={d.card}>
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Crosshair className={`w-14 h-14 mx-auto mb-4 ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                        <h3 className={`text-lg font-bold ${headText} mb-2`}>No zones found</h3>
                        <p className={`${subText} mb-5`}>
                            {zones.length === 0
                                ? 'No traffic data yet for this campaign.'
                                : 'Try different search terms or filters.'
                            }
                        </p>
                        {(search || statusFilter !== 'ALL') && (
                            <button onClick={() => { setSearch(''); setStatusFilter('ALL'); }} className={d.btnSecondary}>
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${divider}`}>
                                    {[
                                        { key: 'shortId', label: 'Zone ID' },
                                        { key: 'siteName', label: 'Site / Zone' },
                                        { key: 'impressions', label: 'Impressions' },
                                        { key: 'clicks', label: 'Clicks' },
                                        { key: 'ctr', label: 'CTR' },
                                        { key: 'cpm', label: 'CPM' },
                                        { key: 'spent', label: 'Spend' },
                                        { key: 'status', label: 'Status' },
                                        { key: 'action', label: 'Action' },
                                    ].map(col => (
                                        <th
                                            key={col.key}
                                            onClick={col.key !== 'action' ? () => setSort(prev => ({
                                                key: col.key,
                                                dir: prev.key === col.key && prev.dir === 'desc' ? 'asc' : 'desc'
                                            })) : undefined}
                                            className={`${d.tableHeadCell} text-left pb-3 ${col.key !== 'action' ? 'cursor-pointer select-none hover:opacity-80' : ''} transition-opacity`}
                                        >
                                            <span className="flex items-center gap-1">
                                                {col.label}
                                                {sort.key === col.key && (
                                                    <span className={`text-[10px] ${accent.text}`}>{sort.dir === 'desc' ? '▼' : '▲'}</span>
                                                )}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                                {filtered.map((z, i) => {
                                    const status = getZoneStatus(z.zoneId);
                                    const isExcluded = status === 'EXCLUDED';
                                    const isIncluded = status === 'INCLUDED';
                                    const isActionLoading = actionLoading === z.zoneId;

                                    const statusBadge = {
                                        EXCLUDED: d.isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
                                        INCLUDED: d.isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
                                        ACTIVE: d.isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500',
                                        NOT_IN_WHITELIST: d.isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700',
                                    }[status];

                                    const statusLabel = {
                                        EXCLUDED: 'Blacklisted', INCLUDED: 'Whitelisted', ACTIVE: 'Active', NOT_IN_WHITELIST: 'Not Whitelisted'
                                    }[status];

                                    return (
                                        <tr key={z.zoneId || i} className={`${d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} ${isExcluded ? 'opacity-60' : ''}`}>
                                            <td className={`py-3.5 pr-4 font-mono text-sm font-bold ${accent.text}`}>{z.shortId}</td>
                                            <td className={`py-3.5 pr-4 text-sm ${headText}`}>
                                                <span className="block truncate max-w-[180px]">{z.siteName}</span>
                                                {z.zoneName !== 'Unknown Zone' && (
                                                    <span className={`block text-xs mt-0.5 ${subText}`}>{z.zoneName}</span>
                                                )}
                                            </td>
                                            <td className={`py-3.5 pr-4 text-sm ${subText}`}>{z.impressions.toLocaleString()}</td>
                                            <td className={`py-3.5 pr-4 text-sm ${subText}`}>{z.clicks.toLocaleString()}</td>
                                            <td className={`py-3.5 pr-4 text-sm font-mono ${accent.text}`}>{z.ctr.toFixed(2)}%</td>
                                            <td className={`py-3.5 pr-4 text-sm font-mono ${subText}`}>${z.cpm.toFixed(2)}</td>
                                            <td className={`py-3.5 pr-4 text-sm font-medium ${headText}`}>${z.spent.toFixed(2)}</td>
                                            <td className="py-3.5 pr-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge}`}>
                                                    {statusLabel}
                                                </span>
                                            </td>
                                            <td className="py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    {isExcluded ? (
                                                        <>
                                                            <button
                                                                onClick={() => updateZoneTargeting(z.zoneId, 'remove')}
                                                                disabled={isActionLoading}
                                                                title="Remove from blacklist"
                                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                                                                    d.isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Unblock'}
                                                            </button>
                                                            <button
                                                                onClick={() => updateZoneTargeting(z.zoneId, 'include')}
                                                                disabled={isActionLoading}
                                                                title="Whitelist this zone"
                                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                                                                    d.isDark ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                }`}
                                                            >
                                                                {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </>
                                                    ) : isIncluded ? (
                                                        <>
                                                            <button
                                                                onClick={() => updateZoneTargeting(z.zoneId, 'remove')}
                                                                disabled={isActionLoading}
                                                                title="Remove from whitelist"
                                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                                                                    d.isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Remove'}
                                                            </button>
                                                            <button
                                                                onClick={() => updateZoneTargeting(z.zoneId, 'exclude')}
                                                                disabled={isActionLoading}
                                                                title="Blacklist this zone"
                                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                                                                    d.isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                }`}
                                                            >
                                                                {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => updateZoneTargeting(z.zoneId, 'include')}
                                                                disabled={isActionLoading}
                                                                title="Whitelist this zone"
                                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                                                                    d.isDark ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                }`}
                                                            >
                                                                {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                                            </button>
                                                            <button
                                                                onClick={() => updateZoneTargeting(z.zoneId, 'exclude')}
                                                                disabled={isActionLoading}
                                                                title="Blacklist this zone"
                                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                                                                    d.isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                }`}
                                                            >
                                                                {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
