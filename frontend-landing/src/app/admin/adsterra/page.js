'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';

const S = {
    page: { padding: '24px 28px', minHeight: '100vh', background: '#05050f', fontFamily: 'DM Sans, sans-serif', color: '#f1f5f9' },
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
    h1: { fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Geist Mono, monospace', marginBottom: '4px' },
    sub: { fontSize: '13px', color: '#475569' },
    syncBtn: { padding: '9px 20px', borderRadius: '9px', border: 'none', background: '#8b5cf6', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' },
    periodBtns: { display: 'flex', gap: '6px', marginBottom: '24px' },
    periodBtn: (active) => ({ padding: '6px 14px', borderRadius: '7px', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: active ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', color: active ? '#c4b5fd' : '#64748b', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' },
    statCard: { background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px 22px' },
    statLabel: { fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' },
    statValue: { fontSize: '26px', fontWeight: 800, fontFamily: 'Geist Mono, monospace' },
    statSub: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
    card: { background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px 22px', marginBottom: '16px' },
    cardTitle: { fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    td: { padding: '11px 12px', fontSize: '13px', color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    badge: (color) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, background: color + '22', color }), 
    bar: { height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginTop: '4px' },
    barFill: (pct, color) => ({ height: '100%', width: pct + '%', background: color, borderRadius: '3px', transition: 'width 0.6s ease' }),
    cols2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    syncRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', fontSize: '12px', color: '#c4b5fd', marginBottom: '20px' },
};

const PERIODS = [7, 14, 30];

function StatCard({ label, value, sub, color = '#8b5cf6' }) {
    return (
        <div style={S.statCard}>
            <div style={S.statLabel}>{label}</div>
            <div style={{ ...S.statValue, color }}>{value}</div>
            {sub && <div style={S.statSub}>{sub}</div>}
        </div>
    );
}

const COUNTRY_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

export default function AdsterraStatsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [period, setPeriod] = useState(7);
    const [syncMsg, setSyncMsg] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await adminAPI.getAdsterraStats(period);
            setData(d);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => { load(); }, [load]);

    const triggerSync = async () => {
        setSyncing(true);
        setSyncMsg(null);
        try {
            const result = await adminAPI.triggerAdsterraSync();
            const todayPubs = result.today?.publishers || 0;
            const ydayPubs = result.yesterday?.publishers || 0;
            setSyncMsg(`Sync complete — ${todayPubs + ydayPubs} publisher(s) updated.`);
            await load();
        } catch (e) {
            setSyncMsg('Sync failed: ' + e.message);
        } finally {
            setSyncing(false);
        }
    };

    const fmt = (n) => '$' + (parseFloat(n) || 0).toFixed(4);
    const fmtInt = (n) => (parseInt(n) || 0).toLocaleString();
    const topCountryCount = data?.countryBreakdown?.[0]?.impressions || 1;

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={S.header}>
                <div>
                    <h1 style={S.h1}>Adsterra Backfill</h1>
                    <p style={S.sub}>
                        SmartLink revenue sync logs &amp; publisher distribution
                        {data?.lastSync && <> — Last settled: <b style={{ color: '#c4b5fd' }}>{data.lastSync}</b></>}
                    </p>
                </div>
                <button onClick={triggerSync} disabled={syncing} style={{ ...S.syncBtn, opacity: syncing ? 0.6 : 1 }}>
                    {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
                </button>
            </div>

            {/* Sync result message */}
            {syncMsg && (
                <div style={S.syncRow}>
                    <span>✅</span> {syncMsg}
                </div>
            )}

            {/* Period selector */}
            <div style={S.periodBtns}>
                {PERIODS.map(p => (
                    <button key={p} style={S.periodBtn(period === p)} onClick={() => setPeriod(p)}>
                        Last {p} days
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569', fontSize: '14px' }}>
                    Loading Adsterra data...
                </div>
            ) : !data ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>No data available</div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div style={S.grid}>
                        <StatCard
                            label="Total Backfill Impressions"
                            value={fmtInt(data.totalImpressions)}
                            sub={`Last ${period} days`}
                            color="#06b6d4"
                        />
                        <StatCard
                            label="Total Paid to Publishers"
                            value={fmt(data.totalPaidToPublishers)}
                            sub="Adsterra country-proportional"
                            color="#10b981"
                        />
                        <StatCard
                            label="Publishers Earning"
                            value={data.publisherPayouts?.length || 0}
                            sub="With at least 1 payout"
                            color="#8b5cf6"
                        />
                        <StatCard
                            label="Revenue/Impression"
                            value={data.totalImpressions > 0
                                ? fmt(data.totalPaidToPublishers / data.totalImpressions * 1000) + ' CPM'
                                : '—'}
                            sub="Effective publisher CPM"
                            color="#f59e0b"
                        />
                    </div>

                    <div style={S.cols2}>
                        {/* Daily Timeline */}
                        <div style={S.card}>
                            <div style={S.cardTitle}>📅 Daily Breakdown</div>
                            <table style={S.table}>
                                <thead>
                                    <tr>
                                        <th style={S.th}>Date</th>
                                        <th style={S.th}>Impressions</th>
                                        <th style={{ ...S.th, textAlign: 'right' }}>Paid Out</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.timeline.length === 0 ? (
                                        <tr><td colSpan={3} style={{ ...S.td, textAlign: 'center', color: '#475569' }}>No data</td></tr>
                                    ) : (
                                        [...data.timeline].reverse().map(row => (
                                            <tr key={row.date}>
                                                <td style={S.td}>{row.date}</td>
                                                <td style={S.td}>{fmtInt(row.impressions)}</td>
                                                <td style={{ ...S.td, textAlign: 'right', color: row.paidToPublishers > 0 ? '#10b981' : '#475569', fontFamily: 'Geist Mono, monospace' }}>
                                                    {row.paidToPublishers > 0 ? fmt(row.paidToPublishers) : '—'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Country Breakdown */}
                        <div style={S.card}>
                            <div style={S.cardTitle}>🌍 Traffic by Country</div>
                            {data.countryBreakdown.length === 0 ? (
                                <div style={{ color: '#475569', fontSize: '13px' }}>No country data</div>
                            ) : (
                                data.countryBreakdown.map((c, i) => (
                                    <div key={c.country} style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                            <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{c.country}</span>
                                            <span style={{ color: '#94a3b8', fontFamily: 'Geist Mono, monospace' }}>{fmtInt(c.impressions)}</span>
                                        </div>
                                        <div style={S.bar}>
                                            <div style={S.barFill(Math.round(c.impressions / topCountryCount * 100), COUNTRY_COLORS[i % COUNTRY_COLORS.length])} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Publisher Payouts */}
                    <div style={S.card}>
                        <div style={S.cardTitle}>👤 Publisher Payouts (Adsterra Revenue)</div>
                        <table style={S.table}>
                            <thead>
                                <tr>
                                    <th style={S.th}>Publisher</th>
                                    <th style={{ ...S.th, textAlign: 'right' }}>Total Paid (period)</th>
                                    <th style={{ ...S.th, textAlign: 'right' }}>Share</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.publisherPayouts.length === 0 ? (
                                    <tr><td colSpan={3} style={{ ...S.td, textAlign: 'center', color: '#475569', padding: '32px' }}>
                                        No payouts recorded yet. Sync will run hourly once Adsterra API key is configured.
                                    </td></tr>
                                ) : (
                                    data.publisherPayouts.map((p, i) => {
                                        const sharePct = data.totalPaidToPublishers > 0
                                            ? ((p.totalPaid / data.totalPaidToPublishers) * 100).toFixed(1)
                                            : '0.0';
                                        return (
                                            <tr key={p.userId}>
                                                <td style={S.td}>
                                                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{p.email}</div>
                                                    <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'Geist Mono, monospace' }}>{p.userId.slice(0, 12)}…</div>
                                                </td>
                                                <td style={{ ...S.td, textAlign: 'right', fontFamily: 'Geist Mono, monospace', color: '#10b981', fontWeight: 700 }}>
                                                    {fmt(p.totalPaid)}
                                                </td>
                                                <td style={{ ...S.td, textAlign: 'right' }}>
                                                    <span style={S.badge('#8b5cf6')}>{sharePct}%</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
