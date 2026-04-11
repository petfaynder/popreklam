import { useState, useCallback } from 'react';
import { Image as ImageIcon, Type, Link as LinkIcon, UploadCloud, Eye, Smartphone, Monitor, Plus, Trash2, FlaskConical, GripVertical } from 'lucide-react';
import { getDashboardTheme } from '@/lib/themeUtils';
import useTheme from '@/hooks/useTheme';

export default function CreativesSection({ formData, updateField, setFormData }) {
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const [previewDevice, setPreviewDevice] = useState('MOBILE');
    const [activeVariant, setActiveVariant] = useState(0);

    // Initialize variants from formData or create a default one
    const variants = formData.creativeVariants || [{
        label: 'Original',
        weight: 100,
        title: formData.creativeTitle || '',
        description: formData.creativeDesc || '',
        iconUrl: formData.creativeIcon || '',
        imageUrl: formData.creativeImage || '',
    }];

    const updateVariants = useCallback((newVariants) => {
        setFormData(prev => ({
            ...prev,
            creativeVariants: newVariants,
            // Keep backward compat — first variant is the "main" creative
            creativeTitle: newVariants[0]?.title || '',
            creativeDesc: newVariants[0]?.description || '',
            creativeIcon: newVariants[0]?.iconUrl || '',
            creativeImage: newVariants[0]?.imageUrl || '',
        }));
    }, [setFormData]);

    // ── EARLY RETURN: must be AFTER all hooks ──
    if (formData.adFormat === 'POPUNDER') {
        return null;
    }

    // Push notification has different fields and character limits
    const isPush = formData.adFormat === 'PUSH_NOTIFICATION';
    const titleMaxLength = isPush ? 50 : 30;
    const descMaxLength = isPush ? 125 : 45;

    const updateVariant = (index, field, value) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        updateVariants(updated);
    };

    const addVariant = () => {
        if (variants.length >= 5) return;
        const labels = ['Original', 'Variant B', 'Variant C', 'Variant D', 'Variant E'];
        const newWeight = Math.floor(100 / (variants.length + 1));
        const rebalanced = variants.map(v => ({ ...v, weight: newWeight }));
        const remainder = 100 - (newWeight * (variants.length + 1));
        rebalanced[0].weight += remainder;

        updateVariants([...rebalanced, {
            label: labels[variants.length] || `Variant ${variants.length + 1}`,
            weight: newWeight,
            title: '',
            description: '',
            iconUrl: '',
            imageUrl: '',
        }]);
        setActiveVariant(variants.length);
    };

    const removeVariant = (index) => {
        if (variants.length <= 1) return;
        const updated = variants.filter((_, i) => i !== index);
        // Redistribute weight
        const totalWeight = updated.reduce((sum, v) => sum + v.weight, 0);
        if (totalWeight !== 100) {
            const diff = 100 - totalWeight;
            updated[0].weight += diff;
        }
        updateVariants(updated);
        setActiveVariant(Math.min(activeVariant, updated.length - 1));
    };

    const updateWeight = (index, newWeight) => {
        const clamped = Math.max(5, Math.min(95, newWeight));
        const updated = [...variants];
        const oldWeight = updated[index].weight;
        const diff = clamped - oldWeight;

        // Distribute the difference among other variants
        const others = updated.filter((_, i) => i !== index);
        const totalOthersWeight = others.reduce((s, v) => s + v.weight, 0);

        updated[index].weight = clamped;
        for (let i = 0; i < updated.length; i++) {
            if (i !== index) {
                const proportion = totalOthersWeight > 0 ? updated[i].weight / totalOthersWeight : 1 / (updated.length - 1);
                updated[i].weight = Math.max(5, Math.round(updated[i].weight - diff * proportion));
            }
        }

        // Fix rounding errors
        const total = updated.reduce((s, v) => s + v.weight, 0);
        if (total !== 100) {
            const fixIdx = updated.findIndex((_, i) => i !== index);
            if (fixIdx !== -1) updated[fixIdx].weight += 100 - total;
        }

        updateVariants(updated);
    };

    const current = variants[activeVariant] || variants[0];

    // Variant color assignments
    const variantColors = [
        { bg: d.isDark ? 'bg-lime-500/15' : 'bg-[#1A1A1A]/5', text: d.isDark ? 'text-lime-400' : 'text-[#1A1A1A]', ring: d.isDark ? 'ring-lime-500/40' : 'ring-[#1A1A1A]/30', bar: d.isDark ? 'bg-lime-500' : 'bg-[#1A1A1A]' },
        { bg: d.isDark ? 'bg-sky-500/15' : 'bg-sky-500/10', text: d.isDark ? 'text-sky-400' : 'text-sky-600', ring: d.isDark ? 'ring-sky-500/40' : 'ring-sky-500/30', bar: 'bg-sky-500' },
        { bg: d.isDark ? 'bg-amber-500/15' : 'bg-amber-500/10', text: d.isDark ? 'text-amber-400' : 'text-amber-600', ring: d.isDark ? 'ring-amber-500/40' : 'ring-amber-500/30', bar: 'bg-amber-500' },
        { bg: d.isDark ? 'bg-purple-500/15' : 'bg-purple-500/10', text: d.isDark ? 'text-purple-400' : 'text-purple-600', ring: d.isDark ? 'ring-purple-500/40' : 'ring-purple-500/30', bar: 'bg-purple-500' },
        { bg: d.isDark ? 'bg-rose-500/15' : 'bg-rose-500/10', text: d.isDark ? 'text-rose-400' : 'text-rose-600', ring: d.isDark ? 'ring-rose-500/40' : 'ring-rose-500/30', bar: 'bg-rose-500' },
    ];

    return (
        <div className={`p-6 rounded-2xl mb-6 border ${d.card} ${d.cardHover}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${d.heading}`}>
                    <ImageIcon className={`w-5 h-5 ${d.accent}`} />
                    Ad Creatives & Preview
                </h3>

                {variants.length > 1 && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold ${d.isDark ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-50 text-sky-600'}`}>
                        <FlaskConical className="w-3 h-3" />
                        A/B TEST ACTIVE · {variants.length} variants
                    </div>
                )}
            </div>

            {/* ─── VARIANT TABS ─── */}
            <div className={`flex items-center gap-2 mb-5 pb-4 border-b overflow-x-auto ${d.isDark ? 'border-white/5' : 'border-gray-100'}`}>
                {variants.map((variant, idx) => {
                    const vc = variantColors[idx] || variantColors[0];
                    const isActive = idx === activeVariant;
                    return (
                        <div
                            key={idx}
                            role="button"
                            tabIndex={0}
                            onClick={() => setActiveVariant(idx)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveVariant(idx); }}
                            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none
                                ${isActive
                                    ? `${vc.bg} ${vc.text} ring-2 ${vc.ring}`
                                    : `${d.isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-500'}`
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isActive ? vc.bar : d.isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                            {variant.label}
                            <span className={`text-[10px] font-mono ${isActive ? vc.text : ''}`}>{variant.weight}%</span>
                            {idx > 0 && isActive && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeVariant(idx); }}
                                    className={`ml-1 p-0.5 rounded hover:bg-red-500/20 text-red-400`}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    );
                })}
                {variants.length < 5 && (
                    <button
                        type="button"
                        onClick={addVariant}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-dashed transition-all
                            ${d.isDark
                                ? 'border-white/10 text-gray-400 hover:border-lime-500/40 hover:text-lime-400 hover:bg-lime-500/5'
                                : 'border-gray-300 text-gray-500 hover:border-[#1A1A1A]/30 hover:text-[#1A1A1A] hover:bg-gray-50'
                            }`}
                    >
                        <Plus className="w-3 h-3" />
                        Add Variant
                    </button>
                )}
            </div>

            {/* ─── WEIGHT DISTRIBUTION BAR ─── */}
            {variants.length > 1 && (
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${d.muted}`}>Traffic Distribution</span>
                    </div>
                    <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                        {variants.map((v, idx) => {
                            const vc = variantColors[idx] || variantColors[0];
                            return (
                                <div
                                    key={idx}
                                    className={`${vc.bar} transition-all duration-300 first:rounded-l-full last:rounded-r-full`}
                                    style={{ width: `${v.weight}%` }}
                                    title={`${v.label}: ${v.weight}%`}
                                />
                            );
                        })}
                    </div>
                    <div className="flex gap-2 mt-3">
                        {variants.map((v, idx) => {
                            const vc = variantColors[idx] || variantColors[0];
                            return (
                                <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${vc.bg}`}>
                                    <span className={`w-2 h-2 rounded-full ${vc.bar}`} />
                                    <span className={`text-[11px] font-semibold ${vc.text}`}>{v.label}</span>
                                    <input
                                        type="number"
                                        min={5}
                                        max={95}
                                        value={v.weight}
                                        onChange={(e) => updateWeight(idx, parseInt(e.target.value) || 5)}
                                        className={`w-12 text-center text-[11px] font-bold rounded px-1 py-0.5 ${d.isDark ? 'bg-black/30 text-white border border-white/10' : 'bg-white border border-gray-200 text-gray-900'}`}
                                    />
                                    <span className={`text-[10px] ${vc.text}`}>%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ─── CREATIVE FORM + PREVIEW ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs for active variant */}
                <div className="space-y-5">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${d.subheading}`}>
                            {isPush ? 'Push Title' : 'Ad Title'}
                            {isPush && <span className="ml-1 text-xs text-gray-400">(max 50 chars)</span>}
                        </label>
                        <div className="relative">
                            <Type className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${d.muted}`} />
                            <input
                                type="text"
                                value={current.title || ''}
                                onChange={(e) => updateVariant(activeVariant, 'title', e.target.value)}
                                maxLength={titleMaxLength}
                                placeholder={isPush ? 'e.g., 🔥 Special Offer Just For You' : 'e.g., You won a prize!'}
                                className={`${d.inputCls} pl-10`}
                            />
                        </div>
                        <p className={`text-xs mt-1 text-right ${(current.title?.length || 0) > titleMaxLength - 5 ? 'text-red-400' : d.muted}`}>
                            {current.title?.length || 0}/{titleMaxLength}
                        </p>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${d.subheading}`}>
                            {isPush ? 'Push Body' : 'Description'}
                            {isPush && <span className="ml-1 text-xs text-gray-400">(max 125 chars)</span>}
                        </label>
                        <textarea
                            value={current.description || ''}
                            onChange={(e) => updateVariant(activeVariant, 'description', e.target.value)}
                            maxLength={descMaxLength}
                            placeholder={isPush ? 'e.g., Tap to claim your exclusive deal before it expires!' : 'Click here to claim your reward instantly.'}
                            rows={isPush ? 3 : 2}
                            className={`${d.inputCls}`}
                        />
                        <p className={`text-xs mt-1 text-right ${(current.description?.length || 0) > descMaxLength - 10 ? 'text-red-400' : d.muted}`}>
                            {current.description?.length || 0}/{descMaxLength}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${d.subheading}`}>
                                Icon URL
                                {isPush && <span className="ml-1 text-xs text-amber-400">*required (192×192)</span>}
                            </label>
                            <div className="relative">
                                <LinkIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${d.muted}`} />
                                <input
                                    type="url"
                                    value={current.iconUrl || ''}
                                    onChange={(e) => updateVariant(activeVariant, 'iconUrl', e.target.value)}
                                    placeholder="https://"
                                    className={`${d.inputCls} pl-10 text-xs`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${d.subheading}`}>
                                {isPush ? 'Large Image URL' : 'Main Image URL'}
                                {isPush && <span className="ml-1 text-xs text-gray-400">optional (720×480)</span>}
                            </label>
                            <div className="relative">
                                <LinkIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${d.muted}`} />
                                <input
                                    type="url"
                                    value={current.imageUrl || ''}
                                    onChange={(e) => updateVariant(activeVariant, 'imageUrl', e.target.value)}
                                    placeholder="https://"
                                    className={`${d.inputCls} pl-10 text-xs`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Upload helper */}
                    <div className={`p-4 rounded-xl border border-dashed text-center cursor-pointer transition-colors ${d.isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-50'}`}>
                        <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${d.muted}`} />
                        <p className={`text-sm font-medium ${d.text}`}>Upload Assets</p>
                        <p className={`text-xs ${d.muted}`}>Drag & drop or click to browse</p>
                    </div>
                </div>

                {/* Live Preview */}
                <div className={`rounded-2xl overflow-hidden border ${d.isDark ? 'bg-black/40 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                    <div className="p-3 border-b border-inherit flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className={`w-4 h-4 ${d.muted}`} />
                            <span className={`text-xs font-bold uppercase ${d.muted}`}>Live Preview</span>
                            {variants.length > 1 && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${variantColors[activeVariant]?.bg} ${variantColors[activeVariant]?.text} font-bold`}>
                                    {current.label}
                                </span>
                            )}
                        </div>
                        <div className={`flex rounded-lg p-0.5 ${d.isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                            <button
                                type="button"
                                onClick={() => setPreviewDevice('MOBILE')}
                                className={`p-1.5 rounded-md transition-all ${previewDevice === 'MOBILE' ? 'bg-white shadow text-black' : d.isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Smartphone className="w-3 h-3" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewDevice('DESKTOP')}
                                className={`p-1.5 rounded-md transition-all ${previewDevice === 'DESKTOP' ? 'bg-white shadow text-black' : d.isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Monitor className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 flex items-center justify-center min-h-[300px] relative">
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '20px 20px' }}
                        />

                        {/* PREVIEW: IN_PAGE_PUSH */}
                        {formData.adFormat === 'IN_PAGE_PUSH' && (
                            <div className={`relative w-80 bg-white rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500`}>
                                <div className="p-3 flex gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${current.iconUrl || 'https://placehold.co/100x100?text=Icon'})` }}
                                    ></div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 leading-tight truncate">{current.title || 'Your Headline Here'}</h4>
                                        <p className="text-sm text-gray-600 leading-snug mt-1 line-clamp-2">{current.description || 'Description text goes here. Make it catchy!'}</p>
                                    </div>
                                </div>
                                {current.imageUrl && (
                                    <div className="w-full h-40 bg-gray-100 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${current.imageUrl})` }}
                                    ></div>
                                )}
                                <div className="bg-gray-50 px-3 py-2 text-[10px] text-gray-400 uppercase font-bold flex justify-between items-center">
                                    <span>Ad</span>
                                    <span>Just Now</span>
                                </div>
                            </div>
                        )}

                        {/* PREVIEW: PUSH_NOTIFICATION (Windows-style OS notification) */}
                        {formData.adFormat === 'PUSH_NOTIFICATION' && (
                            <div className="w-full max-w-[360px] space-y-2">
                                {/* Windows-style notification */}
                                <div className="bg-[#1f1f1f] rounded-lg shadow-2xl overflow-hidden border border-white/10">
                                    <div className="px-3 py-1.5 flex items-center gap-2 border-b border-white/10">
                                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                                        <span className="text-[10px] text-gray-400 font-medium">Chrome · yoursite.com</span>
                                        <span className="ml-auto text-[10px] text-gray-500">now</span>
                                    </div>
                                    <div className="p-3 flex gap-3">
                                        <div
                                            className="w-12 h-12 rounded-lg bg-gray-700 flex-shrink-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url(${current.iconUrl || 'https://placehold.co/100x100?text=🔔'})` }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-white leading-tight truncate">
                                                {current.title || '🔔 New Notification'}
                                            </h4>
                                            <p className="text-xs text-gray-400 leading-snug mt-1 line-clamp-3">
                                                {current.description || 'Tap to see the latest offer just for you.'}
                                            </p>
                                        </div>
                                    </div>
                                    {current.imageUrl && (
                                        <div
                                            className="w-full h-28 bg-gray-800 bg-cover bg-center"
                                            style={{ backgroundImage: `url(${current.imageUrl})` }}
                                        />
                                    )}
                                </div>
                                <p className="text-[10px] text-center text-gray-500">Windows / macOS notification preview</p>
                            </div>
                        )}

                        {/* PREVIEW: NATIVE */}
                        {formData.adFormat === 'NATIVE' && (
                            <div className="w-full max-w-[320px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="w-full h-48 bg-gray-100 bg-cover bg-center relative"
                                    style={{ backgroundImage: `url(${current.imageUrl || 'https://placehold.co/600x400?text=Native+Image'})` }}
                                >
                                    <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">Ad</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 bg-cover bg-center"
                                            style={{ backgroundImage: `url(${current.iconUrl || 'https://placehold.co/100?text=Logo'})` }}
                                        />
                                        <span className="text-xs text-gray-500 font-medium">Sponsored</span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">{current.title || 'Native Ad Title'}</h4>
                                    <p className="text-sm text-gray-600">{current.description || 'A short description mimicking editorial content.'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
