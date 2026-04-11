'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Clock, Calendar, BarChart2, Zap, Gauge, TrendingUp, Brain, Target } from 'lucide-react';
import { getDashboardTheme } from '@/lib/themeUtils';
import useTheme from '@/hooks/useTheme';
import { advertiserAPI } from '@/lib/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Initialize full 7x24 schedule (all hours enabled by default)
const createDefaultSchedule = () => {
    const schedule = {};
    DAYS.forEach(day => {
        schedule[day] = new Set(HOURS); // all hours enabled
    });
    return schedule;
};

// Convert Set-based schedule to serializable format
const serializeSchedule = (schedule) => {
    const result = {};
    Object.entries(schedule).forEach(([day, hours]) => {
        result[day] = Array.from(hours);
    });
    return result;
};

export default function BudgetSchedule({ formData, updateField }) {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [schedule, setSchedule] = useState(createDefaultSchedule);
    const [isDaypartingEnabled, setIsDaypartingEnabled] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragAction, setDragAction] = useState(null);
    const [pacing, setPacing] = useState('EVEN');
    const [biddingStrategy, setBiddingStrategy] = useState(formData.biddingStrategy || 'CPM');

    // Bid recommendation state
    const [bidRec, setBidRec] = useState(null);
    const [bidRecLoading, setBidRecLoading] = useState(false);

    // Fetch bid recommendation when countries or adFormat changes
    const countriesKey = JSON.stringify(formData.countries || []);
    useEffect(() => {
        const fetchBidRec = async () => {
            try {
                setBidRecLoading(true);
                const data = await advertiserAPI.getBidRecommendation(
                    formData.countries || [],
                    formData.adFormat || 'POPUNDER'
                );
                setBidRec(data);
            } catch {
                setBidRec(null);
            } finally {
                setBidRecLoading(false);
            }
        };
        const timeout = setTimeout(fetchBidRec, 300); // debounce
        return () => clearTimeout(timeout);
    }, [countriesKey, formData.adFormat]);

    const toggleHour = (day, hour, action) => {
        setSchedule(prev => {
            const next = { ...prev };
            const daySet = new Set(next[day]);
            if (action === 'remove') {
                daySet.delete(hour);
            } else {
                daySet.add(hour);
            }
            next[day] = daySet;
            updateField('schedule', serializeSchedule(next));
            return next;
        });
    };

    const handleMouseDown = (day, hour) => {
        const action = schedule[day].has(hour) ? 'remove' : 'add';
        setIsDragging(true);
        setDragAction(action);
        toggleHour(day, hour, action);
    };

    const handleMouseEnter = (day, hour) => {
        if (isDragging) {
            toggleHour(day, hour, dragAction);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragAction(null);
    };

    const toggleDay = (day) => {
        setSchedule(prev => {
            const next = { ...prev };
            const allSelected = next[day].size === 24;
            next[day] = allSelected ? new Set() : new Set(HOURS);
            updateField('schedule', serializeSchedule(next));
            return next;
        });
    };

    const toggleHourColumn = (hour) => {
        setSchedule(prev => {
            const next = { ...prev };
            const allSelected = DAYS.every(day => next[day].has(hour));
            DAYS.forEach(day => {
                const daySet = new Set(next[day]);
                if (allSelected) daySet.delete(hour); else daySet.add(hour);
                next[day] = daySet;
            });
            updateField('schedule', serializeSchedule(next));
            return next;
        });
    };

    const selectedHoursCount = Object.values(schedule).reduce((acc, set) => acc + set.size, 0);
    const totalHours = 7 * 24;
    const schedulePercent = Math.round((selectedHoursCount / totalHours) * 100);

    return (
        <div
            className={`p-6 rounded-2xl mb-6 border ${d.card} ${d.cardHover}`}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${d.heading}`}>
                <DollarSign className={`w-5 h-5 ${d.accent}`} />
                Budget & Schedule
            </h3>

            {/* === BIDDING STRATEGY === */}
            <div className={`p-4 rounded-xl border mb-8 ${d.isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className={`w-4 h-4 ${d.accent}`} />
                    <h4 className={`text-sm font-bold ${d.heading}`}>Bidding Strategy</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {[
                        {
                            id: 'CPM',
                            icon: '📊',
                            label: 'CPM',
                            sublabel: 'Fixed Bid',
                            desc: 'Pay a fixed rate per 1,000 impressions. Full control over spend.'
                        },
                        {
                            id: 'SMART_CPM',
                            icon: '⚡',
                            label: 'SmartCPM',
                            sublabel: 'Auto-optimize',
                            desc: 'Set a max CPM. System bids just enough to win — often much lower.'
                        },
                        {
                            id: 'SMART_CPC',
                            icon: '🎯',
                            label: 'SmartCPC',
                            sublabel: 'CPA Optimize',
                            desc: 'AI auto-blacklists sites that fail to convert within your CPA goal.'
                        }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                                setBiddingStrategy(opt.id);
                                updateField('biddingStrategy', opt.id);
                            }}
                            className={`flex flex-col gap-1.5 p-3.5 rounded-xl border text-left transition-all ${
                                biddingStrategy === opt.id
                                    ? (d.isDark ? 'border-lime-500/50 bg-lime-500/10' : 'border-lime-500 bg-lime-50')
                                    : (d.isDark ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-white hover:bg-gray-50')
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-lg">{opt.icon}</span>
                                {biddingStrategy === opt.id && (
                                    <div className="w-4 h-4 rounded-full bg-lime-500 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${biddingStrategy === opt.id ? d.accent : d.heading}`}>{opt.label}</p>
                                <p className={`text-[10px] font-medium ${d.muted}`}>{opt.sublabel}</p>
                            </div>
                            <p className={`text-[10px] leading-relaxed ${d.muted}`}>{opt.desc}</p>
                        </button>
                    ))}
                </div>

                {/* SmartCPM explanation card */}
                {biddingStrategy === 'SMART_CPM' && (
                    <div className={`p-3.5 rounded-xl border mb-0 ${
                        d.isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'
                    }`}>
                        <p className={`text-xs font-bold mb-1 ${d.isDark ? 'text-amber-400' : 'text-amber-700'}`}>⚡ How SmartCPM Works</p>
                        <ul className={`text-[11px] space-y-0.5 ${d.isDark ? 'text-amber-300/80' : 'text-amber-700/80'}`}>
                            <li>• Algorithms maximize impressions at the competitive price in real-time auction</li>
                            <li>• You set the <strong>maximum CPM bid</strong> (ceiling) — system bids just enough to win</li>
                            <li>• Great for broad reach while saving budget</li>
                        </ul>
                    </div>
                )}
            </div>

            {/* === BIDDING & BUDGET ROW === */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Bid Amount — label changes based on strategy */}
                <div>
                    <label className={`block text-sm font-medium mb-2 ${d.subheading}`}>
                        {biddingStrategy === 'SMART_CPM' ? 'Maximum CPM Bid (Ceiling)' : 'Bid Amount (CPM)'}
                    </label>
                    <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold ${d.text}`}>$</span>
                        <input
                            type="number"
                            value={formData.bidAmount}
                            onChange={(e) => {
                                updateField('bidAmount', e.target.value);
                                if (biddingStrategy === 'SMART_CPM') {
                                    updateField('smartCpmMaxBid', e.target.value);
                                }
                            }}
                            placeholder={biddingStrategy === 'SMART_CPM' ? '3.00' : '0.50'}
                            step="0.01"
                            min="0.1"
                            className={`${d.inputCls} pl-8 text-lg font-bold`}
                        />
                    </div>
                    {/* Dynamic Bid Recommendation */}
                    {bidRecLoading ? (
                        <p className={`text-xs mt-2 ${d.muted} animate-pulse`}>⏳ Calculating optimal bid...</p>
                    ) : bidRec ? (
                        <div className={`mt-2 flex flex-wrap items-center gap-2`}>
                            <button
                                type="button"
                                onClick={() => {
                                    updateField('bidAmount', bidRec.recommendedBid);
                                    if (biddingStrategy === 'SMART_CPM') updateField('smartCpmMaxBid', bidRec.recommendedBid);
                                }}
                                className={`text-xs px-2 py-1 rounded-lg font-medium transition-all ${d.isDark ? 'bg-lime-500/10 text-lime-400 hover:bg-lime-500/20 border border-lime-500/20' : 'bg-lime-50 text-lime-700 hover:bg-lime-100 border border-lime-200'}`}
                            >
                                💡 Use ${bidRec.recommendedBid}
                            </button>
                            <span className={`text-[10px] ${d.muted}`}>
                                Min: ${bidRec.minBid}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                bidRec.competition === 'HIGH' 
                                    ? (d.isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600')
                                    : bidRec.competition === 'MEDIUM'
                                        ? (d.isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600')
                                        : (d.isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600')
                            }`}>
                                {bidRec.competition === 'HIGH' ? '🔥' : bidRec.competition === 'MEDIUM' ? '⚡' : '✅'} {bidRec.competition}
                            </span>
                        </div>
                    ) : (
                        <p className={`text-xs mt-2 ${d.muted}`}>{biddingStrategy === 'SMART_CPM' ? 'Set your maximum — system will bid lower to save budget' : 'Recommended: $1.20 for current targeting'}</p>
                    )}
                </div>

                {/* Daily Budget */}
                <div>
                    <label className={`block text-sm font-medium mb-2 ${d.subheading}`}>Daily Budget</label>
                    <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold ${d.text}`}>$</span>
                        <input
                            type="number"
                            value={formData.dailyBudget}
                            onChange={(e) => updateField('dailyBudget', e.target.value)}
                            placeholder="50.00"
                            step="5"
                            min="5"
                            className={`${d.inputCls} pl-8 text-lg font-bold`}
                        />
                    </div>
                </div>

                {/* Total Budget */}
                <div>
                    <label className={`block text-sm font-medium mb-2 ${d.subheading}`}>Total Budget</label>
                    <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold ${d.text}`}>$</span>
                        <input
                            type="number"
                            value={formData.totalBudget}
                            onChange={(e) => updateField('totalBudget', e.target.value)}
                            placeholder="100.00"
                            step="10"
                            min="10"
                            className={`${d.inputCls} pl-8 text-lg font-bold`}
                        />
                    </div>
                </div>
            </div>

            {/* === BUDGET PACING === */}
            <div className={`p-4 rounded-xl border mb-8 ${d.isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                    <Gauge className={`w-4 h-4 ${d.accent}`} />
                    <h4 className={`text-sm font-bold ${d.heading}`}>Budget Pacing</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        {
                            id: 'EVEN',
                            icon: '⚖️',
                            label: 'Even Delivery',
                            desc: 'Budget spread evenly throughout the day. Stable, predictable spend.'
                        },
                        {
                            id: 'ACCELERATED',
                            icon: '⚡',
                            label: 'Accelerated',
                            desc: 'Spend budget as fast as possible. Maximizes impressions during peak hours.'
                        }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                                setPacing(opt.id);
                                updateField('pacing', opt.id);
                            }}
                            className={`flex gap-3 p-3 rounded-xl border text-left transition-all ${
                                pacing === opt.id
                                    ? (d.isDark ? 'border-lime-500/50 bg-lime-500/10' : 'border-lime-500 bg-lime-50')
                                    : (d.isDark ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-white hover:bg-gray-50')
                            }`}
                        >
                            <span className="text-xl flex-shrink-0 mt-0.5">{opt.icon}</span>
                            <div>
                                <p className={`text-sm font-bold ${pacing === opt.id ? d.accent : d.heading}`}>{opt.label}</p>
                                <p className={`text-xs mt-0.5 ${d.muted}`}>{opt.desc}</p>
                            </div>
                            {pacing === opt.id && (
                                <div className="ml-auto flex-shrink-0">
                                    <div className="w-4 h-4 rounded-full bg-lime-500 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* === SMART CPA === (only shown for CPM + SmartCPC) */}
            {(biddingStrategy === 'CPM' || biddingStrategy === 'SMART_CPC') && (
            <div className={`p-5 rounded-2xl mb-8 border relative overflow-hidden ${d.isDark ? 'border-lime-500/20 bg-lime-500/5' : 'border-lime-500/30 bg-lime-50'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 rounded-full blur-3xl"></div>
                <div className="flex items-start justify-between gap-4 relative z-10">
                    <div>
                        <h4 className={`text-base font-bold flex items-center gap-2 mb-1 ${d.accent}`}>
                            <BarChart2 className="w-5 h-5" />
                            Smart CPA Auto-Optimization
                        </h4>
                        <p className={`text-sm ${d.muted} pr-8`}>
                            Our AI will automatically blacklist publisher sites that fail to convert traffic within your target Cost-Per-Action (CPA).
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                        <input
                            type="checkbox"
                            checked={formData.autoOptimize || false}
                            onChange={(e) => updateField('autoOptimize', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className={`w-11 h-6 ${d.isDark ? 'bg-gray-700' : 'bg-gray-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500`}></div>
                    </label>
                </div>
                {formData.autoOptimize && (
                    <div className="mt-5 pt-5 border-t border-lime-500/10">
                        <label className={`block text-sm font-bold mb-2 ${d.accent}`}>Target CPA Goal</label>
                        <div className="relative max-w-[200px]">
                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold ${d.text}`}>$</span>
                            <input
                                type="number"
                                value={formData.cpaGoal || ''}
                                onChange={(e) => updateField('cpaGoal', e.target.value)}
                                placeholder="1.50"
                                step="0.01"
                                min="0.01"
                                className={`w-full ${d.inputCls} pl-8 font-bold`}
                            />
                        </div>
                    </div>
                )}
            </div>
            )}

            {/* === FREQUENCY CAPPING === */}
            <div className={`p-4 rounded-xl border mb-8 ${d.isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Clock className={`w-4 h-4 ${d.accent}`} />
                    <h4 className={`text-sm font-bold ${d.heading}`}>Frequency Capping</h4>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-sm ${d.text}`}>Show</span>
                    <input
                        type="number"
                        value={formData.freqCap || 3}
                        onChange={(e) => updateField('freqCap', e.target.value)}
                        className={`!w-16 !px-2 !py-2 text-center ${d.inputCls}`}
                    />
                    <span className={`text-sm ${d.text}`}>impressions every</span>
                    <input
                        type="number"
                        value={formData.freqInterval || 24}
                        onChange={(e) => updateField('freqInterval', e.target.value)}
                        className={`!w-16 !px-2 !py-2 text-center ${d.inputCls}`}
                    />
                    <span className={`text-sm ${d.text}`}>hours per user</span>
                </div>
            </div>

            {/* === CLICK LIMITS === */}
            <div className={`p-4 rounded-xl border mb-8 ${d.isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <Target className={`w-4 h-4 ${d.accent}`} />
                    <h4 className={`text-sm font-bold ${d.heading}`}>Click Limits</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ d.isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>Budget Control</span>
                </div>
                <p className={`text-xs mb-4 ${d.muted}`}>
                    Automatically pause the campaign when click limits are reached. Leave empty for unlimited clicks.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d.muted}`}>
                            Daily Clicks Limit
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={formData.dailyClicksLimit || ''}
                                onChange={(e) => updateField('dailyClicksLimit', e.target.value)}
                                placeholder="e.g. 500"
                                min="1"
                                step="1"
                                className={`${d.inputCls} w-full`}
                            />
                        </div>
                        <p className={`text-[10px] mt-1.5 ${d.muted}`}>Resets at midnight (UTC). Empty = unlimited.</p>
                    </div>
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d.muted}`}>
                            Total Clicks Limit
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={formData.totalClicksLimit || ''}
                                onChange={(e) => updateField('totalClicksLimit', e.target.value)}
                                placeholder="e.g. 10000"
                                min="1"
                                step="1"
                                className={`${d.inputCls} w-full`}
                            />
                        </div>
                        <p className={`text-[10px] mt-1.5 ${d.muted}`}>Campaign pauses when total clicks reach this cap.</p>
                    </div>
                </div>
            </div>

            {/* === DAYPARTING === */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${d.accent}`} />
                        <h4 className={`text-sm font-bold ${d.heading}`}>Dayparting Schedule</h4>
                        {isDaypartingEnabled && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${d.isDark ? 'bg-lime-500/20 text-lime-400' : 'bg-lime-100 text-lime-700'}`}>
                                {schedulePercent}% active
                            </span>
                        )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isDaypartingEnabled}
                            onChange={(e) => {
                                setIsDaypartingEnabled(e.target.checked);
                                if (!e.target.checked) updateField('schedule', null);
                                else updateField('schedule', serializeSchedule(schedule));
                            }}
                            className="sr-only peer"
                        />
                        <div className={`w-9 h-5 ${d.isDark ? 'bg-gray-600' : 'bg-gray-300'} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-lime-500`}></div>
                    </label>
                </div>

                {!isDaypartingEnabled ? (
                    <div className={`text-sm text-center py-6 rounded-xl border-2 border-dashed ${d.isDark ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                        🕐 Running 24/7 by default — enable to set custom hours
                    </div>
                ) : (
                    <div className="select-none">
                        <p className={`text-[11px] mb-3 ${d.muted}`}>
                            Click or drag to toggle hours. Click a day label to toggle the full row.
                        </p>

                        {/* Hour labels */}
                        <div className="flex gap-0.5 mb-1 ml-10">
                            {HOURS.filter(h => h % 3 === 0).map(h => (
                                <div
                                    key={h}
                                    className={`text-[9px] font-mono ${d.muted} cursor-pointer hover:text-lime-400 transition-colors`}
                                    style={{ width: `${100 / 8}%`, textAlign: 'left' }}
                                    onClick={() => toggleHourColumn(h)}
                                >
                                    {h.toString().padStart(2, '0')}:00
                                </div>
                            ))}
                        </div>

                        {/* Day rows */}
                        {DAYS.map(day => {
                            const dayActive = schedule[day].size;
                            const dayFull = dayActive === 24;
                            return (
                                <div key={day} className="flex items-center gap-0.5 mb-0.5">
                                    {/* Day label */}
                                    <button
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={`w-9 flex-shrink-0 text-[10px] font-bold text-right pr-1.5 transition-colors ${
                                            dayFull ? 'text-lime-400' : dayActive > 0 ? (d.isDark ? 'text-yellow-400' : 'text-yellow-600') : d.muted
                                        }`}
                                    >
                                        {day}
                                    </button>

                                    {/* Hour cells */}
                                    {HOURS.map(hour => {
                                        const isActive = schedule[day].has(hour);
                                        return (
                                            <div
                                                key={hour}
                                                className={`flex-1 h-5 rounded-sm cursor-pointer transition-all duration-75 ${
                                                    isActive
                                                        ? (d.isDark ? 'bg-lime-500 hover:bg-lime-400' : 'bg-lime-500 hover:bg-lime-600')
                                                        : (d.isDark ? 'bg-white/8 hover:bg-white/15' : 'bg-gray-200 hover:bg-gray-300')
                                                }`}
                                                onMouseDown={() => handleMouseDown(day, hour)}
                                                onMouseEnter={() => handleMouseEnter(day, hour)}
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })}

                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-3 rounded-sm bg-lime-500" />
                                <span className={`text-[10px] ${d.muted}`}>Active</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-4 h-3 rounded-sm ${d.isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                                <span className={`text-[10px] ${d.muted}`}>Paused</span>
                            </div>
                            <div className={`ml-auto text-[10px] ${d.muted}`}>
                                {selectedHoursCount}/{totalHours} hours active
                            </div>
                        </div>

                        {/* Quick presets */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                            {[
                                { label: 'Business Hours', fn: () => {
                                    const s = {};
                                    DAYS.forEach(day => {
                                        s[day] = ['Sat', 'Sun'].includes(day)
                                            ? new Set()
                                            : new Set([9,10,11,12,13,14,15,16,17,18]);
                                    });
                                    setSchedule(s);
                                    updateField('schedule', serializeSchedule(s));
                                }},
                                { label: 'Evening Peak', fn: () => {
                                    const s = {};
                                    DAYS.forEach(day => { s[day] = new Set([18,19,20,21,22,23]); });
                                    setSchedule(s);
                                    updateField('schedule', serializeSchedule(s));
                                }},
                                { label: 'Weekends Only', fn: () => {
                                    const s = {};
                                    DAYS.forEach(day => {
                                        s[day] = ['Sat', 'Sun'].includes(day) ? new Set(HOURS) : new Set();
                                    });
                                    setSchedule(s);
                                    updateField('schedule', serializeSchedule(s));
                                }},
                                { label: 'Reset All', fn: () => {
                                    const s = createDefaultSchedule();
                                    setSchedule(s);
                                    updateField('schedule', serializeSchedule(s));
                                }},
                            ].map(preset => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={preset.fn}
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors ${d.isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
