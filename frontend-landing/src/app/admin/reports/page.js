'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';
import StatCard from '@/components/admin/StatCard';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const S = {
    page: { padding: '24px 28px', minHeight: '100vh', background: '#05050f', fontFamily: 'DM Sans, sans-serif' },
    card: { background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px 24px' },
    sectionTitle: { fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
};

const PERIODS = [7, 14, 30, 60, 90];
const PIE_COLORS = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0f0f24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px', fontFamily: 'DM Sans, sans-serif' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ fontSize: '12px', color: p.color, fontWeight: 600 }}>
                    {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue') ? '$' : ''}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
                </div>
            ))}
        </div>
    );
};

export default function ReportsPage() {
    const [period, setPeriod] = useState(30);
    const [revenueData, setRevenueData] = useState([]);
    const [topPublishers, setTopPublishers] = useState([]);
    const [topAdvertisers, setTopAdvertisers] = useState([]);
    const [geoData, setGeoData] = useState([]);
    const [formatData, setFormatData] = useState([]);
    const [health, setHealth] = useState({});
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => { load(); }, [period]);

    const load = async () => {
        setLoading(true);
        try {
            const [rev, pubs, advs, geo, fmt, h] = await Promise.all([
                adminAPI.getRevenueTimeline(period),
                adminAPI.getTopPublishers(period, 10),
                adminAPI.getTopAdvertisers(period, 10),
                adminAPI.getGeoBreakdown(period),
                adminAPI.getFormatBreakdown(period),
                adminAPI.getPlatformHealth(),
            ]);
            setRevenueData(rev.data || []);
            setTopPublishers(pubs.publishers || []);
            setTopAdvertisers(advs.advertisers || []);
            setGeoData(geo.countries || []);
            setFormatData(fmt.formats || []);
            setHealth(h);
        } catch (e) { toast.error('Failed to load analytics'); }
        finally { setLoading(false); }
    };

    const exportCsv = () => {
        const url = adminAPI.getExportCsvUrl(period);
        window.open(url, '_blank');
    };

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Geist Mono, monospace', marginBottom: '4px' }}>Analytics & Reports</h1>
                    <p style={{ fontSize: '13px', color: '#475569' }}>Platform-wide performance insights</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', overflow: 'hidden' }}>
                        {PERIODS.map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                style={{ padding: '7px 12px', border: 'none', background: period === p ? '#8b5cf6' : 'transparent', color: period === p ? '#fff' : '#64748b', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                                {p}d
                            </button>
                        ))}
                    </div>
                    <button onClick={exportCsv} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#34d399', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ⬇ Export CSV
                    </button>
                </div>
            </div>

            {/* Platform Health */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' }}>
                <StatCard label="Active Users" value={health.activeUsers} icon="👥" color="#10b981" loading={loading} />
                <StatCard label="Active Campaigns" value={health.activeCampaigns} icon="📢" color="#8b5cf6" loading={loading} />
                <StatCard label="Active Sites" value={health.activeSites} icon="🌐" color="#0ea5e9" loading={loading} />
                <StatCard label="Avg CPM Rate" value={health.avgCpm?.toFixed(4)} prefix="$" icon="📊" color="#f59e0b" loading={loading} />
                <StatCard label="Platform CTR" value={health.platformCtr} suffix="%" icon="🖱️" color="#ef4444" loading={loading} />
            </div>

            {/* Revenue Chart */}
            <div style={{ ...S.card, marginBottom: '20px' }}>
                <div style={S.sectionTitle}>Revenue Timeline — Last {period} Days</div>
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={revenueData}>
                        <defs>
                            {[['rev', '#10b981'], ['pay', '#8b5cf6'], ['prof', '#0ea5e9']].map(([k, c]) => (
                                <linearGradient key={k} id={`grad${k}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={c} stopOpacity={0.25} />
                                    <stop offset="100%" stopColor={c} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={55} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b', paddingTop: '12px' }} />
                        <Area type="monotone" dataKey="totalRevenue" name="Ad Revenue" stroke="#10b981" strokeWidth={2} fill="url(#gradrev)" />
                        <Area type="monotone" dataKey="publisherPayout" name="Publisher Payout" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradpay)" />
                        <Area type="monotone" dataKey="platformProfit" name="Platform Profit" stroke="#0ea5e9" strokeWidth={2} fill="url(#gradprof)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div style={S.grid2}>
                {/* Top Publishers */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>Top Publishers</div>
                    {topPublishers.slice(0, 8).map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                <span style={{ width: '20px', fontSize: '11px', color: '#475569', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '12px', color: '#f1f5f9', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</div>
                                    <div style={{ fontSize: '11px', color: '#475569' }}>{Number(p.impressions || 0).toLocaleString()} imp</div>
                                </div>
                            </div>
                            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '13px', fontWeight: 700, color: '#34d399', flexShrink: 0 }}>
                                ${Number(p.earnings || 0).toFixed(2)}
                            </div>
                        </div>
                    ))}
                    {topPublishers.length === 0 && !loading && <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No data</div>}
                </div>

                {/* Top Advertisers */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>Top Advertisers</div>
                    {topAdvertisers.slice(0, 8).map((a, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                <span style={{ width: '20px', fontSize: '11px', color: '#475569', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '12px', color: '#f1f5f9', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
                                    <div style={{ fontSize: '11px', color: '#475569' }}>{a.campaigns} campaigns</div>
                                </div>
                            </div>
                            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '13px', fontWeight: 700, color: '#f87171', flexShrink: 0 }}>
                                ${Number(a.spent || 0).toFixed(2)}
                            </div>
                        </div>
                    ))}
                    {topAdvertisers.length === 0 && !loading && <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No data</div>}
                </div>
            </div>

            <div style={S.grid2}>
                {/* Geo Breakdown */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>Geographic Breakdown</div>
                    {geoData.slice(0, 8).map((g, i) => (
                        <div key={g.country || i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontSize: '12px', color: '#475569', width: '24px', fontWeight: 700 }}>#{i + 1}</span>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', flex: 1 }}>{g.country || 'Unknown'}</span>
                            <div style={{ minWidth: '90px' }}>
                                <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                                    <div style={{ height: '100%', borderRadius: '2px', background: '#8b5cf6', width: `${Math.min(100, (g.impressions / (geoData[0]?.impressions || 1)) * 100)}%` }} />
                                </div>
                            </div>
                            <span style={{ fontSize: '11px', color: '#475569', minWidth: '60px', textAlign: 'right', fontFamily: 'Geist Mono, monospace' }}>
                                {Number(g.impressions || 0).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Format Breakdown */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>Ad Format Performance</div>
                    {formatData.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <ResponsiveContainer width={160} height={160}>
                                <PieChart>
                                    <Pie data={formatData} dataKey="impressions" nameKey="adType" innerRadius={45} outerRadius={75} paddingAngle={2}>
                                        {formatData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ flex: 1 }}>
                                {formatData.slice(0, 6).map((f, i) => (
                                    <div key={f.adType || i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                                        <span style={{ fontSize: '12px', color: '#94a3b8', flex: 1 }}>{(f.adType || '').replace(/_/g, ' ')}</span>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', fontFamily: 'Geist Mono, monospace' }}>
                                            {Number(f.impressions || 0).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No format data available</div>
                    )}
                </div>
            </div>
        </div>
    );
}
