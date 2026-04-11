'use client';
import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
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

// CampaignStatus enum: ACTIVE, PAUSED, COMPLETED, PENDING_APPROVAL
// Note: Campaign model does NOT have REJECTED status in enum — filtered display only
const STATUSES = ['All', 'PENDING_APPROVAL', 'ACTIVE', 'PAUSED', 'COMPLETED'];
// Campaign uses adFormat (AdFormat enum), NOT adType
const AD_FORMATS = ['All', 'POPUNDER', 'POPUP', 'NATIVE', 'IN_PAGE_PUSH', 'DIRECT_LINK', 'BANNER_300x250', 'BANNER_728x90'];

const fmt = (n) => '$' + Number(n || 0).toFixed(2);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusTab, setStatusTab] = useState('All');
    const [format, setFormat] = useState('All');
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
            if (format !== 'All') params.adFormat = format; // schema field: adFormat
            if (search) params.search = search;
            const d = await adminAPI.getCampaigns(params);
            setCampaigns(d.campaigns || []);
            setPagination(d.pagination || {});
        } catch (e) { toast.error('Failed to load campaigns'); }
        finally { setLoading(false); }
    }, [page, statusTab, format, search]);

    useEffect(() => { load(); }, [load]);

    const approve = async (id) => {
        setActionLoading(true);
        try {
            await adminAPI.approveCampaign(id);
            toast.success('Campaign approved');
            setSelected(null);
            await load();
        } catch (e) { toast.error(e.message || 'Failed to approve'); }
        finally { setActionLoading(false); }
    };

    const reject = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await adminAPI.rejectCampaign(selected.id, rejectReason || 'Does not meet quality standards.');
            toast.success('Campaign rejected');
            setSelected(null); setRejectModal(false); setRejectReason('');
            await load();
        } catch (e) { toast.error(e.message || 'Failed to reject'); }
        finally { setActionLoading(false); }
    };

    const downloadCsv = async () => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/campaigns/export/csv`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `campaigns_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Campaigns exported successfully');
        } catch (e) {
            toast.error(e.message || 'Failed to export campaigns');
        } finally {
            setActionLoading(false);
        }
    };

    // Campaign.adFormat (AdFormat enum) — display helper
    const fmtAdFormat = (f) => (f || '').replace(/_/g, ' ').replace('BANNER ', 'Banner ');

    return (
        <div style={S.page}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Geist Mono, monospace', marginBottom: '4px' }}>Campaign Management</h1>
                    <p style={{ fontSize: '13px', color: '#475569' }}>{pagination.total || 0} total campaigns</p>
                </div>
                <button onClick={downloadCsv} disabled={actionLoading} style={{ padding: '9px 16px', borderRadius: '8px', background: '#8b5cf6', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: actionLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
                {STATUSES.map(s => (
                    <button key={s} onClick={() => { setStatusTab(s); setPage(1); }}
                        style={{
                            padding: '9px 12px', fontSize: '12px', fontWeight: 700, border: 'none',
                            background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
                            color: statusTab === s ? '#c4b5fd' : '#475569',
                            borderBottom: statusTab === s ? '2px solid #8b5cf6' : '2px solid transparent',
                            transition: 'all 0.15s',
                        }}>
                        {s === 'PENDING_APPROVAL' ? 'Pending Review' : s}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search campaigns..." style={{ flex: 1, minWidth: '200px', padding: '9px 14px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                <select value={format} onChange={e => { setFormat(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer' }}>
                    {AD_FORMATS.map(f => <option key={f} value={f}>{f === 'All' ? 'All Formats' : fmtAdFormat(f)}</option>)}
                </select>
            </div>

            {/* Table */}
            <div style={{ ...S.card, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Campaign', 'Advertiser', 'Format', 'Status', 'Budget', 'Spent', 'Created', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 8 }).map((_, j) => (
                                        <td key={j} style={S.td}><div style={{ height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} /></td>
                                    ))}
                                </tr>
                            ))
                        ) : campaigns.length === 0 ? (
                            <tr><td colSpan={8}><EmptyState icon="campaigns" title="No campaigns found" message="Try adjusting your filters." /></td></tr>
                        ) : (
                            campaigns.map(c => (
                                <tr key={c.id}
                                    onClick={() => setSelected(c)}
                                    style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={S.td}>
                                        <div style={{ maxWidth: '160px' }}>
                                            <div style={{ fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                                            <div style={{ fontSize: '11px', color: '#475569' }}>#{c.id?.slice(0, 8)}</div>
                                        </div>
                                    </td>
                                    {/* advertiserId from campaign.advertiserId */}
                                    <td style={S.td}><span style={{ fontSize: '12px' }}>{c.advertiserId?.slice(0, 8)}…</span></td>
                                    {/* adFormat — campaign schema field */}
                                    <td style={S.td}><Badge value={c.adFormat} size="xs" dot={false} /></td>
                                    <td style={S.td}><Badge value={c.status} size="xs" /></td>
                                    <td style={{ ...S.td, fontFamily: 'Geist Mono, monospace', color: '#94a3b8' }}>{fmt(c.totalBudget)}</td>
                                    <td style={{ ...S.td, fontFamily: 'Geist Mono, monospace', color: '#34d399' }}>{fmt(c.totalSpent)}</td>
                                    <td style={S.td}>{fmtDate(c.createdAt)}</td>
                                    <td style={S.td} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {c.status === 'PENDING_APPROVAL' && (
                                                <>
                                                    <button onClick={() => approve(c.id)} style={{ padding: '4px 8px', borderRadius: '5px', border: 'none', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✓</button>
                                                    <button onClick={() => { setSelected(c); setRejectModal(true); }} style={{ padding: '4px 8px', borderRadius: '5px', border: 'none', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✗</button>
                                                </>
                                            )}
                                            <button onClick={() => setSelected(c)} style={{ padding: '4px 8px', borderRadius: '5px', border: 'none', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>View</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {pagination.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '12px', color: '#475569' }}>Page {page} of {pagination.pages}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit' }}>← Prev</button>
                            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit' }}>Next →</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Campaign Detail Panel */}
            <SlidePanel isOpen={!!selected && !rejectModal} onClose={() => setSelected(null)} title={selected?.name} subtitle={`${selected?.adFormat || ''} · ${selected?.status || ''}`} width="560px">
                {selected && (
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            {[
                                ['Total Budget', fmt(selected.totalBudget), '#94a3b8'],
                                ['Total Spent', fmt(selected.totalSpent), '#34d399'],
                                ['Daily Budget', fmt(selected.dailyBudget), '#94a3b8'],
                                ['Daily Spent', fmt(selected.dailySpent), '#fbbf24'],
                                ['Bid Amount', `$${selected.bidAmount || 0}`, '#94a3b8'],
                                ['CPM Rate', `$${selected.cpmRate || 0}`, '#a78bfa'],
                                ['Ad Format', fmtAdFormat(selected.adFormat), '#38bdf8'],
                                ['Created', fmtDate(selected.createdAt), '#475569'],
                            ].map(([label, val, color]) => (
                                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px 14px' }}>
                                    <div style={{ fontSize: '10px', color: '#475569', marginBottom: '5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color, fontFamily: 'Geist Mono, monospace', wordBreak: 'break-all' }}>{val || '—'}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
                            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Target URL</div>
                            <div style={{ fontSize: '13px', color: '#38bdf8', wordBreak: 'break-all' }}>{selected.targetUrl || '—'}</div>
                        </div>

                        {selected.rejectionReason && (
                            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', fontSize: '13px', color: '#fca5a5' }}>
                                <strong>Rejection Reason:</strong> {selected.rejectionReason}
                            </div>
                        )}

                        {selected.status === 'PENDING_APPROVAL' && (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button onClick={() => approve(selected.id)} disabled={actionLoading}
                                    style={{ flex: 1, padding: '10px', borderRadius: '9px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1 }}>
                                    {actionLoading ? 'Processing...' : '✓ Approve Campaign'}
                                </button>
                                <button onClick={() => setRejectModal(true)} disabled={actionLoading}
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
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>Reject Campaign</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Rejecting: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{selected.name}</span></div>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                            placeholder="Reason for rejection (shown to advertiser)..."
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#f1f5f9', fontSize: '14px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '16px' }} />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setRejectModal(false)} style={{ padding: '9px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                            <button onClick={reject} disabled={actionLoading} style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, opacity: actionLoading ? 0.7 : 1 }}>
                                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
