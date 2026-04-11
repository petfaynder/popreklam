'use client';

const BADGE_STYLES = {
    // Status
    ACTIVE: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#34d399', dot: '#10b981' },
    PENDING: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24', dot: '#f59e0b' },
    PENDING_APPROVAL: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24', dot: '#f59e0b' },
    SUSPENDED: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#f87171', dot: '#ef4444' },
    BANNED: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#ef4444', dot: '#dc2626' },
    REJECTED: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#f87171', dot: '#ef4444' },
    PAUSED: { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)', color: '#94a3b8', dot: '#64748b' },
    COMPLETED: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#34d399', dot: '#10b981' },
    // Ticket status
    OPEN: { bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.3)', color: '#38bdf8', dot: '#0ea5e9' },
    IN_PROGRESS: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)', color: '#a78bfa', dot: '#8b5cf6' },
    RESOLVED: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#34d399', dot: '#10b981' },
    CLOSED: { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', color: '#94a3b8', dot: '#64748b' },
    // Priority
    LOW: { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)', color: '#94a3b8', dot: '#64748b' },
    MEDIUM: { bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.25)', color: '#38bdf8', dot: '#0ea5e9' },
    HIGH: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#fbbf24', dot: '#f59e0b' },
    URGENT: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', color: '#f87171', dot: '#ef4444' },
    // Roles
    PUBLISHER: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', color: '#a78bfa', dot: '#8b5cf6' },
    ADVERTISER: { bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.25)', color: '#38bdf8', dot: '#0ea5e9' },
    ADMIN: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#fbbf24', dot: '#f59e0b' },
    // Payment
    WITHDRAWAL: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: '#f87171', dot: '#ef4444' },
    DEPOSIT: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', color: '#34d399', dot: '#10b981' },
    // Ad formats
    POPUNDER: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', color: '#a78bfa' },
    POPUP: { bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.25)', color: '#38bdf8' },
    NATIVE: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#34d399' },
    IN_PAGE_PUSH: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#fbbf24' },
    BANNER: { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)', color: '#94a3b8' },
    DIRECT_LINK: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', color: '#f87171' },
};

const LABEL_MAP = {
    PENDING_APPROVAL: 'Pending', IN_PROGRESS: 'In Progress', IN_PAGE_PUSH: 'In-Page Push', DIRECT_LINK: 'Direct Link',
};

export default function Badge({ value, dot = true, size = 'sm' }) {
    const style = BADGE_STYLES[value] || { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)', color: '#94a3b8', dot: '#64748b' };
    const label = LABEL_MAP[value] || (value ? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ') : '—');
    const fontSize = size === 'xs' ? '11px' : size === 'lg' ? '13px' : '12px';
    const padding = size === 'xs' ? '2px 7px' : size === 'lg' ? '5px 12px' : '3px 9px';

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: style.bg, border: `1px solid ${style.border}`,
            color: style.color, borderRadius: '20px',
            fontSize, fontWeight: 600, padding, whiteSpace: 'nowrap',
            fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.01em',
        }}>
            {dot && style.dot && (
                <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: style.dot, display: 'inline-block', flexShrink: 0,
                }} />
            )}
            {label}
        </span>
    );
}
