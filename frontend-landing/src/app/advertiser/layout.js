'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, BarChart2, Target, CreditCard,
    HelpCircle, Bell, LogOut, Zap, Plus,
    Menu, X, Settings, Gift, Crown, Users, Activity
} from 'lucide-react';
import { authAPI, advertiserAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

const NOISE_BG = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2VGaWx0ZXIpIiBvcGFjaXR5PSIwLjAzIi8+PC9zdmc+";

const navItems = [
    { href: '/advertiser', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/advertiser/campaigns', icon: Target, label: 'Campaigns' },
    { href: '/advertiser/audiences', icon: Users, label: 'Audiences' },
    { href: '/advertiser/statistics', icon: BarChart2, label: 'Statistics' },
    { href: '/advertiser/tracking', icon: Activity, label: 'Tracking' },
    { href: '/advertiser/billing', icon: CreditCard, label: 'Billing' },
    { href: '/advertiser/referrals', icon: Gift, label: 'Referrals' },
    { href: '/advertiser/priority', icon: Crown, label: 'Priority' },
];

const accountItems = [
    { href: '/advertiser/settings', icon: Settings, label: 'Settings' },
    { href: '/advertiser/support', icon: HelpCircle, label: 'Support' },
];

function ThemeLogo({ theme, d }) {
    if (theme === 'theme-brutalist') {
        return (
            <Link href="/advertiser" className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-[#1A1A1A] text-white flex items-center justify-center transform -rotate-3 group-hover:rotate-0 transition-transform">
                    <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="text-lg font-black tracking-tighter uppercase">PopReklam</span>
                <span className="text-[9px] font-black bg-[#F5F5F0] border-2 border-[#1A1A1A] px-1 py-0.5 uppercase tracking-widest">ADV</span>
            </Link>
        );
    }
    if (theme === 'theme-editorial') {
        return (
            <Link href="/advertiser" className="group text-center">
                <span className="text-xl font-black tracking-tight hover:text-red-700 transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>The PR Journal</span>
                <span className="block text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>Advertiser Panel</span>
            </Link>
        );
    }
    if (theme === 'theme-saas') {
        return (
            <Link href="/advertiser" className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                    <div className="w-3.5 h-3.5 bg-[#09090B] rounded-sm"></div>
                </div>
                <span className="text-base font-semibold text-white tracking-tight">PopReklam</span>
                <span className="text-[10px] font-medium bg-white/[0.06] text-gray-400 px-1.5 py-0.5 rounded border border-white/[0.08]">ADV</span>
            </Link>
        );
    }
    // Luminous & Azure
    const isAzure = theme === 'theme-azure';
    const accentColor = isAzure ? 'bg-sky-400' : 'bg-lime-400';
    const glowColor = isAzure ? 'shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'shadow-[0_0_15px_rgba(163,255,51,0.3)]';
    const badgeBg = isAzure ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-lime-400/20 text-lime-400 border-lime-400/30';
    return (
        <Link href="/advertiser" className="flex items-center gap-2 group">
            <div className={`w-8 h-8 ${accentColor} rounded-lg flex items-center justify-center ${glowColor}`}>
                <Zap className={`w-5 h-5 ${isAzure ? 'text-white' : 'text-slate-900'} fill-current`} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">PopReklam</span>
            <span className={`text-[10px] font-bold ${badgeBg} px-1.5 py-0.5 rounded border ml-auto`}>ADV</span>
        </Link>
    );
}

// ─── Tier Badge Component ───
const TIER_STYLES = {
    STARTER: {
        bg: 'bg-gray-500/10 border-gray-500/20',
        text: 'text-gray-400',
        glow: '',
        label: 'Starter',
    },
    PRO: {
        bg: 'bg-blue-500/10 border-blue-500/30',
        text: 'text-blue-400',
        glow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]',
        label: 'Pro',
    },
    ELITE: {
        bg: 'bg-amber-500/10 border-amber-500/30',
        text: 'text-amber-400',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]',
        label: 'Elite',
    },
    VIP: {
        bg: 'bg-red-500/10 border-red-500/30',
        text: 'text-red-400',
        glow: 'shadow-[0_0_16px_rgba(239,68,68,0.4)] animate-pulse',
        label: 'VIP',
    },
};

function TierBadge({ tier }) {
    const s = TIER_STYLES[tier] || TIER_STYLES.STARTER;
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${s.bg} ${s.glow} group-hover:scale-105 transition-all duration-200 cursor-pointer`}>
            <Crown className={`w-3.5 h-3.5 ${s.text}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${s.text}`}>{s.label}</span>
        </div>
    );
}

export default function AdvertiserLayout({ children }) {
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

    // Fetch tier data and real balance from dashboard API
    const [tierData, setTierData] = useState(null);
    const [balance, setBalance] = useState(null);
    useEffect(() => {
        advertiserAPI.getDashboard()
            .then(data => {
                if (data?.priority) setTierData(data.priority);
                if (data?.balance !== undefined) setBalance(Number(data.balance));
            })
            .catch(() => {});
    }, []);

    const handleLogout = () => {
        authAPI.logout();
        router.push('/login');
    };

    const isActive = (href) => {
        if (href === '/advertiser') return pathname === '/advertiser';
        return pathname.startsWith(href);
    };

    const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'AD';

    return (
        <div className={`${d.shell} selection:bg-sky-400 selection:text-slate-900`}>
            {d.bgTexture && (
                <div className="fixed inset-0 opacity-40 pointer-events-none z-0" style={{ backgroundImage: 'url(' + NOISE_BG + ')' }}></div>
            )}

            {mobileOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`${d.sidebar} ${mobileOpen ? '!flex' : ''}`}>
                <div className={d.sidebarLogo}>
                    <ThemeLogo theme={theme} d={d} />
                </div>

                {/* Create Campaign CTA */}
                <div className="p-4">
                    <Link href="/advertiser/campaigns/create" className={`w-full py-3 ${d.btnPrimary} flex items-center justify-center gap-2 group`}>
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        New Campaign
                    </Link>
                </div>

                {/* Nav */}
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

                {/* Profile */}
                <div className={d.sidebarProfile}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${d.avatarBg} flex items-center justify-center`}>
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`${d.avatarName} truncate`}>{user?.email || 'Advertiser'}</div>
                            <div className={d.avatarSub}>Advertiser</div>
                        </div>
                        <button onClick={handleLogout} className={d.logoutBtn} title="Logout">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative z-10">
                <header className={d.topbar}>
                    <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    <div className={`hidden md:block ${d.breadcrumb}`}>
                        Advertiser Panel &gt; <span className={d.breadcrumbActive}>
                            {pathname === '/advertiser' ? 'Dashboard' : pathname.split('/').pop()?.charAt(0).toUpperCase() + pathname.split('/').pop()?.slice(1)}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6 ml-auto">
                        {/* Tier Badge */}
                        {tierData && (
                            <Link href="/advertiser/priority" className="group">
                                <TierBadge tier={tierData.tier} theme={theme} />
                            </Link>
                        )}

                        <div className={d.balanceCard}>
                            <div className="text-right">
                                <div className={d.balanceLabel}>Funds Available</div>
                                <div className={d.balanceValue}>
                                    {balance === null
                                        ? '...' 
                                        : `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                    }
                                </div>
                            </div>
                            <div className={d.balanceIcon}>
                                <CreditCard className="w-5 h-5" />
                            </div>
                        </div>

                        <button className={d.notifBtn}>
                            <Bell className="w-6 h-6" />
                            <span className={d.notifDot}></span>
                        </button>
                    </div>
                </header>

                <main className={d.mainPadding}>
                    {children}
                </main>
            </div>
        </div>
    );
}
