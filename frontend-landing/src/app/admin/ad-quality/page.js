'use client';

import { useState, useEffect } from 'react';
import {
    Shield, AlertTriangle, Flag, CheckCircle, Clock,
    TrendingUp, TrendingDown, Pause, X, Loader2, RefreshCw, ChevronDown
} from 'lucide-react';
import { adminAPI } from '@/lib/api';

const S = {
    page:       { padding: '28px 32px', fontFamily: 'DM Sans, sans-serif' },
    header:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' },
    title:      { fontSize: '22px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' },
    sub:        { fontSize: '13px', color: '#475569', marginTop: '4px' },
    card:       { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' },
    iconWrap:   (color) => ({ width: '40px', height: '40px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    metaVal:    { fontSize: '22px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1 },
    metaLabel:  { fontSize: '12px', color: '#64748b', marginTop: '3px' },
    panel:      { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' },
    tabBar:     { display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 6px', gap: '2px' },
    tabBtn:     (active) => ({
        padding: '12px 16px', fontSize: '13px', fontWeight: active ? 700 : 500,
        color: active ? '#a78bfa' : '#64748b',
        borderBottom: `2px solid ${active ? '#8b5cf6' : 'transparent'}`,
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '6px',
        fontFamily: 'DM Sans, sans-serif', transition: 'color 0.15s',
    }),
    badge:      (active) => ({
        fontSize: '10px', fontWeight: 700,
        padding: '1px 6px', borderRadius: '8px',
        background: active ? '#8b5cf620' : 'rgba(255,255,255,0.06)',
        color: active ? '#a78bfa' : '#475569',
    }),
    refreshBtn: {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        color: '#94a3b8', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
        transition: 'all 0.15s',
    },
    select:     {
        appearance: 'none', fontSize: '12px', padding: '6px 28px 6px 10px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', color: '#94a3b8', cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif',
    },
    th:         { fontSize: '10px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    td:         { padding: '12px 16px', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    emptyBox:   { padding: '64px 20px', textAlign: 'center', color: '#334155' },
};

const REASON_LABELS = {
    MISLEADING: 'Misleading Content', INAPPROPRIATE: 'Inappropriate',
    MALWARE: 'Malware / Suspicious', SPAM: 'Spam', OTHER: 'Other',
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div style={S.card}>
            <div style={S.iconWrap(color)}><Icon size={18} color={color} /></div>
            <div>
                <div style={S.metaVal}>{value ?? '—'}</div>
                <div style={S.metaLabel}>{label}</div>
            </div>
        </div>
    );
}

// ── Score Badge ─────────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
    const color = score >= 60 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#64748b';
    return (
        <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: `${color}18`, color }}>
            {score}
        </span>
    );
}

// ── Status Badge ────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        OPEN:       { color: '#f59e0b', label: 'Open' },
        RESOLVED:   { color: '#10b981', label: 'Resolved' },
        DISMISSED:  { color: '#64748b', label: 'Dismissed' },
        ACTIVE:     { color: '#10b981', label: 'Active' },
        PAUSED:     { color: '#64748b', label: 'Paused' },
        PENDING_APPROVAL: { color: '#f59e0b', label: 'Pending' },
        REJECTED:   { color: '#ef4444', label: 'Rejected' },
        COMPLETED:  { color: '#0ea5e9', label: 'Completed' },
    };
    const { color, label } = map[status] || { color: '#64748b', label: status };
    return (
        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: `${color}18`, color }}>
            {label}
        </span>
    );
}

