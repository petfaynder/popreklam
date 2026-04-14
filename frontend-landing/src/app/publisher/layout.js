'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, BarChart2, Globe, Wallet,
    HelpCircle, Bell, LogOut, Zap, Code2,
    Menu, X, Settings, Gift
} from 'lucide-react';
import { authAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

const NOISE_BG = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2VGaWx0ZXIpIiBvcGFjaXR5PSIwLjAzIi8+PC9zdmc+";

const navItems = [
    { href: '/publisher', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/publisher/analytics', icon: BarChart2, label: 'Analytics' },
    { href: '/publisher/sites', icon: Globe, label: 'Sites' },
    { href: '/publisher/ad-codes', icon: Code2, label: 'Ad Codes' },
    { href: '/publisher/statistics', icon: BarChart2, label: 'Statistics' },
    { href: '/publisher/payments', icon: Wallet, label: 'Payments' },
    { href: '/publisher/referrals', icon: Gift, label: 'Referrals' },
];

const accountItems = [
    { href: '/publisher/settings', icon: Settings, label: 'Settings' },
    { href: '/publisher/support', icon: HelpCircle, label: 'Support' },
];

function ThemeLogo({ theme, d }) {
    if (theme === 'theme-brutalist') {
        return (
            <Link href="/publisher" className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-[#1A1A1A] text-white flex items-center justify-center transform -rotate-3 group-hover:rotate-0 transition-transform">
                    <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="text-lg font-black tracking-tighter uppercase">MrPop.io</span>
            </Link>
        );
    }
    if (theme === 'theme-editorial') {
        return (
            <Link href="/publisher" className="group text-center">
                <span className="text-xl font-black tracking-tight hover:text-red-700 transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>The PR Journal</span>
                <span className="block text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>Publisher Panel</span>
            </Link>
        );
    }
    if (theme === 'theme-saas') {
        return (
            <Link href="/publisher" className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                    <div className="w-3.5 h-3.5 bg-[#09090B] rounded-sm"></div>
                </div>
                <span className="text-base font-semibold text-white tracking-tight">MrPop.io</span>
            </Link>
        );
    }
    // Luminous
    const isAzure = theme === 'theme-azure';
    const accentColor = isAzure ? 'bg-sky-400' : 'bg-lime-400';
    const glowColor = isAzure ? 'shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'shadow-[0_0_15px_rgba(163,255,51,0.3)]';
    return (
        <Link href="/publisher" className="flex items-center gap-2 group">
            <div className={`w-8 h-8 ${accentColor} rounded-lg flex items-center justify-center ${glowColor}`}>
                <Zap className={`w-5 h-5 ${isAzure ? 'text-white' : 'text-slate-900'} fill-current`} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">MrPop.io</span>
        </Link>
    );
}

export default function PublisherLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            if (stored) setUser(JSON.parse(stored));
        } catch { }
    }, []);

    const handleLogout = () => {
        authAPI.logout();
        router.push('/login');
    };

    const isActive = (href) => {
        if (href === '/publisher') return pathname === '/publisher';
        return pathname.startsWith(href);
    };

    const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'PB';

    return (
        <div className={`${d.shell} selection:bg-lime-400 selection:text-slate-900`}>
            {/* Background Texture (dark themes only) */}
            {d.bgTexture && (
                <div className="fixed inset-0 opacity-40 pointer-events-none z-0" style={{ backgroundImage: 'url(' + NOISE_BG + ')' }}></div>
            )}

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`${d.sidebar} ${mobileOpen ? '!flex' : ''}`}>
                {/* Logo */}
                <div className={d.sidebarLogo}>
                    <ThemeLogo theme={theme} d={d} />
                </div>

                {/* Navigation */}
                <nav className={d.sidebarNav}>
                    {navItems.map(item => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={active ? d.navActive : `${d.navInactive} group`}
                            >
                                <div className={active ? d.navIconActive : `${d.navIconInactive} transition-colors`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    <div className={d.sidebarSection}>Account</div>
                    {accountItems.map(item => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={active ? d.navActive : `${d.navInactive} group`}
                            >
                                <div className={active ? d.navIconActive : `${d.navIconInactive} transition-colors`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className={d.sidebarProfile}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${d.avatarBg} flex items-center justify-center`}>
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`${d.avatarName} truncate`}>{user?.email || 'Publisher'}</div>
                            <div className={d.avatarSub}>Publisher</div>
                        </div>
                        <button onClick={handleLogout} className={d.logoutBtn} title="Logout">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative z-10">
                {/* Topbar */}
                <header className={d.topbar}>
                    {/* Mobile Menu */}
                    <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Breadcrumb */}
                    <div className={`hidden md:block ${d.breadcrumb}`}>
                        Publisher Panel &gt; <span className={d.breadcrumbActive}>
                            {pathname === '/publisher' ? 'Dashboard' : pathname.split('/').pop()?.charAt(0).toUpperCase() + pathname.split('/').pop()?.slice(1)}
                        </span>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4 md:gap-6 ml-auto">
                        {/* Balance */}
                        <div className={d.balanceCard}>
                            <div className="text-right">
                                <div className={d.balanceLabel}>Balance</div>
                                <div className={d.balanceValue}>$1,240.50</div>
                            </div>
                            <div className={d.balanceIcon}>
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Notifications */}
                        <button className={d.notifBtn}>
                            <Bell className="w-6 h-6" />
                            <span className={d.notifDot}></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className={d.mainPadding}>
                    {children}
                </main>
            </div>
        </div>
    );
}
