'use client';

import { useState, useEffect, useRef } from 'react';
import { advertiserAPI } from '@/lib/api';
import { getDashboardTheme } from '@/lib/themeUtils';
import useTheme from '@/hooks/useTheme';
import { COUNTRIES } from '../campaigns/create/components/countryData';
import ConfirmModal from '@/components/ConfirmModal';
import {
    Users, Plus, X, Trash2, Edit2, Save, Search,
    Globe, Smartphone, Monitor, Chrome, Target, CheckCircle, BarChart2,
    Loader2, AlertCircle, ArrowRight, ChevronDown, Eye, EyeOff, MousePointer,
    Crosshair, RefreshCw, Layers
} from 'lucide-react';

// ─── Rule type configs ──────────────────────────────────────────────────────
const RULE_TYPES = [
    { type: 'GEO_INCLUDE',      label: 'Countries — Include',       icon: '🌍', hasCountry: true,  hasValues: false, hasCampaign: false },
    { type: 'GEO_EXCLUDE',      label: 'Countries — Exclude',       icon: '🚫', hasCountry: true,  hasValues: false, hasCampaign: false },
    { type: 'DEVICE_MATCH',     label: 'Device Type',               icon: '📱', hasCountry: false, hasValues: true,  hasCampaign: false, options: ['mobile', 'desktop', 'tablet'] },
    { type: 'OS_MATCH',         label: 'Operating System',          icon: '💻', hasCountry: false, hasValues: true,  hasCampaign: false, options: ['Android', 'iOS', 'Windows', 'macOS', 'Linux'] },
    { type: 'BROWSER_MATCH',    label: 'Browser',                   icon: '🌐', hasCountry: false, hasValues: true,  hasCampaign: false, options: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'] },
    { type: 'CAMPAIGN_SAW',     label: 'Saw Campaign (Retarget)',   icon: '👁',  hasCountry: false, hasValues: false, hasCampaign: true  },
    { type: 'CAMPAIGN_CLICKED', label: 'Clicked Campaign',          icon: '🖱',  hasCountry: false, hasValues: false, hasCampaign: true  },
    { type: 'CAMPAIGN_SAW_NOT', label: 'Did NOT See Campaign',      icon: '🙈',  hasCountry: false, hasValues: false, hasCampaign: true  },
];

// ─── CountryPicker ──────────────────────────────────────────────────────────
function CountryPicker({ selected = [], onChange, isDark, inputCls }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);

    const subText = isDark ? 'text-gray-400' : 'text-gray-500';
    const accentText = isDark ? 'text-lime-400' : 'text-lime-600';

    // Close on outside click
    useEffect(() => {
        const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    const filtered = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    const toggle = (code) => {
        if (selected.includes(code)) {
            onChange(selected.filter(c => c !== code));
        } else {
            onChange([...selected, code]);
        }
    };

    const remove = (code, e) => {
        e.stopPropagation();
        onChange(selected.filter(c => c !== code));
    };

    const selectedCountries = COUNTRIES.filter(c => selected.includes(c.code));

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <div
                onClick={() => setOpen(!open)}
                className={`min-h-[38px] w-full px-3 py-2 cursor-pointer flex flex-wrap gap-1.5 items-center ${inputCls} ${open ? (isDark ? 'border-lime-400/50' : 'border-lime-500') : ''}`}
            >
                {selectedCountries.length === 0 ? (
                    <span className={`text-xs ${subText}`}>Search & select countries…</span>
                ) : (
                    selectedCountries.map(c => (
                        <span
                            key={c.code}
                            className={`inline-flex items-center gap-1 pl-1.5 pr-1 py-0.5 rounded text-[11px] font-medium border ${isDark ? 'bg-lime-500/15 border-lime-500/30 text-lime-300' : 'bg-lime-100 border-lime-300 text-lime-700'}`}
                        >
                            <span>{c.flag}</span>
                            <span>{c.code}</span>
                            <button
                                type="button"
                                onClick={(e) => remove(c.code, e)}
                                className="ml-0.5 hover:opacity-70 transition"
                            >
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </span>
                    ))
                )}
                <ChevronDown className={`w-3.5 h-3.5 ml-auto flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${subText}`} />
            </div>

            {/* Dropdown */}
            {open && (
                <div className={`absolute z-50 mt-1.5 w-full border shadow-xl overflow-hidden ${isDark ? 'bg-[#0a0a1a] border-white/10 rounded-xl' : 'bg-white border-gray-200 rounded-lg'}`}>
                    {/* Search */}
                    <div className={`p-2 border-b ${isDark ? 'border-white/8' : 'border-gray-100'}`}>
                        <div className={`flex items-center gap-2 px-2 py-1.5 rounded ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <Search className={`w-3.5 h-3.5 flex-shrink-0 ${subText}`} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search country…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className={`flex-1 bg-transparent text-xs outline-none ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}`}
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch('')}>
                                    <X className={`w-3 h-3 ${subText}`} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-52 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className={`text-center py-6 text-xs ${subText}`}>No countries found</div>
                        ) : (
                            filtered.map(c => {
                                const isSelected = selected.includes(c.code);
                                return (
                                    <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => toggle(c.code)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition ${
                                            isSelected
                                                ? (isDark ? 'bg-lime-500/10 text-lime-300' : 'bg-lime-50 text-lime-700')
                                                : (isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50')
                                        }`}
                                    >
                                        <span className="text-base leading-none">{c.flag}</span>
                                        <span className="flex-1 font-medium">{c.name}</span>
                                        <span className={`text-[10px] font-mono ${subText}`}>{c.code}</span>
                                        {isSelected && <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${accentText}`} />}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer: selected count + clear */}
                    {selected.length > 0 && (
                        <div className={`flex items-center justify-between px-3 py-2 border-t text-[10px] ${isDark ? 'border-white/8 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
                            <span>{selected.length} selected</span>
                            <button
                                type="button"
                                onClick={() => onChange([])}
                                className="text-red-400 hover:text-red-300 font-medium transition"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── RuleRow ─────────────────────────────────────────────────────────────────
function RuleRow({ rule, index, onChange, onRemove, campaigns, isDark, inputCls }) {
    const config = RULE_TYPES.find(r => r.type === rule.type) || RULE_TYPES[0];
    const accentText = isDark ? 'text-lime-400' : 'text-lime-600';

    return (
        <div className={`flex flex-col gap-3 p-3 border ${isDark ? 'bg-white/[0.02] border-white/[0.08] rounded-xl' : 'bg-gray-50 border-gray-200 rounded-lg'}`}>
            <div className="flex items-center gap-2">
                <span className="text-base">{config.icon}</span>

                {/* Rule type selector */}
                <select
                    value={rule.type}
                    onChange={e => onChange(index, { ...rule, type: e.target.value, values: [], campaignId: null })}
                    className={`flex-1 text-xs px-2 py-1.5 font-medium ${inputCls}`}
                >
                    {RULE_TYPES.map(rt => (
                        <option key={rt.type} value={rt.type}>{rt.label}</option>
                    ))}
                </select>

                <button type="button" onClick={() => onRemove(index)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Country searchable picker */}
            {config.hasCountry && (
                <CountryPicker
                    selected={Array.isArray(rule.values) ? rule.values : []}
                    onChange={(codes) => onChange(index, { ...rule, values: codes })}
                    isDark={isDark}
                    inputCls={inputCls}
                />
            )}

            {/* Options multi-select (Device, OS, Browser) */}
            {config.hasValues && config.options && (
                <div className="flex flex-wrap gap-1.5">
                    {config.options.map(opt => {
                        const selected = Array.isArray(rule.values) && rule.values.includes(opt);
                        return (
                            <button key={opt} type="button"
                                onClick={() => {
                                    const cur = Array.isArray(rule.values) ? rule.values : [];
                                    onChange(index, { ...rule, values: selected ? cur.filter(v => v !== opt) : [...cur, opt] });
                                }}
                                className={`px-2.5 py-1 text-[11px] font-medium border transition ${
                                    selected
                                        ? (isDark ? 'bg-lime-500/15 border-lime-500/30 text-lime-400 rounded-lg' : 'bg-lime-100 border-lime-400 text-lime-700 rounded')
                                        : (isDark ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 rounded-lg' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100 rounded')
                                }`}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Campaign selector */}
            {config.hasCampaign && (
                <select
                    value={rule.campaignId || ''}
                    onChange={e => onChange(index, { ...rule, campaignId: e.target.value || null })}
                    className={`text-xs px-2 py-1.5 ${inputCls}`}
                >
                    <option value="">— Select Campaign —</option>
                    {(campaigns || []).map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.totalImpressions?.toLocaleString()} impr)</option>
                    ))}
                </select>
            )}
        </div>
    );
}

// ─── AudienceCard ─────────────────────────────────────────────────────────────
function AudienceCard({ audience, onDelete, onEdit, d }) {
    const [size, setSize] = useState(null);
    const [loadingSize, setLoadingSize] = useState(false);

    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    const accentText = d.isDark ? 'text-lime-400' : 'text-lime-600';

    const loadSize = async () => {
        if (size !== null) return;
        setLoadingSize(true);
        try {
            const res = await advertiserAPI.getAudienceSize(audience.id);
            setSize(res.estimatedSize);
        } catch { setSize(0); }
        finally { setLoadingSize(false); }
    };

    useEffect(() => { loadSize(); }, []);

    const rules = Array.isArray(audience.rules) ? audience.rules : [];

    return (
        <div className={`${d.card} flex flex-col gap-4 transition-all ${d.cardHover}`}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className={`font-bold text-base ${headText}`}>{audience.name}</h3>
                    {audience.description && <p className={`text-xs mt-0.5 ${subText}`}>{audience.description}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => onEdit(audience)} className={`p-1.5 rounded-lg transition ${d.isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(audience.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Rules summary */}
            <div className="flex flex-wrap gap-1.5">
                {rules.slice(0, 4).map((r, i) => {
                    const cfg = RULE_TYPES.find(rt => rt.type === r.type);
                    // For geo rules, show flag + first few country codes
                    const geoPreview = cfg?.hasCountry && Array.isArray(r.values) && r.values.length > 0
                        ? r.values.slice(0, 3).map(code => {
                            const country = COUNTRIES.find(c => c.code === code);
                            return country ? `${country.flag} ${code}` : code;
                        }).join(', ') + (r.values.length > 3 ? ` +${r.values.length - 3}` : '')
                        : null;

                    return (
                        <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium border ${d.isDark ? 'bg-white/5 border-white/10 rounded-full text-gray-300' : 'bg-gray-100 border-gray-200 rounded text-gray-600'}`}>
                            <span>{cfg?.icon}</span>
                            {geoPreview ? geoPreview : cfg?.label}
                        </span>
                    );
                })}
                {rules.length > 4 && <span className={`text-[10px] ${subText}`}>+{rules.length - 4} more</span>}
                {rules.length === 0 && <span className={`text-[10px] ${subText}`}>No rules defined</span>}
            </div>

            {/* Estimated size */}
            <div className={`flex items-center justify-between pt-3 border-t ${d.isDark ? 'border-white/5' : 'border-gray-100'}`}>
                <div className="flex items-center gap-1.5">
                    <Users className={`w-3.5 h-3.5 ${subText}`} />
                    {loadingSize ? (
                        <span className={`text-xs ${subText} animate-pulse`}>Calculating...</span>
                    ) : size !== null ? (
                        <span className={`text-sm font-bold ${accentText}`}>~{size.toLocaleString()}</span>
                    ) : (
                        <span className={`text-xs ${subText}`}>—</span>
                    )}
                    <span className={`text-[10px] ${subText}`}>unique users (30d)</span>
                </div>
                <a href="/advertiser/campaigns/create" className={`text-[10px] flex items-center gap-1 font-medium ${d.isDark ? 'text-lime-400 hover:text-lime-300' : 'text-lime-600 hover:text-lime-700'} transition`}>
                    Use in campaign <ArrowRight className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}

// ─── CreateEditModal ──────────────────────────────────────────────────────────
function CreateEditModal({ audience, campaigns, onSave, onClose, d }) {
    const [name, setName] = useState(audience?.name || '');
    const [description, setDescription] = useState(audience?.description || '');
    const [rules, setRules] = useState(Array.isArray(audience?.rules) ? audience.rules : []);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';

    const addRule = () => {
        setRules(prev => [...prev, { type: 'GEO_INCLUDE', values: [] }]);
    };

    const updateRule = (idx, updated) => {
        setRules(prev => prev.map((r, i) => i === idx ? updated : r));
    };

    const removeRule = (idx) => {
        setRules(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        if (!name.trim()) { setError('Name is required'); return; }
        setSaving(true);
        setError('');
        try {
            await onSave({ name: name.trim(), description: description.trim(), rules });
            onClose();
        } catch (e) {
            setError(e.message || 'Failed to save audience');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 backdrop-blur-sm ${d.isDark ? 'bg-black/60' : 'bg-black/30'}`}
                onClick={onClose}
            />

            <div className={`relative w-full max-w-xl flex flex-col max-h-[85vh] ${d.isDark
                ? 'bg-slate-900 border border-white/10 rounded-2xl shadow-2xl'
                : 'bg-white border border-gray-200 rounded-xl shadow-xl'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b ${d.isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
                    <h3 className={`font-bold text-base ${headText}`}>{audience ? 'Edit Audience' : 'New Audience'}</h3>
                    <button onClick={onClose} className={`p-1.5 rounded-lg transition ${d.isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div>
                        <label className={d.labelCls}>Audience Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Turkish Mobile Users"
                            className={d.inputCls}
                        />
                    </div>

                    <div>
                        <label className={d.labelCls}>Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Optional description"
                            className={d.inputCls}
                        />
                    </div>

                    {/* Rules */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className={d.labelCls + ' !mb-0'}>Audience Rules</label>
                            <span className={`text-[10px] ${subText}`}>All rules must match (AND)</span>
                        </div>

                        {rules.length === 0 && (
                            <div className={`text-center py-6 border border-dashed ${d.isDark ? 'border-white/10 text-gray-500 rounded-xl' : 'border-gray-200 text-gray-400 rounded'} text-xs`}>
                                No rules yet. Add a rule to define who belongs to this audience.
                            </div>
                        )}

                        <div className="space-y-2">
                            {rules.map((rule, i) => (
                                <RuleRow key={i} rule={rule} index={i} onChange={updateRule} onRemove={removeRule} campaigns={campaigns} isDark={d.isDark} inputCls={d.inputCls} />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addRule}
                            className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-dashed text-xs font-medium transition ${d.isDark ? 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl' : 'border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded'}`}
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Rule
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-end gap-3 p-4 border-t ${d.isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
                    <button onClick={onClose} className={d.btnSecondary}>
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className={`${d.btnPrimary} disabled:opacity-50`}>
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {saving ? 'Saving...' : 'Save Audience'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AudiencesPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';

    const [audiences, setAudiences] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAudience, setEditingAudience] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [aud, cmp] = await Promise.allSettled([
                advertiserAPI.getAudiences(),
                advertiserAPI.getEligibleCampaigns(),
            ]);
            if (aud.status === 'fulfilled') setAudiences(aud.value || []);
            if (cmp.status === 'fulfilled') setCampaigns(cmp.value || []);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        if (editingAudience) {
            await advertiserAPI.updateAudience(editingAudience.id, data);
        } else {
            await advertiserAPI.createAudience(data);
        }
        await loadData();
    };

    const handleDelete = async (id) => {
        setConfirmDeleteId(id);
    };

    const doDelete = async () => {
        await advertiserAPI.deleteAudience(confirmDeleteId);
        setAudiences(prev => prev.filter(a => a.id !== confirmDeleteId));
    };

    const handleEdit = (audience) => {
        setEditingAudience(audience);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={d.heading}>Audiences</h1>
                    <p className={`${d.subheading} mt-1`}>
                        Build reusable audience segments for retargeting, suppression, and campaign efficiency.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={loadData} className={d.btnSecondary}>
                        <RefreshCw className="w-4 h-4 inline mr-1.5" />
                        Refresh
                    </button>
                    <button
                        onClick={() => { setEditingAudience(null); setShowModal(true); }}
                        className={`${d.btnPrimary} group`}
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> New Audience
                    </button>
                </div>
            </div>

            {/* Explain cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: Eye, title: 'Retargeting', desc: 'Show ads to users who previously saw or clicked your campaigns.', color: 'lime' },
                    { icon: EyeOff, title: 'Suppression', desc: 'Exclude already-converted users from future campaigns.', color: 'red' },
                    { icon: Layers, title: 'Audience Building', desc: 'Tag visitors of a campaign and retarget them later.', color: 'blue' },
                ].map(card => {
                    const Icon = card.icon;
                    const colorMap = {
                        lime: { iconCls: d.isDark ? 'text-lime-400' : 'text-lime-600', bgCls: d.isDark ? 'bg-lime-500/10 border-lime-500/20' : 'bg-lime-50 border-lime-200' },
                        red: { iconCls: d.isDark ? 'text-red-400' : 'text-red-600', bgCls: d.isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200' },
                        blue: { iconCls: d.isDark ? 'text-sky-400' : 'text-sky-600', bgCls: d.isDark ? 'bg-sky-500/10 border-sky-500/20' : 'bg-sky-50 border-sky-200' },
                    };
                    const colors = colorMap[card.color];
                    return (
                        <div key={card.title} className={d.card}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors.bgCls} border`}>
                                <Icon className={`w-5 h-5 ${colors.iconCls}`} />
                            </div>
                            <p className={`text-sm font-bold ${headText} mb-1`}>{card.title}</p>
                            <p className={`text-[11px] ${subText} leading-relaxed`}>{card.desc}</p>
                        </div>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className={`${d.card} flex items-center justify-center py-20`}>
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className={`w-8 h-8 ${d.loaderColor} animate-spin`} />
                        <p className={d.loaderText}>Loading audiences…</p>
                    </div>
                </div>
            ) : audiences.length === 0 ? (
                <div className={d.card}>
                    <div className="text-center py-12">
                        <Users className={`w-12 h-12 mx-auto mb-4 opacity-20 ${headText}`} />
                        <h3 className={`font-bold text-lg mb-1 ${headText}`}>No audiences yet</h3>
                        <p className={`text-sm mb-6 ${subText}`}>Create your first audience to start retargeting visitors across campaigns.</p>
                        <button
                            onClick={() => { setEditingAudience(null); setShowModal(true); }}
                            className={d.btnPrimary}
                        >
                            <Plus className="w-4 h-4" /> Create Your First Audience
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {audiences.map(aud => (
                        <AudienceCard
                            key={aud.id}
                            audience={aud}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            d={d}
                        />
                    ))}
                </div>
            )}

            {/* Delete confirm modal */}
            <ConfirmModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={doDelete}
                title="Delete Audience?"
                message="Campaigns using this audience will still run, but audience matching will be skipped. This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                d={d}
            />

            {/* Create/Edit modal */}
            {showModal && (
                <CreateEditModal
                    audience={editingAudience}
                    campaigns={campaigns}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditingAudience(null); }}
                    d={d}
                />
            )}
        </div>
    );
}
