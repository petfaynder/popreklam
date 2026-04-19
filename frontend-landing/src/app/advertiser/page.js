'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Target, TrendingUp, DollarSign, Activity, MousePointer, Plus, Download,
    BarChart3, PieChart, Eye, Loader2, Zap, Crown, ArrowRight
} from 'lucide-react';
import { advertiserAPI } from '@/lib/api';
import { LineChart, BarChart, DonutChart, MultiLineChart } from '@/components/charts';
import DateRangePicker from '@/components/DateRangePicker';
import StatsCard from '@/components/StatsCard';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

export default function AdvertiserDashboard() {
    const router = useRouter();
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [campaignPerformance, setCampaignPerformance] = useState(null);
    const [roiAnalysis, setROIAnalysis] = useState(null);
    const [geoPerformance, setGeoPerformance] = useState(null);
    const [devicePerformance, setDevicePerformance] = useState(null);
    const [dateRange, setDateRange] = useState({ period: 30 });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        fetchAnalyticsData(dateRange);
    }, [dateRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await advertiserAPI.getDashboard();
            setStats(data);
            // Fetch analytics right after dashboard stats load
            await fetchAnalyticsData(dateRange);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalyticsData = async (range = dateRange) => {
        try {
            setAnalyticsLoading(true);
            const [performance, roi, geo, devices] = await Promise.allSettled([
                advertiserAPI.getCampaignPerformance(range),
                advertiserAPI.getROIAnalysis(),
                advertiserAPI.getGeographicPerformance(),
                advertiserAPI.getDevicePerformance()
            ]);

            if (performance.status === 'fulfilled') setCampaignPerformance(performance.value);
            else setCampaignPerformance({ cost: [], impressions: [], clicks: [], dates: [] });

            if (roi.status === 'fulfilled') setROIAnalysis(roi.value);
            else setROIAnalysis({ campaigns: [] });

            if (geo.status === 'fulfilled') setGeoPerformance(geo.value);
            else setGeoPerformance({ countries: [] });

            if (devices.status === 'fulfilled') setDevicePerformance(devices.value);
            else setDevicePerformance({ devices: [] });
        } catch (err) {
            console.error('Error fetching analytics:', err);
            // Set empty states so spinners stop
            setCampaignPerformance({ cost: [], impressions: [], clicks: [], dates: [] });
            setROIAnalysis({ campaigns: [] });
            setGeoPerformance({ countries: [] });
            setDevicePerformance({ devices: [] });
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleDateRangeChange = (range) => {
        setDateRange(range);
    };

    const exportData = () => {
        console.log('Export feature coming soon');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className={`w-12 h-12 ${d.loaderColor} animate-spin mx-auto mb-4`} />
                    <p className={d.loaderText}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${d.card} text-center`}>
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={fetchDashboardData} className={d.btnPrimary}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className={`${d.heading} mb-2`}>Campaign Overview</h1>
                    <p className={d.subheading}>Monitor your ad performance and optimize campaigns</p>
                </div>
                <div className="flex items-center gap-3">
                    <DateRangePicker onRangeChange={handleDateRangeChange} defaultRange={30} />
                    <button onClick={exportData} className={`${d.btnSecondary} flex items-center gap-2`}>
                        <Download className="w-5 h-5" />
                        <span className="text-sm font-medium">Export</span>
                    </button>
                    <button
                        onClick={() => router.push('/advertiser/campaigns/create')}
                        className={`${d.btnPrimary} flex items-center gap-2`}
                    >
                        <Plus className="w-5 h-5" />
                        <span className="text-sm">New Campaign</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    icon={DollarSign}
                    title="Total Spend"
                    value={`$${Number(stats?.spending?.total || 0).toFixed(2)}`}
                    change={stats?.spending?.change}
                    color="sky"
                />
                <StatsCard
                    icon={Eye}
                    title="Impressions"
                    value={(stats?.performance?.impressions || 0).toLocaleString()}
                    change={stats?.performance?.impressionsChange}
                    color="purple"
                />
                <StatsCard
                    icon={MousePointer}
                    title="Clicks"
                    value={(stats?.performance?.clicks || 0).toLocaleString()}
                    subtitle={`CTR: ${stats?.performance?.ctr || 0}%`}
                    color="orange"
                />
                <StatsCard
                    icon={Target}
                    title="Active Campaigns"
                    value={stats?.campaigns?.active || 0}
                    subtitle={`${stats?.campaigns?.total || 0} total`}
                    color="emerald"
                />
            </div>

            {/* Priority Status Widget */}
            {stats?.priority && (
                <div
                    className={`${d.card} cursor-pointer group hover:border-white/20 transition-all`}
                    onClick={() => router.push('/advertiser/priority')}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                stats.priority.tier === 'STARTER' ? 'bg-gray-500/10' :
                                stats.priority.tier === 'PRO' ? 'bg-blue-500/10' :
                                stats.priority.tier === 'ELITE' ? 'bg-amber-500/10' :
                                'bg-red-500/10'
                            }`}>
                                <Crown className={`w-6 h-6 ${
                                    stats.priority.tier === 'STARTER' ? 'text-gray-400' :
                                    stats.priority.tier === 'PRO' ? 'text-blue-400' :
                                    stats.priority.tier === 'ELITE' ? 'text-amber-400' :
                                    'text-red-400'
                                }`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-lg font-bold ${
                                        stats.priority.tier === 'STARTER' ? 'text-gray-400' :
                                        stats.priority.tier === 'PRO' ? 'text-blue-400' :
                                        stats.priority.tier === 'ELITE' ? 'text-amber-400' :
                                        'text-red-400'
                                    }`}>
                                        {stats.priority.tier} Tier
                                    </span>
                                    <span className="text-xs text-gray-500">• 30-day spend: ${Number(stats.priority.monthlySpend).toLocaleString()}</span>
                                </div>
                                {stats.priority.nextTier && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${
                                                    stats.priority.tier === 'STARTER' ? 'bg-gray-400' :
                                                    stats.priority.tier === 'PRO' ? 'bg-blue-400' :
                                                    stats.priority.tier === 'ELITE' ? 'bg-amber-400' :
                                                    'bg-red-400'
                                                }`}
                                                style={{ width: `${stats.priority.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">{stats.priority.progress}% to {stats.priority.nextTier}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-white transition-colors">
                            View Benefits
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={d.card}>
                    <h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Spend Trend</h3>
                    {campaignPerformance ? (
                        <LineChart
                            data={campaignPerformance.cost || []}
                            categories={campaignPerformance.dates || []}
                            title=""
                            color={d.chartColors.primary}
                            height={300}
                            prefix="$"
                        />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center">
                            <Loader2 className={`w-8 h-8 ${d.loaderColor} animate-spin`} />
                        </div>
                    )}
                </div>

                <div className={d.card}>
                    <h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Performance Metrics</h3>
                    {campaignPerformance ? (
                        <MultiLineChart
                            series={[
                                { name: 'Impressions', data: campaignPerformance.impressions || [] },
                                { name: 'Clicks', data: campaignPerformance.clicks || [] }
                            ]}
                            categories={campaignPerformance.dates || []}
                            title=""
                            colors={[d.chartColors.primary, d.chartColors.accent]}
                            height={300}
                        />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center">
                            <Loader2 className={`w-8 h-8 ${d.loaderColor} animate-spin`} />
                        </div>
                    )}
                </div>
            </div>

            {/* ROI Analysis & Device Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`${d.card} lg:col-span-2`}>
                    <h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Campaign ROI Analysis</h3>
                {/* ROI Analysis — show table or empty state, never infinite spinner */}
                {roiAnalysis && roiAnalysis.campaigns ? (
                    <div className="overflow-x-auto">
                        {roiAnalysis.campaigns.length === 0 ? (
                            <div className={`text-center py-12 ${d.subheading}`}>
                                <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No campaigns yet</p>
                                <p className="text-sm mt-1 opacity-60">Create your first campaign to see ROI data</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className={d.tableHead}>
                                        <th className={`text-left ${d.tableHeadCell}`}>Campaign</th>
                                        <th className={`text-right ${d.tableHeadCell}`}>Budget</th>
                                        <th className={`text-right ${d.tableHeadCell}`}>Spent</th>
                                        <th className={`text-right ${d.tableHeadCell}`}>Remaining</th>
                                        <th className={`text-right ${d.tableHeadCell}`}>Clicks</th>
                                        <th className={`text-right ${d.tableHeadCell}`}>CPC</th>
                                        <th className={`text-right ${d.tableHeadCell}`}>CTR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roiAnalysis.campaigns.map((campaign, index) => (
                                        <tr key={index} className={d.tableRow}>
                                            <td className={`${d.tableCell} truncate max-w-xs`} title={campaign.name}>
                                                {campaign.name}
                                            </td>
                                            <td className={`${d.tableCell} text-right`}>
                                                ${Number(campaign.budget || 0).toFixed(2)}
                                            </td>
                                            <td className={`${d.tableCellAccent} text-right`}>
                                                ${Number(campaign.spent || 0).toFixed(2)}
                                            </td>
                                            <td className={`${d.tableCell} text-right`}>
                                                ${Number(campaign.remaining || 0).toFixed(2)}
                                            </td>
                                            <td className={`${d.tableCell} text-right`}>
                                                {Number(campaign.clicks || 0).toLocaleString()}
                                            </td>
                                            <td className={`${d.tableCell} text-right`}>
                                                ${campaign.cpc}
                                            </td>
                                            <td className={`${d.tableCell} text-right`}>
                                                {campaign.ctr}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : analyticsLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className={`w-8 h-8 ${d.loaderColor} animate-spin`} />
                    </div>
                ) : (
                    <div className={`text-center py-12 ${d.subheading}`}>
                        <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Unable to load ROI data</p>
                    </div>
                )}
                </div>
                <div className={d.card}>
                    <h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Device Distribution</h3>
                    {devicePerformance && devicePerformance.devices ? (
                        devicePerformance.devices.length > 0 ? (
                            <DonutChart
                                data={devicePerformance.devices.map(dd => dd.impressions)}
                                labels={devicePerformance.devices.map(dd => dd.device)}
                                title=""
                                colors={[d.chartColors.primary, d.chartColors.secondary, d.chartColors.accent, '#facc15']}
                                height={300}
                            />
                        ) : (
                            <div className={`h-[300px] flex flex-col items-center justify-center gap-3 ${d.subheading}`}>
                                <PieChart className="w-10 h-10 opacity-30" />
                                <p className="font-medium">No impression data yet</p>
                                <p className="text-sm opacity-60">Data will appear once your campaigns run</p>
                            </div>
                        )
                    ) : analyticsLoading ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <Loader2 className={`w-8 h-8 ${d.loaderColor} animate-spin`} />
                        </div>
                    ) : (
                        <div className={`h-[300px] flex flex-col items-center justify-center gap-3 ${d.subheading}`}>
                            <PieChart className="w-10 h-10 opacity-30" />
                            <p className="font-medium">No data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Geographic Performance */}
            <div className={d.card}>
                <h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Top Countries by Impressions</h3>
                {geoPerformance && geoPerformance.countries ? (
                    geoPerformance.countries.length > 0 ? (
                        <BarChart
                            data={geoPerformance.countries.slice(0, 10).map(c => c.impressions)}
                            categories={geoPerformance.countries.slice(0, 10).map(c => c.country)}
                            title=""
                            color={d.chartColors.primary}
                            height={300}
                        />
                    ) : (
                        <div className={`h-[260px] flex flex-col items-center justify-center gap-3 ${d.subheading}`}>
                            <BarChart3 className="w-10 h-10 opacity-30" />
                            <p className="font-medium">No geographic data yet</p>
                            <p className="text-sm opacity-60">Country breakdown will appear once your campaigns receive impressions</p>
                        </div>
                    )
                ) : analyticsLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className={`w-8 h-8 ${d.loaderColor} animate-spin`} />
                    </div>
                ) : (
                    <div className={`h-[260px] flex flex-col items-center justify-center gap-3 ${d.subheading}`}>
                        <BarChart3 className="w-10 h-10 opacity-30" />
                        <p className="font-medium">No data available</p>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatSummaryCard d={d} icon={DollarSign} label="Avg CPC" value={`$${Number(stats?.averageCPC || 0).toFixed(2)}`} sub="Cost per click" />
                <StatSummaryCard d={d} icon={BarChart3} label="Avg CPM" value={`$${Number(stats?.averageCPM || 0).toFixed(2)}`} sub="Cost per mille" />
                <StatSummaryCard d={d} icon={Zap} label="Avg CTR" value={`${Number(stats?.averageCTR || 0).toFixed(2)}%`} sub="Click-through rate" />
            </div>
        </div>
    );
}

function StatSummaryCard({ d, icon: Icon, label, value, sub }) {
    const iconWrap = typeof d.statIcon === 'function' ? d.statIcon() : d.statIcon;
    const iconColor = typeof d.statIconColor === 'function' ? d.statIconColor() : d.statIconColor;
    return (
        <div className={`${d.card} ${d.cardHover}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={iconWrap}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                    <p className={d.statTitle}>{label}</p>
                    <p className={d.statValue}>{value}</p>
                </div>
            </div>
            <p className={`text-xs ${d.isDark ? 'text-gray-500' : 'text-gray-400'}`}>{sub}</p>
        </div>
    );
}
