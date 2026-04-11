'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';
import Badge from '@/components/admin/Badge';
import SlidePanel from '@/components/admin/SlidePanel';
import EmptyState from '@/components/admin/EmptyState';
import { useToast } from '@/components/admin/Toast';

const S = {
    page: { padding: '24px 28px', minHeight: '100vh', background: '#05050f', fontFamily: 'DM Sans, sans-serif' },
    card: { background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' },
    th: { padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' },
    td: { padding: '13px 16px', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' },
};

const STATUSES = ['All', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'SUSPENDED'];
const fmt = (n) => '$' + Number(n || 0).toFixed(2);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';

const REJECT_REASONS = [
    'Inappropriate content',
    'Broken or dead URL',
    'Duplicate site',
    'Poor quality content',
    'Violates terms of service',
    'Insufficient traffic data',
];

export default function SitesPage() {
    const [sites, setSites] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusTab, setStatusTab] = useState('All');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [rejectModal, setRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (statusTab !== 'All') params.status = statusTab;
            if (search) params.search = search;
            const d = await adminAPI.getSites(params);
            setSites(d.sites || []);
            setPagination(d.pagination || {});
        } catch (e) { toast.error('Failed to load sites'); }
        finally { setLoading(false); }
    }, [page, statusTab, search]);

    useEffect(() => { load(); }, [load]);

    const approve = async (id) => {
        setActionLoading(true);
        try {
            await adminAPI.approveSite(id);
            toast.success('Site approved — publisher notified');
            setSelected(null);
            await load();
        } catch (e) { toast.error(e.message || 'Failed to approve'); }
        finally { setActionLoading(false); }
    };

    const reject = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await adminAPI.rejectSite(selected.id, rejectReason || REJECT_REASONS[0]);
            toast.success('Site rejected');
            setSelected(null); setRejectModal(false); setRejectReason('');
            await load();
        } catch (e) { toast.error(e.message || 'Failed to reject'); }
        finally { setActionLoading(false); }
    };

    return (
        <div style={S.page}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Geist Mono, monospace', marginBottom: '4px' }}>Site Management</h1>
                    <p style={{ fontSize: '13px', color: '#475569' }}>{pagination.total || 0} total sites</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {STATUSES.map(s => (
                    <button key={s} onClick={() => { setStatusTab(s); setPage(1); }}
                        style={{ padding: '9px 14px', fontSize: '12px', fontWeight: 700, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', color: statusTab === s ? '#c4b5fd' : '#475569', borderBottom: statusTab === s ? '2px solid #8b5cf6' : '2px solid transparent', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                        {s.replace('_', ' ').replace('PENDING APPROVAL', 'Pending Review')}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by site name or URL..." style={{ flex: 1, padding: '9px 14px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            </div>

            <div style={{ ...S.card, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Site', 'Publisher', 'Status', 'Category', 'Zones', 'Impressions', 'Created', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} style={S.td}><div style={{ height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} /></td>)}</tr>
                            ))
                        ) : sites.length === 0 ? (
                            <tr><td colSpan={8}><EmptyState icon="sites" title="No sites found" message="Try adjusting filters." /></td></tr>
                        ) : (
                            sites.map(site => (
                                <tr key={site.id} onClick={() => setSelected(site)} style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={S.td}>
                                        <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '2px' }}>{site.name}</div>
                                        <div style={{ fontSize: '11px', color: '#475569', wordBreak: 'break-all', maxWidth: '180px' }}>{site.url}</div>
                                    </td>
                                    <td style={{ ...S.td, fontSize: '12px' }}>{site.publisherId?.slice(0, 8)}...</td>
                                    <td style={S.td}><Badge value={site.status} size="xs" /></td>
                                    <td style={{ ...S.td, fontSize: '12px', textTransform: 'capitalize' }}>{site.category || '—'}</td>
                                    <td style={{ ...S.td, textAlign: 'center', fontFamily: 'Geist Mono, monospace' }}>{site._count?.zones || 0}</td>
                                    <td style={{ ...S.td, fontFamily: 'Geist Mono, monospace', fontSize: '12px' }}>
                                        {Number(site.totalImpressions || 0).toLocaleString()}
                                    </td>
                                    <td style={S.td}>{fmtDate(site.createdAt)}</td>
                                    <td style={S.td} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {site.status === 'PENDING_APPROVAL' && (
                                                <>
                                                    <button onClick={() => approve(site.id)} style={{ padding: '4px 8px', borderRadius: '5px', border: 'none', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✓</button>
                                                    <button onClick={() => { setSelected(site); setRejectModal(true); }} style={{ padding: '4px 8px', borderRadius: '5px', border: 'none', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✗</button>
                                                </>
                                            )}
                                            <button onClick={() => setSelected(site)} style={{ padding: '4px 8px', borderRadius: '5px', border: 'none', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>View</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {pagination.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '12px', color: '#475569' }}>Page {page} of {pagination.pages} · {pagination.total} sites</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit' }}>← Prev</button>
                            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit' }}>Next →</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Site Detail Panel */}
            <SlidePanel isOpen={!!selected && !rejectModal} onClose={() => setSelected(null)} title={selected?.name} subtitle={selected?.url} width="540px">
                {selected && (
                    <div style={{ padding: '24px' }}>
                        {selected.rejectionReason && (
                            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', fontSize: '13px', color: '#fca5a5' }}>
                                <strong>Rejection Reason:</strong> {selected.rejectionReason}
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            {[
                                ['Status', <Badge key="s" value={selected.status} />],
                                ['Category', selected.category || '—'],
                                ['Zones', selected._count?.zones || 0],
                                ['Total Impressions', Number(selected.totalImpressions || 0).toLocaleString()],
                                ['Monthly Visits', Number(selected.monthlyVisits || 0).toLocaleString()],
                                ['Revenue', fmt(selected.totalRevenue)],
                                ['Created', fmtDate(selected.createdAt)],
                                ['Language', selected.language || '—'],
                            ].map(([label, val]) => (
                                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px 14px' }}>
                                    <div style={{ fontSize: '10px', color: '#475569', marginBottom: '5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8' }}>{val}</div>
                                </div>
                            ))}
                        </div>

                        {selected.description && (
                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                                <div style={{ fontSize: '10px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Description</div>
                                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{selected.description}</p>
                            </div>
                        )}

                        {selected.status === 'PENDING_APPROVAL' && (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button onClick={() => approve(selected.id)} disabled={actionLoading}
                                    style={{ flex: 1, padding: '10px', borderRadius: '9px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1 }}>
                                    {actionLoading ? 'Processing...' : '✓ Approve Site'}
                                </button>
                                <button onClick={() => setRejectModal(true)}
                                    style={{ flex: 1, padding: '10px', borderRadius: '9px', border: 'none', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                    ✗ Reject
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </SlidePanel>

            {/* Reject Modal */}
            {rejectModal && selected && (
                <div onClick={e => e.target === e.currentTarget && setRejectModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#0f0f24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', fontFamily: 'DM Sans, sans-serif' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>Reject Site</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Rejecting: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{selected.name}</span></div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                            {REJECT_REASONS.map(r => (
                                <button key={r} onClick={() => setRejectReason(r)}
                                    style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: rejectReason === r ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)', color: rejectReason === r ? '#f87171' : '#64748b', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: rejectReason === r ? 700 : 400 }}>
                                    {r}
                                </button>
                            ))}
                        </div>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={2} placeholder="Or type a custom reason..."
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#f1f5f9', fontSize: '14px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '16px' }} />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setRejectModal(false)} style={{ padding: '9px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                            <button onClick={reject} disabled={actionLoading || !rejectReason.trim()} style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, opacity: (!rejectReason.trim() || actionLoading) ? 0.5 : 1 }}>
                                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
