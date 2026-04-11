'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Reusable Line Chart Component
 * Used for: Revenue trends, impression trends, click trends
 */
export function LineChart({
    data,
    categories,
    title,
    color = '#a3ff33',
    height = 300,
    prefix = '',
    suffix = ''
}) {
    const options = useMemo(() => ({
        chart: {
            type: 'line',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false
                }
            },
            background: 'transparent',
            foreColor: '#9ca3af'
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        dataLabels: {
            enabled: false
        },
        colors: [color],
        grid: {
            borderColor: '#334155',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px'
                },
                formatter: function (value) {
                    return prefix + (value || 0).toFixed(2) + suffix;
                }
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (value) {
                    return prefix + (value || 0).toFixed(2) + suffix;
                }
            }
        },
        markers: {
            size: 0,
            hover: {
                size: 6
            }
        }
    }), [categories, color, prefix, suffix]);

    const series = useMemo(() => [{
        name: title,
        data: data
    }], [data, title]);

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <Chart
                options={options}
                series={series}
                type="line"
                height={height}
            />
        </div>
    );
}

/**
 * Multi-Line Chart Component
 * Used for: Comparing multiple metrics
 */
export function MultiLineChart({
    series,
    categories,
    title,
    colors = ['#a3ff33', '#38bdf8', '#f472b6'],
    height = 300,
    prefix = '',
    suffix = ''
}) {
    const options = useMemo(() => ({
        chart: {
            type: 'line',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false
                }
            },
            background: 'transparent',
            foreColor: '#9ca3af'
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        dataLabels: {
            enabled: false
        },
        colors: colors,
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'right',
            labels: {
                colors: '#9ca3af'
            }
        },
        grid: {
            borderColor: '#334155',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px'
                },
                formatter: function (value) {
                    return prefix + (value || 0).toFixed(2) + suffix;
                }
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (value) {
                    return prefix + (value || 0).toFixed(2) + suffix;
                }
            }
        },
        markers: {
            size: 0,
            hover: {
                size: 6
            }
        }
    }), [categories, colors, prefix, suffix]);

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <Chart
                options={options}
                series={series}
                type="line"
                height={height}
            />
        </div>
    );
}

/**
 * Donut Chart Component
 * Used for: Device breakdown, OS breakdown, browser breakdown
 */
export function DonutChart({
    data,
    labels,
    title,
    colors = ['#a3ff33', '#38bdf8', '#f472b6', '#facc15', '#fb923c'],
    height = 300
}) {
    const options = useMemo(() => ({
        chart: {
            type: 'donut',
            background: 'transparent',
            foreColor: '#9ca3af'
        },
        labels: labels,
        colors: colors,
        legend: {
            show: true,
            position: 'bottom',
            labels: {
                colors: '#9ca3af'
            }
        },
        dataLabels: {
            enabled: false
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            color: '#9ca3af'
                        },
                        value: {
                            show: true,
                            color: '#ffffff',
                            fontSize: '24px',
                            fontWeight: 'bold'
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            color: '#9ca3af',
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString();
                            }
                        }
                    }
                }
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (value) {
                    return value.toLocaleString();
                }
            }
        }
    }), [labels, colors]);

    const series = useMemo(() => data, [data]);

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <Chart
                options={options}
                series={series}
                type="donut"
                height={height}
            />
        </div>
    );
}

/**
 * Bar Chart Component
 * Used for: Top pages, top campaigns, geographic breakdown
 */
export function BarChart({
    data,
    categories,
    title,
    color = '#a3ff33',
    height = 300,
    horizontal = false,
    prefix = '',
    suffix = ''
}) {
    const options = useMemo(() => ({
        chart: {
            type: 'bar',
            toolbar: {
                show: false
            },
            background: 'transparent',
            foreColor: '#9ca3af'
        },
        plotOptions: {
            bar: {
                horizontal: horizontal,
                borderRadius: 6,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: [color],
        grid: {
            borderColor: '#334155',
            strokeDashArray: 4
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px'
                },
                formatter: function (value) {
                    return prefix + (value || 0).toFixed(2) + suffix;
                }
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (value) {
                    return prefix + (value || 0).toFixed(2) + suffix;
                }
            }
        }
    }), [categories, color, horizontal, prefix, suffix]);

    const series = useMemo(() => [{
        name: title,
        data: data
    }], [data, title]);

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <Chart
                options={options}
                series={series}
                type="bar"
                height={height}
            />
        </div>
    );
}

/**
 * Area Chart Component
 * Used for: Cumulative metrics
 */
export function AreaChart({
    data,
    categories,
    title,
    color = '#a3ff33',
    height = 300,
    prefix = '',
    suffix = ''
}) {
    const options = useMemo(() => ({
        chart: {
            type: 'area',
            toolbar: {
                show: false
            },
            background: 'transparent',
            foreColor: '#9ca3af'
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: [color],
        grid: {
            borderColor: '#334155',
            strokeDashArray: 4
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px'
                },
                formatter: function (value) {
                    return prefix + (value || 0).toFixed(2) + suffix;
                }
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (value) {
                    return prefix + (value || 0).toFixed(2) + suffix;
                }
            }
        }
    }), [categories, color, prefix, suffix]);

    const series = useMemo(() => [{
        name: title,
        data: data
    }], [data, title]);

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <Chart
                options={options}
                series={series}
                type="area"
                height={height}
            />
        </div>
    );
}
