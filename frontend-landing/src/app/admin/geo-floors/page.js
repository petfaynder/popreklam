'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Globe, Plus, Trash2, Loader2, Save, Search,
    AlertCircle, CheckCircle2, Info, TrendingUp, Filter,
    BarChart2, Shield, Layers, ArrowUpDown, X, Zap
} from 'lucide-react';

const AD_FORMATS = ['POPUNDER', 'IN_PAGE_PUSH', 'NATIVE', 'BANNER', 'DIRECT_LINK'];

const COMMON_COUNTRIES = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴' },
];

const FORMAT_CONFIG = {
    POPUNDER: { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', label: 'Popunder', short: 'POP' },
    IN_PAGE_PUSH: { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)', label: 'In-Page Push', short: 'IPP' },
    NATIVE: { color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.3)', label: 'Native', short: 'NAT' },
    BANNER: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)', label: 'Banner', short: 'BAN' },
    DIRECT_LINK: { color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)', label: 'Direct Link', short: 'DLK' },
};

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ type, msg, onClose }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (msg) {
            requestAnimationFrame(() => setVisible(true));
        }
    }, [msg]);
    if (!msg) return null;
    return (
        <div style={{
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
            opacity: visible ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 20px', borderRadius: '14px',
            background: type === 'success'
                ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
                : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
            border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            backdropFilter: 'blur(20px)',
            color: type === 'success' ? '#34d399' : '#f87171',
            fontSize: '14px', fontWeight: 500,
            boxShadow: type === 'success'
                ? '0 8px 32px rgba(16,185,129,0.15)'
                : '0 8px 32px rgba(239,68,68,0.15)',
            minWidth: '260px', maxWidth: '400px',
        }}>
            {type === 'success'
                ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
            <span style={{ flex: 1 }}>{msg}</span>
            <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6, padding: 0, lineHeight: 1 }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
            >
                <X size={14} />
            </button>
        </div>
    );
}

