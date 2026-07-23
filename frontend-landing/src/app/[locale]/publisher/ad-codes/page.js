'use client';

import { useState, useEffect, useCallback } from 'react';
import { Code, Copy, Check, Globe, MousePointer2, Smartphone, Loader2, AlertCircle, Bell, Download, Info, ShieldCheck, Zap, TrendingUp, Eye } from 'lucide-react';
import { publisherAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';
import { useTranslations } from 'next-intl';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mrpop.io';

const AD_FORMATS = [
    {
        id: 'popunder',
        name: 'Popunder',
        icon: MousePointer2,
        description: 'Opens in new tab behind main window. Highest CPM, 100% viewability.',
        cpm: '$2–8 CPM',
        bypassRate: '99.2%',
        bypassLabel: 'Adblock Bypass',
    },
    {
        id: 'inpage-push',
        name: 'In-Page Push',
        icon: Smartphone,
        description: 'Native push-style notification rendered directly on your page. High CTR, Google-compliant.',
        cpm: '$1–5 CPM',
        bypassRate: '97.8%',
        bypassLabel: 'Adblock Safe',
    },
    {
        id: 'push-notification',
        name: 'Web Push Notification',
        icon: Bell,
        description: 'OS-level browser notifications. Reach users even when your site is closed. Premium CPM.',
        cpm: '🔥 $3–15 CPM',
        bypassRate: '100%',
        bypassLabel: 'Adblock Immune',
    },
];

const TRUST_STATS = [
    { icon: ShieldCheck, value: '99.2%', label: 'Adblock Bypass Rate', color: 'lime' },
    { icon: Eye,         value: '2.4B+', label: 'Monthly Impressions', color: 'sky' },
    { icon: Zap,         value: '<5ms',  label: 'Script Load Time',   color: 'amber' },
    { icon: TrendingUp,  value: '3.1×',  label: 'More Revenue vs Competitors', color: 'lime' },
];

export default function PublisherAdCodesPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const t = useTranslations('publisher.ad-codes');
    const tCommon = useTranslations('common');

    const [sites, setSites] = useState([]);
    const [loadingSites, setLoadingSites] = useState(true);
    const [siteError, setSiteError] = useState('');
    const [selectedSite, setSelectedSite] = useState('');
    const [selectedFormat, setSelectedFormat] = useState('popunder');

    // Zone state
    const [zone, setZone] = useState(null);
    const [zoneLoading, setZoneLoading] = useState(false);
    const [zoneError, setZoneError] = useState('');

    // Copy state
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedId, setCopiedId] = useState(false);

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        setLoadingSites(true);
        setSiteError('');
        try {
            const data = await publisherAPI.getSites();
            const list = Array.isArray(data) ? data : data?.sites || [];
            setSites(list);
        } catch (err) {
            setSiteError('Failed to load sites. Please refresh.');
            console.error('Ad-Codes: getSites error', err);
        } finally {
            setLoadingSites(false);
        }
    };

    // Whenever site or format changes, fetch/create the zone
    const fetchZone = useCallback(async (siteId, formatId) => {
        if (!siteId || !formatId) return;
        setZone(null);
        setZoneError('');
        setZoneLoading(true);
        try {
            const data = await publisherAPI.getOrCreateZone(siteId, formatId);
            setZone(data.zone);
        } catch (err) {
            setZoneError(err.message || 'Failed to load zone. Make sure your site is ACTIVE.');
        } finally {
            setZoneLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedSite) {
            fetchZone(selectedSite, selectedFormat);
        } else {
            setZone(null);
            setZoneError('');
        }
    }, [selectedSite, selectedFormat, fetchZone]);

    const activeSites = sites.filter(s => s.status === 'ACTIVE' || s.status === 'active');
    const selectedSiteData = sites.find(s => s.id === parseInt(selectedSite) || s.id === selectedSite);

    const getAdCode = () => {
        if (!zone) return '';
        const zoneId = zone.id;

        if (selectedFormat === 'push-notification') {
            return `<!-- MrPop.io Web Push Notification — Step 1: download pr-sw.js and upload to your site root -->
<!-- Step 2: Add this script to every page <head> -->
<script src="${API_URL}/api/push/push-init.js?z=${zoneId}" async></script>`;
        }

        const formatName = AD_FORMATS.find(f => f.id === selectedFormat)?.name || selectedFormat;
        return `<!-- MrPop.io ${formatName} Ad Code -->
<script>
  (function() {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = '${API_URL}/api/ads/script/${zoneId}';
    s.setAttribute('data-zone-id', '${zoneId}');
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();
</script>`;
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
        else { setCopiedId(true); setTimeout(() => setCopiedId(false), 2000); }
    };

    // ── Theme tokens
    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';

    const accentText = {
        'theme-luminous': 'text-lime-400',
        'theme-azure': 'text-sky-400',
        'theme-saas': 'text-white',
        'theme-editorial': 'text-red-700',
        'theme-brutalist': 'text-[#1A1A1A]',
    }[theme] || 'text-lime-400';

    const formatActive = {
        'theme-luminous': 'bg-lime-400/10 border-lime-400/30',
        'theme-azure': 'bg-sky-500/10 border-sky-400/30',
        'theme-saas': 'bg-white/[0.06] border-white/[0.15]',
        'theme-editorial': 'bg-red-50 border-red-300',
        'theme-brutalist': 'bg-[#F5F5F0] border-[#1A1A1A] shadow-[3px_3px_0px_0px_var(--color-primary)]',
    }[theme] || 'bg-lime-400/10 border-lime-400/30';

    const formatInactive = {
        'theme-luminous': 'bg-white/5 border-white/10 hover:border-white/20',
        'theme-azure': 'bg-white/5 border-white/10 hover:border-sky-400/20',
        'theme-saas': 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]',
        'theme-editorial': 'bg-white border-gray-200 hover:border-gray-400',
        'theme-brutalist': 'bg-[#F5F5F0] border-gray-300 hover:border-[#1A1A1A]',
    }[theme] || 'bg-white/5 border-white/10 hover:border-white/20';

    const canShowCode = selectedSite && zone && !zoneLoading;

    return (
        <div className="space-y-8">
            <div>
                <h1 className={d.heading}>{t('title')}</h1>
                <p className={`${d.subheading} mt-1`}>Get your ad integration codes and start monetizing your traffic</p>
            </div>

            {/* ── Anti-Adblock Trust Bar ─────────────────────────────────────── */}
            <div className={`relative overflow-hidden rounded-2xl border p-1 ${
                d.isDark
                    ? 'bg-gradient-to-br from-lime-950/60 via-black to-emerald-950/40 border-lime-500/20'
                    : 'bg-gradient-to-br from-lime-50 via-white to-emerald-50 border-lime-300/60'
            }`}>
                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-lime-400/60 to-transparent" />
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #84cc16 0%, transparent 50%), radial-gradient(circle at 80% 50%, #10b981 0%, transparent 50%)' }} />

                <div className="relative px-5 py-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${
                            d.isDark ? 'bg-lime-400/10 text-lime-400' : 'bg-lime-100 text-lime-700'
                        }`}>
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${d.isDark ? 'text-lime-300' : 'text-lime-800'}`}>
                                Anti-Adblock Korumalı Kodlar
                            </p>
                            <p className={`text-xs ${d.isDark ? 'text-lime-400/70' : 'text-lime-700/70'}`}>
                                Ziyaretçilerin adblock kullanıp kullanmadığından bağımsız olarak reklamlarınız gösterilir
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {TRUST_STATS.map((stat, i) => {
                            const Icon = stat.icon;
                            const colors = {
                                lime:  { text: d.isDark ? 'text-lime-400'  : 'text-lime-700',  bg: d.isDark ? 'bg-lime-400/10'  : 'bg-lime-100'  },
                                sky:   { text: d.isDark ? 'text-sky-400'   : 'text-sky-700',   bg: d.isDark ? 'bg-sky-400/10'   : 'bg-sky-100'   },
                                amber: { text: d.isDark ? 'text-amber-400' : 'text-amber-700', bg: d.isDark ? 'bg-amber-400/10' : 'bg-amber-100' },
                            }[stat.color];
                            return (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
                                    d.isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white/80 border-white shadow-sm'
                                }`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                                        <Icon className={`w-4 h-4 ${colors.text}`} />
                                    </div>
                                    <div>
                                        <p className={`text-base font-bold leading-tight ${colors.text}`}>{stat.value}</p>
                                        <p className={`text-[10px] leading-tight ${d.isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* ── Left: Config */}
                <div className="space-y-6">
                    {/* Site Select */}
                    <div className={d.card}>
                        <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${headText}`}>
                            <Globe className={`w-5 h-5 ${accentText}`} />
                            Select Site
                        </h2>

                        {loadingSites ? (
                            <div className="flex items-center gap-3 py-4">
                                <Loader2 className={`w-5 h-5 animate-spin ${d.loaderColor}`} />
                                <span className={`text-sm ${subText}`}>Loading your sites...</span>
                            </div>
                        ) : siteError ? (
                            <div className={`flex items-center gap-3 p-4 rounded-xl border ${d.isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{siteError}</span>
                                <button onClick={fetchSites} className={`ml-auto text-xs underline ${subText}`}>Retry</button>
                            </div>
                        ) : activeSites.length === 0 ? (
                            <div className="text-center py-8">
                                <Globe className={`w-10 h-10 mx-auto mb-3 ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                <p className={`${subText} mb-4 text-sm`}>No active sites yet. Add and get a site approved first.</p>
                                <a href="/publisher/sites" className={d.btnPrimary}>Add Your First Site</a>
                            </div>
                        ) : (
                            <select
                                value={selectedSite}
                                onChange={e => setSelectedSite(e.target.value)}
                                className={`w-full px-4 py-3 focus:outline-none transition-all text-sm ${theme === 'theme-brutalist'
                                    ? 'border-2 border-[#1A1A1A] bg-[#F5F5F0] text-[#1A1A1A]'
                                    : d.isDark
                                        ? 'bg-white/5 border border-white/10 text-white rounded-xl focus:border-white/30'
                                        : 'bg-white border border-gray-200 text-[#1A1A1A] rounded-xl focus:border-gray-400'
                                    }`}>
                                <option value="">Choose a site...</option>
                                {activeSites.map(site => (
                                    <option key={site.id} value={site.id}>
                                        {site.name} — {site.url || site.domain}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Zone ID badge */}
                        {selectedSite && (
                            <div className={`mt-4 p-4 rounded-xl border ${d.isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                <p className={`text-xs mb-1 ${subText}`}>Zone ID</p>
                                {zoneLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className={`w-4 h-4 animate-spin ${d.loaderColor}`} />
                                        <span className={`text-xs ${subText}`}>Generating zone...</span>
                                    </div>
                                ) : zoneError ? (
                                    <div className={`flex items-center gap-2 text-xs ${d.isDark ? 'text-red-400' : 'text-red-600'}`}>
                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{zoneError}</span>
                                    </div>
                                ) : zone ? (
                                    <div className="flex items-center justify-between">
                                        <code className={`font-mono font-bold text-sm ${accentText}`}>{zone.id}</code>
                                        <button onClick={() => copyToClipboard(zone.id, 'id')}
                                            className={`p-2 rounded-lg transition-colors ${d.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                                            {copiedId ? <Check className="w-4 h-4 text-green-400" /> : <Copy className={`w-4 h-4 ${subText}`} />}
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    {/* Format Select */}
                    <div className={d.card}>
                        <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${headText}`}>
                            <Code className={`w-5 h-5 ${accentText}`} />
                            Select Ad Format
                        </h2>
                        <div className="space-y-3">
                            {AD_FORMATS.map(fmt => {
                                const Icon = fmt.icon;
                                const isSelected = selectedFormat === fmt.id;
                                return (
                                    <button key={fmt.id} onClick={() => setSelectedFormat(fmt.id)}
                                        className={`w-full p-4 rounded-xl border transition-all text-left ${isSelected ? formatActive : formatInactive}`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${d.isDark ? (isSelected ? 'bg-white/10' : 'bg-white/5') : (isSelected ? 'bg-gray-100' : 'bg-gray-50')}`}>
                                                <Icon className={`w-5 h-5 ${isSelected ? (d.isDark ? 'text-white' : 'text-[#1A1A1A]') : subText}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={`font-bold text-sm ${headText}`}>{fmt.name}</h3>
                                                    <span className={`text-xs font-bold ${accentText}`}>{fmt.cpm}</span>
                                                </div>
                                                <p className={`text-xs ${subText}`}>{fmt.description}</p>
                                                {/* Anti-Adblock Rozeti */}
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        d.isDark
                                                            ? 'bg-lime-400/10 border-lime-400/25 text-lime-400'
                                                            : 'bg-lime-50 border-lime-300 text-lime-700'
                                                    }`}>
                                                        <ShieldCheck className="w-2.5 h-2.5" />
                                                        {fmt.bypassLabel}
                                                    </span>
                                                    <span className={`text-[10px] font-medium ${d.isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {fmt.bypassRate} bypass
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Right: Code output */}
                <div className="space-y-6">
                    <div className={d.card}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-lg font-bold ${headText}`}>Your Ad Code</h2>
                            {canShowCode && (
                                <button onClick={() => copyToClipboard(getAdCode(), 'code')}
                                    className={`${d.btnPrimary} flex items-center gap-2`}>
                                    {copiedCode ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Code</>}
                                </button>
                            )}
                        </div>

                        {!selectedSite ? (
                            <div className={`text-center py-16 ${d.isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                <Code className="w-14 h-14 mx-auto mb-4 opacity-30" />
                                <p className="text-sm">Select an active site to generate your ad code</p>
                            </div>
                        ) : zoneLoading ? (
                            <div className="flex items-center justify-center py-16 gap-3">
                                <Loader2 className={`w-6 h-6 animate-spin ${d.loaderColor}`} />
                                <span className={`text-sm ${subText}`}>Generating your zone...</span>
                            </div>
                        ) : zoneError ? (
                            <div className={`flex flex-col items-center text-center py-12 gap-3 ${d.isDark ? 'text-red-400' : 'text-red-600'}`}>
                                <AlertCircle className="w-10 h-10 opacity-60" />
                                <p className="text-sm font-medium">{zoneError}</p>
                                {zoneError.includes('ACTIVE') && (
                                    <a href="/publisher/sites" className={d.btnPrimary + ' text-xs mt-2'}>Manage Sites</a>
                                )}
                            </div>
                        ) : zone ? (
                            <>
                                {/* Push SW download button */}
                                {selectedFormat === 'push-notification' && (
                                    <div className={`mb-4 p-4 rounded-xl border flex items-center justify-between gap-4 ${d.isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                                        <div>
                                            <p className={`text-sm font-bold ${d.isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                                Step 1: Download Service Worker
                                            </p>
                                            <p className={`text-xs mt-0.5 ${d.isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>
                                                Upload <code className="font-mono">pr-sw.js</code> to your site&apos;s root directory
                                            </p>
                                        </div>
                                        <a
                                            href={`${API_URL}/api/push/pr-sw.js`}
                                            download="pr-sw.js"
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                                                d.isDark
                                                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                                    : 'bg-amber-600 text-white hover:bg-amber-700'
                                            }`}
                                        >
                                            <Download className="w-4 h-4" />
                                            Download pr-sw.js
                                        </a>
                                    </div>
                                )}

                                {/* Anti-Adblock Code Banner */}
                                <div className={`mb-3 relative overflow-hidden rounded-xl border px-4 py-3 ${
                                    d.isDark
                                        ? 'bg-gradient-to-r from-lime-950/60 to-emerald-950/40 border-lime-500/20'
                                        : 'bg-gradient-to-r from-lime-50 to-emerald-50 border-lime-300'
                                }`}>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-10">
                                        <ShieldCheck className="w-12 h-12" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className={`w-4 h-4 flex-shrink-0 ${d.isDark ? 'text-lime-400' : 'text-lime-700'}`} />
                                        <div>
                                            <p className={`text-xs font-bold ${d.isDark ? 'text-lime-300' : 'text-lime-800'}`}>
                                                Anti-Adblock Korumalı Kod
                                            </p>
                                            <p className={`text-[10px] ${d.isDark ? 'text-lime-400/70' : 'text-lime-700/70'}`}>
                                                Bu kod Adblock, uBlock Origin ve diğer tüm engelleyicileri bypass eder — gelir kaybı yaşamazsın.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Zone info banner */}
                                <div className={`mb-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${d.isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'}`}>
                                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>Zone <strong>{zone.name}</strong> ready — ID: <code className="font-mono">{zone.id.slice(0, 8)}…</code></span>
                                </div>

                                <pre className={`p-5 rounded-xl border overflow-x-auto text-xs leading-relaxed ${d.isDark ? 'bg-slate-950 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                    <code className={`font-mono ${accentText}`}>{getAdCode()}</code>
                                </pre>
                            </>
                        ) : null}
                    </div>

                    {/* Installation steps */}
                    {canShowCode && (
                        <div className={d.card}>
                            <h2 className={`text-lg font-bold mb-5 ${headText}`}>Installation Guide</h2>
                            <div className="space-y-5">
                                {(selectedFormat === 'push-notification' ? [
                                    { num: '1', title: 'Download pr-sw.js', desc: 'Click the "Download pr-sw.js" button above and save the file.' },
                                    { num: '2', title: 'Upload to site root', desc: 'Place pr-sw.js at the root of your domain: https://yoursite.com/pr-sw.js' },
                                    { num: '3', title: 'Add the script tag', desc: 'Copy the code above and paste it in the <head> of every page.' },
                                    { num: '4', title: 'Verify & go live', desc: 'Visitors will see a browser permission prompt. Subscribers start building automatically.' },
                                ] : [
                                    { num: '1', title: 'Copy the code', desc: 'Click "Copy Code" to copy the integration snippet.' },
                                    { num: '2', title: 'Paste before </body>', desc: 'Add the code just before the closing </body> tag on every page.' },
                                    { num: '3', title: 'Start earning', desc: 'Ads start serving within minutes. Check Statistics for real-time data.' },
                                ]).map(step => (
                                    <div key={step.num} className="flex gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${theme === 'theme-brutalist' ? 'border-2 border-[#1A1A1A] bg-[#F5F5F0]'
                                            : d.isDark ? `bg-gradient-to-br ${theme === 'theme-luminous' ? 'from-lime-400/20 to-lime-400/5' : 'from-sky-400/20 to-sky-400/5'}`
                                                : theme === 'theme-editorial' ? 'bg-red-50 border border-red-200'
                                                    : 'bg-gray-100'
                                            }`}>
                                            <span className={`font-bold text-sm ${accentText}`}>{step.num}</span>
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-sm ${headText} mb-1`}>{step.title}</h3>
                                            <p className={`text-xs ${subText}`}>{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
