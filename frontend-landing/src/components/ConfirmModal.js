'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2, Info, AlertCircle } from 'lucide-react';

/**
 * ConfirmModal — System-native confirmation dialog.
 * Fully integrated with getDashboardTheme(d) tokens.
 *
 * Props:
 *   isOpen      - boolean
 *   onClose     - () => void
 *   onConfirm   - () => void | Promise<void>
 *   title       - string
 *   message     - string | ReactNode
 *   confirmText - string (default: 'Confirm')
 *   cancelText  - string (default: 'Cancel')
 *   type        - 'danger' | 'warning' | 'info'
 *   d           - getDashboardTheme result (optional, falls back to dark defaults)
 */
export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    d,
}) {
    const [loading, setLoading] = useState(false);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (err) {
            console.error('ConfirmModal error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ── Type config ──────────────────────────────────────────────────────────
    const isDark = d?.isDark ?? true;

    const typeConfig = {
        danger: {
            Icon: Trash2,
            iconBg: isDark ? 'bg-red-500/10' : 'bg-red-50 border border-red-200',
            iconColor: isDark ? 'text-red-400' : 'text-red-600',
            confirmBtn: isDark
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            Icon: AlertTriangle,
            iconBg: isDark ? 'bg-orange-500/10' : 'bg-orange-50 border border-orange-200',
            iconColor: isDark ? 'text-orange-400' : 'text-orange-600',
            confirmBtn: isDark
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white',
        },
        info: {
            Icon: Info,
            iconBg: isDark ? 'bg-blue-500/10' : 'bg-blue-50 border border-blue-200',
            iconColor: isDark ? 'text-blue-400' : 'text-blue-600',
            confirmBtn: isDark
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white',
        },
    };

    const cfg = typeConfig[type] || typeConfig.danger;
    const { Icon } = cfg;

    // ── Theme-aware classes ──────────────────────────────────────────────────
    // If `d` is provided, use its tokens; otherwise fall back to safe defaults.
    const backdropCls = isDark ? 'bg-black/70' : 'bg-black/30';
    const modalCls = d?.card
        ? `${d.card} max-w-sm w-full`
        : isDark
            ? 'bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl'
            : 'bg-white border border-gray-200 rounded-xl p-6 max-w-sm w-full shadow-xl';

    const headTextCls = isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subTextCls  = isDark ? 'text-gray-400' : 'text-gray-500';
    const cancelCls   = d?.btnSecondary
        ? d.btnSecondary
        : isDark
            ? 'px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all text-sm font-medium'
            : 'px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-200 transition-all text-sm font-medium';

    const spinnerBorder = isDark ? 'border-white/30' : 'border-gray-300';
    const spinnerTop    = type === 'danger'
        ? (isDark ? 'border-t-red-400' : 'border-t-red-600')
        : type === 'warning'
            ? (isDark ? 'border-t-orange-400' : 'border-t-orange-600')
            : (isDark ? 'border-t-blue-400' : 'border-t-blue-600');

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 ${backdropCls} backdrop-blur-sm animate-fade-in`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
                <div
                    className={`${modalCls} pointer-events-auto animate-scale-in`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close X */}
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={onClose}
                            className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cfg.iconBg}`}>
                        <Icon className={`w-6 h-6 ${cfg.iconColor}`} />
                    </div>

                    {/* Content */}
                    <h3 className={`text-base font-bold ${headTextCls} mb-2`}>{title}</h3>
                    <p className={`text-sm ${subTextCls} mb-6 leading-relaxed`}>{message}</p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className={`flex-1 ${cancelCls} disabled:opacity-50`}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className={`flex-1 px-4 py-2 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${cfg.confirmBtn}`}
                        >
                            {loading ? (
                                <span className={`w-4 h-4 border-2 ${spinnerBorder} ${spinnerTop} rounded-full animate-spin`} />
                            ) : null}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
