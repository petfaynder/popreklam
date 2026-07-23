'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advertiserAPI } from '@/lib/api';
import {
    ArrowLeft, SlidersHorizontal, Trash2, Plus, Save,
    Loader2, AlertTriangle, TestTube2, CheckCircle
} from 'lucide-react';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

// ─── Weight bar visual ────────────────────────────────────────────────────────
function WeightBar({ creatives, editedWeights }) {
    const total = creatives.reduce((s, c) => s + (editedWeights[c.id] ?? c.weight), 0);
    return (
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {creatives.map((c, i) => {
                const w = editedWeights[c.id] ?? c.weight;
                const pct = total > 0 ? (w / total) * 100 : 100 / creatives.length;
                const colors = ['bg-purple-500', 'bg-sky-500', 'bg-lime-500', 'bg-orange-500', 'bg-pink-500'];
                return (
                    <div key={c.id} className={`${colors[i % colors.length]} transition-all`}
                        style={{ width: `${pct}%` }}
                        title={`${c.label || `Creative ${i + 1}`}: ${pct.toFixed(0)}%`} />
                );
            })}
        </div>
    );
}

const COLORS = ['border-purple-500/50 bg-purple-500/10', 'border-sky-500/50 bg-sky-500/10',
    'border-lime-500/50 bg-lime-500/10', 'border-orange-500/50 bg-orange-500/10',
    'border-pink-500/50 bg-pink-500/10'];
const DOT_COLORS = ['bg-purple-400', 'bg-sky-400', 'bg-lime-400', 'bg-orange-400', 'bg-pink-400'];

