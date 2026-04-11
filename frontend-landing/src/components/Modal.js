'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'medium', showCloseButton = true, variant = 'theme-brutalist' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        small: 'max-w-md',
        medium: 'max-w-2xl',
        large: 'max-w-4xl',
        xlarge: 'max-w-6xl'
    };

    // Calculate theme-specific styles
    let backdropStyle = 'bg-black/60 backdrop-blur-sm';
    let modalStyle = 'glass-premium border border-white/10 text-white shadow-2xl rounded-[24px]';
    let headerStyle = 'border-b border-white/10 p-6';
    let titleStyle = 'text-2xl font-bold tracking-tight text-white';
    let closeBtnStyle = 'hover:bg-white/10 text-gray-400';
    let closeIconProps = { strokeWidth: 2 };
    let contentBg = '';

    if (variant === 'theme-brutalist') {
        backdropStyle = 'bg-black/40';
        modalStyle = 'bg-white text-black border-[3px] border-black shadow-[8px_8px_0px_#000000] rounded-[20px]';
        headerStyle = 'border-b-[3px] border-black bg-gray-50 p-6';
        titleStyle = 'text-2xl font-black uppercase tracking-tight text-black';
        closeBtnStyle = 'hover:bg-gray-200 text-black border-2 border-transparent hover:border-black shadow-[0_0_0_transparent] hover:shadow-[2px_2px_0_#000]';
        closeIconProps = { strokeWidth: 3 };
        contentBg = 'bg-white';
    } else if (variant === 'theme-editorial') {
        backdropStyle = 'bg-[#eee]/80 backdrop-blur-md';
        modalStyle = 'bg-[#f4f4f0] text-[#1a1a1a] border border-[#d2d2c6] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-none';
        headerStyle = 'border-b border-[#1a1a1a] p-8 pb-4 mx-2';
        titleStyle = 'text-3xl font-black tracking-tight text-[#1a1a1a] uppercase';
        closeBtnStyle = 'hover:text-red-700 text-[#1a1a1a]';
        closeIconProps = { strokeWidth: 1.5 };
        contentBg = 'bg-transparent';
    } else if (variant === 'theme-saas') { // Sentinel
        backdropStyle = 'bg-slate-950/40 backdrop-blur-[2px]';
        modalStyle = 'bg-white text-slate-900 border border-slate-200 shadow-xl rounded-2xl ring-1 ring-slate-900/5';
        headerStyle = 'border-b border-slate-100 px-6 py-5 bg-slate-50/50';
        titleStyle = 'text-lg font-semibold tracking-tight text-slate-900';
        closeBtnStyle = 'hover:bg-slate-100 text-slate-500 rounded-lg';
        closeIconProps = { strokeWidth: 2 };
        contentBg = 'bg-white';
    } else if (variant === 'theme-azure') {
        backdropStyle = 'bg-[#0f172a]/80 backdrop-blur-md';
        modalStyle = 'bg-[#1e293b] text-slate-100 border border-slate-700/50 shadow-[0_0_40px_-15px_rgba(56,189,248,0.15)] rounded-2xl overflow-hidden';
        headerStyle = 'border-b border-slate-700/50 p-6 bg-[#0f172a]/50 relative';
        titleStyle = 'text-xl font-bold tracking-tight text-white relative z-10';
        closeBtnStyle = 'hover:bg-slate-800 text-slate-400 rounded-xl transition-all relative z-10';
        closeIconProps = { strokeWidth: 2 };
        contentBg = 'bg-transparent';
    } else if (variant === 'theme-luminous') {
        backdropStyle = 'bg-black/80 backdrop-blur-sm';
        modalStyle = 'bg-[#09090b] text-white border border-white/5 shadow-[0_0_50px_-20px_rgba(163,255,51,0.15)] rounded-3xl';
        headerStyle = 'border-b border-white/5 p-6 relative overflow-hidden';
        titleStyle = 'text-xl font-bold tracking-tight text-white';
        closeBtnStyle = 'hover:bg-white/10 text-gray-400 rounded-full transition-colors';
        closeIconProps = { strokeWidth: 2 };
        contentBg = 'bg-transparent';
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12" style={{ fontFamily: variant === 'theme-editorial' ? 'var(--font-serif)' : 'var(--font-sans)' }}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 transition-opacity duration-300 ${backdropStyle}`}
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col transition-all duration-300 transform ${modalStyle}`}>

                {/* Variant-specific decorative elements */}
                {variant === 'theme-azure' && (
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent"></div>
                )}
                {variant === 'theme-luminous' && (
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-lime-400/30 to-transparent"></div>
                )}

                {/* Header */}
                {(title || showCloseButton) && (
                    <div className={`flex items-center justify-between ${headerStyle}`}>
                        {title && <h2 className={titleStyle}>{title}</h2>}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className={`w-8 h-8 flex items-center justify-center transition-all ${closeBtnStyle}`}
                            >
                                <X className="w-5 h-5" {...closeIconProps} />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className={`p-6 overflow-y-auto flex-1 custom-scrollbar ${contentBg}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}
