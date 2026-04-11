'use client';
import { useEffect, useState, useCallback } from 'react';

let toastIdCounter = 0;
let globalToastDispatch = null;

export function useToast() {
    const show = useCallback((message, type = 'info', duration = 4000) => {
        if (globalToastDispatch) {
            globalToastDispatch({ id: ++toastIdCounter, message, type, duration });
        }
    }, []);

    return {
        success: (msg, dur) => show(msg, 'success', dur),
        error: (msg, dur) => show(msg, 'error', dur || 5000),
        info: (msg, dur) => show(msg, 'info', dur),
        warning: (msg, dur) => show(msg, 'warning', dur),
    };
}

const ICONS = {
    success: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
        </svg>
    ),
    error: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    warning: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    info: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),
};

const COLORS = {
    success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', icon: '#10b981' },
    error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)', icon: '#ef4444' },
    warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', icon: '#f59e0b' },
    info: { bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.4)', icon: '#0ea5e9' },
};

function ToastItem({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);
    const color = COLORS[toast.type] || COLORS.info;

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
        }, toast.duration);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    return (
        <div
            onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
            style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '14px 16px',
                background: color.bg,
                border: `1px solid ${color.border}`,
                backdropFilter: 'blur(20px)',
                borderRadius: '10px',
                cursor: 'pointer',
                maxWidth: '380px',
                minWidth: '280px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                transform: visible ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.95)',
                opacity: visible ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
        >
            <span style={{ color: color.icon, flexShrink: 0, marginTop: '1px' }}>
                {ICONS[toast.type]}
            </span>
            <span style={{ fontSize: '13.5px', lineHeight: 1.5, color: '#e2e8f0', fontFamily: 'DM Sans, sans-serif', flex: 1 }}>
                {toast.message}
            </span>
            <span style={{ color: '#64748b', fontSize: '18px', lineHeight: 1, flexShrink: 0, marginLeft: '4px' }}>×</span>
        </div>
    );
}

export function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        globalToastDispatch = (toast) => {
            setToasts(prev => [...prev.slice(-4), toast]); // max 5
        };
        return () => { globalToastDispatch = null; };
    }, []);

    const remove = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px',
            zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '10px',
            alignItems: 'flex-end',
        }}>
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onRemove={remove} />
            ))}
        </div>
    );
}
