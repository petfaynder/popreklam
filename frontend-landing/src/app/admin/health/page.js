'use client';

import { useState, useEffect } from 'react';
import {
    Activity, Database, Cpu, HardDrive, CheckCircle2,
    AlertCircle, Clock, Server, RefreshCw, BarChart3,
    ShieldCheck, Zap, Globe
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

export default function SystemHealthPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const [loading, setLoading] = useState(true);
    const [health, setHealth] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchHealth = async (isQuiet = false) => {
        try {
            if (!isQuiet) setLoading(true);
            setRefreshing(true);
            const data = await adminAPI.getSystemHealthStatus();
            setHealth(data);
            setError(null);
        } catch (err) {
            console.error('Health fetch error:', err);
            setError('Failed to connect to health monitor');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(() => fetchHealth(true), 15000); // Auto refresh every 15s
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <Activity className={`w-12 h-12 ${d.loaderColor} animate-pulse`} />
                    <p className={d.loaderText}>Initializing System Monitor...</p>
                </div>
            </div>
        );
    }

    const isHealthy = health?.status === 'HEALTHY';

    return (
        <div className="space-y-6">
            {/* Header / Status Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={d.heading}>System Health</h1>
                    <p className={d.subheading}>Real-time monitoring of platform vitals</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isHealthy
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                        <div className={`w-2 h-2 rounded-full animate-ping ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-sm font-bold uppercase tracking-wider">
                            {isHealthy ? 'All Systems Operational' : 'Degraded Performance'}
                        </span>
                    </div>
                    <button
                        onClick={() => fetchHealth()}
                        disabled={refreshing}
                        className={`${d.btnSecondary} p-2`}
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Component Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Database Card */}
                <HealthCard
                    d={d}
                    icon={Database}
                    title="Database"
                    subtitle={health?.components?.database?.engine}
                    status={health?.components?.database?.status}
                    metric={health?.components?.database?.latency}
                    metricLabel="Latency"
                />

                {/* API Card */}
                <HealthCard
                    d={d}
                    icon={Globe}
                    title="API Server"
                    subtitle={`v${health?.components?.api?.version}`}
                    status={health?.components?.api?.status}
                    metric={health?.components?.api?.latency}
                    metricLabel="Response Time"
                />

                {/* Cache Card */}
                <HealthCard
                    d={d}
                    icon={Zap}
                    title="Memory Cache"
                    subtitle={health?.components?.cache?.engine}
                    status={health?.components?.cache?.status}
                    metric="99.2%"
                    metricLabel="Hit Rate"
                />
            </div>

            {/* Infrastructure / Resource Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={d.card}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Cpu className="w-5 h-5 text-sky-400" />
                            <h3 className="text-lg font-bold">Processor (CPU)</h3>
                        </div>
                        <span className="text-xs font-mono text-gray-500">{health?.system?.cpu?.cores} Cores</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Load Average (1m)</span>
                            <span className="text-sm font-mono font-bold text-white">{health?.system?.cpu?.load}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-sky-500 transition-all duration-1000"
                                style={{ width: `${Math.min(Number(health?.system?.cpu?.load) * 20, 100)}%` }}
                            // Assuming load of cores-count is 100%, here we just visualize.
                            />
                        </div>
                        <p className="text-xs text-gray-500">{health?.system?.cpu?.model}</p>
                    </div>
                </div>

                <div className={d.card}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <HardDrive className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-bold">Memory (RAM)</h3>
                        </div>
                        <span className="text-xs font-mono text-gray-500">{health?.system?.memory?.percent} Used</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">{health?.system?.memory?.used} / {health?.system?.memory?.total}</span>
                            <span className="text-sm font-mono font-bold text-white">{health?.system?.memory?.percent}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 transition-all duration-1000"
                                style={{ width: health?.system?.memory?.percent }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                            <span>0 GB</span>
                            <span>{health?.system?.memory?.total}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Info Table */}
            <div className={d.card}>
                <div className="flex items-center gap-3 mb-6">
                    <Server className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold">Infrastructure Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <InfoRow label="Hostname" value={health?.system?.hostname} />
                    <InfoRow label="Platform" value={health?.system?.platform} />
                    <InfoRow label="Uptime" value={health?.system?.uptime} icon={Clock} />
                </div>
            </div>
        </div>
    );
}

function HealthCard({ d, icon: Icon, title, subtitle, status, metric, metricLabel }) {
    const isOk = status === 'OPERATIONAL' || status === 'HEALTHY';
    return (
        <div className={`${d.card} ${d.cardHover} relative overflow-hidden group`}>
            {/* Glow effect on hover */}
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity ${isOk ? 'bg-emerald-500' : 'bg-amber-500'}`} />

            <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/5">
                    <Icon className={`w-6 h-6 ${isOk ? 'text-emerald-400' : 'text-amber-400'}`} />
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${isOk ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                    {status}
                </div>
            </div>

            <h4 className="text-base font-bold text-white mb-1">{title}</h4>
            <p className="text-xs text-gray-500 mb-6">{subtitle}</p>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{metricLabel}</span>
                <span className="text-sm font-mono font-bold text-white">{metric}</span>
            </div>
        </div>
    );
}

function InfoRow({ label, value, icon: Icon }) {
    return (
        <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block">{label}</span>
            <div className="flex items-center gap-2">
                {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
                <span className="text-sm font-medium text-white">{value}</span>
            </div>
        </div>
    );
}
