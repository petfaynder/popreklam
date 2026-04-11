'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Zap, Code2, FlaskConical, Copy, CheckCheck, RefreshCw,
  Shield, ExternalLink, Info, CheckCircle2, AlertCircle,
  Loader2, Play, Clock, Star, Activity, ArrowRight, Tag,
  ToggleLeft, ToggleRight,
} from 'lucide-react';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

// ─── Tracker catalog ───────────────────────────────────────────────────────────
const TRACKER_CATALOG = [
  { id: 'keitaro',      name: 'Keitaro',               color: '#e74c3c', bg: '#e74c3c18', clickMacro: '{click_id}', payoutMacro: '{payout}',   logoDomain: 'keitaro.io',       url: 'https://keitaro.io/?utm_source=popreklam',    offer: true,  logoText: 'K',   tip: 'Campaign → Traffic Sources → Add PopReklam → paste Postback URL in the "Postback" field.' },
  { id: 'voluum',       name: 'Voluum',                 color: '#7c3aed', bg: '#7c3aed18', clickMacro: '{cid}',      payoutMacro: '{revenue}',  logoDomain: 'voluum.com',        url: 'https://voluum.com/?ref=popreklam',           offer: true,  logoText: 'V',   tip: 'Traffic Sources → PopReklam → S2S Postback URL field. Note: Voluum uses {cid} as click_id.' },
  { id: 'binom',        name: 'Binom',                  color: '#16a34a', bg: '#16a34a18', clickMacro: '{click_id}', payoutMacro: '{payout}',   logoDomain: 'binom.org',        url: 'https://binom.org/?ref=popreklam',           offer: true,  logoText: 'B',   tip: 'Traffic Sources → Add Source → Postback URL field.' },
  { id: 'thrivetracker',name: 'ThriveTracker',          color: '#0891b2', bg: '#0891b218', clickMacro: '{click_id}', payoutMacro: '{payout}',   logoDomain: 'thrivetracker.com',url: 'https://thrivetracker.com/',                 offer: false, logoText: 'TT',  tip: 'Traffic Sources → PopReklam → S2S Global Postback.' },
  { id: 'bemob',        name: 'BeMob',                  color: '#2563eb', bg: '#2563eb18', clickMacro: '{externalid}',payoutMacro: '{payout}',  logoDomain: 'bemob.com',         url: 'https://bemob.com/?ref=popreklam',           offer: true,  logoText: 'Be',  tip: 'Traffic Sources → Add → paste URL. Note: BeMob uses {externalid} for click_id.' },
  { id: 'redtrack',     name: 'RedTrack',               color: '#db2777', bg: '#db277718', clickMacro: '{clickid}',  payoutMacro: '{payout}',   logoDomain: 'redtrack.io',       url: 'https://redtrack.io/?ref=popreklam',         offer: true,  logoText: 'RT',  tip: 'Traffic Channels → PopReklam → S2S Postback.' },
  { id: 'funnelflux',   name: 'FunnelFlux',             color: '#d97706', bg: '#d9770618', clickMacro: '{hitid}',    payoutMacro: '{revenue}',  logoDomain: 'funnelflux.com',   url: 'https://funnelflux.com/?ref=popreklam',     offer: true,  logoText: 'FF',  tip: 'Traffic Sources → Add PopReklam → Postback URL. Note: uses {hitid} for click tracking.' },
  { id: 'peerclick',    name: 'Peerclick',              color: '#0d9488', bg: '#0d948818', clickMacro: '{clickid}',  payoutMacro: '{payout}',   logoDomain: 'peerclick.com',    url: 'https://peerclick.com/?ref=popreklam',      offer: false, logoText: 'PC',  tip: 'Traffic Sources → New → Postback URL field.' },
  { id: 'landingtrack', name: 'LandingTrack',           color: '#059669', bg: '#05966918', clickMacro: '{click_id}', payoutMacro: '{payout}',   logoDomain: 'landingtrack.com', url: 'https://landingtrack.com/',                 offer: false, logoText: 'LT',  tip: 'Sources → Add → Postback URL.' },
  { id: 'trackingdesk', name: 'TrackingDesk',           color: '#1d4ed8', bg: '#1d4ed818', clickMacro: '{s1}',       payoutMacro: '{payout}',   logoDomain: 'trackingdesk.com', url: 'https://trackingdesk.com/?ref=popreklam',   offer: false, logoText: 'TD',  tip: 'Uses {s1} as click_id token. Map it in your PopReklam postback URL.' },
  { id: 'kintura',      name: 'KINTURA',                color: '#7c3aed', bg: '#7c3aed18', clickMacro: '{click_id}', payoutMacro: '{payout}',   logoDomain: 'kintura.io',       url: 'https://kintura.io/',                       offer: false, logoText: 'KI',  tip: 'Traffic Sources → PopReklam → Conversion URL.' },
  { id: 'appsflyer',   name: 'AppsFlyer',               color: '#0284c7', bg: '#0284c718', clickMacro: '{clickid}',  payoutMacro: '{payout}',   logoDomain: 'appsflyer.com',    url: 'https://www.appsflyer.com/',               offer: false, logoText: 'AF',  tip: 'Best for mobile app campaigns. Use their S2S In-App Events API.' },
  { id: 'cplab',        name: 'CPLab',                  color: '#6d28d9', bg: '#6d28d918', clickMacro: '{click_id}', payoutMacro: '{payout}',   logoDomain: 'cpl.io',           url: 'https://cpl.io/',                           offer: false, logoText: 'CP',  tip: 'Campaign → Postback → Global S2S URL field.' },
  { id: 'maxconv',      name: 'MaxConv',                color: '#b91c1c', bg: '#b91c1c18', clickMacro: '{click_id}', payoutMacro: '{payout}',   logoDomain: 'maxconv.com',      url: 'https://maxconv.com/',                      offer: true,  logoText: 'MC',  tip: 'Traffic Sources → Add → Postback URL.' },
  { id: 'manual',       name: 'Other / CPA Network',   color: '#64748b', bg: '#64748b18', clickMacro: '{CLICK_ID}', payoutMacro: '{PAYOUT}',   logoDomain: null,               url: null,                                        offer: false, logoText: '···', tip: 'Replace {CLICK_ID} with your tracker\'s click ID macro and {PAYOUT} with its payout macro.' },
];

