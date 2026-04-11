'use client';

const EMPTY_ICONS = {
    users: '👥',
    campaigns: '📢',
    sites: '🌐',
    payments: '💳',
    tickets: '🎫',
    search: '🔍',
    data: '📊',
    default: '📋',
};

export default function EmptyState({ icon = 'default', title = 'No results found', message = 'There is nothing here yet.', action }) {
    const emoji = typeof icon === 'string' ? (EMPTY_ICONS[icon] || EMPTY_ICONS.default) : icon;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '60px 24px', textAlign: 'center', fontFamily: 'DM Sans, sans-serif',
        }}>
            <div style={{
                fontSize: '48px', marginBottom: '20px',
                filter: 'grayscale(0.3)',
                animation: 'emptyFloat 3s ease-in-out infinite',
            }}>
                {emoji}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>{title}</div>
            <div style={{ fontSize: '14px', color: '#64748b', maxWidth: '300px', lineHeight: 1.6 }}>{message}</div>
            {action && (
                <button
                    onClick={action.onClick}
                    style={{
                        marginTop: '24px', padding: '10px 20px', borderRadius: '8px',
                        background: '#8b5cf6', border: 'none', color: '#fff',
                        fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                >
                    {action.label}
                </button>
            )}
            <style>{`@keyframes emptyFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
        </div>
    );
}
