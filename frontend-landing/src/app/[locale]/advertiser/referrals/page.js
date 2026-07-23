'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Sparkles, Copy, Check, Users, TrendingUp, DollarSign,
    Clock, Link2, RefreshCw, Share2, CircleDot
} from 'lucide-react';
import { advertiserAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

function StatusBadge({ status }) {
    const map = {
        PENDING: { label: 'Pending', cls: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/25' },
        ACTIVE: { label: 'Active', cls: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25' },
        PAID: { label: 'Paid', cls: 'bg-sky-500/15 text-sky-500 border-sky-500/25' },
    };
    const { label, cls } = map[status] || map.PENDING;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
            <CircleDot className="w-2.5 h-2.5" />
            {label}
        </span>
    );
}

export default function AdvertiserReferralsPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [info, setInfo] = useState(null);
    const [stats, setStats] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [i, s, r] = await Promise.all([
                advertiserAPI.getReferralInfo(),
                advertiserAPI.getReferralStats(),
                advertiserAPI.getReferrals({ limit: 50 }),
            ]);
            setInfo(i);
            setStats(s);
            setReferrals(r.referrals || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const copyLink = () => {
        if (!info?.referralLink) return;
        navigator.clipboard.writeText(info.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const statCards = [
        {
            label: 'Total Referrals', value: stats?.totalReferrals ?? '—', icon: Users,
            color: 'text-indigo-500', bg: 'bg-indigo-500/10 border border-indigo-500/20'
        },
        {
            label: 'Active Referrals', value: stats?.activeReferrals ?? '—', icon: TrendingUp,
            color: 'text-emerald-500', bg: 'bg-emerald-500/10 border border-emerald-500/20'
        },
        {
            label: 'Credits Earned', value: stats ? `$${Number(stats.totalEarned).toFixed(2)}` : '—', icon: DollarSign,
            color: 'text-sky-500', bg: 'bg-sky-500/10 border border-sky-500/20'
        },
        {
            label: 'Pending Credits', value: stats ? `$${Number(stats.pendingEarnings).toFixed(2)}` : '—', icon: Clock,
            color: 'text-amber-500', bg: 'bg-amber-500/10 border border-amber-500/20'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className={d.heading}>Referral Program</h1>
                    <p className={`${d.subheading} mt-1`}>
                        Invite advertisers and earn {info?.advertiserCommission ?? 3}% credit on their ad spend
                    </p>
                </div>
                <button onClick={load} className={`${d.btnSecondary} text-sm`}>
                    <RefreshCw className="w-4 h-4 inline mr-1.5" />
                    Refresh
                </button>
            </div>

            {/* Referral Link Card */}
            <div className={`${d.card} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />

                <div className="relative flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <p className={`font-bold text-sm ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Your Referral Link</p>
                        <p className={`text-xs ${d.subheading}`}>Share this link with fellow advertisers</p>
                    </div>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-lg ${d.isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                    <Link2 className={`w-4 h-4 flex-shrink-0 ${d.subheading}`} />
                    <span className={`flex-1 text-xs font-mono truncate ${d.isDark ? 'text-gray-200' : 'text-[#1A1A1A]'}`}>
                        {loading ? 'Loading…' : (info?.referralLink || '—')}
                    </span>
                    <button
                        onClick={copyLink}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0
                            ${copied ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                : d.btnSecondary}`}
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                {info?.referralCode && (
                    <p className={`text-xs mt-3 ${d.subheading}`}>
                        Code: <code className={`font-mono font-bold ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>{info.referralCode}</code>
                        <span className="mx-2">·</span>
                        {info.advertiserCommission}% credit on referred advertiser spend
                    </p>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(card => (
                    <div key={card.label} className={d.card}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.bg}`}>
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                        <div className={`text-2xl font-bold ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>{card.value}</div>
                        <div className={`text-xs mt-0.5 ${d.subheading}`}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Referral Table */}
            <div className={d.card}>
                <h2 className={`font-bold text-sm mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Referred Advertisers</h2>
                {loading ? (
                    <div className={`text-center py-12 text-sm ${d.subheading}`}>Loading…</div>
                ) : referrals.length === 0 ? (
                    <div className="text-center py-12">
                        <Share2 className={`w-10 h-10 mx-auto mb-3 opacity-20 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`} />
                        <p className={`font-semibold text-sm ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>No referrals yet</p>
                        <p className={`text-xs mt-1 ${d.subheading}`}>Share your referral link to start earning credits!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={d.tableHead}>
                                    {['Advertiser', 'Status', 'Commission', 'Credits Earned', 'Joined'].map(h => (
                                        <th key={h} className={`${d.tableHeadCell} text-left`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.map(r => (
                                    <tr key={r.id} className={d.tableRow}>
                                        <td className={`${d.tableCell} font-mono`}>{r.referredEmail}</td>
                                        <td className={d.tableCell}><StatusBadge status={r.status} /></td>
                                        <td className={d.tableCell}>{r.commissionRate}%</td>
                                        <td className={`${d.tableCell} font-semibold ${r.totalEarned > 0 ? 'text-emerald-500' : ''}`}>
                                            ${Number(r.totalEarned).toFixed(2)}
                                        </td>
                                        <td className={d.tableCell}>
                                            {new Date(r.joinedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* How it Works */}
            <div className={d.card}>
                <h2 className={`font-bold text-sm mb-5 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>How It Works</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { step: '01', icon: Link2, title: 'Share Your Link', desc: 'Copy your unique referral link and share it with other businesses and marketers.' },
                        { step: '02', icon: Users, title: 'They Sign Up', desc: "When an advertiser registers using your link, they're linked to your account automatically." },
                        { step: '03', icon: DollarSign, title: 'Earn Credits', desc: `Get ${info?.advertiserCommission ?? 3}% credit on their total ad spend, applied to your balance.` },
                    ].map(item => (
                        <div key={item.step} className={`flex gap-3 p-4 rounded-xl ${d.isDark ? 'bg-white/[0.03] border border-white/8' : 'bg-gray-50 border border-gray-100'}`}>
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-indigo-500/15 text-indigo-500">
                                {item.step}
                            </div>
                            <div>
                                <p className={`font-semibold text-sm ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>{item.title}</p>
                                <p className={`text-xs mt-1 leading-relaxed ${d.subheading}`}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