/* ─── Confirm Dialog ─────────────────────────────────────── */
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, country, format }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (isOpen) requestAnimationFrame(() => setVisible(true));
        else setVisible(false);
    }, [isOpen]);
    if (!isOpen) return null;
    const cfg = FORMAT_CONFIG[format] || { color: '#ef4444', label: format };
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
            background: `rgba(0,0,0,${visible ? 0.7 : 0})`,
            backdropFilter: visible ? 'blur(8px)' : 'none',
            transition: 'background 0.25s, backdrop-filter 0.25s',
        }} onClick={onClose}>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 420,
                    background: 'linear-gradient(135deg, rgba(20,20,40,0.98) 0%, rgba(10,10,25,0.98) 100%)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 20,
                    padding: '28px',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(239,68,68,0.1)',
                    transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                    opacity: visible ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                {/* Icon */}
                <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 18,
                }}>
                    <Trash2 size={22} color="#ef4444" />
                </div>

                {/* Title */}
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                    {title}
                </div>

                {/* Message */}
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 6 }}>
                    {message}
                </div>

                {/* Details pill */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 14px', borderRadius: 100, marginBottom: 24,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: 12, color: 'rgba(255,255,255,0.6)',
                }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#fff' }}>{country?.flag || '🌐'} {country?.code || format}</span>
                    <span style={{ opacity: 0.4 }}>/</span>
                    <span style={{ color: cfg.color, fontWeight: 700 }}>{cfg.label}</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '11px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)',
                            cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1, padding: '11px 16px', borderRadius: 12, border: 'none',
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                            boxShadow: '0 4px 20px rgba(239,68,68,0.3)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(239,68,68,0.45)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(239,68,68,0.3)'; }}
                    >
                        Remove Floor
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Summary Stat Card ──────────────────────────────────── */
function StatChip({ icon: Icon, label, value, accent }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 18px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
            transition: 'border-color 0.2s',
            flex: '1', minWidth: '140px',
        }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `${accent}40`}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
        >
            <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${accent}18`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}>
                <Icon size={16} color={accent} />
            </div>
            <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</div>
            </div>
        </div>
    );
}

/* ─── Format Badge ──────────────────────────────────────── */
function FormatBadge({ format }) {
    const cfg = FORMAT_CONFIG[format] || { color: '#888', bg: 'rgba(136,136,136,0.1)', border: 'rgba(136,136,136,0.2)', label: format, short: '???' };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px 3px 8px', borderRadius: 100,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            color: cfg.color, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.04em', whiteSpace: 'nowrap',
        }}>
            <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: cfg.color, display: 'inline-block',
                boxShadow: `0 0 6px ${cfg.color}`,
            }} />
            {cfg.label}
        </span>
    );
}

/* ─── Floor Row ─────────────────────────────────────────── */
function FloorRow({ floor, onDelete, onEdit, index }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(Number(floor.minBid).toFixed(4));
    const inputRef = useRef(null);
    const country = COMMON_COUNTRIES.find(c => c.code === floor.countryCode);

    const save = () => {
        onEdit(floor, val);
        setEditing(false);
    };

    useEffect(() => {
        if (editing && inputRef.current) inputRef.current.focus();
    }, [editing]);

    return (
        <tr style={{
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            transition: 'background 0.15s',
            animation: `fadeSlideIn 0.3s ease both`,
            animationDelay: `${index * 40}ms`,
        }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            {/* Country */}
            <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{country?.flag || '🌐'}</span>
                    <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                            {floor.countryCode}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                            {country?.name || 'Unknown'}
                        </div>
                    </div>
                </div>
            </td>
            {/* Format */}
            <td style={{ padding: '14px 16px' }}>
                <FormatBadge format={floor.adFormat} />
            </td>
            {/* Min Bid */}
            <td style={{ padding: '14px 16px' }}>
                {editing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 180 }}>
                        <input
                            ref={inputRef}
                            type="number"
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            step="0.0001" min="0"
                            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
                            style={{
                                flex: 1, padding: '6px 10px', borderRadius: 8,
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(251,191,36,0.4)',
                                color: '#fbbf24', fontSize: 13, fontFamily: 'monospace',
                                outline: 'none', fontWeight: 600,
                            }}
                        />
                        <button
                            onClick={save}
                            style={{
                                padding: '6px 10px', borderRadius: 8, border: 'none',
                                background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.25)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.15)'}
                        >
                            <Save size={14} />
                        </button>
                        <button
                            onClick={() => setEditing(false)}
                            style={{
                                padding: '6px', borderRadius: 8, border: 'none',
                                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                transition: 'background 0.15s',
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditing(true)}
                        title="Click to edit"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
                            borderRadius: 6, transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(251,191,36,0.08)';
                            e.currentTarget.style.color = '#fbbf24';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = 'inherit';
                        }}
                    >
                        <span style={{ color: '#fbbf24', fontFamily: 'monospace', fontWeight: 700, fontSize: 15 }}>
                            $<span style={{ fontSize: 16 }}>{Number(floor.minBid).toFixed(4)}</span>
                        </span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>CPM</span>
                    </button>
                )}
            </td>
            {/* Action */}
            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                <button
                    onClick={() => onDelete(floor.countryCode, floor.adFormat)}
                    title="Remove floor"
                    style={{
                        padding: '6px 8px', borderRadius: 8, border: 'none',
                        background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.6)',
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                        e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                        e.currentTarget.style.color = 'rgba(239,68,68,0.6)';
                    }}
                >
                    <Trash2 size={14} />
                </button>
            </td>
        </tr>
    );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function AdminGeoFloorPage() {
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ type: '', msg: '' });
    const [search, setSearch] = useState('');
    const [formatFilter, setFormatFilter] = useState('');
    const [sortField, setSortField] = useState('countryCode');
    const [sortDir, setSortDir] = useState('asc');
    const [newEntry, setNewEntry] = useState({ countryCode: '', adFormat: 'POPUNDER', minBid: '' });
    const [pendingDelete, setPendingDelete] = useState(null); // { countryCode, adFormat }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast({ type: '', msg: '' }), 4200);
    };

    const fetchFloors = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/geo-floors', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setFloors(data.floors || []);
        } catch { showToast('error', 'Failed to load floors'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchFloors(); }, []);

    const handleAdd = async () => {
        if (!newEntry.countryCode || !newEntry.adFormat || newEntry.minBid === '') {
            showToast('error', 'All fields are required');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/api/admin/geo-floors', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ countryCode: newEntry.countryCode.toUpperCase(), adFormat: newEntry.adFormat, minBid: Number(newEntry.minBid) })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showToast('success', `Floor set: ${newEntry.countryCode.toUpperCase()} / ${newEntry.adFormat} → $${Number(newEntry.minBid).toFixed(4)}`);
            setNewEntry({ countryCode: '', adFormat: 'POPUNDER', minBid: '' });
            fetchFloors();
        } catch (err) { showToast('error', err.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async (countryCode, adFormat) => {
        setPendingDelete({ countryCode, adFormat });
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const { countryCode, adFormat } = pendingDelete;
        setPendingDelete(null);
        try {
            await fetch(`/api/admin/geo-floors/${countryCode}/${adFormat}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
            });
            showToast('success', `Floor removed: ${countryCode} / ${adFormat}`);
            setFloors(f => f.filter(x => !(x.countryCode === countryCode && x.adFormat === adFormat)));
        } catch { showToast('error', 'Failed to delete'); }
    };

    const handleInlineEdit = async (floor, newMinBid) => {
        try {
            await fetch('/api/admin/geo-floors', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ countryCode: floor.countryCode, adFormat: floor.adFormat, minBid: Number(newMinBid) })
            });
            setFloors(f => f.map(x => x.id === floor.id ? { ...x, minBid: Number(newMinBid) } : x));
            showToast('success', 'Floor updated');
        } catch { showToast('error', 'Failed to update'); }
    };

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const filtered = floors
        .filter(f => {
            const q = search.toLowerCase();
            const matchSearch = !q || f.countryCode.toLowerCase().includes(q) || f.adFormat.toLowerCase().includes(q);
            const matchFormat = !formatFilter || f.adFormat === formatFilter;
            return matchSearch && matchFormat;
        })
        .sort((a, b) => {
            const aVal = sortField === 'minBid' ? Number(a.minBid) : a[sortField];
            const bVal = sortField === 'minBid' ? Number(b.minBid) : b[sortField];
            return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });

    const formatStats = AD_FORMATS.reduce((acc, fmt) => {
        acc[fmt] = floors.filter(f => f.adFormat === fmt).length;
        return acc;
    }, {});

    const avgBid = floors.length > 0
        ? (floors.reduce((s, f) => s + Number(f.minBid), 0) / floors.length).toFixed(4)
        : '0.0000';

    /* ─── Styles ──────────────────── */
    const glassCard = {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
    };

    const inputStyle = {
        width: '100%', padding: '10px 14px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, color: '#fff',
        fontSize: 13, outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        WebkitAppearance: 'none', appearance: 'none',
        fontFamily: 'inherit',
    };

    const selectStyle = {
        ...inputStyle,
        cursor: 'pointer',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: '36px',
    };

    const labelStyle = {
        display: 'block', fontSize: 11, fontWeight: 700,
        color: 'rgba(255,255,255,0.4)', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.1em',
    };

    const thStyle = (field) => ({
        padding: '12px 16px', textAlign: 'left',
        fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'color 0.15s',
    });

    return (
        <>
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.3); }
                    50% { box-shadow: 0 0 0 8px rgba(251,191,36,0); }
                }
                .geo-input:focus {
                    border-color: rgba(251,191,36,0.5) !important;
                    box-shadow: 0 0 0 3px rgba(251,191,36,0.1) !important;
                }
                .set-floor-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .set-floor-btn:not(:disabled):hover {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 25px rgba(251,191,36,0.35) !important;
                }
                .set-floor-btn:not(:disabled):active { transform: translateY(0); }
                .sort-th:hover { color: rgba(255,255,255,0.7) !important; }
                .format-pill { transition: all 0.15s; }
                .format-pill:hover { transform: translateY(-1px); }
                .format-pill.active-filter { animation: pulseGlow 2s ease-in-out infinite; }
                select option { background: #1a1a2e; color: #fff; }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
            `}</style>

            <Toast type={toast.type} msg={toast.msg} onClose={() => setToast({ type: '', msg: '' })} />

            {/* ── Confirm Delete Modal ── */}
            <ConfirmDialog
                isOpen={!!pendingDelete}
                onClose={() => setPendingDelete(null)}
                onConfirm={confirmDelete}
                title="Remove Floor?"
                message="This floor price rule will be permanently deleted. Advertisers targeting this country/format will revert to free-market bidding."
                country={pendingDelete ? COMMON_COUNTRIES.find(c => c.code === pendingDelete.countryCode) || { code: pendingDelete?.countryCode } : null}
                format={pendingDelete?.adFormat}
            />

            <div style={{ maxWidth: 1100, space: 0 }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: 32, animation: 'fadeSlideIn 0.4s ease both' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05))',
                                    border: '1px solid rgba(251,191,36,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 20px rgba(251,191,36,0.15)',
                                }}>
                                    <Globe size={18} color="#fbbf24" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>
                                        Operations
                                    </div>
                                    <h1 style={{
                                        fontSize: 28, fontWeight: 800, color: '#fff',
                                        margin: 0, letterSpacing: '-0.02em', lineHeight: 1,
                                    }}>
                                        Geo Floor Pricing
                                    </h1>
                                </div>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0, maxWidth: 520 }}>
                                Set minimum bid floors per country and ad format. Advertisers must bid at or above these values to serve.
                            </p>
                        </div>

                        {/* Stat chips */}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <StatChip icon={Shield} label="Active Floors" value={floors.length} accent="#fbbf24" />
                            <StatChip icon={TrendingUp} label="Avg Floor" value={`$${avgBid}`} accent="#4ade80" />
                            <StatChip icon={Layers} label="Filtered" value={filtered.length} accent="#38bdf8" />
                        </div>
                    </div>
                </div>

                {/* ── Info Banner ── */}
                <div style={{
                    ...glassCard,
                    padding: '14px 18px',
                    marginBottom: 20,
                    borderColor: 'rgba(56,189,248,0.2)',
                    background: 'linear-gradient(135deg, rgba(56,189,248,0.06) 0%, rgba(56,189,248,0.02) 100%)',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    animation: 'fadeSlideIn 0.4s ease 0.05s both',
                }}>
                    <Info size={15} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                        <strong style={{ color: '#38bdf8' }}>How it works:</strong>{' '}
                        When a floor is set for a country+format, advertisers targeting that country must bid at or above the floor.
                        If no bids meet the floor, the Backfill network (Monetag/Adsterra) is activated automatically.
                        Removing a floor reverts to free-market bidding.
                    </p>
                </div>

                {/* ── Format Filter Pills ── */}
                <div style={{
                    display: 'flex', gap: 8, flexWrap: 'wrap',
                    marginBottom: 20,
                    animation: 'fadeSlideIn 0.4s ease 0.1s both',
                }}>
                    <button
                        className={`format-pill${!formatFilter ? ' active-filter' : ''}`}
                        onClick={() => setFormatFilter('')}
                        style={{
                            padding: '6px 14px', borderRadius: 100, border: 'none', cursor: 'pointer',
                            background: !formatFilter ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                            color: !formatFilter ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                            fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                            border: `1px solid ${!formatFilter ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.06)'}`,
                            transition: 'all 0.15s',
                        }}
                    >
                        All Formats
                    </button>
                    {AD_FORMATS.map(fmt => {
                        const cfg = FORMAT_CONFIG[fmt];
                        const active = formatFilter === fmt;
                        return (
                            <button
                                key={fmt}
                                className={`format-pill${active ? ' active-filter' : ''}`}
                                onClick={() => setFormatFilter(active ? '' : fmt)}
                                style={{
                                    padding: '6px 14px', borderRadius: 100, cursor: 'pointer',
                                    background: active ? cfg.bg : 'rgba(255,255,255,0.04)',
                                    color: active ? cfg.color : 'rgba(255,255,255,0.4)',
                                    fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                                    border: `1px solid ${active ? cfg.border : 'rgba(255,255,255,0.06)'}`,
                                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
                                    boxShadow: active ? `0 0 12px ${cfg.color}18` : 'none',
                                }}
                                onMouseEnter={e => !active && (e.currentTarget.style.borderColor = `${cfg.color}40`)}
                                onMouseLeave={e => !active && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                            >
                                {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, display: 'inline-block', boxShadow: `0 0 6px ${cfg.color}` }} />}
                                {cfg.label}
                                {formatStats[fmt] > 0 && (
                                    <span style={{
                                        background: active ? cfg.color : 'rgba(255,255,255,0.1)',
                                        color: active ? '#000' : 'rgba(255,255,255,0.5)',
                                        borderRadius: 100, padding: '1px 7px', fontSize: 10, fontWeight: 800,
                                    }}>{formatStats[fmt]}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Add / Update Floor ── */}
                <div style={{
                    ...glassCard,
                    padding: '24px',
                    marginBottom: 20,
                    animation: 'fadeSlideIn 0.4s ease 0.15s both',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: 8,
                            background: 'rgba(251,191,36,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Plus size={14} color="#fbbf24" />
                        </div>
                        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>Add / Update Floor</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, alignItems: 'end' }}>
                        <div>
                            <label style={labelStyle}>Country (ISO-2)</label>
                            <select
                                className="geo-input"
                                value={newEntry.countryCode}
                                onChange={e => setNewEntry(n => ({ ...n, countryCode: e.target.value }))}
                                style={selectStyle}
                            >
                                <option value="">Select country…</option>
                                {COMMON_COUNTRIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Ad Format</label>
                            <select
                                className="geo-input"
                                value={newEntry.adFormat}
                                onChange={e => setNewEntry(n => ({ ...n, adFormat: e.target.value }))}
                                style={selectStyle}
                            >
                                {AD_FORMATS.map(f => <option key={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Min Bid ($ CPM)</label>
                            <input
                                className="geo-input"
                                type="number" min="0" step="0.0001"
                                placeholder="e.g. 0.5000"
                                value={newEntry.minBid}
                                onChange={e => setNewEntry(n => ({ ...n, minBid: e.target.value }))}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <button
                                className="set-floor-btn"
                                onClick={handleAdd}
                                disabled={saving}
                                style={{
                                    width: '100%', padding: '10px 18px',
                                    borderRadius: 12, border: 'none', cursor: 'pointer',
                                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                    color: '#1a1200', fontWeight: 800, fontSize: 13,
                                    letterSpacing: '0.04em',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    boxShadow: '0 4px 20px rgba(251,191,36,0.25)',
                                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                }}
                            >
                                {saving
                                    ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                                    : <Zap size={15} />
                                }
                                {saving ? 'Setting…' : 'Set Floor'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Floors Table ── */}
                <div style={{
                    ...glassCard,
                    overflow: 'hidden',
                    animation: 'fadeSlideIn 0.4s ease 0.2s both',
                }}>
                    {/* Table Toolbar */}
                    <div style={{
                        padding: '18px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                        flexWrap: 'wrap',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <BarChart2 size={16} color="rgba(255,255,255,0.4)" />
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>
                                Active Floors
                            </span>
                            <span style={{
                                padding: '2px 10px', borderRadius: 100,
                                background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
                                fontSize: 12, fontWeight: 800, border: '1px solid rgba(251,191,36,0.2)',
                            }}>
                                {filtered.length}
                            </span>
                        </div>
                        <div style={{ position: 'relative', maxWidth: 280, flex: 1 }}>
                            <Search size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                className="geo-input"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search country or format…"
                                style={{ ...inputStyle, paddingLeft: 36, width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <Loader2 size={28} color="#fbbf24" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px', display: 'block' }} />
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading floors…</div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <Globe size={36} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px', display: 'block' }} />
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginBottom: 4 }}>
                                {search || formatFilter ? 'No floors match your filters.' : 'No floors set yet.'}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
                                {!search && !formatFilter && 'All countries are operating on free-market bidding.'}
                            </div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th className="sort-th" style={thStyle('countryCode')} onClick={() => toggleSort('countryCode')}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                Country
                                                <ArrowUpDown size={11} style={{ opacity: sortField === 'countryCode' ? 0.8 : 0.3 }} />
                                            </span>
                                        </th>
                                        <th className="sort-th" style={thStyle('adFormat')} onClick={() => toggleSort('adFormat')}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                Format
                                                <ArrowUpDown size={11} style={{ opacity: sortField === 'adFormat' ? 0.8 : 0.3 }} />
                                            </span>
                                        </th>
                                        <th className="sort-th" style={thStyle('minBid')} onClick={() => toggleSort('minBid')}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                Min Bid (CPM)
                                                <ArrowUpDown size={11} style={{ opacity: sortField === 'minBid' ? 0.8 : 0.3 }} />
                                            </span>
                                        </th>
                                        <th style={{ ...thStyle(), textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((floor, i) => (
                                        <FloorRow
                                            key={`${floor.countryCode}_${floor.adFormat}`}
                                            floor={floor}
                                            index={i}
                                            onDelete={handleDelete}
                                            onEdit={handleInlineEdit}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer */}
                    {filtered.length > 0 && (
                        <div style={{
                            padding: '12px 20px',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                                Showing {filtered.length} of {floors.length} floors
                            </span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                                Click on a bid value to edit inline · Click ↕ to sort
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}
