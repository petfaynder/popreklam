'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    TrendingUp, DollarSign, Globe, Eye, MousePointerClick, Plus, Download,
    BarChart3, PieChart, ArrowUpRight, Loader2, Sparkles, ArrowRight,
    Smartphone, Zap, TrendingDown, Layers, ChevronLeft, ChevronRight
} from 'lucide-react';
import { publisherAPI } from '@/lib/api';
import { LineChart, BarChart, DonutChart, MultiLineChart } from '@/components/charts';
import DateRangePicker from '@/components/DateRangePicker';
import StatsCard from '@/components/StatsCard';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

export default function PublisherDashboard() {
    const router = useRouter();
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [revenueTrends, setRevenueTrends] = useState(null);
    const [topPages, setTopPages] = useState(null);
    const [geoStats, setGeoStats] = useState(null);
    const [deviceStats, setDeviceStats] = useState(null);
    const [dateRange, setDateRange] = useState({ period: 30 });
    const [recommendations, setRecommendations] = useState([]);
    const [recIndex, setRecIndex] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        fetchAnalyticsData();
    }, [dateRange]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const data = await publisherAPI.getDashboard();
            setStats(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching dashboard:', err);
        } finally {
            setLoading(false);
        }
        // Also fetch analytics in parallel with initial load
        fetchAnalyticsData();
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await publisherAPI.getDashboard();
            setStats(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalyticsData = async () => {
        try {
            const results = await Promise.allSettled([
                publisherAPI.getRevenueTrends(dateRange),
                publisherAPI.getTopPages(10),
                publisherAPI.getGeographicStats(),
                publisherAPI.getDeviceBreakdown(),
                publisherAPI.getYieldRecommendations()
            ]);

            const [trendsResult, pagesResult, geoResult, devicesResult, recsResult] = results;
            const trends = trendsResult.status === 'fulfilled' ? trendsResult.value : null;
            const pages = pagesResult.status === 'fulfilled' ? pagesResult.value : null;
            const geo = geoResult.status === 'fulfilled' ? geoResult.value : null;
            const devices = devicesResult.status === 'fulfilled' ? devicesResult.value : null;
            const recs = recsResult.status === 'fulfilled' ? recsResult.value : null;

            results.forEach((r, i) => {
                if (r.status === 'rejected') {
                    console.error(`Analytics fetch[${i}] failed:`, r.reason);
                }
            });

            // Backend returns a flat array: [{ date, revenue, impressions, clicks }]
            // Transform to the shape the charts expect
            if (Array.isArray(trends)) {
                setRevenueTrends({
                    dates: trends.map(t => t.date),
                    revenue: trends.map(t => t.revenue),
                    impressions: trends.map(t => t.impressions),
                    clicks: trends.map(t => t.clicks),
                });
            } else {
                setRevenueTrends(trends);
            }

            // Backend returns: [{ page, views, earnings }]
            if (Array.isArray(pages)) {
                setTopPages({
                    pages: pages.map(p => ({
                        url: p.page,
                        revenue: p.earnings,
                        impressions: p.views,
                        clicks: 0,
                        ctr: '0.00',
                    }))
                });
            } else {
                setTopPages(pages);
            }

            // Backend returns: [{ name, value }] where name=country
            if (Array.isArray(geo)) {
                setGeoStats({
                    countries: geo.map(g => ({ country: g.name, revenue: g.value, impressions: g.value }))
                });
            } else {
                setGeoStats(geo);
            }

            // Backend returns: [{ name, value }] where name=device
            if (Array.isArray(devices)) {
                setDeviceStats({
                    devices: devices.map(d => ({ device: d.name, impressions: d.value }))
                });
            } else {
                setDeviceStats(devices);
            }

            setRecommendations(recs || []);
        } catch (err) {
            console.error('Error fetching analytics:', err);
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
                    <h1 className={`${d.heading} mb-2`}>Publisher Dashboard</h1>
                    <p className={d.subheading}>Monitor your ad revenue and performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <DateRangePicker onRangeChange={handleDateRangeChange} defaultRange={30} />
                    <button onClick={exportData} className={`${d.btnSecondary} flex items-center gap-2`}>
                        <Download className="w-5 h-5" />
                        <span className="text-sm font-medium">Export</span>
                    </button>
                    <button
                        onClick={() => router.push('/publisher/sites/add')}
                        className={`${d.btnPrimary} flex items-center gap-2`}
                    >
                        <Plus className="w-5 h-5" />
                        <span className="text-sm">Add Site</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    icon={DollarSign}
                    title="Today's Revenue"
                    value={`$${Number(stats?.today?.revenue || 0).toFixed(2)}`}
                    change={stats?.today?.revenueChange}
                    color="lime"
                />
                <StatsCard
                    icon={Eye}
                    title="Impressions"
                    value={(stats?.today?.impressions || 0).toLocaleString()}
                    change={stats?.today?.impressionsChange}
                    color="sky"
                />
                <StatsCard
                    icon={MousePointerClick}
                    title="Clicks"
                    value={(stats?.today?.clicks || 0).toLocaleString()}
                    subtitle={`CTR: ${stats?.today?.ctr || 0}%`}
                    color="purple"
                />
                <StatsCard
                    icon={Globe}
                    title="Active Sites"
                    value={stats?.sites?.active || 0}
                    subtitle={`${stats?.sites?.total || 0} total`}
                    color="emerald"
                />
            </div>

            {/* Yield Optimization Recommendations */}
            {recommendations.length > 0 && (
                <div className="relative overflow-hidden">
                    <div className={`${d.card} border-l-4 border-l-lime-500 relative overflow-hidden group`}>
                        {/* Background Decoration */}
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-lime-500/5 rounded-full blur-3xl group-hover:bg-lime-500/10 transition-all duration-700" />

                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-lime-500/20">
                                {(() => {
                                    const Icon = {
                                        smartphone: Smartphone,
                                        globe: Globe,
                                        layers: Layers,
                                        'trending-down': TrendingDown
                                    }[recommendations[recIndex].icon] || Sparkles;
                                    return <Icon className="w-8 h-8 text-slate-900" />;
                                })()}
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-lime-500/10 text-lime-500 px-2 py-0.5 rounded-full">
                                        Optimization Opportunity
                                    </span>
                                    {recommendations[recIndex].severity === 'high' && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Zap className="w-3 h-3" /> High Impact
                                        </span>
                                    )}
                                </div>
                                <h2 className={`text-xl font-bold mb-2 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>
                                    {recommendations[recIndex].title}
                                </h2>
                                <p className={`text-sm leading-relaxed ${d.subheading} max-w-2xl`}>
                                    {recommendations[recIndex].description.split('**').map((part, i) =>
                                        i % 2 === 1 ? <strong key={i} className={d.isDark ? 'text-lime-400' : 'text-emerald-600'}>{part}</strong> : part
                                    )}
                                </p>
                            </div>

                            <div className="flex flex-col items-center md:items-end gap-4">
                                <button
                                    onClick={() => router.push(recommendations[recIndex].actionLink)}
                                    className={`${d.btnPrimary} whitespace-nowrap px-6 py-3 flex items-center gap-2 group-hover:scale-105 transition-transform`}
                                >
                                    {recommendations[recIndex].actionLabel}
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                {recommendations.length > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setRecIndex(p => (p - 1 + recommendations.length) % recommendations.length)}
                                            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors border border-white/10"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs font-mono text-gray-500">
                                            {recIndex + 1} / {recommendations.length}
                                        </span>
                                        <button
                                            onClick={() => setRecIndex(p => (p + 1) % recommendations.length)}
                                            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors border border-white/10"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Revenue & Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={d.card}>
                    <h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Revenue Trend</h3>
                    {revenueTrends ? (
                        <LineChart
                            data={revenueTrends.revenue || []}
                            categories={revenueTrends.dates || []}
                            title=""
                            color={d.chartColors.primary}
                            height={260}
                            prefix="$"
                        />
                    ) : (
                        <div className="h-[260px] flex items-center justify-center">
                            <Loader2 className={`w-8 h-8 ${d.loaderColor} animate-spin`} />
                        </div>
                    )}
                </div>

                <div className={d.card}>
                    <h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Performance Overview</h3>
                    {revenueTrends ? (
                        <MultiLineChart
                            series={[
                                { name: 'Impressions', data: revenueTrends.impressions || [] },
                                { name: 'Clicks', data: revenueTrends.clicks || [] }
                            ]}
                            categories={revenueTrends.dates || []}
                            title=""
                            colors={[d.chartColors.primary, d.chartColors.secondary]}
                            height={260}
                        />
                    ) : (
                        <div className="h-[260px] flex items-center justify-center">
                            <Loader2 className={`w-8 h-8 ${d.loaderColor} animate-spin`} />
                        </div>
                    )}
                </div>
            </div>

            {/* Top Pages & Device Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Pages Table */}
                <div className={`${d.card} lg:col-span-2`}>
                    <h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Top Performing Pages</h3>
                    {topPages && topPages.pages ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={d.tableHead}>
                                        <th className={`text-left ${d.tableHeadCell}`}>Page URL</th>
                                        <th className={`text-right ${d.tableHeadCell}`}>Revenue</th>
                                        <th className={`text-right ${d.tableHeadCell}`}>Impressions</th>
                                        <th className={`text-right ${d.tableHeadCell}`}>Clicks</th>
                                        <th className={`text-right ${d.tableHeadCell}`}>CTR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topPages.pages.map((page, index) => (
                                        <tr key={index} className={d.tableRow}>
                                            <td className={`${d.tableCell} truncate max-w-xs`} title={page.url}>
                                                {page.url}
                                            </td>
                                            <td className={`${d.tableCellAccent} text-right`}>
                                                ${Number(page.revenue || 0).toFixed(2)}
                                            </td>
                                            <td className={`${d.tableCell} text-right`}>
                                                {page.impressions.toLocaleString()}
                                            </td>
                                            <td className={`${d.tableCell} text-right`}>
                                                {page.clicks.toLocaleString()}
                                            </td>
                                            <td className={`${d.tableCell} text-right`}>
                                                {page.ctr}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {topPages.pages.length === 0 && (
                                <div className={`text-center py-8 ${d.subheading}`}>
                                    No data available yet
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center">
                            <Loader2 className={`w-8 h-8 ${d.loaderColor} animate-spin`} />
                        </div>
                    )}
                </div>

                {/* Device Breakdown */}
                <div className={d.card}>
                    <h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Device Breakdown</h3>
                    {deviceStats ? (
                        deviceStats.devices && deviceStats.devices.length > 0 ? (
                            <DonutChart
                                data={deviceStats.devices.map(dd => dd.impressions)}
                                labels={deviceStats.devices.map(dd => dd.device)}
                                title=""
                                colors={[d.chartColors.primary, d.chartColors.secondary, d.chartColors.accent, '#facc15']}
                                height={260}
                            />
                        ) : (
                            <div className="h-[260px] flex flex-col items-center justify-center gap-3">
                                <Smartphone className={`w-10 h-10 ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                <p className={`text-sm ${d.isDark ? 'text-gray-500' : 'text-gray-400'}`}>No device data yet</p>
                                <p className={`text-xs ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`}>Data appears once impressions are recorded</p>
                            </div>
                        )
                    ) : (
                        <div className="h-[260px] flex items-center justify-center">
                            <Loader2 className={`w-8 h-8 ${d.loaderColor} animate-spin`} />
                        </div>
                    )}
                </div>
            </div>

            {/* Geographic Performance */}
            <div className={d.card}>
                <h3 className={`text-lg font-bold mb-4 ${d.isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Top Countries by Revenue</h3>
                {geoStats ? (
                    geoStats.countries && geoStats.countries.length > 0 ? (
                        <BarChart
                            data={geoStats.countries.slice(0, 10).map(c => Number(c.revenue || 0))}
                            categories={geoStats.countries.slice(0, 10).map(c => c.country)}
                            title=""
                            color={d.chartColors.primary}
                            height={300}
                            prefix="$"
                        />
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center gap-3">
                            <Globe className={`w-10 h-10 ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={`text-sm ${d.isDark ? 'text-gray-500' : 'text-gray-400'}`}>No geographic data yet</p>
                            <p className={`text-xs ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`}>Data appears once impressions are recorded</p>
                        </div>
                    )
                ) : (
                    <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className={`w-8 h-8 ${d.loaderColor} animate-spin`} />
                    </div>
                )}
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatSummaryCard
                    d={d}
                    icon={DollarSign}
                    label="Total Earnings"
                    value={`$${Number(stats?.earnings?.total || 0).toFixed(2)}`}
                    sub="All-time revenue"
                />
                <StatSummaryCard
                    d={d}
                    icon={BarChart3}
                    label="Avg eCPM"
                    value={`$${Number(stats?.averageECPM || 0).toFixed(2)}`}
                    sub="Effective cost per mille"
                />
                <StatSummaryCard
                    d={d}
                    icon={PieChart}
                    label="Avg CTR"
                    value={`${Number(stats?.averageCTR || 0).toFixed(2)}%`}
                    sub="Click-through rate"
                />
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
