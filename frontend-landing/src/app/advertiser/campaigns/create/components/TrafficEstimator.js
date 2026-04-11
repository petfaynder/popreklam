import { useState, useEffect } from 'react';
import { Zap, Target, Users, TrendingUp, AlertTriangle, CheckCircle, Info, Activity, Gauge } from 'lucide-react';
import { getDashboardTheme } from '@/lib/themeUtils';
import useTheme from '@/hooks/useTheme';

// Competition data by country tier
const HIGH_TIER_COUNTRIES = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK', 'CH', 'AT', 'JP', 'SG', 'AE'];
const MID_TIER_COUNTRIES  = ['BR', 'MX', 'IN', 'TR', 'PL', 'IT', 'ES', 'RU', 'TH', 'ID', 'MY', 'AR', 'CO', 'ZA', 'KR', 'TW', 'SA', 'IL'];

function getCompetitionLevel(formData, isDark) {
    const { countries, devices, os, browsers, bidAmount, adFormat } = formData;

    let score = 0;

    if (countries.length === 0) {
        score += 40;
    } else {
        const highCount = countries.filter(c => HIGH_TIER_COUNTRIES.includes(c)).length;
        const midCount  = countries.filter(c => MID_TIER_COUNTRIES.includes(c)).length;
        const ratio = highCount / countries.length;
        score += ratio > 0.5 ? 70 : midCount / countries.length > 0.5 ? 45 : 20;
    }

    if (adFormat === 'POPUNDER') score += 15;
    else if (adFormat === 'PUSH_NOTIFICATION') score += 5;

    if (devices.length > 0) score -= 8;
    if (os.length > 0) score -= 5;
    if (browsers.length > 0) score -= 4;

    const bid = parseFloat(bidAmount) || 0;
    if (bid >= 2) score += 20;
    else if (bid >= 1) score += 10;
    else if (bid < 0.3) score -= 15;

    score = Math.max(0, Math.min(100, score));

    if (score >= 65) return {
        level: 'HIGH', score,
        color: isDark ? '#f87171' : '#dc2626',
        textCls: isDark ? 'text-red-400' : 'text-red-600',
        bgCls: isDark ? 'bg-red-500/10' : 'bg-red-50',
        borderCls: isDark ? 'border-red-500/20' : 'border-red-200',
        icon: AlertTriangle,
        label: 'HIGH',
        tip: 'High competition in selected geos. Increase bid for visibility.'
    };
    if (score >= 35) return {
        level: 'MEDIUM', score,
        color: isDark ? '#fbbf24' : '#d97706',
        textCls: isDark ? 'text-amber-400' : 'text-amber-600',
        bgCls: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
        borderCls: isDark ? 'border-amber-500/20' : 'border-amber-200',
        icon: Info,
        label: 'MEDIUM',
        tip: 'Balanced competition. Good starting point for new campaigns.'
    };
    return {
        level: 'LOW', score,
        color: isDark ? '#a3e635' : '#16a34a',
        textCls: isDark ? 'text-lime-400' : 'text-green-600',
        bgCls: isDark ? 'bg-lime-500/10' : 'bg-green-50',
        borderCls: isDark ? 'border-lime-500/20' : 'border-green-200',
        icon: CheckCircle,
        label: 'LOW',
        tip: 'Low competition! Great opportunity to get cheap clicks.'
    };
}

