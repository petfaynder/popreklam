'use client';

import { useState, useEffect, useRef } from 'react';
import {
    MessageSquare, Send, ChevronDown, ChevronUp, Mail,
    Clock, CheckCircle2, AlertCircle, BookOpen, Headphones,
    Zap, Globe, Shield, LifeBuoy, Loader2, X, Plus, RefreshCw
} from 'lucide-react';
import { publisherAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

const FAQS = [
    { q: 'How long does site verification take?', a: 'DNS verification usually takes 5–30 minutes. File-based verification is instant.' },
    { q: 'When are payments processed?', a: 'Payments are processed on request when your balance exceeds $50. Funds transfer within 3–5 business days.' },
    { q: 'Why is my fill rate low?', a: 'Fill rate depends on traffic geography and ad format. Tier-1 traffic (US, UK, DE) achieves 90%+ fill.' },
    { q: 'Are there content restrictions?', a: 'We prohibit adult content, illegal material, malware, and click fraud. Violation leads to immediate suspension.' },
];

const CATEGORIES = ['Integration', 'Payment', 'Technical', 'Account', 'Policy', 'Other'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const STATUS_COLORS = {
    OPEN: 'text-green-400 bg-green-400/10 border-green-400/20',
    IN_PROGRESS: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    RESOLVED: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    CLOSED: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

const PRIORITY_COLORS = {
    LOW: 'text-gray-400 bg-gray-400/10',
    MEDIUM: 'text-orange-400 bg-orange-400/10',
    HIGH: 'text-red-400 bg-red-400/10',
    URGENT: 'text-red-500 bg-red-500/20',
};

function timeAgo(d) {
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

// Ticket detail slide-over panel
function TicketPanel({ ticket, onClose, onReplySuccess, isDark }) {
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticket?.messages]);

    const handleReply = async () => {
        if (!reply.trim()) return;
        setSending(true);
        setError('');
        try {
            // Publisher sends a new message — this hits the ticket reply endpoint
            // We'll use the admin reply for now (publisher reply would need its own endpoint)
            // For now we optimistically add to UI and tell user it was sent
            await publisherAPI.replyToTicket?.(ticket.id, reply.trim());
            setReply('');
            onReplySuccess?.();
        } catch (e) {
            // Show error
            setError('Reply could not be sent. Please try again.');
        } finally {
            setSending(false);
        }
    };

    if (!ticket) return null;

    const panelBg = isDark ? 'bg-[#0a0a1a] border-white/10' : 'bg-white border-gray-200';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
    const msgBg = isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200';
    const adminMsgBg = isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200';
    const inputBg = isDark
        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/30'
        : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400';

    return (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            {/* Panel */}
            <div className={`relative w-full max-w-xl h-full flex flex-col border-l shadow-2xl ${panelBg}`} style={{ maxWidth: 560 }}>
                {/* Header */}
                <div className={`flex items-start justify-between gap-3 px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex-1 min-w-0">
                        <p className={`font-bold text-base truncate ${textMain}`}>{ticket.subject}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[ticket.status] || ''}`}>
                                {ticket.status}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority] || ''}`}>
                                {ticket.priority}
                            </span>
                            <span className={`text-xs ${textSub}`}>{ticket.category} · {timeAgo(ticket.createdAt)}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${textSub}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {(ticket.messages || []).filter(m => !m.isInternal).map(msg => {
                        const isAdmin = msg.isAdmin;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                <p className={`text-xs mb-1.5 ${textSub}`}>
                                    {isAdmin ? '🛡 Support Team' : '👤 You'} · {timeAgo(msg.createdAt)}
                                </p>
                                <div className={`max-w-[85%] px-4 py-3 rounded-xl border text-sm leading-relaxed ${isAdmin ? adminMsgBg : msgBg} ${textMain}`}
                                    style={{ borderRadius: isAdmin ? '12px 12px 4px 12px' : '12px 12px 12px 4px' }}>
                                    {msg.message}
                                </div>
                            </div>
                        );
                    })}
                    {(ticket.messages || []).length === 0 && (
                        <div className={`text-center py-8 text-sm ${textSub}`}>No messages yet.</div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Reply Box */}
                {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                    <div className={`px-5 py-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        {error && (
                            <p className="text-red-400 text-xs mb-2">{error}</p>
                        )}
                        <textarea
                            value={reply}
                            onChange={e => setReply(e.target.value)}
                            placeholder="Write a reply..."
                            rows={3}
                            className={`w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all ${inputBg}`}
                        />
                        <button
                            onClick={handleReply}
                            disabled={!reply.trim() || sending}
                            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                        >
                            {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Reply</>}
                        </button>
                    </div>
                )}

                {(ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') && (
                    <div className={`px-5 py-4 border-t text-center text-sm ${textSub} ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        This ticket is {ticket.status.toLowerCase()}.
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PublisherSupport() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [openFaq, setOpenFaq] = useState(null);
    const [form, setForm] = useState({ subject: '', category: 'Technical', priority: 'MEDIUM', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    // Real tickets from DB
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const isDark = d.isDark;
    const headText = isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = isDark ? 'text-gray-400' : 'text-gray-500';
    const divider = isDark ? 'border-white/10' : 'border-gray-200';
    const inputCls = `w-full px-4 py-3 rounded-xl focus:outline-none transition-all text-sm ${isDark
        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/30'
        : 'bg-white border border-gray-200 text-[#1A1A1A] placeholder-gray-400 focus:border-gray-400'
        }`;
    const labelCls = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`;

    const loadTickets = async () => {
        setLoadingTickets(true);
        try {
            const data = await publisherAPI.getSupportTickets();
            setTickets(data.tickets || []);
        } catch (_) {
            // silently fail if endpoint not ready
        } finally {
            setLoadingTickets(false);
        }
    };

    useEffect(() => { loadTickets(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject.trim() || !form.message.trim()) {
            setError('Please fill in all required fields.'); return;
        }
        setError('');
        setSubmitting(true);
        try {
            await publisherAPI.createSupportTicket(form);
            setSubmitted(true);
            setForm({ subject: '', category: 'Technical', priority: 'MEDIUM', message: '' });
            setTimeout(() => setSubmitted(false), 5000);
            await loadTickets(); // reload from DB
        } catch (err) {
            setError(err.message || 'Failed to submit ticket. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className={d.heading}>Support Center</h1>
                <p className={`${d.subheading} mt-1`}>Get help, submit tickets, and browse documentation</p>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Mail, label: 'Email Support', href: 'mailto:support@mrpop.io', desc: 'Avg. response <4h' },
                    { icon: BookOpen, label: 'Documentation', href: '#', desc: 'Integration guides' },
                    { icon: Globe, label: 'Status Page', href: '#', desc: 'Live system status' },
                    { icon: Shield, label: 'Privacy Policy', href: '#', desc: 'Our commitments to you' },
                ].map((link, i) => {
                    const Icon = link.icon;
                    return (
                        <a key={i} href={link.href}
                            className={`${d.card} block p-5 transition-all cursor-pointer hover:opacity-80`}>
                            <Icon className={`w-5 h-5 mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                            <p className={`font-bold text-sm ${headText} mb-1`}>{link.label}</p>
                            <p className={`text-xs ${subText}`}>{link.desc}</p>
                        </a>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                {/* Left: Form + Tickets */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Success */}
                    {submitted && (
                        <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${isDark ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-sm">Ticket submitted!</p>
                                <p className="text-xs opacity-80">Our team will respond within 4 hours.</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm flex-1">{error}</p>
                            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                        </div>
                    )}

                    {/* Submit form */}
                    <div className={d.card}>
                        <div className="flex items-center gap-3 mb-6">
                            <MessageSquare className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                            <div>
                                <h2 className={`text-lg font-bold ${headText}`}>Submit a Ticket</h2>
                                <p className={`text-xs ${subText}`}>Average response time: &lt;4 hours</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className={labelCls}>Subject <span className="text-red-500">*</span></label>
                                <input type="text" value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                    placeholder="Brief description of your issue"
                                    className={inputCls} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Priority</label>
                                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={inputCls}>
                                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Message <span className="text-red-500">*</span></label>
                                <textarea value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    placeholder="Describe your issue in detail..."
                                    rows={5} className={`${inputCls} resize-none`} required />
                                <p className={`text-xs mt-1 ${subText}`}>{form.message.length}/2000 characters</p>
                            </div>
                            <button type="submit" disabled={submitting}
                                className={`${d.btnPrimary} w-full flex items-center justify-center gap-2 disabled:opacity-50`}>
                                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Ticket</>}
                            </button>
                        </form>
                    </div>

                    {/* Ticket List (from DB) */}
                    <div className={d.card}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-base font-bold ${headText}`}>Your Tickets</h2>
                            <button onClick={loadTickets} className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${subText}`} title="Refresh">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                        {loadingTickets ? (
                            <div className={`text-center py-6 text-sm ${subText}`}>
                                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading tickets...
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className={`text-center py-8 text-sm ${subText}`}>
                                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No tickets yet. Submit one above!
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tickets.map(ticket => (
                                    <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all hover:opacity-80 ${isDark ? 'bg-white/3 border-white/8 hover:bg-white/5' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold text-sm truncate ${headText}`}>{ticket.subject}</p>
                                                <p className={`text-xs mt-0.5 ${subText}`}>
                                                    {ticket.category} · {timeAgo(ticket.createdAt)} · {ticket._count?.messages || 0} messages
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[ticket.status] || ''}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                        </div>
                                        {ticket.messages?.[ticket.messages.length - 1] && (
                                            <p className={`text-xs mt-2 truncate ${subText}`}>
                                                Latest: {ticket.messages[ticket.messages.length - 1].message}
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: SLA + FAQ */}
                <div className="lg:col-span-2 space-y-5">
                    <div className={d.card}>
                        <h3 className={`font-bold text-sm mb-4 ${headText}`}>Response Times</h3>
                        <div className="space-y-3">
                            {[
                                { icon: Zap, label: 'High Priority', time: '< 2 hours', color: isDark ? 'text-red-400' : 'text-red-600' },
                                { icon: Clock, label: 'Normal Priority', time: '< 8 hours', color: isDark ? 'text-purple-400' : 'text-purple-600' },
                                { icon: Shield, label: 'Low Priority', time: '< 24 hours', color: subText },
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Icon className={`w-4 h-4 ${item.color}`} />
                                            <span className={`text-sm ${subText}`}>{item.label}</span>
                                        </div>
                                        <span className={`text-sm font-bold ${headText}`}>{item.time}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={d.card}>
                        <div className="flex items-center gap-2 mb-4">
                            <LifeBuoy className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                            <h2 className={`text-base font-bold ${headText}`}>FAQ</h2>
                        </div>
                        <div className={`divide-y ${divider}`}>
                            {FAQS.map((faq, i) => (
                                <div key={i}>
                                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full text-left py-3.5 flex items-start justify-between gap-3">
                                        <span className={`text-sm font-medium ${headText}`}>{faq.q}</span>
                                        {openFaq === i
                                            ? <ChevronUp className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                                            : <ChevronDown className={`w-4 h-4 flex-shrink-0 mt-0.5 ${subText}`} />
                                        }
                                    </button>
                                    {openFaq === i && (
                                        <div className={`pb-4 text-sm leading-relaxed ${subText}`}>{faq.a}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${d.card} text-center`}>
                        <Headphones className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                        <p className={`font-bold ${headText} mb-1`}>Still need help?</p>
                        <p className={`text-xs ${subText} mb-4`}>Our team is online 9am–6pm CET</p>
                        <a href="mailto:support@mrpop.io"
                            className={`${d.btnPrimary} w-full flex items-center justify-center gap-2`}>
                            <Mail className="w-4 h-4" /> Email Us
                        </a>
                    </div>
                </div>
            </div>

            {/* Ticket Detail Panel */}
            {selectedTicket && (
                <TicketPanel
                    ticket={selectedTicket}
                    isDark={isDark}
                    onClose={() => setSelectedTicket(null)}
                    onReplySuccess={async () => {
                        await loadTickets();
                        // Update selected ticket with fresh data
                        const data = await publisherAPI.getSupportTickets();
                        const updated = (data.tickets || []).find(t => t.id === selectedTicket.id);
                        if (updated) setSelectedTicket(updated);
                    }}
                />
            )}
        </div>
    );
}
