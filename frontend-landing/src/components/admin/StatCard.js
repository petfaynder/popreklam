'use client';

export default function StatCard({ label, value, delta, deltaLabel, icon, color = '#8b5cf6', prefix = '', suffix = '', loading = false }) {
    const isPositiveDelta = delta !== undefined && delta !== null && delta >= 0;
    const deltaAbs = delta !== undefined && delta !== null ? Math.abs(delta) : null;

    return (
        <div style={{
            background: '#0a0a1a',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '22px 24px',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'default',
            transition: 'border-color 0.2s, transform 0.2s',
            fontFamily: 'DM Sans, sans-serif',
        }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${color}40`;
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Background accent */}
            <div style={{
                position: 'absolute', top: '-40px', right: '-30px',
                width: '120px', height: '120px', borderRadius: '50%',
                background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: `${color}18`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px',
                }}>
                    {icon}
                </div>
                {deltaAbs !== null && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '12px', fontWeight: 600,
                        color: isPositiveDelta ? '#10b981' : '#ef4444',
                        background: isPositiveDelta ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        padding: '4px 8px', borderRadius: '20px',
                    }}>
                        {isPositiveDelta ? '▲' : '▼'} {deltaAbs.toFixed(1)}%
                    </div>
                )}
            </div>

            {loading ? (
                <div style={{ height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px' }} />
            ) : (
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px', fontFamily: 'Geist Mono, monospace', lineHeight: 1.1 }}>
                    {prefix}{value !== undefined && value !== null ? Number(value).toLocaleString() : '—'}{suffix}
                </div>
            )}

            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                {label}
                {deltaLabel && <span style={{ color: '#475569', marginLeft: '6px' }}>{deltaLabel}</span>}
            </div>
        </div>
    );
}
