'use client';
import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '@/lib/api';
import Badge from '@/components/admin/Badge';
import EmptyState from '@/components/admin/EmptyState';
import { useToast } from '@/components/admin/Toast';

const S = {
    page: { display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden', fontFamily: 'DM Sans, sans-serif', background: '#05050f' },
    left: { width: '380px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', background: '#060612' },
    right: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    card: { background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' },
};

const STATUSES = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const STATUS_COLORS = { OPEN: '#0ea5e9', IN_PROGRESS: '#8b5cf6', RESOLVED: '#10b981', CLOSED: '#64748b' };
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const CATEGORIES = ['general', 'billing', 'technical', 'campaign', 'account'];
const CANNED = [
    { id: 1, title: 'Will Review', text: 'Thank you for reaching out. Our team will review your request and get back to you within 24 hours.' },
    { id: 2, title: 'Need More Info', text: 'Thank you for contacting us. Could you please provide more details about your issue?' },
    { id: 3, title: 'Issue Resolved', text: 'We are happy to inform you that your issue has been resolved. Please let us know if you need further assistance.' },
    { id: 4, title: 'Billing Info', text: 'Payments are processed within 3-5 business days. If you have further questions, please reply to this message.' },
];

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function SLATimer({ createdAt }) {
    const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / 3600000);
    const isLate = hours >= 24;
    return (
        <span style={{ fontSize: '11px', color: isLate ? '#ef4444' : '#64748b', fontWeight: isLate ? 700 : 400 }}>
            {isLate ? `⚠ ${hours}h` : `${hours}h`}
        </span>
    );
}

export default function SupportPage() {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({});
    const [activeTab, setActiveTab] = useState('OPEN');
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [ticketData, setTicketData] = useState(null);
    const [loadingTicket, setLoadingTicket] = useState(false);
    const [reply, setReply] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [sendingReply, setSendingReply] = useState(false);
    const [showCanned, setShowCanned] = useState(false);
    const [updating, setUpdating] = useState(false);
    const messagesEndRef = useRef(null);
    const toast = useToast();

    useEffect(() => {
        loadTickets();
        loadStats();
    }, [activeTab, search]);

    useEffect(() => {
        if (selectedId) loadTicket(selectedId);
    }, [selectedId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticketData?.ticket?.messages]);

    const loadTickets = async () => {
        try {
            const params = { status: activeTab };
            if (search) params.search = search;
            const d = await adminAPI.getTickets(params);
            setTickets(d.tickets || []);
        } catch (e) { toast.error('Failed to load tickets'); }
    };

    const loadStats = async () => {
        try {
            const d = await adminAPI.getTicketStats();
            setStats(d);
        } catch (e) { }
    };

    const loadTicket = async (id) => {
        setLoadingTicket(true);
        try {
            const d = await adminAPI.getTicket(id);
            setTicketData(d);
        } catch (e) { toast.error('Failed to load ticket'); }
        finally { setLoadingTicket(false); }
    };

    const sendReply = async () => {
        if (!reply.trim() || !selectedId) return;
        setSendingReply(true);
        try {
            if (isInternal) {
                await adminAPI.addTicketNote(selectedId, reply);
            } else {
                await adminAPI.replyTicket(selectedId, reply);
            }
            setReply('');
            await loadTicket(selectedId);
            await loadTickets();
            toast.success(isInternal ? 'Internal note added' : 'Reply sent');
        } catch (e) { toast.error('Failed to send reply'); }
        finally { setSendingReply(false); }
    };

    const updateStatus = async (status) => {
        if (!selectedId) return;
        setUpdating(true);
        try {
            await adminAPI.updateTicketStatus(selectedId, status);
            await loadTicket(selectedId);
            await loadTickets();
            await loadStats();
            toast.success(`Status updated to ${status}`);
        } catch (e) { toast.error('Failed to update status'); }
        finally { setUpdating(false); }
    };

    const updatePriority = async (priority) => {
        if (!selectedId) return;
        try {
            await adminAPI.updateTicketPriority(selectedId, priority);
            await loadTicket(selectedId);
            toast.success(`Priority set to ${priority}`);
        } catch (e) { toast.error('Failed to update priority'); }
    };

    const ticket = ticketData?.ticket;

    return (
        <div style={S.page}>
            {/* ===== LEFT: Ticket List ===== */}
            <div style={S.left}>
                {/* Stats */}
                <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
                    {[
                        { label: 'Open', value: stats.open, color: '#0ea5e9' },
                        { label: 'In Progress', value: stats.inProgress, color: '#8b5cf6' },
                        { label: 'Urgent', value: stats.urgent, color: '#ef4444' },
                    ].map(s => (
                        <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: s.color, fontFamily: 'Geist Mono, monospace' }}>{s.value || 0}</div>
                            <div style={{ fontSize: '10px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by email or subject..."
                        style={{
                            width: '100%', padding: '8px 12px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                {/* Status Tabs */}
                <div style={{ display: 'flex', padding: '0 8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
                    {STATUSES.map(s => (
                        <button key={s} onClick={() => { setActiveTab(s); setSelectedId(null); }}
                            style={{
                                padding: '10px 10px', fontSize: '11px', fontWeight: 700, border: 'none',
                                background: 'transparent', borderBottom: activeTab === s ? '2px solid #8b5cf6' : '2px solid transparent',
                                color: activeTab === s ? '#c4b5fd' : '#475569', cursor: 'pointer',
                                whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'all 0.15s',
                            }}>
                            {s.replace('_', ' ')}
                            {s !== 'ALL' && stats[s.toLowerCase().replace('_', '')] > 0 && (
                                <span style={{
                                    marginLeft: '5px', background: STATUS_COLORS[s] || '#475569',
                                    color: '#fff', fontSize: '10px', padding: '1px 5px', borderRadius: '8px',
                                }}>
                                    {stats[s.toLowerCase().replace('_', '')] || 0}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Ticket List */}
                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.3) transparent' }}>
                    {tickets.length === 0 ? (
                        <EmptyState icon="tickets" title="No tickets" message="No tickets match your current filters." />
                    ) : (
                        tickets.map(t => (
                            <div key={t.id} onClick={() => setSelectedId(t.id)}
                                style={{
                                    padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    cursor: 'pointer',
                                    background: selectedId === t.id ? 'rgba(139,92,246,0.1)' : 'transparent',
                                    borderLeft: selectedId === t.id ? '3px solid #8b5cf6' : '3px solid transparent',
                                    transition: 'all 0.1s',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                                        {t.user?.email}
                                    </span>
                                    <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                                        <Badge value={t.priority} size="xs" dot={false} />
                                        <SLATimer createdAt={t.createdAt} />
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 600, marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {t.subject}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Badge value={t.status} size="xs" />
                                    <span style={{ fontSize: '11px', color: '#475569' }}>
                                        {t._count?.messages || 0} msgs · {t.category}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ===== RIGHT: Ticket Detail ===== */}
            <div style={S.right}>
                {!selectedId ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <EmptyState icon="🎫" title="Select a ticket" message="Click a ticket from the list to view details and reply." />
                    </div>
                ) : loadingTicket ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '14px' }}>
                        Loading ticket...
                    </div>
                ) : ticket ? (
                    <>
                        {/* Ticket Header */}
                        <div style={{
                            padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                            background: '#060612', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                        }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>{ticket.subject}</div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <Badge value={ticket.status} />
                                    <Badge value={ticket.priority} />
                                    <span style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center' }}>
                                        by {ticket.user?.email} · {ticket.category} · {timeAgo(ticket.createdAt)}
                                    </span>
                                </div>
                            </div>
                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                                <select value={ticket.status} onChange={e => updateStatus(e.target.value)} disabled={updating}
                                    style={{ padding: '6px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                                <select value={ticket.priority} onChange={e => updatePriority(e.target.value)}
                                    style={{ padding: '6px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* User Info Bar */}
                        <div style={{ padding: '10px 24px', background: 'rgba(139,92,246,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                                <span style={{ background: 'rgba(139,92,246,0.12)', padding: '2px 8px', borderRadius: '5px', color: '#a78bfa', fontWeight: 600 }}>
                                    {ticket.user?.role}
                                </span>
                                <Badge value={ticket.user?.status} size="xs" />
                            </div>
                            <span style={{ fontSize: '12px', color: '#475569' }}>Balance: <span style={{ color: '#34d399', fontFamily: 'Geist Mono, monospace' }}>${Number(ticket.user?.balance || 0).toFixed(2)}</span></span>
                            <span style={{ fontSize: '12px', color: '#475569' }}>Tickets: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{ticket.user?._count?.supportTickets || 0}</span></span>
                            <span style={{ fontSize: '12px', color: '#475569' }}>Joined: {ticket.user ? new Date(ticket.user.createdAt).toLocaleDateString() : '—'}</span>
                        </div>

                        {/* Messages Thread */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.3) transparent' }}>
                            {(ticket.messages || []).map(msg => {
                                const isAdminMsg = msg.isAdmin;
                                const isNote = msg.isInternal;
                                return (
                                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdminMsg ? 'flex-end' : 'flex-start' }}>
                                        <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            {isNote && <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Internal Note</span>}
                                            <span>{msg.sender?.email}</span>
                                            <span>·</span>
                                            <span>{timeAgo(msg.createdAt)}</span>
                                        </div>
                                        <div style={{
                                            maxWidth: '75%', padding: '12px 16px', borderRadius: '12px',
                                            background: isNote ? 'rgba(245,158,11,0.08)' : isAdminMsg ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.05)',
                                            border: isNote ? '1px solid rgba(245,158,11,0.2)' : isAdminMsg ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(255,255,255,0.07)',
                                            fontSize: '13.5px', color: '#e2e8f0', lineHeight: 1.6,
                                            borderBottomRightRadius: isAdminMsg ? '4px' : '12px',
                                            borderBottomLeftRadius: isAdminMsg ? '12px' : '4px',
                                        }}>
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Box */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#060612' }}>
                            {/* Toggle */}
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', alignItems: 'center' }}>
                                <button onClick={() => setIsInternal(false)}
                                    style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: !isInternal ? '#8b5cf6' : 'rgba(255,255,255,0.05)', color: !isInternal ? '#fff' : '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    Public Reply
                                </button>
                                <button onClick={() => setIsInternal(true)}
                                    style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: isInternal ? '#f59e0b' : 'rgba(255,255,255,0.05)', color: isInternal ? '#fff' : '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    🔒 Internal Note
                                </button>
                                <div style={{ position: 'relative', marginLeft: 'auto' }}>
                                    <button onClick={() => setShowCanned(p => !p)}
                                        style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#64748b', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        📋 Canned
                                    </button>
                                    {showCanned && (
                                        <div style={{ position: 'absolute', bottom: '36px', right: 0, background: '#0f0f24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', zIndex: 10, minWidth: '240px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                                            {CANNED.map(c => (
                                                <div key={c.id} onClick={() => { setReply(c.text); setShowCanned(false); }}
                                                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>{c.title}</div>
                                                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <textarea
                                value={reply} onChange={e => setReply(e.target.value)}
                                placeholder={isInternal ? 'Write an internal note (only visible to admins)...' : 'Write your reply...'}
                                rows={3}
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                                    background: isInternal ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.04)',
                                    border: isInternal ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.08)',
                                    color: '#f1f5f9', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical',
                                    outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
                                }}
                                onKeyDown={e => { if (e.metaKey && e.key === 'Enter') sendReply(); }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', gap: '8px' }}>
                                <button
                                    onClick={sendReply}
                                    disabled={!reply.trim() || sendingReply}
                                    style={{
                                        padding: '9px 20px', borderRadius: '8px', border: 'none',
                                        background: sendingReply ? '#475569' : isInternal ? '#f59e0b' : '#8b5cf6',
                                        color: '#fff', fontSize: '13px', fontWeight: 700, cursor: sendingReply ? 'wait' : 'pointer',
                                        fontFamily: 'inherit', opacity: !reply.trim() ? 0.5 : 1,
                                    }}>
                                    {sendingReply ? 'Sending...' : isInternal ? '🔒 Add Note' : 'Send Reply ↩ Cmd+Enter'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