// ── Resolve Modal ───────────────────────────────────────────────────────────────
function ResolveModal({ report, onClose, onSave }) {
    const [status, setStatus] = useState('RESOLVED');
    const [adminNote, setAdminNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await adminAPI.updateAdQualityReport(report.id, { status, adminNote });
            onSave(); onClose();
        } catch (e) { alert(e.message); }
        finally { setLoading(false); }
    };

    const modal = {
        overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
        box:     { background: '#0d0d1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' },
        head:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
        body:    { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
        foot:    { display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' },
        label:   { fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' },
        btn:     (active) => ({
            flex: 1, padding: '8px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
            background: active ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
            color: active ? '#fff' : '#94a3b8',
        }),
        textarea: {
            width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#e2e8f0',
            resize: 'none', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
        },
    };

    return (
        <div style={modal.overlay}>
            <div style={modal.box}>
                <div style={modal.head}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>Update Report Status</span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}><X size={16} /></button>
                </div>
                <div style={modal.body}>
                    <div>
                        <label style={modal.label}>Action</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['RESOLVED', 'DISMISSED'].map(s => (
                                <button key={s} onClick={() => setStatus(s)} style={modal.btn(status === s)}>
                                    {s === 'RESOLVED' ? '✓ Resolve' : '— Dismiss'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label style={modal.label}>Admin Note (optional)</label>
                        <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                            rows={3} placeholder="Add a note visible to the publisher..."
                            style={modal.textarea} />
                    </div>
                </div>
                <div style={modal.foot}>
                    <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
                    <button onClick={handleSave} disabled={loading} style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, background: '#8b5cf6', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px', opacity: loading ? 0.6 : 1 }}>
                        {loading && <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />} Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Fraud Signals Tab ───────────────────────────────────────────────────────────
function FraudSignalsTab({ signals, loading, onPause }) {
    if (loading) return <div style={S.emptyBox}><Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: '#475569' }} /></div>;
    if (!signals.length) return (
        <div style={S.emptyBox}>
            <Shield size={32} color="#1e293b" style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '13px' }}>No fraud signals detected in this period 🎉</div>
        </div>
    );
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>{['Campaign', 'Format', 'Advertiser', 'Fraud Score', 'CTR', 'Impressions', 'Flags', 'Status', 'Action'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                    ))}</tr>
                </thead>
                <tbody>
                    {signals.map(s => (
                        <tr key={s.campaignId} style={{ transition: 'background 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={S.td}>
                                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.campaignName}</div>
                                <div style={{ fontSize: '11px', color: '#334155', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.targetUrl}</div>
                            </td>
                            <td style={S.td}>{s.adFormat}</td>
                            <td style={{ ...S.td, fontSize: '11px' }}>{s.advertiserEmail}</td>
                            <td style={{ ...S.td, textAlign: 'center' }}><ScoreBadge score={s.avgFraudScore} /></td>
                            <td style={{ ...S.td, textAlign: 'center' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    {s.ctr > 10 ? <TrendingUp size={12} color="#ef4444" /> : s.ctr < 0.05 ? <TrendingDown size={12} color="#f59e0b" /> : null}
                                    {s.ctr}%
                                </span>
                            </td>
                            <td style={{ ...S.td, textAlign: 'center' }}>{s.impressions.toLocaleString()}</td>
                            <td style={S.td}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {s.flags.map(f => <span key={f} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>{f}</span>)}
                                </div>
                            </td>
                            <td style={{ ...S.td, textAlign: 'center' }}><StatusBadge status={s.campaignStatus} /></td>
                            <td style={{ ...S.td, textAlign: 'center' }}>
                                {s.campaignStatus === 'ACTIVE' && (
                                    <button onClick={() => onPause(s.campaignId)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(245,158,11,0.12)', border: 'none', color: '#f59e0b', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                        <Pause size={11} /> Pause
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Publisher Reports Tab ───────────────────────────────────────────────────────
function PublisherReportsTab({ reports, loading, onAction }) {
    const [resolveTarget, setResolveTarget] = useState(null);

    if (loading) return <div style={S.emptyBox}><Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: '#475569' }} /></div>;
    if (!reports.length) return (
        <div style={S.emptyBox}>
            <Flag size={32} color="#1e293b" style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '13px' }}>No publisher reports yet.</div>
        </div>
    );

    return (
        <>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>{['Publisher', 'Zone / Site', 'Campaign', 'Reason', 'Description', 'Status', 'Date', 'Actions'].map(h => (
                            <th key={h} style={{ ...S.th, textAlign: h === 'Status' || h === 'Date' || h === 'Actions' ? 'center' : 'left' }}>{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {reports.map(r => (
                            <tr key={r.id}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ ...S.td, fontSize: '11px' }}>{r.publisherEmail}</td>
                                <td style={S.td}>
                                    {r.zone ? (
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '12px' }}>{r.zone.name}</div>
                                            <div style={{ fontSize: '11px', color: '#334155' }}>{r.zone.siteName}</div>
                                        </div>
                                    ) : <span style={{ color: '#334155' }}>—</span>}
                                </td>
                                <td style={S.td}>
                                    {r.campaign ? (
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '12px', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.campaign.name}</div>
                                            <div style={{ fontSize: '11px', color: '#334155' }}>{r.campaign.advertiserEmail}</div>
                                        </div>
                                    ) : <span style={{ fontSize: '11px', color: '#334155' }}>Not identified</span>}
                                </td>
                                <td style={S.td}>
                                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                                        {REASON_LABELS[r.reason] || r.reason}
                                    </span>
                                </td>
                                <td style={{ ...S.td, maxWidth: '180px' }}>
                                    <p style={{ fontSize: '11px', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{r.description || '—'}</p>
                                    {r.adminNote && <p style={{ fontSize: '11px', color: '#10b981', margin: '4px 0 0', fontStyle: 'italic' }}>Note: {r.adminNote}</p>}
                                </td>
                                <td style={{ ...S.td, textAlign: 'center' }}><StatusBadge status={r.status} /></td>
                                <td style={{ ...S.td, textAlign: 'center', fontSize: '11px', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                                <td style={{ ...S.td, textAlign: 'center' }}>
                                    {r.status === 'OPEN' && (
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            {r.campaignId && (
                                                <button onClick={async () => {
                                                    if (confirm('Pause this campaign and resolve the report?')) {
                                                        await adminAPI.pauseCampaignFromReport(r.id, '');
                                                        onAction();
                                                    }
                                                }} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(245,158,11,0.12)', border: 'none', color: '#f59e0b', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                                    <Pause size={11} /> Pause
                                                </button>
                                            )}
                                            <button onClick={() => setResolveTarget(r)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(139,92,246,0.12)', border: 'none', color: '#a78bfa', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                                <CheckCircle size={11} /> Review
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {resolveTarget && <ResolveModal report={resolveTarget} onClose={() => setResolveTarget(null)} onSave={onAction} />}
        </>
    );
}

// ── Main Page ───────────────────────────────────────────────────────────────────
export default function AdminAdQualityPage() {
    const [tab, setTab] = useState('fraud');
    const [overview, setOverview] = useState(null);
    const [signals, setSignals] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('OPEN');
    const [days, setDays] = useState(7);

    const load = async () => {
        setLoading(true);
        try {
            const [ov, sig, rep] = await Promise.all([
                adminAPI.getAdQualityOverview(),
                adminAPI.getFraudSignals({ days }),
                adminAPI.getAdQualityReports({ status: statusFilter, limit: 50 }),
            ]);
            setOverview(ov);
            setSignals(sig.signals || []);
            setReports(rep.reports || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [statusFilter, days]);

    const handlePauseFraud = async (campaignId) => {
        if (!confirm('Pause this campaign?')) return;
        try { await adminAPI.pauseFraudCampaign(campaignId); load(); }
        catch (e) { alert(e.message); }
    };

    const TABS = [
        { id: 'fraud',   label: 'Fraud Signals',     icon: AlertTriangle, count: overview?.fraudFlaggedCampaigns },
        { id: 'reports', label: 'Publisher Reports',  icon: Flag,          count: overview?.openReports },
    ];

    return (
        <>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={S.page}>
                {/* Header */}
                <div style={S.header}>
                    <div>
                        <div style={S.title}>
                            <Shield size={20} color="#8b5cf6" /> Ad Quality
                        </div>
                        <div style={S.sub}>Monitor fraud signals and publisher-reported ad issues</div>
                    </div>
                    <button onClick={load} style={S.refreshBtn}>
                        <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh
                    </button>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                    <StatCard icon={Flag}          label="Open Reports"             value={overview?.openReports}             color="#f59e0b" />
                    <StatCard icon={AlertTriangle}  label="Fraud-Flagged Campaigns"  value={overview?.fraudFlaggedCampaigns}   color="#ef4444" />
                    <StatCard icon={CheckCircle}    label="Resolved This Week"        value={overview?.resolvedThisWeek}        color="#10b981" />
                    <StatCard icon={Shield}         label="Total Reports"             value={overview?.totalReports}            color="#8b5cf6" />
                </div>

                {/* Tab Panel */}
                <div style={S.panel}>
                    <div style={S.tabBar}>
                        {TABS.map(t => {
                            const Icon = t.icon;
                            const active = tab === t.id;
                            return (
                                <button key={t.id} onClick={() => setTab(t.id)} style={S.tabBtn(active)}>
                                    <Icon size={13} />
                                    {t.label}
                                    {t.count > 0 && <span style={S.badge(active)}>{t.count}</span>}
                                </button>
                            );
                        })}

                        {/* Filters */}
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 6px' }}>
                            {tab === 'fraud' && (
                                <div style={{ position: 'relative' }}>
                                    <select value={days} onChange={e => setDays(e.target.value)} style={S.select}>
                                        <option value={7}>Last 7 days</option>
                                        <option value={14}>Last 14 days</option>
                                        <option value={30}>Last 30 days</option>
                                    </select>
                                    <ChevronDown size={11} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                                </div>
                            )}
                            {tab === 'reports' && (
                                <div style={{ position: 'relative' }}>
                                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={S.select}>
                                        <option value="">All statuses</option>
                                        <option value="OPEN">Open</option>
                                        <option value="RESOLVED">Resolved</option>
                                        <option value="DISMISSED">Dismissed</option>
                                    </select>
                                    <ChevronDown size={11} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {tab === 'fraud'   && <FraudSignalsTab    signals={signals} loading={loading} onPause={handlePauseFraud} />}
                    {tab === 'reports' && <PublisherReportsTab reports={reports} loading={loading} onAction={load} />}
                </div>
            </div>
        </>
    );
}