// SVG Gauge component — clean semi-circle meter
function ReachGauge({ reach, gaugeColor, isDark }) {
    const [animatedReach, setAnimatedReach] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedReach(reach), 100);
        return () => clearTimeout(timer);
    }, [reach]);

    // Semi-circle parameters
    const size = 160;
    const strokeW = 12;
    const r = (size - strokeW) / 2 - 4;
    const cx = size / 2;
    const cy = size / 2 + 8;

    // Arc path — 180° semi-circle from left to right
    const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
    const arcLength = Math.PI * r;
    const fillLength = (animatedReach / 100) * arcLength;

    // Needle angle — maps 0-100 to 180°-0° (left to right)
    const needleAngle = 180 - (animatedReach / 100) * 180;
    const needleLen = r - 14;
    const needleRad = (needleAngle * Math.PI) / 180;
    const nx = cx + needleLen * Math.cos(needleRad);
    const ny = cy - needleLen * Math.sin(needleRad);

    // Tick marks for scale (0, 25, 50, 75, 100)
    const ticks = [0, 25, 50, 75, 100];

    return (
        <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
            <svg width={size} height={size / 2 + 28} viewBox={`0 0 ${size} ${size / 2 + 28}`}>
                {/* Glow filter */}
                <defs>
                    <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="gauge-track" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                        <stop offset="100%" stopColor={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} />
                    </linearGradient>
                </defs>

                {/* Scale ticks */}
                {ticks.map(t => {
                    const angle = 180 - (t / 100) * 180;
                    const rad = (angle * Math.PI) / 180;
                    const innerR = r + strokeW / 2 + 2;
                    const outerR = r + strokeW / 2 + 7;
                    const x1 = cx + innerR * Math.cos(rad);
                    const y1 = cy - innerR * Math.sin(rad);
                    const x2 = cx + outerR * Math.cos(rad);
                    const y2 = cy - outerR * Math.sin(rad);
                    return (
                        <line key={t} x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}
                            strokeWidth="1.5" strokeLinecap="round"
                        />
                    );
                })}

                {/* Background track */}
                <path d={arcPath} fill="none"
                    stroke="url(#gauge-track)"
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                />

                {/* Filled arc */}
                <path d={arcPath} fill="none"
                    stroke={gaugeColor}
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                    strokeDasharray={`${fillLength} ${arcLength}`}
                    filter={isDark ? "url(#gauge-glow)" : undefined}
                    style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease' }}
                />

                {/* Needle */}
                <line x1={cx} y1={cy} x2={nx} y2={ny}
                    stroke={isDark ? '#fff' : '#1A1A1A'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                        transition: 'x2 0.8s cubic-bezier(0.4, 0, 0.2, 1), y2 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: isDark ? 'drop-shadow(0 0 3px rgba(255,255,255,0.3))' : 'none'
                    }}
                />
                {/* Needle center dot */}
                <circle cx={cx} cy={cy} r="4"
                    fill={isDark ? '#fff' : '#1A1A1A'}
                    stroke={gaugeColor} strokeWidth="2"
                />

                {/* Min/Max labels */}
                <text x={cx - r - 2} y={cy + 16} textAnchor="middle"
                    fill={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
                    fontSize="9" fontWeight="600">0</text>
                <text x={cx + r + 2} y={cy + 16} textAnchor="middle"
                    fill={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
                    fontSize="9" fontWeight="600">100</text>
            </svg>

            {/* Center label */}
            <div className="absolute left-0 right-0 flex flex-col items-center"
                style={{ bottom: '0px' }}>
                <span className="text-2xl font-black tabular-nums tracking-tight"
                    style={{ color: gaugeColor, transition: 'color 0.4s ease', lineHeight: 1 }}>
                    {animatedReach}%
                </span>
                <span className="text-[8px] uppercase font-bold tracking-[0.2em] mt-0.5"
                    style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
                    Reach Score
                </span>
            </div>
        </div>
    );
}

