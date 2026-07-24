'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import {
    Activity, Database, Cpu, HardDrive, AlertTriangle,
    Clock, Server, RefreshCw, Zap, Globe, Bell,
    Layers, CreditCard, Lock, CheckCircle2, XCircle
} from 'lucide-react';

const S = {
    page: {
        padding: '24px 28px',
        minHeight: '100vh',
        background: '#05050f',
        fontFamily: 'DM Sans, sans-serif',
        color: '#f1f5f9'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
    },
    h1: {
        fontSize: '22px',
        fontWeight: 800,
        color: '#f1f5f9',
        fontFamily: 'Geist Mono, monospace',
        marginBottom: '4px',
        letterSpacing: '-0.02em'
    },
    sub: {
        fontSize: '13px',
        color: '#64748b'
    },
    statusBanner: (isOk) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '30px',
        background: isOk ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
        border: `1px solid ${isOk ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
        color: isOk ? '#34d399' : '#fbbf24',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.05em'
    }),
    refreshBtn: {
        padding: '9px 14px',
        borderRadius: '9px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        color: '#f1f5f9',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.15s'
    },
    alertBox: {
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px'
    },
    grid3: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },
    grid2: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },
    card: {
        background: '#0a0a1a',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden'
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px'
    },
    iconWrap: (color = '#8b5cf6') => ({
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: color + '15',
        border: `1px solid ${color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
    }),
    badge: (type) => {
        let bg = 'rgba(16,185,129,0.12)';
        let color = '#34d399';
        let border = 'rgba(16,185,129,0.25)';
        if (type === 'OFFLINE' || type === 'DEGRADED') {
            bg = 'rgba(239,68,68,0.12)';
            color = '#f87171';
            border = 'rgba(239,68,68,0.25)';
        } else if (type === 'DISABLED' || type === 'NOT_CONFIGURED') {
            bg = 'rgba(148,163,184,0.1)';
            color = '#94a3b8';
            border = 'rgba(148,163,184,0.2)';
        } else if (type === 'CONFIGURED' || type === 'CONFIGURED_NO_API') {
            bg = 'rgba(56,189,248,0.12)';
            color = '#38bdf8';
            border = 'rgba(56,189,248,0.25)';
        }
        return {
            padding: '3px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.06em',
            background: bg,
            color: color,
            border: `1px solid ${border}`,
            textTransform: 'uppercase'
        };
    },
    cardTitle: {
        fontSize: '15px',
        fontWeight: 700,
        color: '#f1f5f9',
        marginBottom: '3px'
    },
    cardSub: {
        fontSize: '12px',
        color: '#64748b',
        marginBottom: '16px'
    },
    cardFooter: {
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    metricLabel: {
        fontSize: '11px',
        fontWeight: 700,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.06em'
    },
    metricVal: {
        fontSize: '14px',
        fontWeight: 700,
        fontFamily: 'Geist Mono, monospace',
        color: '#f1f5f9'
    },
    sectionTitle: {
        fontSize: '12px',
        fontWeight: 800,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    bar: {
        height: '6px',
        borderRadius: '3px',
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
        marginTop: '8px',
        marginBottom: '4px'
    },
    barFill: (pct, color = '#8b5cf6') => ({
        height: '100%',
        width: Math.min(pct, 100) + '%',
        background: color,
        borderRadius: '3px',
        transition: 'width 0.6s ease'
    }),
    codeBlock: {
        background: '#05050f',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '3px 8px',
        borderRadius: '5px',
        fontFamily: 'Geist Mono, monospace',
        fontSize: '11px',
        color: '#fbbf24'
    }
};

export default function SystemHealthPage() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHealth = async (isQuiet = false) => {
        try {
            if (!isQuiet) setLoading(true);
            setRefreshing(true);
            const data = await adminAPI.getSystemHealthStatus();
            setHealth(data);
        } catch (err) {
            console.error('Health fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(() => fetchHealth(true), 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <Activity size={36} color="#8b5cf6" style={{ animation: 'spin 2s linear infinite', marginBottom: '12px' }} />
                    <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Analyzing System Vitals...</div>
                </div>
            </div>
        );
    }

    const isHealthy = health?.status === 'HEALTHY';
    const redisOk = health?.components?.redis?.status === 'OPERATIONAL';

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={S.header}>
                <div>
                    <h1 style={S.h1}>System Health &amp; Service Monitor</h1>
                    <p style={S.sub}>Real-time monitoring of database, Redis, queues, rate limits, and server vitals</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={S.statusBanner(isHealthy)}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isHealthy ? '#34d399' : '#fbbf24', display: 'inline-block' }} />
                        <span>{isHealthy ? 'ALL SYSTEMS OPERATIONAL' : 'DEGRADED PERFORMANCE'}</span>
                    </div>
                    <button onClick={() => fetchHealth()} disabled={refreshing} style={S.refreshBtn}>
                        <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Redis Offline Warning Alert */}
            {!redisOk && (
                <div style={S.alertBox}>
                    <AlertTriangle size={22} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                            Redis 7 Queue Server Offline
                        </div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '8px' }}>
                            {health?.components?.redis?.message || 'Redis is currently unreachable. Database and Ad Serving are active, but Web Push Notifications queue is offline.'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            To start Redis in Dokploy: Go to Dokploy Compose Services → Start <span style={S.codeBlock}>mrpop_redis</span> container, or run <span style={S.codeBlock}>docker-compose up -d redis</span> in terminal.
                        </div>
                    </div>
                </div>
            )}

            {/* Component Cards Grid */}
            <div style={S.grid3}>
                {/* Database Card */}
                <div style={S.card}>
                    <div style={S.cardHeader}>
                        <div style={S.iconWrap('#10b981')}>
                            <Database size={20} />
                        </div>
                        <span style={S.badge(health?.components?.database?.status)}>
                            {health?.components?.database?.status}
                        </span>
                    </div>
                    <div style={S.cardTitle}>Database (MySQL 8.0)</div>
                    <div style={S.cardSub}>{health?.components?.database?.engine}</div>
                    <div style={S.cardFooter}>
                        <span style={S.metricLabel}>Query Latency</span>
                        <span style={{ ...S.metricVal, color: '#10b981' }}>{health?.components?.database?.latency}</span>
                    </div>
                </div>

                {/* Redis 7 Card */}
                <div style={{ ...S.card, borderColor: redisOk ? 'rgba(255,255,255,0.07)' : 'rgba(239,68,68,0.3)' }}>
                    <div style={S.cardHeader}>
                        <div style={S.iconWrap(redisOk ? '#38bdf8' : '#ef4444')}>
                            <Zap size={20} />
                        </div>
                        <span style={S.badge(health?.components?.redis?.status)}>
                            {redisOk ? 'RUNNING (ONLINE)' : 'OFFLINE'}
                        </span>
                    </div>
                    <div style={S.cardTitle}>Redis 7 (BullMQ Queue)</div>
                    <div style={S.cardSub}>{health?.components?.redis?.engine}</div>
                    <div style={S.cardFooter}>
                        <span style={S.metricLabel}>Ping Latency</span>
                        <span style={{ ...S.metricVal, color: redisOk ? '#38bdf8' : '#ef4444' }}>
                            {health?.components?.redis?.latency}
                        </span>
                    </div>
                </div>

                {/* API Server Card */}
                <div style={S.card}>
                    <div style={S.cardHeader}>
                        <div style={S.iconWrap('#8b5cf6')}>
                            <Globe size={20} />
                        </div>
                        <span style={S.badge(health?.components?.api?.status)}>
                            {health?.components?.api?.status}
                        </span>
                    </div>
                    <div style={S.cardTitle}>Express API Server</div>
                    <div style={S.cardSub}>Version {health?.components?.api?.version}</div>
                    <div style={S.cardFooter}>
                        <span style={S.metricLabel}>Response Time</span>
                        <span style={{ ...S.metricVal, color: '#c4b5fd' }}>{health?.components?.api?.latency}</span>
                    </div>
                </div>

                {/* Web Push VAPID Card */}
                <div style={S.card}>
                    <div style={S.cardHeader}>
                        <div style={S.iconWrap('#f59e0b')}>
                            <Bell size={20} />
                        </div>
                        <span style={S.badge(health?.components?.vapid?.status)}>
                            {health?.components?.vapid?.status}
                        </span>
                    </div>
                    <div style={S.cardTitle}>Web Push (VAPID Keys)</div>
                    <div style={S.cardSub}>{health?.components?.vapid?.subject}</div>
                    <div style={S.cardFooter}>
                        <span style={S.metricLabel}>VAPID Status</span>
                        <span style={S.metricVal}>
                            {health?.components?.vapid?.status === 'OPERATIONAL' ? 'Keys Loaded' : 'Missing'}
                        </span>
                    </div>
                </div>

                {/* Adsterra Backfill Card */}
                <div style={S.card}>
                    <div style={S.cardHeader}>
                        <div style={S.iconWrap('#06b981')}>
                            <Layers size={20} />
                        </div>
                        <span style={S.badge(health?.components?.adsterra?.status)}>
                            {health?.components?.adsterra?.status}
                        </span>
                    </div>
                    <div style={S.cardTitle}>Adsterra Backfill</div>
                    <div style={S.cardSub}>
                        {health?.components?.adsterra?.hasApiKey ? 'SmartLink + API Synced' : 'SmartLink Configured (No API)'}
                    </div>
                    <div style={S.cardFooter}>
                        <span style={S.metricLabel}>Fallback Mode</span>
                        <span style={{ ...S.metricVal, color: health?.components?.adsterra?.enabled ? '#34d399' : '#64748b' }}>
                            {health?.components?.adsterra?.enabled ? 'Active (%100 Fill)' : 'Disabled'}
                        </span>
                    </div>
                </div>

                {/* Configured Rate Limits Card */}
                <div style={S.card}>
                    <div style={S.cardHeader}>
                        <div style={S.iconWrap('#ec4899')}>
                            <Lock size={20} />
                        </div>
                        <span style={S.badge('CONFIGURED')}>DYNAMIC</span>
                    </div>
                    <div style={S.cardTitle}>Active Rate Limits</div>
                    <div style={S.cardSub}>Configurable in Admin → Settings</div>
                    <div style={{ paddingTop: '8px', fontSize: '11px', fontFamily: 'Geist Mono, monospace' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#64748b' }}>Auth / Admin:</span>
                            <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{health?.components?.rateLimits?.strict}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#64748b' }}>Panel API:</span>
                            <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{health?.components?.rateLimits?.api}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Ad Serving:</span>
                            <span style={{ color: '#34d399', fontWeight: 700 }}>{health?.components?.rateLimits?.adServer}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Gateways Row */}
            <div style={S.card}>
                <div style={S.sectionTitle}>
                    <CreditCard size={15} color="#8b5cf6" />
                    <span>Payment Gateway Integration Status</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                    <GatewayBox title="Dodo Payments (Cards / MoR)" status={health?.components?.payments?.dodo} />
                    <GatewayBox title="OxaPay (Crypto BTC/USDT)" status={health?.components?.payments?.oxapay} />
                    <GatewayBox title="Volet.com (Wallet / Fiat)" status={health?.components?.payments?.volet} />
                </div>
            </div>

            {/* Infrastructure Details */}
            <div style={S.grid2}>
                {/* CPU Card */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>
                        <Cpu size={15} color="#38bdf8" />
                        <span>Processor (CPU) Status</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: '#94a3b8' }}>Load Average (1m):</span>
                        <span style={{ fontFamily: 'Geist Mono, monospace', fontWeight: 700, color: '#f1f5f9' }}>
                            {health?.system?.cpu?.load} ({health?.system?.cpu?.cores} Cores)
                        </span>
                    </div>
                    <div style={S.bar}>
                        <div style={S.barFill(Number(health?.system?.cpu?.load || 0) * 20, '#38bdf8')} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>
                        {health?.system?.cpu?.model}
                    </div>
                </div>

                {/* RAM Card */}
                <div style={S.card}>
                    <div style={S.sectionTitle}>
                        <HardDrive size={15} color="#c4b5fd" />
                        <span>Memory (RAM) Usage</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: '#94a3b8' }}>
                            {health?.system?.memory?.used} / {health?.system?.memory?.total}
                        </span>
                        <span style={{ fontFamily: 'Geist Mono, monospace', fontWeight: 700, color: '#c4b5fd' }}>
                            {health?.system?.memory?.percent}
                        </span>
                    </div>
                    <div style={S.bar}>
                        <div style={S.barFill(parseFloat(health?.system?.memory?.percent || 0), '#8b5cf6')} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#475569', marginTop: '8px' }}>
                        <span>0 GB</span>
                        <span>{health?.system?.memory?.total}</span>
                    </div>
                </div>
            </div>

            {/* Server Environment Box */}
            <div style={S.card}>
                <div style={S.sectionTitle}>
                    <Server size={15} color="#34d399" />
                    <span>Server Environment &amp; Uptime</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Hostname</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{health?.system?.hostname}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Platform</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{health?.system?.platform}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Process Uptime</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#34d399', fontFamily: 'Geist Mono, monospace', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {health?.system?.uptime}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GatewayBox({ title, status }) {
    const active = status === 'ACTIVE';
    return (
        <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>{title}</span>
            <span style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                background: active ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.1)',
                color: active ? '#34d399' : '#64748b',
                border: `1px solid ${active ? 'rgba(16,185,129,0.25)' : 'rgba(148,163,184,0.2)'}`,
                textTransform: 'uppercase'
            }}>
                {status || 'DISABLED'}
            </span>
        </div>
    );
}