export default function CreativeManagerPage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const campaignId = params?.id;

    const [creatives, setCreatives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // creativeId being saved
    const [deleting, setDeleting] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editedWeights, setEditedWeights] = useState({});
    const [editedLabels, setEditedLabels] = useState({});

    const load = async () => {
        try {
            setLoading(true);
            const { creatives: list } = await advertiserAPI.getCreatives(campaignId);
            setCreatives(list);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (campaignId) load(); }, [campaignId]);

    const handleSave = async (creativeId) => {
        setSaving(creativeId);
        setError(''); setSuccess('');
        try {
            await advertiserAPI.updateCreative(campaignId, creativeId, {
                weight: editedWeights[creativeId] ?? creatives.find(c => c.id === creativeId)?.weight,
                label: editedLabels[creativeId] ?? creatives.find(c => c.id === creativeId)?.label,
            });
            setSuccess('Creative updated!'); await load();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) { setError(e.message); }
        finally { setSaving(null); }
    };

    const handleDelete = async (creativeId) => {
        setDeleting(creativeId); setError('');
        try {
            await advertiserAPI.deleteCreative(campaignId, creativeId);
            await load();
        } catch (e) { setError(e.message); }
        finally { setDeleting(null); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className={`w-10 h-10 ${d.loaderColor} animate-spin`} />
        </div>
    );

    const totalWeight = creatives.reduce((s, c) => s + (editedWeights[c.id] ?? c.weight), 0);

    return (
        <div className={`min-h-screen ${d.mainPadding} ${d.shell} block`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className={`p-2 rounded-xl border ${d.isDark ? 'border-white/10 bg-white/5 text-gray-400 hover:text-white' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-900'}`}>
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className={`text-xl font-bold flex items-center gap-2 ${d.heading}`}>
                            <TestTube2 className="w-5 h-5 text-purple-400" />
                            A/B Creative Manager
                        </h1>
                        <p className={`text-sm mt-0.5 ${d.muted}`}>Distribute traffic across creatives using weights</p>
                    </div>
                </div>

                {/* Alerts */}
                {error && <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"><AlertTriangle className="w-4 h-4" />{error}</div>}
                {success && <div className="mb-5 p-4 bg-lime-500/10 border border-lime-500/20 rounded-xl flex items-center gap-3 text-lime-400"><CheckCircle className="w-4 h-4" />{success}</div>}

                {/* Distribution Preview */}
                {creatives.length > 1 && (
                    <div className={`p-5 rounded-2xl border mb-6 ${d.card}`}>
                        <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${d.heading}`}>
                            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                            Traffic Distribution Preview
                        </h3>
                        <WeightBar creatives={creatives} editedWeights={editedWeights} />
                        <div className="flex flex-wrap gap-4 mt-3">
                            {creatives.map((c, i) => {
                                const w = editedWeights[c.id] ?? c.weight;
                                const pct = totalWeight > 0 ? ((w / totalWeight) * 100).toFixed(0) : 0;
                                return (
                                    <div key={c.id} className="flex items-center gap-2 text-xs">
                                        <div className={`w-2.5 h-2.5 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`} />
                                        <span className={d.muted}>{editedLabels[c.id] ?? (c.label || `Creative ${i + 1}`)}</span>
                                        <span className={`font-bold ${d.text}`}>{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Creative Cards */}
                <div className="space-y-4">
                    {creatives.map((c, i) => {
                        const currWeight = editedWeights[c.id] ?? c.weight;
                        const currLabel = editedLabels[c.id] ?? (c.label || `Creative ${i + 1}`);
                        const isDirty = editedWeights[c.id] !== undefined || editedLabels[c.id] !== undefined;

                        return (
                            <div key={c.id} className={`p-5 rounded-2xl border ${COLORS[i % COLORS.length]}`}>
                                <div className="flex items-start justify-between gap-4 mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${DOT_COLORS[i % DOT_COLORS.length]} bg-opacity-20 flex items-center justify-center`}>
                                            <span className="text-sm font-bold text-white">{String.fromCharCode(65 + i)}</span>
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={currLabel}
                                                onChange={e => setEditedLabels(prev => ({ ...prev, [c.id]: e.target.value }))}
                                                className={`font-bold bg-transparent border-none outline-none text-sm ${d.text} focus:border-b focus:border-white/20`}
                                                placeholder="Version label"
                                            />
                                            <p className={`text-xs ${d.muted}`}>
                                                {c.stats.impressions.toLocaleString()} impr · ${c.stats.spent.toFixed(4)} spent (7d)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isDirty && (
                                            <button onClick={() => handleSave(c.id)} disabled={saving === c.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-lime-500 rounded-xl text-xs font-bold text-black">
                                                {saving === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                Save
                                            </button>
                                        )}
                                        {creatives.length > 1 && (
                                            <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                                                {deleting === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Creative content preview */}
                                <div className={`p-4 rounded-xl mb-5 text-sm ${d.isDark ? 'bg-black/20' : 'bg-white/60'}`}>
                                    {c.title && <p className={`font-bold ${d.text}`}>{c.title}</p>}
                                    {c.description && <p className={`text-xs mt-0.5 ${d.muted}`}>{c.description}</p>}
                                    {c.htmlCode && <p className={`text-xs font-mono ${d.muted}`}>Custom HTML code</p>}
                                    {!c.title && !c.description && !c.htmlCode && (
                                        <p className={`text-xs ${d.muted}`}>No content preview available</p>
                                    )}
                                </div>

                                {/* Weight slider */}
                                <div>
                                    <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${d.muted}`}>
                                        Traffic Weight: <span className="text-purple-400 font-black">{currWeight}</span>
                                        <span className={`ml-2 font-normal ${d.muted}`}>
                                            ({totalWeight > 0 ? ((currWeight / totalWeight) * 100).toFixed(0) : 0}% of traffic)
                                        </span>
                                    </label>
                                    <input
                                        type="range" min="1" max="100" value={currWeight}
                                        onChange={e => setEditedWeights(prev => ({ ...prev, [c.id]: Number(e.target.value) }))}
                                        className="w-full h-2 rounded-full accent-purple-500"
                                    />
                                    <div className="flex justify-between text-[10px] mt-1">
                                        <span className={d.muted}>1</span>
                                        <span className={d.muted}>50</span>
                                        <span className={d.muted}>100</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {creatives.length === 0 && (
                        <div className={`text-center py-16 ${d.card} rounded-2xl border`}>
                            <TestTube2 className={`w-10 h-10 mx-auto mb-4 ${d.muted}`} />
                            <p className={`${d.muted} text-sm`}>No creatives yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
