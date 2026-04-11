'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';
import Badge from '@/components/admin/Badge';
import SlidePanel from '@/components/admin/SlidePanel';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { useToast } from '@/components/admin/Toast';
import StatCard from '@/components/admin/StatCard';

const S = {
    page: { padding: '24px 28px', minHeight: '100vh', background: '#05050f', fontFamily: 'DM Sans, sans-serif' },
    card: { background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' },
    th: { padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' },
    td: { padding: '13px 16px', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' },
};

const STATUSES = ['All', 'PENDING', 'COMPLETED', 'FAILED'];  // PaymentStatus enum'a göre
const TYPES = ['All', 'WITHDRAWAL', 'DEPOSIT'];
const fmt = (n) => '$' + Number(n || 0).toFixed(2);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [pagination, setPagination] = useState({});
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusTab, setStatusTab] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (statusTab !== 'All') params.status = statusTab;
            if (typeFilter !== 'All') params.type = typeFilter;
            if (search) params.search = search;
            const d = await adminAPI.getPayments(params);
            setPayments(d.payments || []);
            setPagination(d.pagination || {});
            setSummary(d.summary || {});
        } catch (e) { toast.error('Failed to load payments'); }
        finally { setLoading(false); }
    }, [page, statusTab, typeFilter, search]);

    useEffect(() => { load(); }, [load]);

    const approve = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await adminAPI.approvePayment(selected.id);
            toast.success(`Payment approved — ${fmt(selected.amount)} processed`);
            setSelected(null); setConfirmAction(null);
            await load();
        } catch (e) { toast.error(e.message || 'Failed to approve'); }
        finally { setActionLoading(false); }
    };

    const reject = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await adminAPI.rejectPayment(selected.id, rejectReason || 'Does not meet requirements.');
            toast.success('Payment rejected');
            setSelected(null); setConfirmAction(null); setRejectReason('');
            await load();
        } catch (e) { toast.error(e.message || 'Failed to reject'); }
        finally { setActionLoading(false); }
    };

    // Badge value normalizer — schema uses COMPLETED not APPROVED
    const statusLabel = (status) => {
        if (status === 'COMPLETED') return 'APPROVED';
        if (status === 'FAILED') return 'REJECTED';
        return status;
    };

    return (
        <div style={S.page}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Geist Mono, monospace', marginBottom: '4px' }}>Payment Management</h1>
                    <p style={{ fontSize: '13px', color: '#475569' }}>{pagination.total || 0} total transactions</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                <StatCard label="Pending Withdrawals" value={summary.pendingCount} icon="⏳" color="#f59e0b" loading={loading} />
                <StatCard label="Pending Amount" value={summary.pendingAmount?.toFixed(2)} prefix="$" icon="💸" color="#f59e0b" loading={loading} />
                <StatCard label="Approved (30d)" value={summary.approvedTotal?.toFixed(2)} prefix="$" icon="✓" color="#10b981" loading={loading} />
                <StatCard label="Rejected (30d)" value={summary.rejectedCount} icon="✗" color="#ef4444" loading={loading} />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {STATUSES.map(s => (
                    <button key={s} onClick={() => { setStatusTab(s); setPage(1); }}
                        style={{ padding: '9px 14px', fontSize: '12px', fontWeight: 700, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', color: statusTab === s ? '#c4b5fd' : '#475569', borderBottom: statusTab === s ? '2px solid #8b5cf6' : '2px solid transparent', transition: 'all 0.15s' }}>
                        {s === 'COMPLETED' ? 'Approved' : s === 'FAILED' ? 'Rejected' : s}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by user email..." style={{ flex: 1, padding: '9px 14px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer' }}>
                    {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
                </select>
            </div>

            {/* Table */}
            <div style={{ ...S.card, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['User', 'Type', 'Amount', 'Method', 'Status', 'Requested', 'Notes', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} style={S.td}><div style={{ height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} /></td>)}</tr>
                            ))
                        ) : payments.length === 0 ? (
                            <tr><td colSpan={8}><EmptyState icon="payments" title="No payments found" message="Try adjusting filters." /></td></tr>
                        ) : (
                            payments.map(p => (
                                <tr key={p.id}
                                    style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={S.td}>
                                        <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '13px' }}>{p.user?.email}</div>
                                        <div style={{ fontSize: '11px', color: '#475569' }}><Badge value={p.user?.role} size="xs" /></div>
                                    </td>
                                    <td style={S.td}><Badge value={p.type} size="xs" dot={false} /></td>
                                    <td style={{ ...S.td, fontFamily: 'Geist Mono, monospace', fontWeight: 700 }}>
                                        <span style={{ color: p.type === 'WITHDRAWAL' ? '#f87171' : '#34d399' }}>
                                            {p.type === 'WITHDRAWAL' ? '-' : '+'}{fmt(p.amount)}
                                        </span>
                                    </td>
                                    <td style={{ ...S.td, fontSize: '12px' }}>{p.method || '—'}</td>
                                    <td style={S.td}><Badge value={statusLabel(p.status)} size="xs" /></td>
                                    <td style={{ ...S.td, fontSize: '12px' }}>{fmtDate(p.createdAt)}</td>
                                    <td style={{ ...S.td, fontSize: '12px', maxWidth: '140px' }}>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                            {p.rejectionReason || '—'}
                                        </span>
                                    </td>
                                    <td style={S.td} onClick={e => e.stopPropagation()}>
                                        {p.status === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button onClick={() => { setSelected(p); setConfirmAction('approve'); }}
                                                    style={{ padding: '4px 8px', borderRadius: '5px', border: 'none', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✓</button>
                                                <button onClick={() => { setSelected(p); setConfirmAction('reject'); }}
                                                    style={{ padding: '4px 8px', borderRadius: '5px', border: 'none', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✗</button>
                                            </div>
                                        )}
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

            {/* Approve Confirm */}
            <ConfirmDialog
                isOpen={confirmAction === 'approve' && !!selected}
                onClose={() => { setSelected(null); setConfirmAction(null); }}
                onConfirm={approve}
                title="Approve Payment?"
                message={`Approve ${fmt(selected?.amount)} withdrawal for ${selected?.user?.email}? Funds will be released immediately.`}
                confirmText="Approve & Release Funds"
                variant="success"
                loading={actionLoading}
            />

            {/* Reject Modal */}
            {confirmAction === 'reject' && selected && (
                <div onClick={e => e.target === e.currentTarget && setConfirmAction(null)} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#0f0f24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', fontFamily: 'DM Sans, sans-serif' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>Reject Payment</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                            <span style={{ fontFamily: 'Geist Mono, monospace', color: '#f87171' }}>{fmt(selected.amount)}</span> from {selected.user?.email}
                        </div>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                            placeholder="Reason for rejection (sent to user)..."
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#f1f5f9', fontSize: '14px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '16px' }} />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setConfirmAction(null)} style={{ padding: '9px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                            <button onClick={reject} disabled={actionLoading} style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, opacity: actionLoading ? 0.7 : 1 }}>
                                {actionLoading ? 'Processing...' : 'Reject Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
