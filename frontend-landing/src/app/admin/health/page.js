'use client';

import { useState, useEffect } from 'react';
import {
    Activity, Database, Cpu, HardDrive, CheckCircle2,
    AlertTriangle, Clock, Server, RefreshCw, BarChart3,
    ShieldCheck, Zap, Globe, Bell, Layers, CreditCard, Lock
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
    const isRedisOk = health?.components?.redis?.status === 'OPERATIONAL';

    return (
        <div className="space-y-6">
            {/* Header / Status Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={d.heading}>System Health & Service Monitor</h1>
                    <p className={d.subheading}>Real-time monitoring of database, Redis, services, and infrastructure</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isHealthy
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                        <div className={`w-2 h-2 rounded-full animate-ping ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-sm font-bold uppercase tracking-wider">
                            {isHealthy ? 'All Systems Operational' : 'Action / Attention Required'}
                        </span>
                    </div>
                    <button
                        onClick={() => fetchHealth()}
                        disabled={refreshing}
                        className={`${d.btnSecondary} p-2`}
                        title="Refresh Health Status"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Redis Alert Banner if Offline */}
            {!isRedisOk && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider">Redis Container Offline / Unreachable</h4>
                        <p className="text-xs text-amber-200/80 leading-relaxed">
                            {health?.components?.redis?.message || 'Redis container is down. Main API and Ad Serving are running, but Web Push Notifications queue is offline.'}
                        </p>
                        <p className="text-xs text-amber-400 font-mono mt-2">
                            To start Redis in Dokploy: Go to Dokploy Compose services → start <code className="bg-black/30 px-1 py-0.5 rounded">mrpop_redis</code> or run <code className="bg-black/30 px-1 py-0.5 rounded">docker-compose up -d redis</code>.
                        </p>
                    </div>
                </div>
            )}

            {/* Component Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Database Card */}
                <HealthCard
                    d={d}
                    icon={Database}
                    title="Database (MySQL)"
                    subtitle={health?.components?.database?.engine}
                    status={health?.components?.database?.status}
                    metric={health?.components?.database?.latency}
                    metricLabel="Query Latency"
                />

                {/* Redis Status Card */}
                <HealthCard
                    d={d}
                    icon={Zap}
                    title="Redis 7 (BullMQ Queue)"
                    subtitle={health?.components?.redis?.engine}
                    status={health?.components?.redis?.status}
                    metric={health?.components?.redis?.latency}
                    metricLabel="Ping Latency"
                    badgeColor={isRedisOk ? 'emerald' : 'rose'}
                    statusText={isRedisOk ? 'RUNNING (ONLINE)' : 'OFFLINE'}
                />

                {/* API Server Card */}
                <HealthCard
                    d={d}
                    icon={Globe}
                    title="API Server"
                    subtitle={`v${health?.components?.api?.version}`}
                    status={health?.components?.api?.status}
                    metric={health?.components?.api?.latency}
                    metricLabel="Response Time"
                />

                {/* Web Push VAPID Card */}
                <HealthCard
                    d={d}
                    icon={Bell}
                    title="Web Push (VAPID)"
                    subtitle={health?.components?.vapid?.subject}
                    status={health?.components?.vapid?.status}
                    metric={health?.components?.vapid?.status === 'OPERATIONAL' ? 'Keys Loaded' : 'Missing Keys'}
                    metricLabel="VAPID Keys"
                />

                {/* Adsterra Backfill Card */}
                <HealthCard
                    d={d}
                    icon={Layers}
                    title="Adsterra Backfill"
                    subtitle={health?.components?.adsterra?.hasApiKey ? 'SmartLink + API Synced' : 'SmartLink Only / No API Key'}
                    status={health?.components?.adsterra?.status}
                    metric={health?.components?.adsterra?.enabled ? 'Active' : 'Disabled'}
                    metricLabel="Fallback Mode"
                />

                {/* Active Rate Limits Card */}
                <div className={`${d.card} relative overflow-hidden`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-white/5">
                            <Lock className="w-6 h-6 text-sky-400" />
                        </div>
                        <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-sky-500/10 text-sky-400">
                            CONFIGURED
                        </div>
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">Active Rate Limits</h4>
                    <p className="text-xs text-gray-500 mb-4">Configurable in Admin Settings</p>
                    <div className="space-y-2 pt-2 border-t border-white/5 text-xs font-mono">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Auth & Admin:</span>
                            <span className="text-white font-bold">{health?.components?.rateLimits?.strict}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Panel API:</span>
                            <span className="text-white font-bold">{health?.components?.rateLimits?.api}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Ad Serving:</span>
                            <span className="text-emerald-400 font-bold">{health?.components?.rateLimits?.adServer}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Gateways Overview */}
            <div className={d.card}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-bold">Payment Gateway Integrations</h3>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GatewayStatusBox name="Dodo Payments (Cards / MoR)" status={health?.components?.payments?.dodo} />
                    <GatewayStatusBox name="OxaPay (Crypto BTC/USDT)" status={health?.components?.payments?.oxapay} />
                    <GatewayStatusBox name="Volet.com (Wallet / Fiat)" status={health?.components?.payments?.volet} />
                </div>
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
                    <h3 className="text-lg font-bold">Server Environment</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <InfoRow label="Hostname" value={health?.system?.hostname} />
                    <InfoRow label="Platform" value={health?.system?.platform} />
                    <InfoRow label="Process Uptime" value={health?.system?.uptime} icon={Clock} />
                </div>
            </div>
        </div>
    );
}

function HealthCard({ d, icon: Icon, title, subtitle, status, metric, metricLabel, badgeColor, statusText }) {
    const isOk = status === 'OPERATIONAL' || status === 'HEALTHY' || status === 'RUNNING';
    const isOffline = status === 'OFFLINE' || status === 'DEGRADED';

    let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    let iconClass = 'text-emerald-400';
    if (isOffline) {
        badgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        iconClass = 'text-rose-400';
    } else if (!isOk) {
        badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        iconClass = 'text-amber-400';
    }

    return (
        <div className={`${d.card} ${d.cardHover} relative overflow-hidden group`}>
            <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/5">
                    <Icon className={`w-6 h-6 ${iconClass}`} />
                </div>
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                    {statusText || status}
                </div>
            </div>

            <h4 className="text-base font-bold text-white mb-1">{title}</h4>
            <p className="text-xs text-gray-500 mb-6 truncate">{subtitle}</p>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{metricLabel}</span>
                <span className="text-sm font-mono font-bold text-white">{metric}</span>
            </div>
        </div>
    );
}

function GatewayStatusBox({ name, status }) {
    const isActive = status === 'ACTIVE';
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-200">{name}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                }`}>
                {status || 'DISABLED'}
            </span>
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

