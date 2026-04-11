'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';

const S = {
    page: { padding: '24px 28px', minHeight: '100vh', background: '#05050f', fontFamily: 'DM Sans, sans-serif' },
    card: { background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px 24px', marginBottom: '16px' },
    sectionTitle: { fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    label: { fontSize: '14px', color: '#f1f5f9', fontWeight: 600 },
    desc: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
    input: { padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif', width: '200px', textAlign: 'right' },
    toggle: { width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer', border: 'none', position: 'relative', transition: 'background 0.2s', flexShrink: 0 },
    saveBtn: { padding: '10px 22px', borderRadius: '9px', border: 'none', background: '#8b5cf6', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
};

// Groups must match SystemSetting.group values in Prisma schema:
// general | financial | adserver | notifications | security
const GROUPS = {
    general: { label: 'General Platform', icon: '⚙️' },
    financial: { label: 'Payment & Finance', icon: '💰' },
    adserver: { label: 'Ad Server', icon: '📢' },
    ad_networks: { label: 'Third-Party Networks', icon: '🌐' },
    payments: { label: 'Payment Gateways', icon: '💳' },
    invoice: { label: 'Invoice & Branding', icon: '🧾' },
    notifications: { label: 'Notifications', icon: '🔔' },
    security: { label: 'Security', icon: '🔒' },
    priority: { label: 'Priority / Loyalty', icon: '👑' },
};

function Toggle({ checked, onChange }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            style={{ ...S.toggle, background: checked ? '#8b5cf6' : 'rgba(255,255,255,0.1)' }}
        >
            <span style={{
                position: 'absolute', top: '3px', left: checked ? '25px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', display: 'block',
            }} />
        </button>
    );
}

export default function SettingsPage() {
    const [settings, setSettings] = useState({});
    const [edited, setEdited] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeGroup, setActiveGroup] = useState('general');
    const toast = useToast();

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            // Backend returns { settings: [...], grouped: {...} }
            const d = await adminAPI.getSettings();
            const items = Array.isArray(d) ? d : (Array.isArray(d?.settings) ? d.settings : []);
            if (items.length === 0) {
                // No settings yet — seed and reload
                await adminAPI.seedSettings();
                const d2 = await adminAPI.getSettings();
                const items2 = Array.isArray(d2) ? d2 : (Array.isArray(d2?.settings) ? d2.settings : []);
                const map2 = {};
                items2.forEach(s => { map2[s.key] = s; });
                setSettings(map2);
            } else {
                const map = {};
                items.forEach(s => { map[s.key] = s; });
                setSettings(map);
            }
        } catch (e) {
            toast.error('Failed to load settings');
        } finally { setLoading(false); }
    };

    const groupItems = Object.values(settings).filter(s => s.group === activeGroup);

    const getValue = (key) => {
        if (key in edited) return edited[key];
        return settings[key]?.value ?? '';
    };

    const update = (key, val) => {
        setEdited(prev => ({ ...prev, [key]: val }));
    };

    const save = async () => {
        if (Object.keys(edited).length === 0) { toast.info('No changes to save'); return; }
        setSaving(true);
        try {
            const updates = Object.entries(edited).map(([key, value]) => ({ key, value: String(value) }));
            await adminAPI.bulkUpdateSettings(updates);
            // Merge back
            setSettings(prev => {
                const next = { ...prev };
                updates.forEach(({ key, value }) => { if (next[key]) next[key] = { ...next[key], value }; });
                return next;
            });
            setEdited({});
            toast.success(`${updates.length} setting${updates.length > 1 ? 's' : ''} saved`);
        } catch (e) { toast.error('Failed to save settings'); }
        finally { setSaving(false); }
    };

    const reset = async (key) => {
        try {
            const result = await adminAPI.resetSetting(key);
            if (result?.setting) {
                setSettings(prev => ({ ...prev, [key]: result.setting }));
                setEdited(prev => { const n = { ...prev }; delete n[key]; return n; });
            }
            toast.success(`${key} reset to default`);
        } catch (e) { toast.error('Failed to reset'); }
    };

    const renderInput = (setting) => {
        const val = getValue(setting.key);
        const isDirty = setting.key in edited;

        if (setting.type === 'boolean') {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Toggle checked={val === 'true' || val === true} onChange={v => update(setting.key, String(v))} />
                    {isDirty && <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>Modified</span>}
                </div>
            );
        }

        if (setting.type === 'number') {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="number" value={val} onChange={e => update(setting.key, e.target.value)}
                        style={{ ...S.input, width: '120px', borderColor: isDirty ? 'rgba(139,92,246,0.5)' : undefined }} />
                    {isDirty && (
                        <button onClick={() => reset(setting.key)} style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>↩ Reset</button>
                    )}
                </div>
            );
        }

        if (setting.key === 'global_theme') {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select value={val} onChange={e => update(setting.key, e.target.value)}
                        style={{ ...S.input, borderColor: isDirty ? 'rgba(139,92,246,0.5)' : undefined, width: '220px' }}>
                        <option value="theme-brutalist">Theme: Neo-Brutalist</option>
                        <option value="theme-saas">Theme: Sentinel (SaaS)</option>
                        <option value="theme-luminous">Theme: Luminous (Neon)</option>
                        <option value="theme-editorial">Theme: Editorial</option>
                        <option value="theme-azure">Theme: Azure</option>
                    </select>
                    {isDirty && (
                        <button onClick={() => reset(setting.key)} style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>↩</button>
                    )}
                </div>
            );
        }

        if (setting.type === 'text') {
            return (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <textarea value={val} onChange={e => update(setting.key, e.target.value)}
                        style={{ ...S.input, borderColor: isDirty ? 'rgba(139,92,246,0.5)' : undefined, minHeight: '80px', resize: 'vertical', width: '300px' }} />
                    {isDirty && (
                        <button onClick={() => reset(setting.key)} style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: '6px' }}>↩</button>
                    )}
                </div>
            );
        }

        if (setting.type === 'password') {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="password" value={val} onChange={e => update(setting.key, e.target.value)}
                        style={{ ...S.input, borderColor: isDirty ? 'rgba(139,92,246,0.5)' : undefined }} placeholder="••••••••" />
                    {isDirty && (
                        <button onClick={() => reset(setting.key)} style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>↩</button>
                    )}
                </div>
            );
        }

        if (setting.key.includes('email') || setting.key.includes('url') || setting.key.includes('name') || setting.key.includes('currency')) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="text" value={val} onChange={e => update(setting.key, e.target.value)}
                        style={{ ...S.input, borderColor: isDirty ? 'rgba(139,92,246,0.5)' : undefined }} />
                    {isDirty && (
                        <button onClick={() => reset(setting.key)} style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>↩</button>
                    )}
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="text" value={val} onChange={e => update(setting.key, e.target.value)}
                    style={{ ...S.input, borderColor: isDirty ? 'rgba(139,92,246,0.5)' : undefined }} />
                {isDirty && (
                    <button onClick={() => reset(setting.key)} style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>↩</button>
                )}
            </div>
        );
    };

    const dirtyCount = Object.keys(edited).length;

    return (
        <div style={S.page}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Geist Mono, monospace', marginBottom: '4px' }}>Platform Settings</h1>
                    <p style={{ fontSize: '13px', color: '#475569' }}>Configure global platform settings</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {dirtyCount > 0 && (
                        <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 700, background: 'rgba(245,158,11,0.1)', padding: '5px 10px', borderRadius: '6px' }}>
                            {dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''}
                        </span>
                    )}
                    <button onClick={save} disabled={saving || dirtyCount === 0} style={{ ...S.saveBtn, opacity: (saving || dirtyCount === 0) ? 0.5 : 1 }}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Sidebar */}
                <div style={{ width: '200px', flexShrink: 0 }}>
                    {Object.entries(GROUPS).map(([key, g]) => {
                        const count = Object.values(settings).filter(s => s.group === key).length;
                        const changedInGroup = Object.values(settings).filter(s => s.group === key && s.key in edited).length;
                        return (
                            <button key={key} onClick={() => setActiveGroup(key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                    padding: '10px 12px', borderRadius: '8px', border: 'none',
                                    background: activeGroup === key ? 'rgba(139,92,246,0.15)' : 'transparent',
                                    color: activeGroup === key ? '#c4b5fd' : '#64748b',
                                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                    textAlign: 'left', marginBottom: '2px', transition: 'all 0.15s',
                                    borderLeft: activeGroup === key ? '2px solid #8b5cf6' : '2px solid transparent',
                                }}>
                                <span>{g.icon}</span>
                                <span style={{ flex: 1 }}>{g.label}</span>
                                {changedInGroup > 0 && <span style={{ background: '#f59e0b', width: '8px', height: '8px', borderRadius: '50%', display: 'block' }} />}
                            </button>
                        );
                    })}
                </div>

                {/* Settings Panel */}
                <div style={{ flex: 1 }}>
                    <div style={S.card}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '20px' }}>{GROUPS[activeGroup]?.icon}</span>
                            <div style={S.sectionTitle}>{GROUPS[activeGroup]?.label} Settings</div>
                        </div>

                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} style={{ ...S.row, opacity: 0.5 }}>
                                    <div style={{ height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '200px' }} />
                                    <div style={{ height: '34px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', width: '120px' }} />
                                </div>
                            ))
                        ) : groupItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569', fontSize: '14px' }}>
                                No settings in this group.{' '}
                                <button onClick={() => adminAPI.seedSettings().then(load)} style={{ color: '#8b5cf6', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}>
                                    Seed defaults
                                </button>
                            </div>
                        ) : (
                            groupItems.map(s => (
                                <div key={s.key} style={S.row}>
                                    <div>
                                        <div style={{ ...S.label, color: s.key in edited ? '#c4b5fd' : '#f1f5f9' }}>
                                            {s.label}
                                        </div>
                                        {s.description && <div style={S.desc}>{s.description}</div>}
                                    </div>
                                    {renderInput(s)}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