export default function TrafficEstimator({ formData }) {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const { countries, devices, os, bidAmount, biddingStrategy, smartCpmMaxBid } = formData;

    // Effective bid for estimations: SmartCPM uses max bid as the reference
    const effectiveBid = (biddingStrategy === 'SMART_CPM' && smartCpmMaxBid)
        ? parseFloat(smartCpmMaxBid) || 0
        : parseFloat(bidAmount) || 0;

    // ── REACH SCORE ──
    // Smooth curve: bid has a continuous effect instead of step thresholds
    const calculateReach = () => {
        let score = 50;

        if (countries.length > 0) {
            const highCount = countries.filter(c => HIGH_TIER_COUNTRIES.includes(c)).length;
            score = 30 + (countries.length / 200) * 60 + highCount * 0.5;
        }

        if (devices.length > 0) score -= 5;
        if (os.length > 0) score -= 3;

        // Bid impact: smooth curve up to +25 points (diminishing returns)
        score += Math.min(25, effectiveBid * 8);

        return Math.min(Math.max(Math.round(score), 5), 98);
    };

    const reach = calculateReach();
    const competition = getCompetitionLevel(formData, d.isDark);
    const CompIcon = competition.icon;

    // ── IMPRESSIONS & CLICKS ──
    // Win-rate model: higher bid = win more auctions = more impressions
    // effectiveBid: SmartCPM → smartCpmMaxBid, otherwise → bidAmount
    const bid = effectiveBid || 0.5;

    // Available daily inventory pool based on targeting
    let baseInventory = 200000;
    if (countries.length > 0) {
        const highCount = countries.filter(c => HIGH_TIER_COUNTRIES.includes(c)).length;
        const midCount  = countries.filter(c => MID_TIER_COUNTRIES.includes(c)).length;
        const lowCount  = countries.length - highCount - midCount;
        baseInventory = highCount * 25000 + midCount * 15000 + lowCount * 8000;
        if (baseInventory < 5000) baseInventory = 5000;
    }
    if (devices.length > 0) baseInventory *= 0.6;
    if (os.length > 0) baseInventory *= 0.7;

    // Win rate: logarithmic curve — $0.3→35%, $1→55%, $2→75%, $5→92%
    const winRate = Math.min(0.95, 0.2 + 0.75 * (1 - Math.exp(-bid / 1.8)));


    // Impressions scale with available inventory × win rate
    const dailyImpressions = Math.floor(baseInventory * winRate);
    const estClicks = Math.floor(dailyImpressions * 0.022);

    const gaugeColor = reach >= 70 ? (d.isDark ? '#a3e635' : '#16a34a') : reach >= 40 ? (d.isDark ? '#fbbf24' : '#d97706') : (d.isDark ? '#f87171' : '#dc2626');

    // Bid display in Settings Summary
    const bidDisplayLabel = biddingStrategy === 'SMART_CPM' ? 'Max CPM (SmartCPM)'
        : biddingStrategy === 'SMART_CPC' ? 'Bid (SmartCPC)'
        : 'Bid (CPM)';
    const bidDisplayValue = `$${effectiveBid > 0 ? effectiveBid.toFixed(4) : '0.00'}`;

    return (
        <div className={`sticky top-24 rounded-2xl border overflow-hidden ${d.card}`}>
            {/* Header stripe */}
            <div className={`px-5 py-3 border-b flex items-center gap-2 ${d.isDark ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50/80 border-gray-100'}`}>
                <div className={`p-1.5 rounded-lg ${d.isDark ? 'bg-lime-500/10' : 'bg-[#1A1A1A]/5'}`}>
                    <Activity className={`w-3.5 h-3.5 ${d.accent}`} />
                </div>
                <h3 className={`text-sm font-bold uppercase tracking-wide ${d.heading}`}>Traffic Estimator</h3>
            </div>

            <div className="px-5 pt-5 pb-5">
                {/* Gauge */}
                <div className="flex justify-center mb-4">
                    <ReachGauge reach={reach} gaugeColor={gaugeColor} isDark={d.isDark} />
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className={`p-3 rounded-xl text-center ${d.isDark ? 'bg-white/[0.03] border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                            <Users className={`w-3 h-3 ${d.muted}`} />
                            <span className={`text-[10px] uppercase tracking-wider font-semibold ${d.muted}`}>Impressions</span>
                        </div>
                        <span className={`text-lg font-black tabular-nums ${d.text}`}>
                            {dailyImpressions >= 1000 ? `${(dailyImpressions / 1000).toFixed(0)}K` : dailyImpressions.toLocaleString('en-US')}
                        </span>
                        <span className={`block text-[9px] ${d.muted}`}>/day</span>
                    </div>
                    <div className={`p-3 rounded-xl text-center ${d.isDark ? 'bg-white/[0.03] border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                            <Target className={`w-3 h-3 ${d.muted}`} />
                            <span className={`text-[10px] uppercase tracking-wider font-semibold ${d.muted}`}>Clicks</span>
                        </div>
                        <span className={`text-lg font-black tabular-nums ${d.text}`}>
                            {estClicks >= 1000 ? `${(estClicks / 1000).toFixed(1)}K` : estClicks.toLocaleString('en-US')}
                        </span>
                        <span className={`block text-[9px] ${d.muted}`}>/day</span>
                    </div>
                </div>

                {/* Competition badge */}
                <div className={`flex items-center justify-between p-3 rounded-xl border mb-3 ${competition.bgCls} ${competition.borderCls}`}>
                    <div className="flex items-center gap-2">
                        <TrendingUp className={`w-3.5 h-3.5 ${competition.textCls}`} />
                        <span className={`text-xs font-semibold ${d.muted}`}>Competition</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${competition.bgCls} ${competition.textCls}`}>
                        <CompIcon className="w-3 h-3" />
                        {competition.label}
                    </div>
                </div>

                {/* Tip */}
                <p className={`text-[11px] leading-relaxed px-3 py-2.5 rounded-lg mb-4 ${competition.bgCls} ${competition.textCls}`}>
                    <span className="mr-1">💡</span>{competition.tip}
                </p>

                {/* Divider */}
                <div className={`border-t mb-4 ${d.isDark ? 'border-white/5' : 'border-gray-100'}`} />

                {/* Summary */}
                <div className="space-y-2">
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2.5 ${d.muted}`}>
                        Settings Summary
                    </p>
                    {[
                        { label: 'Format', value: formData.adFormat?.replace('_', ' ') || 'POPUNDER' },
                        { label: 'Countries', value: formData.countries.length > 0 ? `${formData.countries.length} selected` : 'Global' },
                        { label: bidDisplayLabel, value: bidDisplayValue },
                        { label: 'Pacing', value: formData.pacing || 'EVEN' },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className={`text-xs ${d.muted}`}>{label}</span>
                            <span className={`text-xs font-bold capitalize ${d.text}`}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
