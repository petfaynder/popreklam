'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Crown, Shield, Zap, Star, ArrowRight, CheckCircle2,
    XCircle, Clock, TrendingUp, TrendingDown, ChevronRight,
    Lock, Sparkles, Loader2
} from 'lucide-react';
import { advertiserAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

// ─── Tier Config ───────────────────────────────────────────────────────────────
const TIERS = {
    STARTER: { name: 'Starter', icon: Shield, color: '#6B7280', textCls: 'text-gray-500', bgCls: 'bg-gray-100', borderCls: 'border-gray-400', label: 'Entry Level', index: 0 },
    PRO:     { name: 'Pro',     icon: Zap,    color: '#3B82F6', textCls: 'text-blue-600', bgCls: 'bg-blue-50',  borderCls: 'border-blue-400', label: 'Growth Stage', index: 1 },
    ELITE:   { name: 'Elite',  icon: Star,   color: '#D97706', textCls: 'text-amber-600', bgCls: 'bg-amber-50', borderCls: 'border-amber-400', label: 'Power User', index: 2 },
    VIP:     { name: 'VIP',    icon: Crown,  color: '#DC2626', textCls: 'text-red-600', bgCls: 'bg-red-50',  borderCls: 'border-red-500', label: 'Top Advertiser', index: 3 },
};
const ORDER = ['STARTER', 'PRO', 'ELITE', 'VIP'];

export default function PriorityPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        advertiserAPI.getPriority()
            .then(res => setData(res))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className={`${d.card} flex items-center justify-center py-20`}>
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className={`w-8 h-8 ${d.loaderColor} animate-spin`} />
                        <p className={d.loaderText}>Loading priority data…</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const tier = TIERS[data.tier] || TIERS.STARTER;
    const TierIcon = tier.icon;
    const currentIndex = ORDER.indexOf(data.tier);

    return (
        <div className="space-y-6">

            {/* ── PAGE HEADER ──────────────────────────────────────────── */}
            <div>
                <h1 className={d.heading}>
                    <Crown className="w-7 h-7 inline mr-3 -mt-1" />
                    Priority
                </h1>
                <p className={d.subheading}>Your tier determines ad delivery priority, moderation speed &amp; exclusive perks</p>
            </div>

            {/* ── HERO: CURRENT TIER ───────────────────────────────────── */}
            <div className={`${d.card} relative overflow-hidden`}>
                {/* Tier accent stripe on left */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: tier.color }}
                />

                <div className="flex flex-col lg:flex-row lg:items-center gap-6 pl-4">
                    {/* Badge */}
                    <div className={`w-16 h-16 flex items-center justify-center border-2 ${tier.borderCls} ${tier.bgCls} flex-shrink-0`}>
                        <TierIcon className="w-8 h-8" style={{ color: tier.color }} />
                    </div>

                    {/* Name + label */}
                    <div className="flex-1">
                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${d.subheading}`}>
                            Current Tier
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-4xl font-black uppercase tracking-tight ${tier.textCls}`}>
                                {tier.name}
                            </span>
                            <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 border-2 ${tier.borderCls} ${tier.bgCls} ${tier.textCls}`}>
                                {tier.label}
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 flex-wrap">
                        <div>
                            <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${d.subheading}`}>30-Day Spend</div>
                            <div className="text-2xl font-black font-mono text-[#1A1A1A]">
                                ${Number(data.monthlySpend).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        {data.progress?.nextTier && (
                            <>
                                <div>
                                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${d.subheading}`}>Next Tier</div>
                                    <div className={`text-2xl font-black uppercase ${TIERS[data.progress.nextTier]?.textCls}`}>
                                        {TIERS[data.progress.nextTier]?.name}
                                    </div>
                                </div>
                                <div>
                                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${d.subheading}`}>To Unlock</div>
                                    <div className="text-2xl font-black font-mono text-[#1A1A1A]">
                                        ${Number(data.progress.remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </>
                        )}
                        {data.tier === 'VIP' && (
                            <div>
                                <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${d.subheading}`}>Status</div>
                                <div className={`text-2xl font-black uppercase flex items-center gap-2 ${tier.textCls}`}>
                                    <Sparkles className="w-5 h-5" />
                                    Maximum
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                {data.progress?.nextTier && (
                    <div className="mt-6 pl-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${tier.textCls}`}>{tier.name}</span>
                            <span className="text-[10px] font-black text-gray-400 font-mono">{data.progress.progress}%</span>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${TIERS[data.progress.nextTier]?.textCls}`}>
                                {TIERS[data.progress.nextTier]?.name}
                            </span>
                        </div>
                        <div className="h-3 bg-[#F5F5F0] border-2 border-[#1A1A1A] overflow-hidden">
                            <div
                                className="h-full transition-all duration-1000"
                                style={{ width: `${data.progress.progress}%`, backgroundColor: tier.color }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── TIER PROGRESSION ─────────────────────────────────────── */}
            <div className={d.card}>
                <h2 className={`${d.heading} text-lg mb-6`}>Tier Progression</h2>

                <div className="grid grid-cols-4 gap-0 border-2 border-[#1A1A1A]">
                    {ORDER.map((key, i) => {
                        const t = TIERS[key];
                        const TIcon = t.icon;
                        const isCurrent = key === data.tier;
                        const isPast = i < currentIndex;
                        const isLocked = i > currentIndex;

                        return (
                            <div
                                key={key}
                                className={`flex flex-col items-center gap-3 p-6 relative 
                                    ${i < ORDER.length - 1 ? 'border-r-2 border-[#1A1A1A]' : ''}
                                    ${isCurrent ? `${t.bgCls}` : isPast ? 'bg-[#F5F5F0]' : 'bg-white'}
                                `}
                            >
                                {/* Active indicator top bar */}
                                {isCurrent && (
                                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: t.color }} />
                                )}

                                <div className={`w-12 h-12 flex items-center justify-center border-2 
                                    ${isCurrent ? `${t.borderCls} ${t.bgCls} shadow-[2px_2px_0px_0px_${t.color}]` : 'border-gray-300 bg-white'}
                                `}>
                                    <TIcon
                                        className={`w-6 h-6 ${isCurrent ? t.textCls : isPast ? 'text-gray-500' : 'text-gray-400'}`}
                                    />
                                </div>

                                <div className="text-center">
                                    <div className={`text-sm font-black uppercase tracking-wider ${isCurrent ? t.textCls : isPast ? 'text-gray-600' : 'text-gray-500'}`}>
                                        {t.name}
                                    </div>
                                    <div className={`text-[10px] font-mono mt-1 ${isCurrent ? 'text-gray-600' : isPast ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {data.matrix?.tiers?.[i]?.spend || ''}
                                    </div>
                                </div>

                                {isCurrent && (
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-2 ${t.borderCls} ${t.textCls} ${t.bgCls}`}>
                                        YOU
                                    </span>
                                )}
                                {isLocked && (
                                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border border-gray-300 text-gray-500 flex items-center gap-1">
                                        <Lock className="w-2.5 h-2.5" /> Locked
                                    </span>
                                )}
                                {isPast && (
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-300">
                                        Passed
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── BENEFITS TABLE ────────────────────────────────────────── */}
            <div className={d.card}>
                <h2 className={`${d.heading} text-lg mb-1`}>Benefits Comparison</h2>
                <p className={`${d.subheading} mb-6`}>Every feature across all tier levels</p>

                <div className={d.tableWrapper}>
                    {/* Header */}
                    <div className={`grid border-b-2 border-[#1A1A1A]`} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
                        <div className={`${d.tableHeadCell} py-4 px-5`}>Feature</div>
                        {data.matrix?.tiers?.map((t, i) => {
                            const cfg = TIERS[t.key];
                            const isCurrent = t.key === data.tier;
                            return (
                                <div
                                    key={t.key}
                                    className={`${d.tableHeadCell} py-4 text-center !font-black
                                        ${isCurrent ? `${cfg.bgCls} ${cfg.textCls}` : ''}
                                        ${i < 3 ? 'border-l-2 border-[#1A1A1A]' : ''}
                                    `}
                                >
                                    {t.name}
                                    {isCurrent && (
                                        <div className={`text-[8px] font-black tracking-widest mt-0.5 ${cfg.textCls}`}>▲ YOU</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Rows */}
                    {data.matrix?.features?.map((feature, fi) => (
                        <div
                            key={fi}
                            className={`grid border-b border-gray-200 last:border-b-0 hover:bg-[#F5F5F0] transition-colors`}
                            style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}
                        >
                            <div className="py-3.5 px-5 text-sm font-bold text-[#1A1A1A] flex items-center">
                                {feature.name}
                            </div>
                            {feature.values.map((val, vi) => {
                                const cfg = TIERS[data.matrix.tiers[vi]?.key];
                                const isCurrent = data.matrix.tiers[vi]?.key === data.tier;
                                return (
                                    <div
                                        key={vi}
                                        className={`py-3.5 flex items-center justify-center text-sm
                                            ${vi < 4 ? 'border-l-2 border-gray-200' : ''}
                                            ${isCurrent ? `${cfg?.bgCls}` : ''}
                                        `}
                                    >
                                        {feature.type === 'boolean' ? (
                                            val ? (
                                                <CheckCircle2
                                                    className={`w-5 h-5 ${isCurrent ? cfg?.textCls : 'text-green-500'}`}
                                                    strokeWidth={isCurrent ? 2.5 : 1.5}
                                                />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
                                            )
                                        ) : (
                                            <span className={`font-mono text-xs ${isCurrent ? `font-black ${cfg?.textCls}` : 'text-gray-500 font-medium'}`}>
                                                {val}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── TIER HISTORY ─────────────────────────────────────────── */}
            <div className={d.card}>
                <h2 className={`${d.heading} text-lg mb-4`}>Tier History</h2>

                {data.history && data.history.length > 0 ? (
                    <div className="space-y-2">
                        {data.history.map((h, i) => {
                            const fromT = TIERS[h.previousTier];
                            const toT = TIERS[h.newTier];
                            const isUpgrade = ORDER.indexOf(h.newTier) > ORDER.indexOf(h.previousTier);
                            return (
                                <div
                                    key={h.id || i}
                                    className="flex items-center gap-4 p-4 border-2 border-[#1A1A1A] bg-[#F5F5F0] hover:shadow-[2px_2px_0px_0px_#1A1A1A] transition-all"
                                >
                                    <div className={`w-8 h-8 flex items-center justify-center border-2 ${isUpgrade ? 'border-green-600 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                        {isUpgrade
                                            ? <TrendingUp className="w-4 h-4 text-green-600" />
                                            : <TrendingDown className="w-4 h-4 text-red-500" />}
                                    </div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <span className={`text-sm font-black uppercase ${fromT?.textCls}`}>{fromT?.name}</span>
                                        <ChevronRight className="w-3 h-3 text-gray-400" />
                                        <span className={`text-sm font-black uppercase ${toT?.textCls}`}>{toT?.name}</span>
                                        {h.reason && <span className="text-xs text-gray-500 ml-2">— {h.reason}</span>}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-mono text-gray-500">
                                            {new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="text-xs font-black font-mono text-[#1A1A1A]">
                                            ${Number(h.monthlySpend).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-300 py-12 flex flex-col items-center gap-3">
                        <Crown className="w-8 h-8 text-gray-300" />
                        <p className="text-sm font-bold uppercase tracking-wider text-gray-400">No tier changes yet</p>
                        <p className="text-xs text-gray-400">Keep spending to unlock higher tiers</p>
                        <Link
                            href="/advertiser/campaigns/create"
                            className={`${d.btnPrimary} mt-2 flex items-center gap-2`}
                        >
                            Launch a Campaign <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>

        </div>
    );
}
