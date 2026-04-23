'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Image as ImageIcon, Loader2, Search, Copy, ExternalLink,
    Rocket, RefreshCw, Tag, Clock, Eye, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { advertiserAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

const FORMAT_LABELS = {
    IN_PAGE_PUSH: { label: 'In-Page Push', color: 'sky' },
    POPUNDER: { label: 'Popunder', color: 'violet' },
    PUSH_NOTIFICATION: { label: 'Push Notification', color: 'amber' },
};

const STATUS_STYLES = {
    ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
    PAUSED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PENDING_APPROVAL: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
    DRAFT: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

function CreativeCard({ creative, d, theme, headText, subText, onCopy }) {
    const [copied, setCopied] = useState(false);
    const fmt = FORMAT_LABELS[creative.adFormat] || { label: creative.adFormat, color: 'gray' };

    const colorMap = {
        sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };

    const handleCopy = () => {
        const text = [creative.title, creative.description, creative.iconUrl, creative.imageUrl].filter(Boolean).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            onCopy?.();
        });
    };

    return (
        <div className={`${d.card} group flex flex-col gap-4 transition-all duration-200 hover:scale-[1.01]`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorMap[fmt.color]}`}>
                            {fmt.label}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[creative.campaignStatus] || STATUS_STYLES.DRAFT}`}>
                            {creative.campaignStatus}
                        </span>
                    </div>
                    <p className={`text-sm font-semibold ${headText} mt-2 truncate`}>{creative.label || 'Untitled Creative'}</p>
                </div>
                <button
                    onClick={handleCopy}
                    title="Copy creative details"
                    className={`p-1.5 rounded-lg transition-all shrink-0 ${
                        copied
                            ? 'bg-green-500/10 text-green-400'
                            : d.isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>

            {/* Preview — In-Page Push */}
            {creative.adFormat === 'IN_PAGE_PUSH' && (creative.title || creative.description) && (
                <div className={`rounded-xl p-3 border ${d.isDark ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                        {creative.iconUrl && (
                            <img
                                src={creative.iconUrl}
                                alt="icon"
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            {creative.title && <p className={`text-sm font-bold ${headText} leading-tight`}>{creative.title}</p>}
                            {creative.description && <p className={`text-xs ${subText} mt-0.5 line-clamp-2`}>{creative.description}</p>}
                        </div>
                    </div>
                    {creative.imageUrl && (
                        <img
                            src={creative.imageUrl}
                            alt="banner"
                            className="mt-3 w-full h-24 object-cover rounded-lg"
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                    )}
                </div>
            )}

            {/* HTML preview badge */}
            {creative.htmlCode && (
                <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${d.isDark ? 'bg-white/[0.03] border border-white/5' : 'bg-gray-50 border border-gray-200'}`}>
                    <Eye className={`w-3.5 h-3.5 ${subText}`} />
                    <span className={subText}>Custom HTML creative</span>
                </div>
            )}

            {/* Campaign link */}
            <div className={`flex items-center justify-between pt-3 border-t ${d.isDark ? 'border-white/5' : 'border-gray-100'}`}>
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Tag className={`w-3.5 h-3.5 ${subText} flex-shrink-0`} />
                    <span className={`text-xs ${subText} truncate`}>{creative.campaignName || 'Unknown Campaign'}</span>
                </div>
                <Link
                    href={`/advertiser/campaigns/${creative.campaignId}/creatives`}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors flex-shrink-0 ml-2 ${d.isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Edit <ExternalLink className="w-3 h-3" />
                </Link>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5 -mt-2">
                <Clock className={`w-3 h-3 ${subText}`} />
                <span className={`text-[10px] ${subText}`}>
                    {creative.createdAt ? new Date(creative.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                </span>
            </div>
        </div>
    );
}

export default function CreativeLibrary() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const [creatives, setCreatives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [formatFilter, setFormatFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [copyCount, setCopyCount] = useState(0);

    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';

    const accent = {
        'theme-luminous': 'text-lime-400',
        'theme-azure': 'text-sky-400',
        'theme-saas': 'text-white',
        'theme-editorial': 'text-red-700',
        'theme-brutalist': 'text-[#1A1A1A]',
    }[theme] || 'text-lime-400';

    useEffect(() => { fetchCreatives(); }, []);

    const fetchCreatives = async () => {
        setLoading(true);
        try {
            const data = await advertiserAPI.getAllCreatives();
            setCreatives(data.creatives || []);
        } catch (err) {
            console.error('Creative Library error:', err);
            // Demo fallback
            setCreatives([
                { id: '1', label: 'Summer Sale Push', adFormat: 'IN_PAGE_PUSH', title: 'Summer Sale!', description: 'Get up to 70% off today only.', iconUrl: 'https://picsum.photos/seed/icon1/40', imageUrl: 'https://picsum.photos/seed/banner1/400/200', campaignId: 'c1', campaignName: 'Summer Sale Campaign', campaignStatus: 'ACTIVE', createdAt: new Date().toISOString(), weight: 1 },
                { id: '2', label: 'Black Friday Popunder', adFormat: 'POPUNDER', title: '', description: '', htmlCode: '<div>...</div>', campaignId: 'c2', campaignName: 'Black Friday Push', campaignStatus: 'PAUSED', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), weight: 1 },
                { id: '3', label: 'Flash Deal Banner', adFormat: 'IN_PAGE_PUSH', title: 'Flash Deal 🔥', description: 'Only 2 hours left!', iconUrl: 'https://picsum.photos/seed/icon2/40', imageUrl: '', campaignId: 'c3', campaignName: 'Flash Deal Push', campaignStatus: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), weight: 2 },
                { id: '4', label: 'App Download Push', adFormat: 'IN_PAGE_PUSH', title: 'Download Our App', description: 'Free and available on all platforms.', iconUrl: 'https://picsum.photos/seed/icon3/40', imageUrl: 'https://picsum.photos/seed/banner2/400/200', campaignId: 'c4', campaignName: 'App Install Campaign', campaignStatus: 'PENDING_APPROVAL', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), weight: 1 },
                { id: '5', label: 'Main Popunder', adFormat: 'POPUNDER', title: '', description: '', htmlCode: null, campaignId: 'c5', campaignName: 'Pop Network Burst', campaignStatus: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), weight: 3 },
                { id: '6', label: 'Push V2', adFormat: 'IN_PAGE_PUSH', title: 'Exclusive Offer Inside', description: 'Click to reveal your personalized deal.', iconUrl: '', imageUrl: 'https://picsum.photos/seed/banner3/400/200', campaignId: 'c3', campaignName: 'Flash Deal Push', campaignStatus: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), weight: 3 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return creatives.filter(cr => {
            const matchSearch = !search || [cr.label, cr.title, cr.description, cr.campaignName].some(
                s => s && s.toLowerCase().includes(search.toLowerCase())
            );
            const matchFormat = formatFilter === 'ALL' || cr.adFormat === formatFilter;
            const matchStatus = statusFilter === 'ALL' || cr.campaignStatus === statusFilter;
            return matchSearch && matchFormat && matchStatus;
        });
    }, [creatives, search, formatFilter, statusFilter]);

    const stats = useMemo(() => {
        const formats = {};
        creatives.forEach(cr => { formats[cr.adFormat] = (formats[cr.adFormat] || 0) + 1; });
        return { total: creatives.length, formats };
    }, [creatives]);

    const tabActiveClass = {
        'theme-luminous': 'bg-lime-400 text-slate-900',
        'theme-azure': 'bg-sky-500 text-white',
        'theme-saas': 'bg-white text-black',
        'theme-editorial': 'bg-[#1A1A1A] text-white',
        'theme-brutalist': 'bg-[#1A1A1A] text-white',
    }[theme] || 'bg-lime-400 text-slate-900';

    const inputClass = `w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border transition-all ${
        d.isDark
            ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/25 focus:bg-white/[0.07]'
            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-300'
    } outline-none`;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={d.heading}>Creative Library</h1>
                    <p className={`${d.subheading} mt-1`}>All your In-Page Push, Popunder, and Push Notification creatives in one place</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchCreatives} className={`${d.btnSecondary} p-2.5`} title="Refresh">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <Link href="/advertiser/campaigns/create" className={`${d.btnPrimary} flex items-center gap-2`}>
                        <Rocket className="w-4 h-4" />
                        New Campaign
                    </Link>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Creatives', value: stats.total },
                    { label: 'In-Page Push', value: stats.formats['IN_PAGE_PUSH'] || 0 },
                    { label: 'Popunder', value: stats.formats['POPUNDER'] || 0 },
                    { label: 'Push Notification', value: stats.formats['PUSH_NOTIFICATION'] || 0 },
                ].map((s, i) => (
                    <div key={i} className={d.card}>
                        <p className={`text-2xl font-bold ${headText} mb-1`}>{s.value}</p>
                        <p className={`text-sm ${subText}`}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className={`${d.card} flex flex-col sm:flex-row gap-4`}>
                {/* Search */}
                <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subText}`} />
                    <input
                        type="text"
                        placeholder="Search by title, label, or campaign..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={inputClass}
                    />
                </div>
                {/* Format filter */}
                <div className="flex gap-1 flex-wrap">
                    {['ALL', 'IN_PAGE_PUSH', 'POPUNDER', 'PUSH_NOTIFICATION'].map(f => (
                        <button key={f} onClick={() => setFormatFilter(f)}
                            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${formatFilter === f ? tabActiveClass : `${subText} ${d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}`}>
                            {f === 'ALL' ? 'All Formats' : FORMAT_LABELS[f]?.label || f}
                        </button>
                    ))}
                </div>
                {/* Status filter */}
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border outline-none transition-all ${
                        d.isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="PENDING_APPROVAL">Pending</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Grid or Empty */}
            {loading ? (
                <div className="flex items-center justify-center h-64 flex-col gap-4">
                    <Loader2 className={`w-10 h-10 animate-spin ${d.loaderColor}`} />
                    <p className={d.loaderText}>Loading creative library...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className={`${d.card} flex flex-col items-center justify-center py-20 gap-4`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${d.isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                        <ImageIcon className={`w-8 h-8 ${subText}`} />
                    </div>
                    <div className="text-center">
                        <p className={`font-semibold ${headText}`}>No creatives found</p>
                        <p className={`text-sm ${subText} mt-1`}>
                            {search || formatFilter !== 'ALL' || statusFilter !== 'ALL'
                                ? 'Try adjusting your filters'
                                : 'Create your first campaign to add creatives'}
                        </p>
                    </div>
                    {!search && formatFilter === 'ALL' && (
                        <Link href="/advertiser/campaigns/create" className={`${d.btnPrimary} flex items-center gap-2 mt-2`}>
                            <Rocket className="w-4 h-4" />
                            Create Campaign
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <p className={`text-sm ${subText} -mt-4`}>
                        Showing <span className={`font-semibold ${headText}`}>{filtered.length}</span> of {creatives.length} creatives
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filtered.map(cr => (
                            <CreativeCard
                                key={cr.id}
                                creative={cr}
                                d={d}
                                theme={theme}
                                headText={headText}
                                subText={subText}
                                onCopy={() => setCopyCount(c => c + 1)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
