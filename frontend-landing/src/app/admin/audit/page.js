'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';
import EmptyState from '@/components/admin/EmptyState';
import { useToast } from '@/components/admin/Toast';

const S = {
    page: { padding: '24px 28px', minHeight: '100vh', background: '#05050f', fontFamily: 'DM Sans, sans-serif' },
    card: { background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' },
    th: { padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' },
    td: { padding: '12px 16px', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'top' },
};

// AuditLog schema fields: adminId, action, entityType, entityId, details, ip
const ACTION_CONFIGS = {
    APPROVE_CAMPAIGN: { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    REJECT_CAMPAIGN: { icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
    APPROVE_SITE: { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    REJECT_SITE: { icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
    SUSPEND_USER: { icon: '⏸', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    BAN_USER: { icon: '🚫', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    ACTIVATE_USER: { icon: '▶', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    APPROVE_PAYMENT: { icon: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    REJECT_PAYMENT: { icon: '💸', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
    ADJUST_BALANCE: { icon: '⚖', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
    UPDATE_SETTING: { icon: '⚙️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
    REPLY_TICKET: { icon: '💬', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
    DEFAULT: { icon: '📝', color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
};

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function MetaBadge({ data }) {
    if (!data || typeof data !== 'object') return null;
    const entries = Object.entries(data).slice(0, 3);
    if (!entries.length) return null;
    return (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '4px' }}>
            {entries.map(([k, v]) => (
                <span key={k} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px', color: '#475569' }}>
                    {k}: <span style={{ color: '#94a3b8' }}>{String(v).slice(0, 24)}</span>
                </span>
            ))}
        </div>
    );
}

export default function AuditPage() {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [action, setAction] = useState('');
    const [page, setPage] = useState(1);
    const toast = useToast();

    const ACTIONS = [
        '', 'APPROVE_CAMPAIGN', 'REJECT_CAMPAIGN', 'APPROVE_SITE', 'REJECT_SITE',
        'BAN_USER', 'SUSPEND_USER', 'ACTIVATE_USER', 'APPROVE_PAYMENT', 'REJECT_PAYMENT',
        'ADJUST_BALANCE', 'UPDATE_SETTING', 'REPLY_TICKET',
    ];

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 30 };
            if (search) params.search = search;
            if (action) params.action = action;
            const d = await adminAPI.getAuditLog(params);
            setLogs(d.logs || []);
            setPagination(d.pagination || {});
        } catch (e) { toast.error('Failed to load audit log'); }
        finally { setLoading(false); }
    }, [page, search, action]);

    useEffect(() => { load(); }, [load]);

    return (
        <div style={S.page}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Geist Mono, monospace', marginBottom: '4px' }}>Audit Log</h1>
                    <p style={{ fontSize: '13px', color: '#475569' }}>Admin activity history — {pagination.total || 0} entries</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by admin email..." style={{ flex: 1, padding: '9px 14px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                <select value={action} onChange={e => { setAction(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer', maxWidth: '220px' }}>
                    {ACTIONS.map(a => <option key={a} value={a}>{a || 'All Actions'}</option>)}
                </select>
            </div>

            <div style={S.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Time', 'Admin', 'Action', 'Entity', 'Details'].map(h => <th key={h} style={S.th}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <td key={j} style={S.td}><div style={{ height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} /></td>
                                    ))}
                                </tr>
                            ))
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5}><EmptyState icon="data" title="No audit logs" message="Admin actions will appear here." /></td></tr>
                        ) : (
                            logs.map(log => {
                                const cfg = ACTION_CONFIGS[log.action] || ACTION_CONFIGS.DEFAULT;
                                return (
                                    <tr key={log.id}>
                                        <td style={{ ...S.td, whiteSpace: 'nowrap', fontSize: '12px' }}>
                                            {fmtDate(log.createdAt)}
                                        </td>
                                        <td style={S.td}>
                                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                                                {log.admin?.email || 'System'}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: cfg.bg, padding: '4px 10px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                                <span style={{ fontSize: '13px' }}>{cfg.icon}</span>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.color, letterSpacing: '0.02em' }}>
                                                    {log.action?.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Schema: entityType + entityId (not targetType/targetId) */}
                                        <td style={{ ...S.td, maxWidth: '140px' }}>
                                            {log.entityType && (
                                                <div>
                                                    <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{log.entityType}</span>
                                                    {log.entityId && <div style={{ fontSize: '11px', color: '#334155', fontFamily: 'Geist Mono, monospace' }}>{log.entityId?.slice(0, 8)}…</div>}
                                                </div>
                                            )}
                                        </td>
                                        <td style={S.td}>
                                            {log.details ? <MetaBadge data={log.details} /> : '—'}
                                        </td>
                                    </tr>
                                );
                            })
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
        </div>
    );
}
