'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';
import Badge from '@/components/admin/Badge';
import SlidePanel from '@/components/admin/SlidePanel';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { useToast } from '@/components/admin/Toast';

const S = {
    page: { padding: '24px 28px', minHeight: '100vh', background: '#05050f', fontFamily: 'DM Sans, sans-serif' },
    card: { background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' },
    th: { padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' },
    td: { padding: '13px 16px', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' },
};

const STATUSES = ['All', 'Active', 'Suspended', 'Banned', 'Pending'];
const ROLES = ['All', 'PUBLISHER', 'ADVERTISER', 'ADMIN'];

function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'; }
function formatMoney(n) { return '$' + Number(n || 0).toFixed(2); }

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusTab, setStatusTab] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailTab, setDetailTab] = useState('overview');
    const [confirmDialog, setConfirmDialog] = useState({ open: false });
    const [balanceModal, setBalanceModal] = useState({ open: false });
    const [balanceAmount, setBalanceAmount] = useState('');
    const [balanceType, setBalanceType] = useState('credit');
    const [balanceReason, setBalanceReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20, sort };
            if (statusTab !== 'All') params.status = statusTab.toUpperCase();
            if (roleFilter !== 'All') params.role = roleFilter;
            if (search) params.search = search;
            const d = await adminAPI.getUsers(params);
            setUsers(d.users || []);
            setPagination(d.pagination || {});
        } catch (e) { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    }, [page, statusTab, roleFilter, search, sort]);

    useEffect(() => { load(); }, [load]);

    const openDetail = async (user) => {
        setSelected(user);
        setDetailTab('overview');
        setDetailLoading(true);
        try {
            const d = await adminAPI.getUserDetail(user.id);
            setDetail(d.user);
        } catch (e) { toast.error('Failed to load user details'); }
        finally { setDetailLoading(false); }
    };

    const changeStatus = async (status) => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await adminAPI.updateUserStatus(selected.id, status);
            toast.success(`User ${status.toLowerCase()}`);
            setConfirmDialog({ open: false });
            await load();
            if (detail) setDetail(prev => ({ ...prev, status }));
        } catch (e) { toast.error(e.message || 'Failed to update status'); }
        finally { setActionLoading(false); }
    };

    const adjustBalance = async () => {
        if (!balanceAmount || isNaN(parseFloat(balanceAmount))) { toast.warning('Enter a valid amount'); return; }
        setActionLoading(true);
        try {
            const r = await adminAPI.adjustUserBalance(selected.id, balanceAmount, balanceType, balanceReason);
            toast.success(`Balance ${balanceType}ed: $${balanceAmount}`);
            setBalanceModal({ open: false });
            setBalanceAmount(''); setBalanceReason(''); setBalanceType('credit');
            await load();
        } catch (e) { toast.error(e.message || 'Failed to adjust balance'); }
        finally { setActionLoading(false); }
    };

    const user = detail || selected;

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Geist Mono, monospace', marginBottom: '4px' }}>User Management</h1>
                    <p style={{ fontSize: '13px', color: '#475569' }}>{pagination.total || 0} total users</p>
                </div>
            </div>

            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
                {STATUSES.map(s => (
                    <button key={s} onClick={() => { setStatusTab(s); setPage(1); }}
                        style={{
                            padding: '9px 14px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer',
                            background: 'transparent', fontFamily: 'inherit',
                            color: statusTab === s ? '#c4b5fd' : '#475569',
                            borderBottom: statusTab === s ? '2px solid #8b5cf6' : '2px solid transparent',
                            transition: 'all 0.15s',
                        }}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by email..." style={{ flex: 1, minWidth: '200px', padding: '9px 14px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer' }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '9px 12px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer' }}>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="balance">Highest Balance</option>
                    <option value="lastLogin">Last Login</option>
                </select>
            </div>

            {/* Table */}
            <div style={{ ...S.card, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['User', 'Role', 'Status', 'Balance', 'Joined', 'Last Login', 'Actions'].map(h => (
                                <th key={h} style={S.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <td key={j} style={S.td}>
                                            <div style={{ height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '0' }}><EmptyState icon="users" title="No users found" message="Try adjusting your filters" /></td></tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id}
                                    onClick={() => openDetail(u)}
                                    style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={S.td}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '13px' }}>{u.email}</div>
                                            <div style={{ fontSize: '11px', color: '#475569' }}>{u.publisher?.companyName || u.advertiser?.companyName || '—'}</div>
                                        </div>
                                    </td>
                                    <td style={S.td}><Badge value={u.role} size="xs" /></td>
                                    <td style={S.td}><Badge value={u.status} size="xs" /></td>
                                    <td style={S.td}>
                                        <span style={{ fontFamily: 'Geist Mono, monospace', color: '#34d399', fontWeight: 600 }}>
                                            {formatMoney(u.balance)}
                                        </span>
                                    </td>
                                    <td style={S.td}>{formatDate(u.createdAt)}</td>
                                    <td style={S.td}>{formatDate(u.lastLogin)}</td>
                                    <td style={S.td} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => openDetail(u)} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(139,92,246,0.12)', border: 'none', color: '#a78bfa', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '12px', color: '#475569' }}>
                            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: p === page ? '#8b5cf6' : 'rgba(255,255,255,0.05)', color: p === page ? '#fff' : '#64748b', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: p === page ? 700 : 400 }}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* User Detail Slide Panel */}
            <SlidePanel isOpen={!!selected} onClose={() => { setSelected(null); setDetail(null); }} title={detail?.email || selected?.email} subtitle={`Role: ${detail?.role || selected?.role} · Status: ${detail?.status || selected?.status}`} width="680px">
                {detailLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>Loading details...</div>
                ) : detail ? (
                    <div style={{ padding: '0' }}>
                        {/* Tab nav */}
                        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px' }}>
                            {[['overview', 'Overview'], ['transactions', 'Transactions'], ['portfolio', 'Campaigns/Sites'], ['tickets', 'Tickets']].map(([k, l]) => (
                                <button key={k} onClick={() => setDetailTab(k)}
                                    style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, border: 'none', background: 'transparent', borderBottom: detailTab === k ? '2px solid #8b5cf6' : '2px solid transparent', color: detailTab === k ? '#c4b5fd' : '#475569', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                                    {l}
                                </button>
                            ))}
                        </div>

                        <div style={{ padding: '24px' }}>
                            {detailTab === 'overview' && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                        {[
                                            ['Balance', formatMoney(detail.balance), '#34d399'],
                                            ['Pending', formatMoney(detail.pendingBalance), '#f59e0b'],
                                            ['Joined', formatDate(detail.createdAt), '#94a3b8'],
                                            ['Last Login', formatDate(detail.lastLogin), '#94a3b8'],
                                        ].map(([label, val, color]) => (
                                            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px 16px' }}>
                                                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                                                <div style={{ fontSize: '18px', fontWeight: 800, color, fontFamily: 'Geist Mono, monospace' }}>{val}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                        {detail.status !== 'ACTIVE' && (
                                            <button onClick={() => setConfirmDialog({ open: true, status: 'ACTIVE', label: 'Activate', variant: 'success' })} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Activate</button>
                                        )}
                                        {detail.status !== 'SUSPENDED' && (
                                            <button onClick={() => setConfirmDialog({ open: true, status: 'SUSPENDED', label: 'Suspend', variant: 'warning' })} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'rgba(245,158,11,0.1)', color: '#fbbf24', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⏸ Suspend</button>
                                        )}
                                        {detail.status !== 'BANNED' && (
                                            <button onClick={() => setConfirmDialog({ open: true, status: 'BANNED', label: 'Ban', variant: 'danger' })} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🚫 Ban</button>
                                        )}
                                        <button onClick={() => setBalanceModal({ open: true })} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'rgba(14,165,233,0.1)', color: '#38bdf8', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>💰 Adjust Balance</button>
                                    </div>
                                </div>
                            )}

                            {detailTab === 'transactions' && (
                                <div>
                                    {(detail.transactions || []).length === 0 ? <EmptyState icon="data" title="No transactions" message="This user has no transaction history." /> :
                                        detail.transactions.map(t => (
                                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <div>
                                                    <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>{t.type}</div>
                                                    <div style={{ fontSize: '11px', color: '#475569' }}>{t.description} · {formatDate(t.createdAt)}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: '14px', fontWeight: 700, color: t.type === 'WITHDRAWAL' ? '#f87171' : '#34d399' }}>
                                                        {t.type === 'WITHDRAWAL' ? '-' : '+'}{formatMoney(t.amount)}
                                                    </span>
                                                    <Badge value={t.status || 'COMPLETED'} size="xs" />
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}

                            {detailTab === 'portfolio' && (
                                <div>
                                    {detail.role === 'PUBLISHER' && detail.publisher?.sites ? (
                                        detail.publisher.sites.map(s => (
                                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>{s.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#475569' }}>{s.url} · {s.zones?.length || 0} zones</div>
                                                </div>
                                                <Badge value={s.status} size="xs" />
                                            </div>
                                        ))
                                    ) : detail.role === 'ADVERTISER' && detail.advertiser?.campaigns ? (
                                        detail.advertiser.campaigns.map(c => (
                                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>{c.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#475569' }}>Budget: {formatMoney(c.totalBudget)} · Spent: {formatMoney(c.totalSpent)}</div>
                                                </div>
                                                <Badge value={c.status} size="xs" />
                                            </div>
                                        ))
                                    ) : <EmptyState icon="data" title="No data" message="Nothing here yet." />}
                                </div>
                            )}

                            {detailTab === 'tickets' && (
                                <div>
                                    {(detail.supportTickets || []).length === 0 ? <EmptyState icon="tickets" title="No tickets" message="This user hasn't opened any support tickets." /> :
                                        detail.supportTickets.map(t => (
                                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                                                <div style={{ fontSize: '13px', color: '#94a3b8' }}>{t.subject}</div>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <Badge value={t.priority} size="xs" dot={false} />
                                                    <Badge value={t.status} size="xs" />
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </SlidePanel>

            {/* Confirm Status Change */}
            <ConfirmDialog
                isOpen={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false })}
                onConfirm={() => changeStatus(confirmDialog.status)}
                title={`${confirmDialog.label} User?`}
                message={`Are you sure you want to ${(confirmDialog.label || '').toLowerCase()} ${selected?.email}?`}
                confirmText={confirmDialog.label}
                variant={confirmDialog.variant || 'danger'}
                loading={actionLoading}
            />

            {/* Balance Adjust Modal */}
            {balanceModal.open && (
                <div onClick={e => e.target === e.currentTarget && setBalanceModal({ open: false })} style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#0f0f24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px', fontFamily: 'DM Sans, sans-serif' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>Adjust Balance</h3>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                            {['credit', 'debit'].map(t => <button key={t} onClick={() => setBalanceType(t)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: balanceType === t ? (t === 'credit' ? '#10b981' : '#ef4444') : 'rgba(255,255,255,0.05)', color: balanceType === t ? '#fff' : '#64748b', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>{t === 'credit' ? '+ Credit' : '- Debit'}</button>)}
                        </div>
                        <input type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} placeholder="Amount (USD)" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'inherit', marginBottom: '12px', boxSizing: 'border-box' }} />
                        <input type="text" value={balanceReason} onChange={e => setBalanceReason(e.target.value)} placeholder="Reason (optional)" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'inherit', marginBottom: '20px', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setBalanceModal({ open: false })} style={{ padding: '9px 18px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                            <button onClick={adjustBalance} disabled={actionLoading} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: balanceType === 'credit' ? '#10b981' : '#ef4444', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, opacity: actionLoading ? 0.7 : 1 }}>
                                {actionLoading ? 'Processing...' : `${balanceType === 'credit' ? 'Add' : 'Deduct'} $${balanceAmount || '0'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
        </div>
    );
}
