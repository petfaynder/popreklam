'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger' // danger, warning, info
}) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Confirmation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const typeConfig = {
        danger: {
            buttonBg: 'bg-red-500 hover:bg-red-600',
            borderColor: 'border-red-500/20'
        },
        warning: {
            buttonBg: 'bg-orange-500 hover:bg-orange-600',
            borderColor: 'border-orange-500/20'
        },
        info: {
            buttonBg: 'bg-blue-500 hover:bg-blue-600',
            borderColor: 'border-blue-500/20'
        }
    };

    const config = typeConfig[type] || typeConfig.danger;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className={`glass-premium border ${config.borderColor} p-6 rounded-3xl max-w-md w-full pointer-events-auto animate-scale-in`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Message */}
                    <p className="text-gray-300 mb-6">{message}</p>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-all disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className={`px-4 py-2 ${config.buttonBg} rounded-xl text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2`}
                        >
                            {loading && (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
