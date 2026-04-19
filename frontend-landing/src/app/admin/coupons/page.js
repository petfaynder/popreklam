'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag, Users, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const API = (path, opts = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return fetch(`/api/admin${path}`, {
        ...opts,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(r => r.json());
};

const EMPTY_FORM = {
    code: '', description: '', type: 'PERCENTAGE', value: '',
    minDeposit: '', maxBonus: '', maxUses: '', maxUsesPerUser: '1',
    startDate: '', endDate: '',
};

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [usages, setUsages] = useState({});
    const [loadingUsages, setLoadingUsages] = useState({});

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchCoupons = async () => {
        setLoading(true);
        const data = await API('/coupons');
        setCoupons(data.coupons || []);
        setLoading(false);
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                value: Number(form.value),
                minDeposit: form.minDeposit ? Number(form.minDeposit) : null,
                maxBonus: form.maxBonus ? Number(form.maxBonus) : null,
                maxUses: form.maxUses ? Number(form.maxUses) : null,
                maxUsesPerUser: Number(form.maxUsesPerUser) || 1,
                startDate: form.startDate || null,
                endDate: form.endDate || null,
            };
            const res = await API('/coupons', { method: 'POST', body: payload });
            if (res.error) throw new Error(res.error);
            showToast('success', `Coupon "${res.code}" created!`);
            setShowModal(false);
            setForm(EMPTY_FORM);
            fetchCoupons();
        } catch (err) {
            showToast('error', err.message);
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (coupon) => {
        await API(`/coupons/${coupon.id}`, { method: 'PUT', body: { isActive: !coupon.isActive } });
        fetchCoupons();
    };

    const toggleUsages = async (id) => {
        if (expandedId === id) { setExpandedId(null); return; }
        setExpandedId(id);
        if (!usages[id]) {
            setLoadingUsages(p => ({ ...p, [id]: true }));
            const data = await API(`/coupons/${id}/usages`);
            setUsages(p => ({ ...p, [id]: data.usages || [] }));
            setLoadingUsages(p => ({ ...p, [id]: false }));
        }
    };

    const s = {
        page: { padding: '32px', minHeight: '100vh', background: '#05050f', color: '#f1f5f9', fontFamily: 'DM Sans, sans-serif' },
        header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' },
        title: { fontSize: '22px', fontWeight: 800, color: '#f1f5f9' },
        sub: { fontSize: '13px', color: '#475569', marginTop: '2px' },
        btn: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '8px', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' },
        card: { background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' },
        row: { display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px 100px 120px 120px', alignItems: 'center', gap: '12px', padding: '14px 20px' },
        label: { fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' },
        val: { fontSize: '13px', color: '#94a3b8' },
        code: { fontFamily: 'monospace', fontWeight: 800, fontSize: '14px', color: '#a78bfa', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: '5px' },
        badge: (active) => ({ display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: active ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)', color: active ? '#10b981' : '#64748b' }),
        typeBadge: (type) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: type === 'PERCENTAGE' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)', color: type === 'PERCENTAGE' ? '#60a5fa' : '#fbbf24' }),
        overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
        modal: { background: '#0d0d22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' },
        mHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
        mTitle: { fontSize: '17px', fontWeight: 800, color: '#f1f5f9' },
        grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
        fLabel: { display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' },
        input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#f1f5f9', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' },
        select: { width: '100%', background: '#0d0d22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: '#f1f5f9', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' },
    };

    return (
        <div style={s.page}>
            {toast && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 999, background: toast.type === 'success' ? '#064e3b' : '#450a0a', border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`, borderRadius: '10px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px', color: toast.type === 'success' ? '#6ee7b7' : '#fca5a5', fontWeight: 600, fontSize: '13px' }}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            <div style={s.header}>
                <div>
                    <div style={s.title}>Promo Coupons</div>
                    <div style={s.sub}>Create and manage deposit bonus coupons for advertisers</div>
                </div>
                <button style={s.btn} onClick={() => setShowModal(true)}>
                    <Plus size={15} /> New Coupon
                </button>
            </div>

            {/* Table header */}
            <div style={{ ...s.row, background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '6px' }}>
                {['Code', 'Type', 'Value', 'Uses', 'Status', 'Expires', 'Actions'].map(h => (
                    <span key={h} style={s.label}>{h}</span>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <Loader2 size={28} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                </div>
            ) : coupons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#334155' }}>
                    <Tag size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                    <p>No coupons yet. Create your first one!</p>
                </div>
            ) : coupons.map(c => (
                <div key={c.id} style={s.card}>
                    <div style={s.row}>
                        <span style={s.code}>{c.code}</span>
                        <span style={s.typeBadge(c.type)}>{c.type === 'PERCENTAGE' ? '%' : '$'} {c.type}</span>
                        <span style={s.val}>{c.type === 'PERCENTAGE' ? `${c.value}%` : `$${Number(c.value).toFixed(2)}`}</span>
                        <span style={s.val}>{c.currentUses}{c.maxUses ? `/${c.maxUses}` : ' / ∞'}</span>
                        <span style={s.badge(c.isActive)}>{c.isActive ? 'Active' : 'Inactive'}</span>
                        <span style={s.val}>{c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => toggleActive(c)}
                                title={c.isActive ? 'Deactivate' : 'Activate'}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: c.isActive ? '#10b981' : '#475569' }}
                            >
                                {c.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                            </button>
                            <button
                                onClick={() => toggleUsages(c.id)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                            >
                                <Users size={13} />
                                {expandedId === c.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                        </div>
                    </div>

                    {/* Usages panel */}
                    {expandedId === c.id && (
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px', background: 'rgba(255,255,255,0.01)' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>Usage History</div>
                            {loadingUsages[c.id] ? (
                                <Loader2 size={20} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                            ) : (usages[c.id] || []).length === 0 ? (
                                <p style={{ color: '#334155', fontSize: '13px' }}>No usages yet.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                    <thead>
                                        <tr style={{ color: '#475569' }}>
                                            {['User', 'Deposit', 'Bonus', 'Date'].map(h => (
                                                <th key={h} style={{ textAlign: 'left', paddingBottom: '6px', fontWeight: 600 }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(usages[c.id] || []).map(u => (
                                            <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '6px 0', color: '#94a3b8' }}>{u.userEmail}</td>
                                                <td style={{ color: '#94a3b8' }}>${Number(u.depositAmount).toFixed(2)}</td>
                                                <td style={{ color: '#34d399', fontWeight: 700 }}>+${Number(u.bonusAmount).toFixed(2)}</td>
                                                <td style={{ color: '#475569' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Create Modal */}
            {showModal && (
                <div style={s.overlay} onClick={() => setShowModal(false)}>
                    <div style={s.modal} onClick={e => e.stopPropagation()}>
                        <div style={s.mHead}>
                            <span style={s.mTitle}>New Promo Coupon</span>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={s.grid2}>
                                <div>
                                    <label style={s.fLabel}>Coupon Code *</label>
                                    <input style={s.input} placeholder="e.g. WELCOME20" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} required />
                                </div>
                                <div>
                                    <label style={s.fLabel}>Type *</label>
                                    <select style={s.select} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount ($)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={s.grid2}>
                                <div>
                                    <label style={s.fLabel}>{form.type === 'PERCENTAGE' ? 'Bonus %' : 'Bonus $ Amount'} *</label>
                                    <input style={s.input} type="number" min="0" step="0.01" placeholder={form.type === 'PERCENTAGE' ? '20' : '50'} value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} required />
                                </div>
                                <div>
                                    <label style={s.fLabel}>Min. Deposit ($)</label>
                                    <input style={s.input} type="number" min="0" step="0.01" placeholder="100" value={form.minDeposit} onChange={e => setForm(p => ({ ...p, minDeposit: e.target.value }))} />
                                </div>
                            </div>

                            {form.type === 'PERCENTAGE' && (
                                <div>
                                    <label style={s.fLabel}>Max Bonus Cap ($)</label>
                                    <input style={s.input} type="number" min="0" step="0.01" placeholder="Optional cap" value={form.maxBonus} onChange={e => setForm(p => ({ ...p, maxBonus: e.target.value }))} />
                                </div>
                            )}

                            <div style={s.grid2}>
                                <div>
                                    <label style={s.fLabel}>Max Total Uses</label>
                                    <input style={s.input} type="number" min="1" placeholder="∞ unlimited" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={s.fLabel}>Max Uses Per User</label>
                                    <input style={s.input} type="number" min="1" value={form.maxUsesPerUser} onChange={e => setForm(p => ({ ...p, maxUsesPerUser: e.target.value }))} />
                                </div>
                            </div>

                            <div style={s.grid2}>
                                <div>
                                    <label style={s.fLabel}>Start Date</label>
                                    <input style={s.input} type="datetime-local" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={s.fLabel}>End Date</label>
                                    <input style={s.input} type="datetime-local" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
                                </div>
                            </div>

                            <div>
                                <label style={s.fLabel}>Description (optional)</label>
                                <input style={s.input} placeholder="e.g. Welcome bonus for new advertisers" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </div>

                            <button type="submit" disabled={saving} style={{ ...s.btn, width: '100%', justifyContent: 'center', padding: '12px', opacity: saving ? 0.7 : 1 }}>
                                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
                                {saving ? 'Creating...' : 'Create Coupon'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
