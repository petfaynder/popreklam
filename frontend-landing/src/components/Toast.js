'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(toast => toast.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = {
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        info: (message, duration) => addToast(message, 'info', duration),
        warning: (message, duration) => addToast(message, 'warning', duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
                {toasts.map(({ id, message, type }) => (
                    <Toast
                        key={id}
                        message={message}
                        type={type}
                        onClose={() => removeToast(id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

function Toast({ message, type, onClose }) {
    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20',
            iconColor: 'text-emerald-400',
            textColor: 'text-emerald-100'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20',
            iconColor: 'text-red-400',
            textColor: 'text-red-100'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            iconColor: 'text-blue-400',
            textColor: 'text-blue-100'
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20',
            iconColor: 'text-orange-400',
            textColor: 'text-orange-100'
        }
    };

    const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type] || config.info;

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl ${bgColor} ${borderColor} shadow-2xl animate-slide-in-right min-w-[300px]`}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
            <p className={`text-sm font-medium flex-1 ${textColor}`}>{message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </div>
    );
}
