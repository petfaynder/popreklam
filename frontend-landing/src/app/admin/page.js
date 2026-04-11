'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import StatCard from '@/components/admin/StatCard';
import Badge from '@/components/admin/Badge';
import { useToast } from '@/components/admin/Toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Link from 'next/link';

const STYLES = {
    page: { padding: '28px', minHeight: '100vh', background: '#05050f' },
    section: { marginBottom: '28px' },
    sectionTitle: { fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' },
    card: { background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px 24px' },
    row: { display: 'grid', gap: '16px' },
    h2: { fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Geist Mono, monospace', letterSpacing: '-0.02em' },
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0f0f24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', fontFamily: 'DM Sans, sans-serif' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ fontSize: '13px', color: p.color, fontWeight: 600 }}>
                    {p.name}: ${Number(p.value).toFixed(2)}
                </div>
            ))}
        </div>
    );
};

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            const d = await adminAPI.getDashboard();
            setData(d);
        } catch (e) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const pending = data?.pendingActions || {};
    const rev = data?.revenue || {};
    const users = data?.users || {};
    const perf = data?.performance || {};

    return (
        <div style={STYLES.page}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ ...STYLES.h2, marginBottom: '6px' }}>Platform Overview</h1>
                    <p style={{ fontSize: '13px', color: '#475569' }}>
                        Real-time platform statistics — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button onClick={load} style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}>
                    ↺ Refresh
                </button>
            </div>

            {/* Pending Actions Alert Bar */}
            {(pending.total > 0) && (
                <div style={{
                    background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
                    display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
                }}>
                    <div style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 700 }}>⚡ {pending.total} actions require your attention</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {pending.campaigns > 0 && (
                            <Link href="/admin/campaigns" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                                {pending.campaigns} Campaigns
                            </Link>
                        )}
                        {pending.sites > 0 && (
                            <Link href="/admin/sites" style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                                {pending.sites} Sites
                            </Link>
                        )}
                        {pending.payments > 0 && (
                            <Link href="/admin/payments" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                                {pending.payments} Payments
                            </Link>
                        )}
                        {pending.tickets > 0 && (
                            <Link href="/admin/support" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                                {pending.tickets} Tickets
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div style={{ ...STYLES.section }}>
                <div style={{ ...STYLES.row, gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <StatCard label="Platform Revenue" value={rev.advertiserSpent?.toFixed(2)} prefix="$" icon="💰" color="#10b981" loading={loading} />
                    <StatCard label="Publisher Payouts" value={rev.publisherEarnings?.toFixed(2)} prefix="$" icon="👤" color="#8b5cf6" loading={loading} />
                    <StatCard label="Platform Profit" value={rev.platformProfit?.toFixed(2)} prefix="$" icon="📈" color="#0ea5e9" loading={loading} />
                    <StatCard label="Total Users" value={users.total} icon="👥" color="#f59e0b" loading={loading} />
                </div>
            </div>

            {/* Second row */}
            <div style={{ ...STYLES.section }}>
                <div style={{ ...STYLES.row, gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <StatCard label="Total Impressions" value={perf.totalImpressions} icon="👁️" color="#06b6d4" loading={loading} />
                    <StatCard label="Total Clicks" value={perf.totalClicks} icon="🖱️" color="#f43f5e" loading={loading} />
                    <StatCard label="Avg CTR" value={perf.ctr} suffix="%" icon="📊" color="#a78bfa" loading={loading} />
                    <StatCard label="Pending Actions" value={pending.total} icon="⚡" color={pending.total > 0 ? '#ef4444' : '#10b981'} loading={loading} />
                </div>
            </div>

            {/* Revenue Chart */}
            <div style={{ ...STYLES.section }}>
                <div style={{ ...STYLES.sectionTitle }}>Revenue & Payout — Last 7 Days</div>
                <div style={{ ...STYLES.card }}>
                    {loading ? (
                        <div style={{ height: '240px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={data?.sparkline || []} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toFixed(2)}`} width={60} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: '#64748b' }} />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
                                <Area type="monotone" dataKey="payout" name="Payout" stroke="#8b5cf6" strokeWidth={2} fill="url(#payGrad)" />
                                <Area type="monotone" dataKey="profit" name="Profit" stroke="#0ea5e9" strokeWidth={2} fill="url(#profGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Bottom: User Stats + Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* User Breakdown */}
                <div style={STYLES.card}>
                    <div style={{ ...STYLES.sectionTitle }}>User Breakdown</div>
                    {[
                        { label: 'Publishers', value: users.publishers, color: '#8b5cf6', icon: '🌐' },
                        { label: 'Advertisers', value: users.advertisers, color: '#0ea5e9', icon: '📢' },
                        { label: 'New This Month', value: users.newThisMonth, color: '#10b981', icon: '✨' },
                    ].map(u => (
                        <div key={u.label} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#94a3b8' }}>
                                <span>{u.icon}</span> {u.label}
                            </div>
                            <span style={{ fontSize: '20px', fontWeight: 800, color: u.color, fontFamily: 'Geist Mono, monospace' }}>
                                {loading ? '—' : (u.value || 0).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div style={STYLES.card}>
                    <div style={{ ...STYLES.sectionTitle }}>Recent Admin Activity</div>
                    {loading ? (
                        <div style={{ color: '#475569', fontSize: '13px' }}>Loading...</div>
                    ) : (data?.recentActivity?.length > 0 ? (
                        data.recentActivity.slice(0, 6).map((log, i) => (
                            <div key={log.id || i} style={{
                                display: 'flex', alignItems: 'flex-start', gap: '10px',
                                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                            }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '7px',
                                    background: 'rgba(139,92,246,0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', flexShrink: 0,
                                }}>
                                    {log.action?.includes('APPROVE') ? '✓' : log.action?.includes('REJECT') ? '✗' : log.action?.includes('BAN') ? '🚫' : '📝'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {log.action?.replace(/_/g, ' ')}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#475569' }}>
                                        {log.admin?.email} · {new Date(log.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No activity yet</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
