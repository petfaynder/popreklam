'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advertiserAPI } from '@/lib/api';
import {
    ArrowLeft, Save, AlertTriangle, Loader2, Check,
    DollarSign, BarChart2, Globe, Smartphone, Chrome,
    CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

// ─── Toggle button (shared with create form) ──────────────────────────────────
function ToggleButton({ label, isSelected, onClick, d }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${isSelected
                    ? `${d.isDark ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-purple-50 border-purple-500 text-purple-700'}`
                    : `${d.isDark ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`
                }`}
        >
            {isSelected && <CheckCircle className="w-3 h-3" />}
            {label}
        </button>
    );
}

// ─── Collapsible section ───────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, d, isOpen, onToggle, hasValue }) {
    return (
        <div className={`rounded-xl border mb-4 overflow-hidden ${d.card}`}>
            <button
                type="button"
                onClick={onToggle}
                className={`w-full flex items-center justify-between p-4 text-left ${d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${hasValue ? 'bg-lime-400/10 text-lime-400' : d.isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className={`text-base font-bold ${d.heading}`}>{title}</h4>
                        {hasValue && <p className="text-xs text-lime-500 font-medium mt-0.5">Active filters</p>}
                    </div>
                </div>
                {isOpen ? <ChevronUp className={`w-5 h-5 ${d.muted}`} /> : <ChevronDown className={`w-5 h-5 ${d.muted}`} />}
            </button>
            {isOpen && (
                <div className={`p-6 border-t ${d.isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default function EditCampaignPage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const campaignId = params?.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [campaign, setCampaign] = useState(null);

    const [openSections, setOpenSections] = useState({ geo: true, device: false, browser: false });

    const [formData, setFormData] = useState({
        name: '', targetUrl: '', postbackUrl: '',
        totalBudget: '', dailyBudget: '', bidAmount: '',
        cpaGoal: '', autoOptimize: false,
        freqCap: 3, freqInterval: 24,
        countries: [], devices: [], os: [], browsers: [], connectionType: [],
        includeZones: '', excludeZones: '',
        dailyClicksLimit: '', totalClicksLimit: '',
    });

    // ── Load campaign ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!campaignId) return;
        (async () => {
            try {
                const camps = await advertiserAPI.getCampaigns();
                const camp = camps.find(c => c.id === campaignId);
                if (!camp) { setError('Campaign not found'); setLoading(false); return; }
                const t = camp.targeting || {};
                setCampaign(camp);
                setFormData({
                    name: camp.name || '',
                    targetUrl: camp.targetUrl || '',
                    postbackUrl: camp.postbackUrl || '',
                    totalBudget: camp.totalBudget || '',
                    dailyBudget: camp.dailyBudget || '',
                    bidAmount: camp.bidAmount || '',
                    cpaGoal: camp.cpaGoal || '',
                    autoOptimize: camp.autoOptimize || false,
                    freqCap: camp.freqCap || 3,
                    freqInterval: camp.freqInterval || 24,
                    countries: t.countries || [],
                    devices: t.devices || [],
                    os: t.os || [],
                    browsers: t.browsers || [],
                    connectionType: t.connectionType || [],
                    includeZones: Array.isArray(t.includeZones) ? t.includeZones.join(',') : (t.includeZones || ''),
                    excludeZones: Array.isArray(t.excludeZones) ? t.excludeZones.join(',') : (t.excludeZones || ''),
                    dailyClicksLimit: camp.dailyClicksLimit || '',
                    totalClicksLimit: camp.totalClicksLimit || '',
                });
            } catch (e) { setError(e.message); }
            finally { setLoading(false); }
        })();
    }, [campaignId]);

    const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const toggleArrayField = (field, value) => setFormData(prev => ({
        ...prev,
        [field]: prev[field].includes(value)
            ? prev[field].filter(v => v !== value)
            : [...prev[field], value]
    }));

    const toggleSection = (s) => setOpenSections(prev => ({ ...prev, [s]: !prev[s] }));

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setError(''); setSuccess('');
        setSaving(true);
        try {
            await advertiserAPI.updateCampaign(campaignId, {
                name: formData.name,
                targetUrl: formData.targetUrl,
                totalBudget: parseFloat(formData.totalBudget) || undefined,
                dailyBudget: formData.dailyBudget ? parseFloat(formData.dailyBudget) : null,
                bidAmount: parseFloat(formData.bidAmount) || undefined,
                cpaGoal: formData.cpaGoal ? parseFloat(formData.cpaGoal) : null,
                autoOptimize: Boolean(formData.autoOptimize),
                targeting: {
                    countries: formData.countries,
                    devices: formData.devices,
                    os: formData.os,
                    browsers: formData.browsers,
                    connectionType: formData.connectionType,
                    includeZones: formData.includeZones,
                    excludeZones: formData.excludeZones,
                },
                dailyClicksLimit: formData.dailyClicksLimit ? parseInt(formData.dailyClicksLimit) : null,
                totalClicksLimit: formData.totalClicksLimit ? parseInt(formData.totalClicksLimit) : null,
            });
            setSuccess('Campaign updated successfully!');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            setError(e.message || 'Failed to update campaign');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally { setSaving(false); }
    };

    // ─────────────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className={`w-12 h-12 ${d.loaderColor} animate-spin`} />
        </div>
    );

    if (error && !campaign) return (
        <div className={`${d.card} text-center py-16`}>
            <p className={d.muted}>{error}</p>
        </div>
    );

    const COUNTRIES = [
        'AF','AX','AL','DZ','AS','AD','AO','AI','AQ','AG','AR','AM','AW','AU','AT',
        'AZ','BS','BH','BD','BB','BY','BE','BZ','BJ','BM','BT','BO','BQ','BA','BW',
        'BV','BR','IO','BN','BG','BF','BI','CV','KH','CM','CA','KY','CF','TD','CL',
        'CN','CX','CC','CO','KM','CD','CG','CK','CR','CI','HR','CU','CW','CY','CZ',
        'DK','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FK','FO','FJ',
        'FI','FR','GF','PF','TF','GA','GM','GE','DE','GH','GI','GR','GL','GD','GP',
        'GU','GT','GG','GN','GW','GY','HT','HM','VA','HN','HK','HU','IS','IN','ID',
        'IR','IQ','IE','IM','IL','IT','JM','JP','JE','JO','KZ','KE','KI','KP','KR',
        'KW','KG','LA','LV','LB','LS','LR','LY','LI','LT','LU','MO','MG','MW','MY',
        'MV','ML','MT','MH','MQ','MR','MU','YT','MX','FM','MD','MC','MN','ME','MS',
        'MA','MZ','MM','NA','NR','NP','NL','NC','NZ','NI','NE','NG','NU','NF','MK',
        'MP','NO','OM','PK','PW','PS','PA','PG','PY','PE','PH','PN','PL','PT','PR',
        'QA','RE','RO','RU','RW','BL','SH','KN','LC','MF','PM','VC','WS','SM','ST',
        'SA','SN','RS','SC','SL','SG','SX','SK','SI','SB','SO','ZA','GS','SS','ES',
        'LK','SD','SR','SJ','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TK','TO',
        'TT','TN','TR','TM','TC','TV','UG','UA','AE','GB','US','UM','UY','UZ','VU',
        'VE','VN','VG','VI','WF','EH','YE','ZM','ZW'
    ];
    const DEVICES = ['DESKTOP', 'MOBILE', 'TABLET'];
    const OS_LIST = ['WINDOWS', 'MAC', 'LINUX', 'ANDROID', 'IOS'];
    const BROWSERS = ['CHROME', 'FIREFOX', 'SAFARI', 'EDGE', 'OPERA'];
    const CONNECTIONS = ['WIFI', 'CELLULAR_3G', 'CELLULAR_4G', 'CELLULAR_5G'];

    return (
        <div className={`min-h-screen ${d.mainPadding} ${d.shell} block`}>
            <div className="max-w-5xl mx-auto w-full">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button onClick={() => router.back()} className={`flex items-center gap-2 mb-2 text-sm font-medium hover:underline ${d.muted}`}>
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <h1 className={`text-2xl font-bold ${d.heading}`}>Edit Campaign</h1>
                        <p className={`text-sm mt-0.5 ${d.muted}`}>{campaign?.name}</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`hidden md:flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${!saving
                                ? 'bg-gradient-to-r from-lime-500 to-green-600 text-white hover:shadow-lime-500/25'
                                : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />{error}
                    </div>
                )}
                {success && (
                    <div className="mb-5 p-4 bg-lime-500/10 border border-lime-500/20 rounded-xl flex items-center gap-3 text-lime-400">
                        <Check className="w-5 h-5 flex-shrink-0" />{success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT — Main form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* General Info */}
                        <div className={`p-6 rounded-2xl border ${d.card}`}>
                            <h3 className={`text-lg font-bold mb-5 ${d.heading}`}>General</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${d.subheading}`}>Campaign Name</label>
                                    <input type="text" value={formData.name} onChange={e => updateField('name', e.target.value)} className={d.inputCls} placeholder="Summer Sale 2025" />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${d.subheading}`}>Target URL</label>
                                    <input type="url" value={formData.targetUrl} onChange={e => updateField('targetUrl', e.target.value)} className={d.inputCls} placeholder="https://yoursite.com/landing" />
                                </div>
                            </div>
                        </div>

                        {/* Budget & Bid */}
                        <div className={`p-6 rounded-2xl border ${d.card}`}>
                            <h3 className={`text-lg font-bold mb-5 flex items-center gap-2 ${d.heading}`}>
                                <DollarSign className={`w-5 h-5 ${d.accent}`} />Budget & Bid
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                {[
                                    { label: 'Total Budget', key: 'totalBudget', placeholder: '100.00' },
                                    { label: 'Daily Budget', key: 'dailyBudget', placeholder: 'Unlimited' },
                                    { label: 'Bid Amount (CPM)', key: 'bidAmount', placeholder: '0.50' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className={`block text-sm font-medium mb-1.5 ${d.subheading}`}>{f.label}</label>
                                        <div className="relative">
                                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${d.text}`}>$</span>
                                            <input
                                                type="number" step="0.01" min="0"
                                                value={formData[f.key]}
                                                onChange={e => updateField(f.key, e.target.value)}
                                                placeholder={f.placeholder}
                                                className={`${d.inputCls} pl-8`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Smart CPA */}
                            <div className="p-5 rounded-2xl border border-lime-500/20 bg-lime-500/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-28 h-28 bg-lime-500/10 rounded-full blur-3xl" />
                                <div className="flex items-start justify-between gap-4 relative z-10">
                                    <div>
                                        <h4 className="text-base font-bold text-lime-500 flex items-center gap-2 mb-1">
                                            <BarChart2 className="w-5 h-5 text-lime-400" />
                                            Smart CPA Auto-Optimization
                                        </h4>
                                        <p className={`text-sm ${d.muted}`}>Automatically blacklist publisher sites that fail to convert.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                                        <input type="checkbox" checked={formData.autoOptimize} onChange={e => updateField('autoOptimize', e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500" />
                                    </label>
                                </div>
                                {formData.autoOptimize && (
                                    <div className="mt-5 pt-5 border-t border-lime-500/10">
                                        <label className="block text-sm font-bold mb-2 text-lime-400">Target CPA Goal</label>
                                        <div className="relative max-w-[200px]">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-white">$</span>
                                            <input
                                                type="number" step="0.01" min="0.01"
                                                value={formData.cpaGoal}
                                                onChange={e => updateField('cpaGoal', e.target.value)}
                                                placeholder="1.50"
                                                className="w-full bg-black/40 border border-lime-500/30 rounded-xl py-2.5 pl-8 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-lime-500 transition-colors font-bold"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Click Limits */}
                        <div className={`p-6 rounded-2xl border ${d.card}`}>
                            <h3 className={`text-lg font-bold mb-5 flex items-center gap-2 ${d.heading}`}>
                                <BarChart2 className={`w-5 h-5 ${d.accent}`} />Click Limits
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${d.isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>Auto-Pause</span>
                            </h3>
                            <p className={`text-sm mb-4 ${d.muted}`}>Campaign will automatically pause when limit is reached. Leave empty for unlimited.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${d.subheading}`}>Daily Clicks Limit</label>
                                    <input type="number" min="1" step="1" value={formData.dailyClicksLimit}
                                        onChange={e => updateField('dailyClicksLimit', e.target.value)}
                                        placeholder="e.g. 500 — empty = unlimited"
                                        className={d.inputCls} />
                                    <p className={`text-xs mt-1.5 ${d.muted}`}>Resets every midnight (UTC)</p>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${d.subheading}`}>Total Clicks Limit</label>
                                    <input type="number" min="1" step="1" value={formData.totalClicksLimit}
                                        onChange={e => updateField('totalClicksLimit', e.target.value)}
                                        placeholder="e.g. 10000 — empty = unlimited"
                                        className={d.inputCls} />
                                    <p className={`text-xs mt-1.5 ${d.muted}`}>Lifetime cap for this campaign</p>
                                </div>
                            </div>
                        </div>

                        {/* Targeting */}
                        <div className="mb-6">
                            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${d.heading}`}>
                                <Globe className={`w-5 h-5 ${d.accent}`} />Targeting
                            </h3>

                            <Section id="geo" title="Geography" icon={Globe} d={d}
                                isOpen={openSections.geo} onToggle={() => toggleSection('geo')}
                                hasValue={formData.countries.length > 0}>
                                <div className="flex flex-wrap gap-2">
                                    {COUNTRIES.map(c => (
                                        <ToggleButton key={c} label={c} d={d}
                                            isSelected={formData.countries.includes(c)}
                                            onClick={() => toggleArrayField('countries', c)} />
                                    ))}
                                </div>
                            </Section>

                            <Section id="device" title="Device & System" icon={Smartphone} d={d}
                                isOpen={openSections.device} onToggle={() => toggleSection('device')}
                                hasValue={formData.devices.length > 0 || formData.os.length > 0}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d.muted}`}>Device Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {DEVICES.map(dev => (
                                                <ToggleButton key={dev} label={dev} d={d}
                                                    isSelected={formData.devices.includes(dev)}
                                                    onClick={() => toggleArrayField('devices', dev)} />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d.muted}`}>Operating System</label>
                                        <div className="flex flex-wrap gap-2">
                                            {OS_LIST.map(os => (
                                                <ToggleButton key={os} label={os} d={d}
                                                    isSelected={formData.os.includes(os)}
                                                    onClick={() => toggleArrayField('os', os)} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            <Section id="browser" title="Browser & Connection" icon={Chrome} d={d}
                                isOpen={openSections.browser} onToggle={() => toggleSection('browser')}
                                hasValue={formData.browsers.length > 0 || formData.connectionType.length > 0}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d.muted}`}>Browser</label>
                                        <div className="flex flex-wrap gap-2">
                                            {BROWSERS.map(br => (
                                                <ToggleButton key={br} label={br} d={d}
                                                    isSelected={formData.browsers.includes(br)}
                                                    onClick={() => toggleArrayField('browsers', br)} />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d.muted}`}>Connection Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {CONNECTIONS.map(conn => (
                                                <ToggleButton key={conn} label={conn.replace('CELLULAR_', '')} d={d}
                                                    isSelected={formData.connectionType.includes(conn)}
                                                    onClick={() => toggleArrayField('connectionType', conn)} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            {/* Zone Whitelist/Blacklist */}
                            <div className={`p-5 rounded-2xl border ${d.card}`}>
                                <h4 className={`text-sm font-bold mb-4 ${d.heading}`}>Zone Targeting</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${d.muted}`}>Include Zone IDs (comma separated)</label>
                                        <textarea value={formData.includeZones} onChange={e => updateField('includeZones', e.target.value)} rows={2}
                                            placeholder="zone-id-1, zone-id-2"
                                            className={`${d.inputCls} h-auto resize-none py-2`} />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${d.muted}`}>Exclude Zone IDs (comma separated)</label>
                                        <textarea value={formData.excludeZones} onChange={e => updateField('excludeZones', e.target.value)} rows={2}
                                            placeholder="zone-id-3, zone-id-4"
                                            className={`${d.inputCls} h-auto resize-none py-2`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Save Button */}
                        <div className="md:hidden mt-4 pb-12">
                            <button onClick={handleSave} disabled={saving}
                                className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold shadow-lg transition-all ${!saving
                                    ? 'bg-gradient-to-r from-lime-500 to-green-600 text-white'
                                    : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                                    }`}>
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT — Summary card */}
                    <div className="lg:col-span-1">
                        <div className={`p-5 rounded-2xl border sticky top-6 ${d.card}`}>
                            <h4 className={`text-sm font-bold mb-4 ${d.heading}`}>Campaign Summary</h4>
                            {campaign && (
                                <div className="space-y-3 text-sm">
                                    {[
                                        { label: 'Format', value: campaign.adFormat },
                                        { label: 'Status', value: campaign.status },
                                        { label: 'Total Spent', value: `$${Number(campaign.totalSpent).toFixed(2)}` },
                                        { label: 'Impressions', value: Number(campaign.totalImpressions).toLocaleString() },
                                        { label: 'Clicks', value: Number(campaign.totalClicks).toLocaleString() },
                                        { label: 'Conversions', value: Number(campaign.totalConversions).toLocaleString() },
                                    ].map(s => (
                                        <div key={s.label} className="flex items-center justify-between">
                                            <span className={d.muted}>{s.label}</span>
                                            <span className={`font-semibold ${d.text}`}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={`mt-5 pt-4 border-t ${d.isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                <p className={`text-xs ${d.muted}`}>
                                    Changes to budget and bid take effect immediately. Targeting changes apply within ~15 minutes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
