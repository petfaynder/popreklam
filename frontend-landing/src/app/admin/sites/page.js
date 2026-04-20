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

const CATEGORIES = ['Entertainment', 'News', 'Technology', 'Sports', 'Finance', 'Health', 'Education', 'Gaming', 'Adult', 'Other'];
const SITE_STATUSES = ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'];
const inp = { width: '100%', padding: '8px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

export default function SitesPage() {
    const [sites, setSites] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusTab, setStatusTab] = useState('All');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [editForm, setEditForm] = useState(null);
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

    const openDetail = (site) => {
        setSelected(site);
        setEditForm({ name: site.name || '', category: site.category || '', description: site.description || '', status: site.status || 'PENDING' });
    };

    const saveEdit = async () => {
        if (!selected || !editForm) return;
        setActionLoading(true);
        try {
            const updated = await adminAPI.updateSite(selected.id, editForm);
            toast.success('Site updated successfully');
            setSelected(prev => ({ ...prev, ...editForm }));
            await load();
        } catch (e) { toast.error(e.message || 'Failed to update site'); }
        finally { setActionLoading(false); }
    };

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

    const forceVerify = async (id) => {
        setActionLoading(true);
        try {
            await adminAPI.forceVerifySite(id);
            toast.success('Site ownership marked as verified');
            setSelected(prev => prev ? { ...prev, verifiedAt: new Date().toISOString() } : prev);
            await load();
        } catch (e) { toast.error(e.message || 'Failed to verify'); }
        finally { setActionLoading(false); }
    };

    const forceVerifyAdsTxt = async (id) => {
        setActionLoading(true);
        try {
            await adminAPI.forceVerifyAdsTxt(id);
            toast.success('ads.txt marked as verified');
            setSelected(prev => prev ? { ...prev, adsTxtVerifiedAt: new Date().toISOString() } : prev);
            await load();
        } catch (e) { toast.error(e.message || 'Failed to verify ads.txt'); }
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
                                <tr key={site.id} onClick={() => openDetail(site)} style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={S.td}>
                                        <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '2px' }}>{site.name}</div>
                                        <a href={site.url.startsWith('http') ? site.url : 'https://' + site.url} target="_blank" rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            style={{ fontSize: '11px', color: '#6366f1', wordBreak: 'break-all', maxWidth: '180px', textDecoration: 'none', display: 'block' }}
                                            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                            onMouseLeave={e => e.target.style.textDecoration = 'none'}>
                                            {site.url}
                                        </a>
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
                                            {(site.status === 'PENDING_APPROVAL' || site.status === 'PENDING') && (
                                                <>
                                                    <button onClick={() => approve(site.id)} style={{ padding: '4px 8px', borderRadius: '5px', border: 'none', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✓</button>
                                                    <button onClick={() => { openDetail(site); setRejectModal(true); }} style={{ padding: '4px 8px', borderRadius: '5px', border: 'none', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✗</button>
                                                </>
                                            )}
                                            <button onClick={() => openDetail(site)} style={{ padding: '4px 8px', borderRadius: '5px', border: 'none', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>View</button>
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
            <SlidePanel isOpen={!!selected && !rejectModal} onClose={() => setSelected(null)} title={selected?.name} subtitle={
                selected ? <a href={selected.url?.startsWith('http') ? selected.url : 'https://' + selected.url} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '12px' }} onMouseEnter={e => e.target.style.textDecoration='underline'} onMouseLeave={e => e.target.style.textDecoration='none'}>↗ {selected.url}</a> : null
            } width="540px">
                {selected && editForm && (
                    <div style={{ padding: '24px' }}>
                        {selected.rejectionReason && (
                            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', fontSize: '13px', color: '#fca5a5' }}>
                                <strong>Rejection Reason:</strong> {selected.rejectionReason}
                            </div>
                        )}

                        {/* Stats row (read-only) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            {[
                                ['Zones', selected._count?.zones || selected.zones?.length || 0],
                                ['Impressions', Number(selected.totalImpressions || 0).toLocaleString()],
                                ['Created', fmtDate(selected.createdAt)],
                            ].map(([label, val]) => (
                                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '9px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{label}</div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>{val}</div>
                                </div>
                            ))}
                        </div>

                        {/* Edit Form */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                            <div style={{ fontSize: '10px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>Edit Site Details</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Site Name</label>
                                    <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={inp} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Category</label>
                                        <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                                            <option value="">— Select —</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Status</label>
                                        <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                                            {SITE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Description</label>
                                    <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' }} />
                                </div>
                                <button onClick={saveEdit} disabled={actionLoading} style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1, alignSelf: 'flex-end' }}>
                                    {actionLoading ? 'Saving...' : '💾 Save Changes'}
                                </button>
                            </div>
                        </div>

                        {/* Verification Status */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                            <div style={{ fontSize: '10px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>Verification Status</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        {selected.verifiedAt
                                            ? <span style={{ color: '#34d399' }}>✓ Ownership verified — {fmtDate(selected.verifiedAt)} ({selected.verificationMethod || 'ADMIN'})</span>
                                            : <span style={{ color: '#f87171' }}>✗ Ownership not verified</span>}
                                    </span>
                                    {!selected.verifiedAt && (
                                        <button onClick={() => forceVerify(selected.id)} disabled={actionLoading}
                                            style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1 }}>
                                            Force Verify
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        {selected.adsTxtVerifiedAt
                                            ? <span style={{ color: '#34d399' }}>✓ ads.txt verified — {fmtDate(selected.adsTxtVerifiedAt)}</span>
                                            : <span style={{ color: '#f59e0b' }}>⚠ ads.txt not verified</span>}
                                    </span>
                                    {!selected.adsTxtVerifiedAt && (
                                        <button onClick={() => forceVerifyAdsTxt(selected.id)} disabled={actionLoading}
                                            style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.6 : 1 }}>
                                            Force Verify ads.txt
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {selected.status === 'PENDING_APPROVAL' || selected.status === 'PENDING' ? (
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
                        ) : null}
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
