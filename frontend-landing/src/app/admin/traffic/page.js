'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';
import {
    BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
    Activity, Globe, TrendingUp, Users,
    AlertTriangle, RefreshCw, Megaphone,
    DollarSign, Eye, MousePointerClick, ShieldAlert
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n, d = 2) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtInt = (n) => Number(n || 0).toLocaleString();

const CARD_STYLE = {
    background: 'linear-gradient(145deg, #0d0d20, #0a0a1a)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '20px',
};

const SECTION_HDR = {
    fontSize: '11px', fontWeight: 700, color: '#334155',
    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px'
};

function KpiCard({ icon: Icon, label, value, sub, color = '#8b5cf6' }) {
    return (
        <div style={{ ...CARD_STYLE }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={17} color={color} />
                </div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{label}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{value}</div>
            {sub && <div style={{ fontSize: '11px', color: '#475569', marginTop: '5px' }}>{sub}</div>}
        </div>
    );
}

export default function AdminTrafficInsightsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetch = useCallback(async () => {
        try {
            const res = await adminAPI.getTrafficInsights();
            setData(res);
            setLastRefresh(new Date());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch();
    }, [fetch]);

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(fetch, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, [autoRefresh, fetch]);

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #8b5cf6', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
        </div>
    );

    const { lastHour, today, network, topCountries, topPublishers, hourly, suspiciousIps } = data || {};

    return (
        <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif', color: '#f1f5f9', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Traffic Insights</h1>
                    <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                        Real-time network monitoring  ·  {lastRefresh ? `Last updated ${lastRefresh.toLocaleTimeString()}` : ''}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#64748b' }}>
                        <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
                        Auto-refresh (30s)
                    </label>
                    <button onClick={fetch} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* Network KPIs */}
            <div style={{ marginBottom: '8px' }}><div style={SECTION_HDR}>Current Hour</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                <KpiCard icon={Eye} label="Impressions (1h)" value={fmtInt(lastHour?.impressions)} color="#8b5cf6" />
                <KpiCard icon={MousePointerClick} label="Clicks (1h)" value={fmtInt(lastHour?.clicks)} color="#0ea5e9" />
                <KpiCard icon={DollarSign} label="Revenue (1h)" value={`$${fmt(lastHour?.revenue, 4)}`} color="#10b981" />
                <KpiCard icon={Activity} label="CTR (1h)" value={`${lastHour?.ctr}%`} color="#f59e0b" />
                <KpiCard icon={Megaphone} label="Active Campaigns" value={fmtInt(network?.activeCampaigns)} color="#a78bfa" />
                <KpiCard icon={Globe} label="Active Sites" value={fmtInt(network?.activeSites)} color="#34d399" />
            </div>

            {/* Today Financials */}
            <div style={{ marginBottom: '8px' }}><div style={SECTION_HDR}>Today's Totals</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                <KpiCard icon={Eye} label="Total Impressions" value={fmtInt(today?.impressions)} color="#8b5cf6" />
                <KpiCard icon={MousePointerClick} label="Total Clicks" value={fmtInt(today?.clicks)} color="#0ea5e9" />
                <KpiCard icon={DollarSign} label="Gross Revenue" value={`$${fmt(today?.revenue, 4)}`} color="#10b981" sub={`eCPM: $${fmt(today?.eCPM, 4)}`} />
                <KpiCard icon={TrendingUp} label="Publisher Payout" value={`$${fmt(today?.publisherPayout, 4)}`} color="#f59e0b" />
                <KpiCard icon={DollarSign} label="System Profit" value={`$${fmt(today?.systemProfit, 4)}`} color="#e11d48" />
            </div>

            {/* 24h Area Chart */}
            <div style={{ ...CARD_STYLE, marginBottom: '20px' }}>
                <div style={SECTION_HDR}>24-Hour Traffic Breakdown</div>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={hourly} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="areaImpr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={v => v?.slice(11, 16) || ''} />
                        <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                        <Tooltip contentStyle={{ background: '#0f0f24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="impressions" stroke="#8b5cf6" fill="url(#areaImpr)" strokeWidth={2} />
                        <Area type="monotone" dataKey="clicks" stroke="#0ea5e9" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Grid: Top Countries + Top Publishers + Fraud */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Top Countries */}
                <div style={{ ...CARD_STYLE }}>
                    <div style={{ ...SECTION_HDR, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={11} /> Top Countries Today
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <th style={{ textAlign: 'left', paddingBottom: '8px', fontWeight: 600 }}>Country</th>
                                <th style={{ textAlign: 'right', paddingBottom: '8px', fontWeight: 600 }}>Impressions</th>
                                <th style={{ textAlign: 'right', paddingBottom: '8px', fontWeight: 600 }}>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(topCountries || []).map((c, i) => (
                                <tr key={c.country} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#94a3b8' }}>
                                    <td style={{ padding: '8px 0' }}>
                                        <span style={{ fontWeight: 700, color: i < 3 ? '#c4b5fd' : '#94a3b8' }}>#{i + 1}</span>
                                        {' '}{c.country}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '8px 0' }}>{fmtInt(c.impressions)}</td>
                                    <td style={{ textAlign: 'right', padding: '8px 0', color: '#10b981' }}>${fmt(c.revenue, 4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Top Publishers */}
                <div style={{ ...CARD_STYLE }}>
                    <div style={{ ...SECTION_HDR, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={11} /> Top Publishers Today
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <th style={{ textAlign: 'left', paddingBottom: '8px', fontWeight: 600 }}>Site</th>
                                <th style={{ textAlign: 'right', paddingBottom: '8px', fontWeight: 600 }}>Impr.</th>
                                <th style={{ textAlign: 'right', paddingBottom: '8px', fontWeight: 600 }}>Payout</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(topPublishers || []).map((p, i) => (
                                <tr key={p.zoneId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#94a3b8' }}>
                                    <td style={{ padding: '8px 0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        <span style={{ fontWeight: 700, color: i < 3 ? '#34d399' : '#94a3b8' }}>#{i + 1}</span>
                                        {' '}{p.siteName}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '8px 0' }}>{fmtInt(p.impressions)}</td>
                                    <td style={{ textAlign: 'right', padding: '8px 0', color: '#10b981' }}>${fmt(p.revenue, 4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Suspicious IPs */}
            {suspiciousIps?.length > 0 && (
                <div style={{ ...CARD_STYLE }}>
                    <div style={{ ...SECTION_HDR, display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
                        <ShieldAlert size={11} style={{ color: '#ef4444' }} /> Suspicious IPs (High Frequency — Last Hour)
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {suspiciousIps.map(ip => (
                            <div key={ip.ip} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '6px 12px' }}>
                                <AlertTriangle size={13} color="#ef4444" />
                                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#fca5a5' }}>{ip.ip}</span>
                                <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>{ip.impressions} reqs</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