const STATUS_META = {
  SUCCESS:          { text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  DUPLICATE:        { text: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
  INVALID_CLICK_ID: { text: 'text-red-400',     bg: 'bg-red-400/10' },
  NO_CLICK_ID:      { text: 'text-orange-400',  bg: 'bg-orange-400/10' },
  NO_CLICK:         { text: 'text-orange-400',  bg: 'bg-orange-400/10' },
  RATE_LIMITED:     { text: 'text-red-500',     bg: 'bg-red-500/10' },
  EXPIRED:          { text: 'text-gray-400',    bg: 'bg-gray-400/10' },
  INVALID_TOKEN:    { text: 'text-red-400',     bg: 'bg-red-400/10' },
  ERROR:            { text: 'text-red-500',     bg: 'bg-red-500/10' },
};

const buildGtmSnippet = (gtmId, campaignId) => `<!-- PopReklam Conversion Tracking via GTM -->
<!-- Add this tag to your "Thank You" page trigger in GTM -->
<script>
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': 'popreklam_conversion',
    'campaign_id': '${campaignId || 'YOUR_CAMPAIGN_ID'}',
    'click_id': (new URLSearchParams(window.location.search)).get('click_id') || ''
  });
</script>

<!-- Custom HTML tag in GTM, fired on the above event: -->
<img src="https://api.popreklam.com/api/postback?click_id={{DL - click_id}}&goal=purchase"
     width="1" height="1" style="display:none" alt="" />`;

// ─── TrackerLogo component ─────────────────────────────────────────────────────
// Multi-source logo: logo.dev → Google Favicons (128px) → colored text fallback
// Client-only rendering avoids SSR/hydration mismatch
const LOGO_SOURCES = (domain) => [
  `https://img.logo.dev/${domain}?token=pk_X-1ZO13GSgeOoUrIuJ6BeQ&size=128&format=png`,
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
];

function TrackerLogo({ tracker, size = 40, active }) {
  const [srcIndex, setSrcIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);

  const radius = Math.round(size * 0.28);
  const fontSize = size <= 32 ? 10 : size <= 48 ? 13 : 16;

  // Text avatar fallback (also used for SSR and missing domains)
  const textAvatar = (
    <div style={{
      width: size, height: size, borderRadius: radius,
      backgroundColor: tracker.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 900, color: '#fff', flexShrink: 0, lineHeight: 1,
      userSelect: 'none',
    }}>
      {tracker.logoText}
    </div>
  );

  // Before mount (SSR) or no domain → always text avatar
  if (!mounted || !tracker.logoDomain) return textAvatar;

  const sources = LOGO_SOURCES(tracker.logoDomain);
  const allFailed = srcIndex >= sources.length;
  if (allFailed) return textAvatar;

  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      backgroundColor: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden',
      border: active ? `2px solid ${tracker.color}50` : '1.5px solid rgba(0,0,0,0.08)',
      boxSizing: 'border-box',
      boxShadow: active ? `0 2px 8px ${tracker.color}30` : '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      <img
        src={sources[srcIndex]}
        alt={tracker.name}
        onError={() => setSrcIndex(i => i + 1)}
        style={{ width: size * 0.72, height: size * 0.72, objectFit: 'contain' }}
      />
    </div>
  );
}

export default function TrackingPage() {
  const theme = useTheme();
  const d = getDashboardTheme(theme);
  const isDark = d.isDark;

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);

  const [tab, setTab] = useState('s2s');
  const [selectedTracker, setSelectedTracker] = useState('keitaro');
  const [showToken, setShowToken] = useState(false);
  const [useToken, setUseToken] = useState(true);
  const [copied, setCopied] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [testLogs, setTestLogs] = useState([]);

  const [gtmId, setGtmId] = useState('GTM-XXXXXXX');

  const headText = isDark ? 'text-white' : 'text-[#1A1A1A]';
  const subText  = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-white/8' : 'border-gray-200';
  const mutedBg  = isDark ? 'bg-white/5' : 'bg-gray-50';
  const codeBg   = isDark ? 'bg-black/40' : 'bg-gray-950';

  const getToken  = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const authHdrs  = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

  useEffect(() => { fetchCampaigns(); }, []);
  useEffect(() => {
    if (selectedCampaignId) { fetchTrackingInfo(); fetchLogs(); }
  }, [selectedCampaignId]);

  const fetchCampaigns = async () => {
    try {
      const res  = await fetch('/api/advertiser/campaigns', { headers: authHdrs() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.campaigns || []);
      setCampaigns(list);
      if (list.length > 0) setSelectedCampaignId(list[0].id);
    } catch {}
  };

  const fetchTrackingInfo = async () => {
    if (!selectedCampaignId) return;
    setPageLoading(true);
    try {
      const res = await fetch(`/api/advertiser/campaigns/${selectedCampaignId}/tracking`, { headers: authHdrs() });
      setTrackingInfo(await res.json());
    } catch {} finally { setPageLoading(false); }
  };

  const fetchLogs = async () => {
    if (!selectedCampaignId) return;
    setLogsLoading(true);
    try {
      const res  = await fetch(`/api/advertiser/campaigns/${selectedCampaignId}/postback-logs?limit=40`, { headers: authHdrs() });
      const data = await res.json();
      const all  = data.logs || [];
      setLogs(all.filter(l => !(l.clickId === 'TEST' || l.errorMsg?.includes('Test'))));
      setTestLogs(all.filter(l => l.clickId === 'TEST' || l.errorMsg?.includes('Test')));
    } catch {} finally { setLogsLoading(false); }
  };

  const sendTestConversion = async () => {
    setTestLoading(true); setTestResult(null);
    try {
      const res  = await fetch(`/api/advertiser/campaigns/${selectedCampaignId}/tracking/test`, { method: 'POST', headers: authHdrs() });
      const data = await res.json();
      setTestResult(data.success ? 'success' : 'error');
      if (data.success) { setTimeout(fetchLogs, 600); setTimeout(fetchTrackingInfo, 600); }
    } catch { setTestResult('error'); } finally { setTestLoading(false); }
  };

  const regenerateToken = async () => {
    if (!confirm('Bu işlem mevcut secret token\'ı geçersiz kılar. Devam?')) return;
    setRegenerating(true);
    try {
      const res = await fetch(`/api/advertiser/campaigns/${selectedCampaignId}/tracking/regenerate-token`, { method: 'POST', headers: authHdrs() });
      if (res.ok) fetchTrackingInfo();
    } catch {} finally { setRegenerating(false); }
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const tracker   = TRACKER_CATALOG.find(t => t.id === selectedTracker) || TRACKER_CATALOG[0];
  const baseUrl   = 'https://api.popreklam.com/api/postback';
  const basicUrl  = `${baseUrl}?click_id=${tracker.clickMacro}&payout=${tracker.payoutMacro}`;
  const secureUrl = trackingInfo?.secretToken
    ? `${baseUrl}?click_id=${tracker.clickMacro}&payout=${tracker.payoutMacro}&token=${trackingInfo.secretToken}`
    : basicUrl;
  const activeUrl = useToken ? secureUrl : basicUrl;
  const displayUrl = (useToken && trackingInfo?.secretToken && !showToken)
    ? activeUrl.replace(trackingInfo.secretToken, '●'.repeat(12))
    : activeUrl;

  const pixelTag = `<img src="https://api.popreklam.com/api/serve/pixel/{CLICK_ID}" width="1" height="1" style="display:none" alt="" />`;

  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const TabBtn = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        tab === id
          ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
          : `${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className={d.heading}>Conversion Tracking</h1>
        <p className={`${d.subheading} mt-1`}>
          Track conversions with S2S Postback URL (recommended) or Image Pixel.
          Compatible with all major trackers and CPA networks.
        </p>
      </div>

      {/* Campaign Selector */}
      <div className={`${d.card} flex items-center gap-3 flex-wrap`}>
        <label className={`text-sm font-semibold ${headText} flex-shrink-0`}>Campaign:</label>
        <select
          value={selectedCampaignId}
          onChange={e => setSelectedCampaignId(e.target.value)}
          className={`flex-1 min-w-[220px] px-3 py-2 rounded-xl text-sm font-medium border ${borderColor} ${isDark ? 'bg-white/5 text-white' : 'bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-violet-500/30`}
        >
          {campaigns.length === 0
            ? <option value="">— No campaigns yet —</option>
            : campaigns.map(c => <option key={c.id} value={c.id}>{c.name} — {c.adFormat}</option>)}
        </select>
        {pageLoading && <Loader2 className={`w-4 h-4 animate-spin ${d.loaderColor}`} />}
        {trackingInfo && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">{trackingInfo.totalConversions} Conversions Tracked</span>
          </div>
        )}
      </div>

      {/* Tab Nav — always visible */}
      <div className={`flex gap-2 p-1 rounded-2xl border ${borderColor} ${mutedBg} w-fit`}>
        <TabBtn id="s2s"  icon={Zap}         label="S2S Setup" />
        <TabBtn id="test" icon={FlaskConical} label="Test Conversion" />
        <TabBtn id="gtm"  icon={Tag}          label="Google Tag Manager" />
      </div>

      {/* ═══════════════ TAB 1 — S2S SETUP ═══════════════ */}
      {tab === 's2s' && (
        <div className="space-y-5">

          {/* Tracker grid */}
          <div className={d.card}>
            <p className={`text-[11px] font-black uppercase tracking-widest ${subText} mb-4`}>
              Step 1 — Select your tracker or CPA network
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {TRACKER_CATALOG.map(t => {
                const active = selectedTracker === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTracker(t.id)}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                      active
                        ? 'border-transparent shadow-md'
                        : `${borderColor} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`
                    }`}
                    style={active ? { backgroundColor: t.bg, borderColor: t.color + '50', boxShadow: `0 0 0 2px ${t.color}25` } : {}}
                  >
                    <TrackerLogo tracker={t} size={44} active={active} />
                    <span className={`text-[11px] font-bold text-center leading-tight ${active ? headText : subText}`}>
                      {t.name}
                    </span>
                    {t.offer && (
                      <span className="absolute -top-1.5 -right-1.5 text-[8px] font-black bg-amber-400 text-black px-1.5 py-0.5 rounded-full leading-tight shadow">
                        OFFER
                      </span>
                    )}
                    {active && (
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Affiliate link */}
            {tracker.url && tracker.id !== 'manual' && (
              <div className={`mt-5 flex items-center gap-2 text-xs ${subText} border-t ${borderColor} pt-4`}>
                <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>
                  Don't have {tracker.name} yet?{' '}
                  <a
                    href={tracker.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-2 transition-colors"
                  >
                    Create a {tracker.name} account
                  </a>
                  {tracker.offer && <span className="ml-1 font-bold text-amber-400"> — Special offer available</span>}
                  <ExternalLink className="w-3 h-3 inline ml-1" />
                </span>
              </div>
            )}
          </div>

          {/* Postback URL */}
          <div className={d.card}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className={`text-[11px] font-black uppercase tracking-widest ${subText}`}>
                Step 2 — Copy the Postback URL into {tracker.name}
              </p>
              <button
                onClick={() => setUseToken(!useToken)}
                className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                style={{ color: useToken ? '#a78bfa' : isDark ? '#6b7280' : '#9ca3af' }}
              >
                {useToken ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <Shield className="w-3.5 h-3.5" />
                Secret Token {useToken ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className={`flex items-center gap-2 rounded-xl border p-3 ${
              useToken ? (isDark ? 'border-violet-400/30' : 'border-violet-300') : borderColor
            } ${isDark ? 'bg-black/30' : 'bg-gray-950'}`}>
              <code className={`flex-1 text-xs font-mono break-all ${isDark ? 'text-gray-200' : 'text-gray-100'}`}>
                {displayUrl}
              </code>
              <div className="flex items-center gap-1 flex-shrink-0">
                {useToken && trackingInfo?.secretToken && (
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${isDark ? 'bg-white/8 text-gray-400 hover:bg-white/12' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {showToken ? 'Hide' : 'Show'}
                  </button>
                )}
                <button
                  onClick={() => copyText(activeUrl, 'pb')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copied === 'pb' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-violet-500 hover:bg-violet-400 text-white'
                  }`}
                >
                  {copied === 'pb' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
              </div>
            </div>

            {useToken && trackingInfo?.secretToken && (
              <div className="flex items-center justify-between mt-2">
                <p className={`text-xs ${subText}`}>
                  Secret token:{' '}
                  <code className={`font-mono text-xs ${isDark ? 'text-violet-300/70' : 'text-violet-600/70'}`}>
                    {showToken ? trackingInfo.secretToken : '●'.repeat(16)}
                  </code>
                </p>
                <button
                  onClick={regenerateToken}
                  disabled={regenerating}
                  className={`flex items-center gap-1.5 text-xs ${subText} hover:text-red-400 transition-colors`}
                >
                  <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>
            )}

            {!trackingInfo && (
              <p className={`text-xs mt-2 ${isDark ? 'text-amber-400/70' : 'text-amber-600/80'}`}>
                ⚠ Select a campaign above to get your campaign-specific secret token.
              </p>
            )}

            <div className={`mt-4 rounded-xl p-3 flex items-start gap-2 border ${isDark ? 'border-white/5 bg-white/3' : 'border-gray-100 bg-gray-50'}`}>
              <Info className={`w-3.5 h-3.5 ${subText} mt-0.5 flex-shrink-0`} />
              <p className={`text-xs ${subText}`}>{tracker.tip}</p>
            </div>
          </div>

          {/* Parameter reference */}
          <div className={d.card}>
            <p className={`text-[11px] font-black uppercase tracking-widest ${subText} mb-3`}>
              Postback URL Parameters
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={`${subText} text-left border-b ${borderColor}`}>
                    <th className="pb-2 pr-6 font-semibold uppercase tracking-wider">Parameter</th>
                    <th className="pb-2 pr-6 font-semibold uppercase tracking-wider">{tracker.name} Macro</th>
                    <th className="pb-2 pr-6 font-semibold uppercase tracking-wider">Required</th>
                    <th className="pb-2 font-semibold uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { param: 'click_id', value: tracker.clickMacro,   req: true,  desc: 'PopReklam click identifier (injected by us on click)' },
                    { param: 'payout',   value: tracker.payoutMacro,  req: false, desc: 'Conversion value in USD reported by your tracker' },
                    { param: 'goal',     value: 'purchase / signup',  req: false, desc: 'Label for the conversion event type' },
                    { param: 'status',   value: '1 or 0',             req: false, desc: '1=confirmed conversion, 0=cancelled/rejected' },
                    { param: 'token',    value: useToken ? '(secret)' : 'not used', req: false, desc: 'Security — rejects postbacks from unknown sources' },
                  ].map(row => (
                    <tr key={row.param} className={`border-t ${borderColor}`}>
                      <td className="py-2 pr-6">
                        <code className="text-violet-400 bg-violet-400/10 px-1.5 py-0.5 rounded font-mono">{row.param}</code>
                      </td>
                      <td className={`py-2 pr-6 font-mono ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>{row.value}</td>
                      <td className="py-2 pr-6">
                        {row.req ? <span className="text-red-400 font-bold">Required</span> : <span className={subText}>Optional</span>}
                      </td>
                      <td className={`py-2 ${subText}`}>{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 2 — TEST CONVERSION ═══════════════ */}
      {tab === 'test' && (
        <div className="space-y-5">
          <div className={d.card}>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-emerald-400/15">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className={`text-base font-bold ${headText}`}>Test Conversion Tracking</h2>
                <p className={`text-xs ${subText}`}>
                  Send a synthetic test to verify your postback setup. Has no effect on real metrics.
                </p>
              </div>
            </div>

            <div className={`rounded-xl p-4 flex items-start gap-3 border mb-5 ${isDark ? 'border-sky-400/20 bg-sky-400/8' : 'border-sky-200 bg-sky-50'}`}>
              <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div className={`text-xs ${isDark ? 'text-sky-200/80' : 'text-sky-700'}`}>
                <p className="font-semibold mb-1">How it works</p>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Select a campaign above (required for test)</li>
                  <li>Click <strong>"Trace"</strong> — a synthetic <code className="bg-sky-400/15 px-1 rounded">TEST</code> conversion is created</li>
                  <li>Check the logs below — you should see a new row appear</li>
                  <li>You can delete test conversions from the Admin panel</li>
                </ol>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={sendTestConversion}
                disabled={testLoading || !selectedCampaignId}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Trace
              </button>
              {!selectedCampaignId && <span className={`text-xs ${subText}`}>Select a campaign first</span>}
              {testResult === 'success' && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5" /> Test conversion sent!
                </div>
              )}
              {testResult === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5" /> Failed. Try again.
                </div>
              )}
            </div>
          </div>

          {/* Test log */}
          <div className={d.card}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-sm font-bold ${headText}`}>Test Conversions</h2>
              <button onClick={fetchLogs} className={`${d.btnSecondary} p-2`}>
                <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {testLogs.length === 0 ? (
              <div className={`text-center py-10 rounded-xl border border-dashed ${borderColor}`}>
                <Clock className={`w-8 h-8 ${subText} mx-auto mb-2 opacity-30`} />
                <p className={`text-sm ${subText}`}>No test conversions yet.</p>
                <p className={`text-xs ${subText} mt-1`}>Click "Trace" above.</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className={`${subText} text-left border-b ${borderColor}`}>
                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">ID</th>
                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">Status</th>
                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">IP</th>
                    <th className="pb-2 font-semibold uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {testLogs.map(log => (
                    <tr key={log.id} className={`border-t ${borderColor}`}>
                      <td className={`py-2.5 pr-4 font-mono ${subText}`}>TEST</td>
                      <td className="py-2.5 pr-4">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-400/10 text-sky-400">✓ TEST</span>
                      </td>
                      <td className={`py-2.5 pr-4 font-mono ${subText}`}>{log.ip || '—'}</td>
                      <td className={`py-2.5 ${subText}`}>{timeAgo(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Postback logs */}
          <div className={d.card}>
            <h2 className={`text-sm font-bold ${headText} mb-4`}>Postback Logs</h2>
            {logs.length === 0 ? (
              <p className={`text-sm text-center py-8 ${subText}`}>No postback logs yet.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className={`${subText} text-left border-b ${borderColor}`}>
                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">Status</th>
                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">Click ID</th>
                    <th className="pb-2 pr-4 font-semibold uppercase tracking-wider">IP</th>
                    <th className="pb-2 font-semibold uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    const meta = STATUS_META[log.status] || { text: 'text-gray-400', bg: 'bg-gray-400/10' };
                    return (
                      <tr key={log.id} className={`border-t ${borderColor}`}>
                        <td className="py-2 pr-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${meta.text} ${meta.bg}`}>{log.status}</span>
                        </td>
                        <td className={`py-2 pr-4 font-mono ${subText}`}>{log.clickId ? `${log.clickId.slice(0, 12)}…` : '—'}</td>
                        <td className={`py-2 pr-4 font-mono ${subText}`}>{log.ip || '—'}</td>
                        <td className={`py-2 ${subText}`}>{timeAgo(log.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 3 — GOOGLE TAG MANAGER ═══════════════ */}
      {tab === 'gtm' && (
        <div className="space-y-5">
          <div className={d.card}>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-orange-400/15">
                <Tag className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className={`text-base font-bold ${headText}`}>Google Tag Manager Integration</h2>
                <p className={`text-xs ${subText}`}>
                  Fire conversion tracking through GTM without modifying your site's code directly.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className={`text-xs font-semibold ${subText} uppercase tracking-wider block mb-2`}>
                Your GTM Container ID
              </label>
              <input
                value={gtmId}
                onChange={e => setGtmId(e.target.value)}
                placeholder="GTM-XXXXXXX"
                className={`px-3 py-2.5 rounded-xl border ${borderColor} text-sm font-mono w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-orange-400/30 ${isDark ? 'bg-white/5 text-white' : 'bg-white text-gray-900'}`}
              />
            </div>

            <div className={`rounded-xl p-4 border mb-5 ${isDark ? 'border-orange-400/15 bg-orange-400/6' : 'border-orange-200 bg-orange-50'}`}>
              <p className={`text-xs font-bold mb-3 ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>3-Step GTM Setup</p>
              <ol className={`text-xs space-y-3 ${isDark ? 'text-orange-200/70' : 'text-orange-800/80'}`}>
                {[
                  { n: 1, html: <>Create a <strong>Variable</strong>: GTM → Variables → User-Defined → URL → Query → <code className="bg-orange-400/15 px-1 rounded font-mono">click_id</code>. Name it <code className="bg-orange-400/15 px-1 rounded font-mono">DL - click_id</code>.</> },
                  { n: 2, html: <>Create a <strong>Trigger</strong>: Page View → your "Thank You" page URL (e.g. <code className="bg-orange-400/15 px-1 rounded font-mono">/thank-you</code>).</> },
                  { n: 3, html: <>Create a <strong>Tag</strong>: Custom HTML → paste the code below → set your trigger → Publish.</> },
                ].map(s => (
                  <li key={s.n} className="flex items-start gap-2">
                    <span className="font-black text-orange-400 flex-shrink-0 w-5">{s.n}.</span>
                    <div>{s.html}</div>
                  </li>
                ))}
              </ol>
            </div>

            <p className={`text-[11px] font-black uppercase tracking-widest ${subText} mb-2`}>Custom HTML Tag Code</p>
            <div className={`relative rounded-xl border ${borderColor} overflow-hidden`}>
              <pre className={`text-xs p-4 overflow-x-auto font-mono ${codeBg} text-gray-300 whitespace-pre-wrap leading-relaxed`}>
                {buildGtmSnippet(gtmId, selectedCampaignId)}
              </pre>
              <button
                onClick={() => copyText(buildGtmSnippet(gtmId, selectedCampaignId), 'gtm')}
                className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  copied === 'gtm' ? 'bg-emerald-400/20 text-emerald-400' : isDark ? 'bg-white/8 text-gray-300 hover:bg-white/15' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {copied === 'gtm' ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <div className={`mt-4 flex items-center gap-2 text-xs ${subText}`}>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
              <a href="https://tagmanager.google.com/" target="_blank" rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2 transition-colors">
                Open Google Tag Manager <ExternalLink className="w-3 h-3 inline" />
              </a>
            </div>
          </div>

          {/* Pixel fallback */}
          <div className={d.card}>
            <p className={`text-[11px] font-black uppercase tracking-widest ${subText} mb-3`}>
              Alternative: Image Pixel (no server needed)
            </p>
            <div className={`relative rounded-xl border ${borderColor} overflow-hidden`}>
              <pre className={`text-xs p-4 overflow-x-auto font-mono ${codeBg} text-gray-300 whitespace-pre-wrap`}>{pixelTag}</pre>
              <button
                onClick={() => copyText(pixelTag, 'pixel')}
                className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  copied === 'pixel' ? 'bg-emerald-400/20 text-emerald-400' : isDark ? 'bg-white/8 text-gray-300 hover:bg-white/15' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {copied === 'pixel' ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <p className={`text-xs mt-2 ${subText}`}>
              Replace <code className="text-yellow-400 bg-yellow-400/10 px-1 rounded font-mono">{'{CLICK_ID}'}</code> with the{' '}
              <code className="font-mono">click_id</code> query parameter from the landing URL.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
