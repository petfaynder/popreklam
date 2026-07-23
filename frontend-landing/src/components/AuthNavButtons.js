'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LayoutDashboard } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useTranslations } from 'next-intl';

export default function AuthNavButtons({
    hrefCTA = '/register',
    labelCTA,
    btnClass = 'px-6 py-2.5 bg-lime-400 text-slate-900 rounded-xl font-bold text-sm hover:bg-lime-300 transition-all',
    loginClass = 'text-gray-400 hover:text-white transition-colors text-sm font-bold',
}) {
    const t = useTranslations('nav');
    const [user, setUser] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const u = authAPI.getCurrentUser();
        const token = localStorage.getItem('token');
        if (token && u) setUser(u);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center gap-4">
                <div className="w-12 h-4 bg-white/10 rounded animate-pulse" />
                <div className="w-24 h-9 bg-white/10 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (user) {
        const dashHref = user.role === 'PUBLISHER' ? '/publisher'
            : user.role === 'ADVERTISER' ? '/advertiser'
                : user.role === 'ADMIN' ? '/admin'
                    : '/';

        const handleLogout = () => {
            authAPI.logout();
            setUser(null);
        };

        return (
            <div className="flex items-center gap-3">
                <Link href={dashHref} className={`${btnClass} flex items-center gap-2`}>
                    <LayoutDashboard className="w-4 h-4" />
                    {t('dashboard')}
                </Link>
                <button onClick={handleLogout} className={loginClass}>
                    {t('logout')}
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <Link href="/login" className={loginClass}>{t('login')}</Link>
            <Link href={hrefCTA} className={btnClass}>
                {labelCTA || t('getStarted')}
            </Link>
        </div>
    );
}
