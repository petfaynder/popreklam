'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Megaphone, Play, Pause, Trash2, Eye, MousePointerClick,
    DollarSign, Loader2, Plus, TrendingUp, Search, Filter,
    CheckCircle2, AlertCircle, X, ChevronDown, SlidersHorizontal,
    ArrowUpDown, RefreshCw, BarChart2, Pencil, TestTube2, Copy, Crosshair
} from 'lucide-react';
import Link from 'next/link';
import { advertiserAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

const STATUS_TABS = ['ALL', 'ACTIVE', 'PAUSED', 'PENDING', 'REJECTED'];

const SORT_OPTIONS = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Most Impressions', value: 'impressions' },
    { label: 'Most Clicks', value: 'clicks' },
    { label: 'Most Spent', value: 'spent' },
    { label: 'Highest CTR', value: 'ctr' },
];

function Toast({ type, message, onClose }) {
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

// Confirm dialog (inline, no browser confirm())
function ConfirmModal({ message, onConfirm, onCancel, d }) {
    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className={`${d.card} max-w-sm w-full`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-red-500/10`}>
                    <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <h3 className={`text-lg font-bold ${headText} mb-2`}>Delete Campaign?</h3>
                <p className={`text-sm ${subText} mb-6`}>{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className={`flex-1 ${d.btnSecondary}`}>Cancel</button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CampaignsPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState({ type: '', msg: '' });
    const [confirmDelete, setConfirmDelete] = useState(null); // campaign id

    // Filter state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('newest');
    const [showSort, setShowSort] = useState(false);

    useEffect(() => { fetchCampaigns(); }, []);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast({ type: '', msg: '' }), 4000);
    };

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const data = await advertiserAPI.getCampaigns();
            setCampaigns(data.campaigns || data || []);
        } catch (err) {
            showToast('error', 'Failed to load campaigns: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, id) => {
        try {
            setActionLoading(id);
            if (action === 'pause') {
                await advertiserAPI.pauseCampaign(id);
                showToast('success', 'Campaign paused.');
            } else if (action === 'resume') {
                await advertiserAPI.resumeCampaign(id);
                showToast('success', 'Campaign resumed.');
            } else if (action === 'delete') {
                await advertiserAPI.deleteCampaign(id);
                showToast('success', 'Campaign deleted.');
            }
            fetchCampaigns();
        } catch (err) {
            showToast('error', `Failed to ${action} campaign: ` + err.message);
        } finally {
            setActionLoading(null);
            setConfirmDelete(null);
        }
    };

    const handleDuplicate = async (camp) => {
        try {
            setActionLoading(camp.id);
            const payload = {
                name: `Copy of ${camp.name}`,
                targetUrl: camp.targetUrl,
                adFormat: camp.adFormat,
                totalBudget: parseFloat(camp.totalBudget) || 100,
                dailyBudget: camp.dailyBudget ? parseFloat(camp.dailyBudget) : null,
                bidAmount: parseFloat(camp.bidAmount) || 1.0,
                creatives: camp.adFormat === 'POPUNDER' ? undefined : { title: 'Duplicated Ad', description: 'Click here' },
            };
            await advertiserAPI.createCampaign(payload);
            showToast('success', `Campaign duplicated as "Copy of ${camp.name}"`);
            fetchCampaigns();
        } catch (err) {
            showToast('error', 'Failed to duplicate: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    // Filter + sort
    const filtered = useMemo(() => {
        let list = [...campaigns];

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.name?.toLowerCase().includes(q) ||
                c.targetUrl?.toLowerCase().includes(q) ||
                c.adFormat?.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== 'ALL') {
            list = list.filter(c => c.status === statusFilter);
        }
        switch (sortBy) {
            case 'oldest': list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
            case 'impressions': list.sort((a, b) => (b.totalImpressions || 0) - (a.totalImpressions || 0)); break;
            case 'clicks': list.sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0)); break;
            case 'spent': list.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)); break;
            case 'ctr': {
                const ctr = c => c.totalImpressions > 0 ? c.totalClicks / c.totalImpressions : 0;
                list.sort((a, b) => ctr(b) - ctr(a)); break;
            }
            default: list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return list;
    }, [campaigns, search, statusFilter, sortBy]);

    // Status counts
    const counts = useMemo(() => {
        const c = { ALL: campaigns.length };
        STATUS_TABS.slice(1).forEach(s => { c[s] = campaigns.filter(x => x.status === s).length; });
        return c;
    }, [campaigns]);

    // Theme tokens
    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';

    const getStatusColor = (status) => {
        const light = !d.isDark;
        switch (status) {
            case 'ACTIVE': return light ? 'bg-green-100 text-green-700' : 'bg-lime-500/20 text-lime-400';
            case 'PAUSED': return light ? 'bg-orange-100 text-orange-700' : 'bg-orange-500/20 text-orange-400';
            case 'PENDING': return light ? 'bg-sky-100 text-sky-700' : 'bg-sky-500/20 text-sky-400';
            case 'REJECTED': return light ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-400';
            default: return light ? 'bg-gray-100 text-gray-600' : 'bg-gray-500/20 text-gray-400';
        }
    };

    const accentText = {
        'theme-luminous': 'text-lime-400', 'theme-azure': 'text-sky-400',
        'theme-saas': 'text-white', 'theme-editorial': 'text-red-700', 'theme-brutalist': 'text-[#1A1A1A]',
    }[theme] || 'text-lime-400';

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

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className={`w-12 h-12 ${d.loaderColor} animate-spin`} />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Confirm modal */}
            {confirmDelete && (
                <ConfirmModal
                    message="This action cannot be undone. All campaign data will be permanently deleted."
                    onConfirm={() => handleAction('delete', confirmDelete)}
                    onCancel={() => setConfirmDelete(null)}
                    d={d}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={d.heading}>My Campaigns</h1>
                    <p className={`${d.subheading} mt-0.5`}>{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} total</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchCampaigns} className={`${d.btnSecondary} p-2.5`} title="Refresh">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <Link href="/advertiser/campaigns/create">
                        <button className={`${d.btnPrimary} flex items-center gap-2`}>
                            <Plus className="w-4 h-4" /> Create Campaign
                        </button>
                    </Link>
                </div>
            </div>

            {/* Toast */}
            {toast.msg && <Toast type={toast.type} message={toast.msg} onClose={() => setToast({ type: '', msg: '' })} />}

            {/* ── Search + Sort row */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subText}`} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search campaigns by name, URL or format…"
                        className={`${inputCls} w-full pl-10`}
                    />
                    {search && (
                        <button onClick={() => setSearch('')}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${subText} hover:opacity-100`}>
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {/* Sort dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowSort(v => !v)}
                        className={`${inputCls} flex items-center gap-2 px-3 pr-4 whitespace-nowrap`}>
                        <ArrowUpDown className="w-4 h-4 flex-shrink-0" />
                        <span>{SORT_OPTIONS.find(s => s.value === sortBy)?.label}</span>
                        <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                    {showSort && (
                        <div className={`absolute right-0 top-12 z-30 min-w-[180px] rounded-xl border shadow-xl overflow-hidden ${d.isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'
                            }`}>
                            {SORT_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-all ${sortBy === opt.value ? `${accentText} font-semibold` : `${subText}`
                                        } ${d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Status filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {STATUS_TABS.map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${statusFilter === s ? tabActive : `${subText} ${d.isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`
                            }`}>
                        {s}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${statusFilter === s ? 'bg-black/15' : d.isDark ? 'bg-white/10' : 'bg-white/60'}`}>
                            {counts[s] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Campaign list */}
            {filtered.length === 0 ? (
                <div className={`${d.card} text-center py-16`}>
                    {search || statusFilter !== 'ALL' ? (
                        <>
                            <Search className={`w-14 h-14 mx-auto mb-4 ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            <h3 className={`text-lg font-bold ${headText} mb-2`}>No results found</h3>
                            <p className={`${subText} mb-5`}>Try different search terms or filters</p>
                            <button onClick={() => { setSearch(''); setStatusFilter('ALL'); }} className={d.btnSecondary}>
                                Clear Filters
                            </button>
                        </>
                    ) : (
                        <>
                            <Megaphone className={`w-16 h-16 mx-auto mb-4 ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            <h3 className={`text-xl font-bold ${headText} mb-2`}>No campaigns yet</h3>
                            <p className={`${subText} mb-6`}>Create your first campaign to start advertising</p>
                            <Link href="/advertiser/campaigns/create">
                                <button className={d.btnPrimary}>Create Campaign</button>
                            </Link>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((camp) => {
                        const ctr = camp.totalImpressions > 0
                            ? ((camp.totalClicks / camp.totalImpressions) * 100).toFixed(2)
                            : '0.00';
                        const budgetUsed = camp.totalBudget > 0
                            ? (camp.totalSpent / camp.totalBudget) * 100
                            : 0;
                        const isLoading = actionLoading === camp.id;

                        return (
                            <div key={camp.id} className={`${d.card} group`}>
                                {/* Campaign header */}
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap mb-1">
                                            <h3 className={`text-lg font-bold ${headText} truncate`}>{camp.name}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold flex-shrink-0 ${getStatusColor(camp.status)}`}>
                                                {camp.status}
                                            </span>
                                        </div>
                                        <p className={`text-xs ${subText} truncate`}>{camp.targetUrl}</p>
                                        <p className={`text-xs mt-0.5 ${d.isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                            {camp.adFormat} · Created {new Date(camp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                        {/* Analytics button */}
                                        <Link href={`/advertiser/campaigns/${camp.id}/analytics`}>
                                            <button title="Analytics" className={`p-2 rounded-lg transition-all ${d.isDark ? 'bg-white/5 text-gray-300 hover:bg-white/15 hover:text-lime-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                                <BarChart2 className="w-4 h-4" />
                                            </button>
                                        </Link>
                                        {/* Zone Optimization */}
                                        <Link href={`/advertiser/campaigns/${camp.id}/zones`}>
                                            <button title="Zone Optimization" className={`p-2 rounded-lg transition-all ${d.isDark ? 'bg-white/5 text-gray-300 hover:bg-white/15 hover:text-orange-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                                <Crosshair className="w-4 h-4" />
                                            </button>
                                        </Link>
                                        {/* Edit button */}
                                        <Link href={`/advertiser/campaigns/${camp.id}/edit`}>
                                            <button title="Edit Campaign" className={`p-2 rounded-lg transition-all ${d.isDark ? 'bg-white/5 text-gray-300 hover:bg-white/15 hover:text-sky-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </Link>
                                        {/* A/B Creatives button */}
                                        <Link href={`/advertiser/campaigns/${camp.id}/creatives`}>
                                            <button title="A/B Creatives" className={`p-2 rounded-lg transition-all ${d.isDark ? 'bg-white/5 text-gray-300 hover:bg-white/15 hover:text-purple-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                                <TestTube2 className="w-4 h-4" />
                                            </button>
                                        </Link>
                                        {/* Duplicate button */}
                                        <button onClick={() => handleDuplicate(camp)} disabled={isLoading}
                                            title="Duplicate Campaign" className={`p-2 rounded-lg transition-all ${d.isDark ? 'bg-white/5 text-gray-300 hover:bg-white/15 hover:text-cyan-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                                        </button>

                                        {camp.status === 'ACTIVE' && (
                                            <button onClick={() => handleAction('pause', camp.id)} disabled={isLoading}
                                                title="Pause"
                                                className="p-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all disabled:opacity-50">
                                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
                                            </button>
                                        )}
                                        {camp.status === 'PAUSED' && (
                                            <button onClick={() => handleAction('resume', camp.id)} disabled={isLoading}
                                                title="Resume"
                                                className={`p-2 rounded-lg transition-all disabled:opacity-50 ${d.isDark ? 'bg-lime-500/20 text-lime-400 hover:bg-lime-500/30'
                                                    : theme === 'theme-editorial' ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                                        : theme === 'theme-brutalist' ? 'bg-[#F5F5F0] text-[#1A1A1A] border-2 border-[#1A1A1A]'
                                                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                                    }`}>
                                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                            </button>
                                        )}
                                        <button onClick={() => setConfirmDelete(camp.id)} disabled={isLoading}
                                            title="Delete"
                                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Stats grid */}
                                <div className={`grid grid-cols-4 gap-3 p-4 rounded-xl mb-4 ${d.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    {[
                                        { icon: Eye, label: 'Impressions', value: (camp.totalImpressions || 0).toLocaleString(), color: 'text-sky-400' },
                                        { icon: MousePointerClick, label: 'Clicks', value: (camp.totalClicks || 0).toLocaleString(), color: 'text-orange-400' },
                                        { icon: TrendingUp, label: 'CTR', value: `${ctr}%`, color: 'text-purple-400' },
                                        { icon: DollarSign, label: 'Spent', value: `$${(camp.totalSpent || 0).toFixed(2)}`, color: `${accentText}` },
                                    ].map((stat, i) => (
                                        <div key={i} className="text-center">
                                            <div className={`flex items-center justify-center gap-1 mb-1 ${d.isDark ? stat.color : stat.color.replace('400', '600')}`}>
                                                <stat.icon className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-medium">{stat.label}</span>
                                            </div>
                                            <p className={`text-base font-bold ${headText}`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Budget bar */}
                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className={subText}>Budget</span>
                                        <span className={`font-medium ${headText}`}>
                                            ${(camp.totalSpent || 0).toFixed(2)} / ${(camp.totalBudget || 0).toFixed(2)}
                                            <span className={`ml-2 ${subText}`}>({budgetUsed.toFixed(0)}%)</span>
                                        </span>
                                    </div>
                                    <div className={`w-full rounded-full h-2 ${d.isDark ? 'bg-white/5' : 'bg-gray-200'}`}>
                                        <div
                                            className={`h-2 rounded-full transition-all ${budgetUsed >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                                            style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
