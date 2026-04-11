'use client';
import { useState, useEffect } from 'react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', dangerText, cancelText = 'Cancel', variant = 'danger', loading = false }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const variantColors = {
        danger: { btn: '#ef4444', hover: '#dc2626', label: confirmText },
        warning: { btn: '#f59e0b', hover: '#d97706', label: confirmText },
        success: { btn: '#10b981', hover: '#059669', label: confirmText },
    };
    const v = variantColors[variant] || variantColors.danger;

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{
                position: 'fixed', inset: 0, zIndex: 99998,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.2s',
            }}
        >
            <div style={{
                background: '#0f0f24',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '28px',
                width: '100%', maxWidth: '420px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
                transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                fontFamily: 'DM Sans, sans-serif',
            }}>
                {/* Icon */}
                <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: variant === 'danger' ? 'rgba(239,68,68,0.15)' : variant === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px',
                }}>
                    {variant === 'danger' ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={v.btn} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={v.btn} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    )}
                </div>

                <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>{title}</h3>
                <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>{message}</p>

                {dangerText && (
                    <div style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '8px', padding: '10px 12px', marginBottom: '20px',
                        fontSize: '13px', color: '#fca5a5',
                    }}>⚠️ {dangerText}</div>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            padding: '10px 20px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.2s',
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => { if (!loading) onConfirm(); }}
                        disabled={loading}
                        style={{
                            padding: '10px 20px', borderRadius: '8px',
                            background: v.btn, border: 'none',
                            color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                            fontFamily: 'inherit', opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
                        }}
                    >
                        {loading ? 'Processing...' : v.label}
                    </button>
                </div>
            </div>
        </div>
    );
}
