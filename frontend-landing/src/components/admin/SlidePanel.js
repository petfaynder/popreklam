'use client';
import { useEffect, useRef } from 'react';

export default function SlidePanel({ isOpen, onClose, title, subtitle, width = '640px', children }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                ref={overlayRef}
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transition: 'opacity 0.3s',
                }}
            />

            {/* Panel */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width, maxWidth: '95vw', zIndex: 9999,
                background: '#0a0a1a',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '-24px 0 80px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column',
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                fontFamily: 'DM Sans, sans-serif',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(139,92,246,0.04)',
                    flexShrink: 0,
                }}>
                    <div>
                        <div style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9' }}>{title}</div>
                        {subtitle && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{subtitle}</div>}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '34px', height: '34px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                            color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', fontSize: '18px', lineHeight: 1, flexShrink: 0,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#f1f5f9'; }}
                        onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#64748b'; }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '0',
                    scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.3) transparent',
                }}>
                    {children}
                </div>
            </div>
        </>
    );
}
