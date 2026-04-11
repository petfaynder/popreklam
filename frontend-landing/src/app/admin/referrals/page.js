'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Gift, Users, TrendingUp, DollarSign, Clock, Search,
    CheckCircle2, ChevronDown, RefreshCw, CircleDot, Save, Loader2
} from 'lucide-react';
import { adminAPI } from '@/lib/api';

const S = {
    page: { padding: '28px 28px', fontFamily: 'DM Sans, sans-serif', color: '#e2e8f0' },
    header: { marginBottom: '24px' },
    h1: { fontSize: '20px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 },
    sub: { fontSize: '13px', color: '#64748b', marginTop: '4px' },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
    card: {
        background: '#0d0d20', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px', padding: '20px',
    },
    statCard: {
        background: '#0d0d20', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px', padding: '20px',
    },
    statVal: { fontSize: '28px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' },
    statLabel: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
    iconBox: (color) => ({
        width: '40px', height: '40px', borderRadius: '10px',
        background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '12px',
    }),
    label: { fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' },
    input: {
        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '13px',
        outline: 'none', boxSizing: 'border-box',
    },
    select: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', padding: '7px 10px', color: '#e2e8f0', fontSize: '12px',
        outline: 'none', cursor: 'pointer',
    },
    btnPrimary: {
        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
        border: 'none', borderRadius: '8px', padding: '8px 16px',
        color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
    },
    btnApprove: {
        background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '6px', padding: '5px 12px', color: '#34d399', fontSize: '12px',
        fontWeight: 600, cursor: 'pointer',
    },
    th: { fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    td: { padding: '12px 12px', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    toggle: (on) => ({
        width: '44px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
        background: on ? '#7c3aed' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s',
    }),
    toggleKnob: (on) => ({
        position: 'absolute', top: '3px', width: '16px', height: '16px',
        borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
        left: on ? '24px' : '3px',
    }),
};

function StatusBadge({ status }) {
    const map = {
        PENDING: { label: 'Pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
        ACTIVE: { label: 'Active', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
        PAID: { label: 'Paid', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)' },
    };
    const m = map[status] || map.PENDING;
    return (
        <span style={{
            background: m.bg, border: `1px solid ${m.border}`, color: m.color,
            fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
        }}>
            <CircleDot size={9} />
            {m.label}
        </span>
    );
}

export default function AdminReferralsPage() {
    const [overview, setOverview] = useState(null);
    const [settings, setSettings] = useState({ enabled: true, publisherCommission: 5, advertiserCommission: 3, minPayout: 10 });
    const [referrals, setReferrals] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [approving, setApproving] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [saveMsg, setSaveMsg] = useState('');

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [ov, s, r] = await Promise.all([
                adminAPI.getReferralOverview(),
                adminAPI.getReferralSettings(),
                adminAPI.getAllReferrals({ limit: 50, status: filterStatus, type: filterType, search }),
            ]);
            setOverview(ov);
            setSettings(s);
            setReferrals(r.referrals || []);
            setTotal(r.pagination?.total || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterType, search]);

    useEffect(() => { load(); }, [load]);

    const saveSettings = async () => {
        try {
            setSaving(true);
            await adminAPI.updateReferralSettings(settings);
            setSaveMsg('Saved!');
            setTimeout(() => setSaveMsg(''), 2500);
        } catch (e) {
            setSaveMsg('Error saving');
        } finally {
            setSaving(false);
        }
    };

    const approve = async (id) => {
        try {
            setApproving(id);
            await adminAPI.approveReferralBonus(id);
            await load();
        } catch (e) {
            console.error(e);
        } finally {
            setApproving(null);
        }
    };

    const statCards = [
        { label: 'Total Referrals', value: overview?.totalReferrals ?? '—', icon: Users, color: 'rgba(124,58,237,0.15)', ic: '#a78bfa' },
        { label: 'Active', value: overview?.activeReferrals ?? '—', icon: TrendingUp, color: 'rgba(16,185,129,0.15)', ic: '#34d399' },
        { label: 'Paid Out', value: overview?.paidReferrals ?? '—', icon: CheckCircle2, color: 'rgba(56,189,248,0.15)', ic: '#38bdf8' },
        { label: 'Total Commission Paid', value: overview ? `$${Number(overview.totalPaidOut).toFixed(2)}` : '—', icon: DollarSign, color: 'rgba(251,191,36,0.15)', ic: '#fbbf24' },
    ];

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={{ ...S.header, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={S.h1}>Referral Management</h1>
                    <p style={S.sub}>Configure the referral program and manage commissions</p>
                </div>
                <button onClick={load} style={{ ...S.btnPrimary, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Stats */}
            <div style={S.grid4}>
                {statCards.map(card => (
                    <div key={card.label} style={S.statCard}>
                        <div style={S.iconBox(card.color)}>
                            <card.icon size={18} color={card.ic} />
                        </div>
                        <div style={S.statVal}>{card.value}</div>
                        <div style={S.statLabel}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Settings Card */}
            <div style={{ ...S.card, marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={S.iconBox('rgba(124,58,237,0.15)')}>
                            <Gift size={18} color="#a78bfa" />
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>Program Settings</div>
                            <div style={S.sub}>Configure commission rates and program availability</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {saveMsg && <span style={{ fontSize: '12px', color: saveMsg === 'Saved!' ? '#34d399' : '#f87171' }}>{saveMsg}</span>}
                        <button onClick={saveSettings} disabled={saving} style={S.btnPrimary}>
                            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                            Save Settings
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {/* Enable Toggle */}
                    <div>
                        <label style={S.label}>Program Status</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '4px' }}>
                            <button
                                style={S.toggle(settings.enabled)}
                                onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
                            >
                                <span style={S.toggleKnob(settings.enabled)} />
                            </button>
                            <span style={{ fontSize: '13px', color: settings.enabled ? '#34d399' : '#64748b', fontWeight: 600 }}>
                                {settings.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>

                    {/* Publisher Commission */}
                    <div>
                        <label style={S.label}>Publisher Commission (%)</label>
                        <input
                            style={S.input}
                            type="number" min="0" max="50" step="0.5"
                            value={settings.publisherCommission}
                            onChange={e => setSettings(s => ({ ...s, publisherCommission: parseFloat(e.target.value) || 0 }))}
                        />
                    </div>

                    {/* Advertiser Commission */}
                    <div>
                        <label style={S.label}>Advertiser Commission (%)</label>
                        <input
                            style={S.input}
                            type="number" min="0" max="50" step="0.5"
                            value={settings.advertiserCommission}
                            onChange={e => setSettings(s => ({ ...s, advertiserCommission: parseFloat(e.target.value) || 0 }))}
                        />
                    </div>

                    {/* Min Payout */}
                    <div>
                        <label style={S.label}>Min Payout ($)</label>
                        <input
                            style={S.input}
                            type="number" min="0" step="1"
                            value={settings.minPayout}
                            onChange={e => setSettings(s => ({ ...s, minPayout: parseFloat(e.target.value) || 0 }))}
                        />
                    </div>
                </div>
            </div>

            {/* Referrals Table */}
            <div style={S.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>
                        All Referrals <span style={{ color: '#475569', fontWeight: 400, fontSize: '12px' }}>({total})</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                            <input
                                style={{ ...S.input, paddingLeft: '28px', width: '180px' }}
                                placeholder="Search email…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <select style={S.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PAID">Paid</option>
                        </select>
                        <select style={S.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="">All Types</option>
                            <option value="PUBLISHER">Publisher</option>
                            <option value="ADVERTISER">Advertiser</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>Loading…</div>
                ) : referrals.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#475569', fontSize: '13px' }}>
                        No referrals found.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Referrer', 'Referred User', 'Type', 'Status', 'Commission', 'Total Earned', 'Joined', 'Action'].map(h => (
                                        <th key={h} style={S.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.map(r => (
                                    <tr key={r.id} style={{ transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={S.td}>
                                            <span style={{ color: '#c4b5fd', fontSize: '12px', fontFamily: 'monospace' }}>
                                                {r.referrer?.email}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                                                {r.referred?.email}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            <span style={{
                                                background: r.type === 'PUBLISHER' ? 'rgba(16,185,129,0.1)' : 'rgba(56,189,248,0.1)',
                                                color: r.type === 'PUBLISHER' ? '#34d399' : '#38bdf8',
                                                fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                                            }}>
                                                {r.type}
                                            </span>
                                        </td>
                                        <td style={S.td}><StatusBadge status={r.status} /></td>
                                        <td style={{ ...S.td, color: '#e2e8f0' }}>{Number(r.commissionRate).toFixed(1)}%</td>
                                        <td style={{ ...S.td, color: Number(r.totalEarned) > 0 ? '#34d399' : '#475569', fontWeight: 600 }}>
                                            ${Number(r.totalEarned).toFixed(2)}
                                        </td>
                                        <td style={S.td}>{new Date(r.createdAt).toLocaleDateString()}</td>
                                        <td style={S.td}>
                                            {r.status === 'ACTIVE' ? (
                                                <button
                                                    onClick={() => approve(r.id)}
                                                    disabled={approving === r.id}
                                                    style={S.btnApprove}
                                                >
                                                    {approving === r.id ? 'Processing…' : 'Approve & Pay'}
                                                </button>
                                            ) : (
                                                <span style={{ color: '#334155', fontSize: '12px' }}>
                                                    {r.status === 'PAID' ? '✓ Paid' : '—'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
