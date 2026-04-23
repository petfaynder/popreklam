'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, BarChart2, Globe, Wallet,
    HelpCircle, Bell, LogOut, Zap, Code2,
    Menu, X, Settings, Gift, Flag
} from 'lucide-react';
import { authAPI, publisherAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';
import { MailWarning, X, RefreshCw } from 'lucide-react';

const NOISE_BG = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2VGaWx0ZXIpIiBvcGFjaXR5PSIwLjAzIi8+PC9zdmc+";

const navItems = [
    { href: '/publisher', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/publisher/analytics', icon: BarChart2, label: 'Analytics' },
    { href: '/publisher/sites', icon: Globe, label: 'Sites' },
    { href: '/publisher/ad-codes', icon: Code2, label: 'Ad Codes' },
    { href: '/publisher/statistics', icon: BarChart2, label: 'Statistics' },
    { href: '/publisher/payments', icon: Wallet, label: 'Payments' },
    { href: '/publisher/referrals', icon: Gift, label: 'Referrals' },
    { href: '/publisher/reports', icon: Flag, label: 'Report Ad' },
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
    const [balance, setBalance] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [bellOpen, setBellOpen] = useState(false);
    const [showVerifyBanner, setShowVerifyBanner] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSent, setResendSent] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                setUser(parsed);
                if (parsed.isVerified === false) setShowVerifyBanner(true);
            }
        } catch { }

        fetchBalance();
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchBalance = async () => {
        try {
            const data = await publisherAPI.getPayments();
            setBalance(parseFloat(data?.stats?.balance ?? 0));
        } catch (e) {
            // Fallback: try dashboard endpoint
            try {
                const dash = await publisherAPI.getDashboard();
                setBalance(parseFloat(dash?.earnings?.total ?? 0));
            } catch {
                setBalance(0);
            }
        }
    };

    const fetchNotifications = async () => {
        try {
            const data = await publisherAPI.getNotifications();
            setNotifications(data);
        } catch (e) {
            console.error('Failed to fetch notifications');
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await publisherAPI.markNotificationAsRead(notif.id);
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
            } catch (e) {
                console.error('Failed to mark as read');
            }
        }
    };

    const handleLogout = () => {
        authAPI.logout();
        router.push('/login');
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        try {
            await authAPI.resendVerificationEmail();
            setResendSent(true);
        } catch (e) {
            console.error('Failed to resend verification email');
        } finally {
            setResendLoading(false);
        }
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

                {/* ── Email Verification Banner ── */}
                {showVerifyBanner && (
                    <div className="relative z-50 flex items-center gap-3 px-4 py-3 bg-amber-500/10 border-b border-amber-500/25 text-amber-300 text-sm">
                        <MailWarning className="w-4 h-4 shrink-0 text-amber-400" />
                        <span className="flex-1">
                            {resendSent
                                ? '✓ Verification email sent! Please check your inbox (and spam folder).'
                                : 'Your email address is not verified. Please check your inbox or resend the verification email.'
                            }
                        </span>
                        {!resendSent && (
                            <button
                                onClick={handleResendVerification}
                                disabled={resendLoading}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3 h-3 ${resendLoading ? 'animate-spin' : ''}`} />
                                {resendLoading ? 'Sending...' : 'Resend Email'}
                            </button>
                        )}
                        <button onClick={() => setShowVerifyBanner(false)} className="p-1 hover:text-amber-200 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
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
                                <div className={d.balanceValue}>
                                    {balance === null
                                        ? <span className="opacity-40 animate-pulse">···</span>
                                        : `$${balance.toFixed(2)}`
                                    }
                                </div>
                            </div>
                            <div className={d.balanceIcon}>
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                className={d.notifBtn} 
                                onClick={() => setBellOpen(!bellOpen)}
                            >
                                <Bell className="w-6 h-6" />
                                {notifications.some(n => !n.isRead) && (
                                    <span className={d.notifDot}></span>
                                )}
                            </button>

                            {bellOpen && (
                                <div className="absolute top-12 right-0 w-80 bg-white dark:bg-[#0f0f24] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-black/20">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                                <p className="text-sm">No notifications yet</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {notifications.map(notif => (
                                                    <div 
                                                        key={notif.id} 
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${!notif.isRead ? 'bg-lime-50 dark:bg-lime-500/10' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="mt-1">
                                                                {notif.type === 'INFO' && <div className="w-2 h-2 rounded-full bg-sky-500"></div>}
                                                                {notif.type === 'SUCCESS' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                                                {notif.type === 'WARNING' && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                                                            </div>
                                                            <div>
                                                                <div className={`text-sm font-semibold mb-1 ${!notif.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                    {notif.title}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                                                                    {notif.message}
                                                                </div>
                                                                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
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
