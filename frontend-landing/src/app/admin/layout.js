'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authAPI, adminAPI } from '@/lib/api';
import { ToastContainer } from '@/components/admin/Toast';
import {
    LayoutDashboard, Users, Globe, Megaphone, CreditCard, BarChart2,
    MessageSquare, Settings, Shield, FileText, LogOut, ArrowLeft,
    Bell, Zap, AlertTriangle, ChevronRight, Gift, ShoppingCart
} from 'lucide-react';

const NAV_GROUPS = [
    {
        label: null,
        items: [
            { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
        ]
    },
    {
        label: 'Platform',
        items: [
            { name: 'Users', href: '/admin/users', icon: Users },
            { name: 'Sites', href: '/admin/sites', icon: Globe },
            { name: 'Campaigns', href: '/admin/campaigns', icon: Megaphone },
            { name: 'Referrals', href: '/admin/referrals', icon: Gift },
        ]
    },
    {
        label: 'Finance',
        items: [
            { name: 'Payments', href: '/admin/payments', icon: CreditCard },
            { name: 'Coupons', href: '/admin/coupons', icon: Gift },
            { name: 'Reports', href: '/admin/reports', icon: BarChart2 },
            { name: 'Adsterra Backfill', href: '/admin/adsterra', icon: Zap },
        ]
    },
    {
        label: 'Operations',
        items: [
            { name: 'Support', href: '/admin/support', icon: MessageSquare, badge: 'tickets' },
            { name: 'Announcements', href: '/admin/notifications', icon: Megaphone },
            { name: 'Conversions', href: '/admin/conversions', icon: ShoppingCart },
            { name: 'Ad Quality', href: '/admin/ad-quality', icon: Zap },
            { name: 'Geo Floors', href: '/admin/geo-floors', icon: Globe },
            { name: 'Traffic Insights', href: '/admin/traffic', icon: BarChart2 },
            { name: 'Audit Log', href: '/admin/audit', icon: FileText },
        ]
    },
    {
        label: 'System',
        items: [
            { name: 'Settings', href: '/admin/settings', icon: Settings },
        ]
    },
];

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [checking, setChecking] = useState(true);
    const [notifications, setNotifications] = useState({ campaigns: 0, sites: 0, payments: 0, tickets: 0, total: 0 });
    const [bellOpen, setBellOpen] = useState(false);

    useEffect(() => {
        if (pathname === '/admin/login') { setChecking(false); return; }
        const user = authAPI.getCurrentUser();
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token || !user || user.role !== 'ADMIN') {
            router.replace('/admin/login');
        } else {
            setChecking(false);
        }
    }, [pathname]);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await adminAPI.getNotifications();
            setNotifications(data);
        } catch (e) { /* ignore */ }
    }, []);

    useEffect(() => {
        if (pathname !== '/admin/login' && !checking) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [pathname, checking, fetchNotifications]);

    const handleLogout = () => {
        authAPI.logout();
        router.push('/admin/login');
    };

    const isActive = (item) => item.exact
        ? pathname === item.href
        : (pathname === item.href || pathname.startsWith(item.href + '/'));

    if (checking) {
        return (
            <div style={{
                minHeight: '100vh', background: '#05050f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{
                    width: '40px', height: '40px', border: '2px solid #8b5cf6',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (pathname === '/admin/login') {
        return <>{children}<ToastContainer /></>;
    }

    return (
        <div style={{ minHeight: '100vh', background: '#05050f', display: 'flex', fontFamily: 'DM Sans, sans-serif' }}>
            {/* ===== SIDEBAR ===== */}
            <aside style={{
                width: '220px', flexShrink: 0,
                background: '#060612',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column',
                position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
                scrollbarWidth: 'none',
            }}>
                {/* Logo */}
                <div style={{
                    padding: '20px 16px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '9px',
                            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(124,58,237,0.4)',
                        }}>
                            <Shield size={16} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>PopAdmin</div>
                            <div style={{ fontSize: '10px', color: '#475569', fontWeight: 500 }}>Control Panel</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '12px 8px' }}>
                    {NAV_GROUPS.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: '4px' }}>
                            {group.label && (
                                <div style={{
                                    fontSize: '9px', fontWeight: 700, color: '#334155',
                                    letterSpacing: '0.1em', textTransform: 'uppercase',
                                    padding: '10px 8px 4px',
                                }}>
                                    {group.label}
                                </div>
                            )}
                            {group.items.map((item) => {
                                const active = isActive(item);
                                const Icon = item.icon;
                                const badgeCount = item.badge === 'tickets' ? notifications.tickets : 0;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '9px',
                                            padding: '8px 10px', borderRadius: '8px',
                                            marginBottom: '2px', textDecoration: 'none',
                                            background: active ? 'rgba(139,92,246,0.15)' : 'transparent',
                                            borderLeft: active ? '2px solid #8b5cf6' : '2px solid transparent',
                                            color: active ? '#c4b5fd' : '#64748b',
                                            fontSize: '13.5px', fontWeight: active ? 600 : 500,
                                            transition: 'all 0.15s',
                                            position: 'relative',
                                        }}
                                        onMouseEnter={e => {
                                            if (!active) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                                e.currentTarget.style.color = '#94a3b8';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!active) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#64748b';
                                            }
                                        }}
                                    >
                                        <Icon size={15} style={{ flexShrink: 0 }} />
                                        <span style={{ flex: 1 }}>{item.name}</span>
                                        {badgeCount > 0 && (
                                            <span style={{
                                                background: '#ef4444', color: '#fff',
                                                fontSize: '10px', fontWeight: 700,
                                                padding: '1px 6px', borderRadius: '10px',
                                                minWidth: '18px', textAlign: 'center',
                                            }}>
                                                {badgeCount > 99 ? '99+' : badgeCount}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <Link
                        href="/"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '9px',
                            padding: '8px 10px', borderRadius: '8px',
                            color: '#475569', textDecoration: 'none', fontSize: '13px',
                            marginBottom: '4px', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <ArrowLeft size={14} /> Back to Site
                    </Link>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
                            padding: '8px 10px', borderRadius: '8px', border: 'none',
                            background: 'rgba(239,68,68,0.06)', color: '#f87171',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </aside>

            {/* ===== MAIN AREA ===== */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top Bar */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'rgba(5,5,15,0.85)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    padding: '0 24px', height: '56px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    {/* Breadcrumb-style path */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px' }}>
                        <span>Admin</span>
                        {pathname !== '/admin' && (
                            <>
                                <ChevronRight size={14} />
                                <span style={{ color: '#94a3b8', fontWeight: 600, textTransform: 'capitalize' }}>
                                    {pathname.split('/admin/')[1]?.replace(/-/g, ' ') || ''}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Right actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Pending actions summary */}
                        {notifications.total > 0 && (
                            <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                {notifications.campaigns > 0 && (
                                    <span style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                        {notifications.campaigns} campaigns
                                    </span>
                                )}
                                {notifications.payments > 0 && (
                                    <span style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                        {notifications.payments} payments
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Bell */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setBellOpen(p => !p)}
                                style={{
                                    width: '36px', height: '36px', borderRadius: '9px',
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: notifications.total > 0 ? '#fbbf24' : '#64748b',
                                    position: 'relative',
                                }}
                            >
                                <Bell size={16} />
                                {notifications.total > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '-4px', right: '-4px',
                                        background: '#ef4444', color: '#fff',
                                        fontSize: '9px', fontWeight: 700,
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {Math.min(notifications.total, 9)}
                                    </span>
                                )}
                            </button>

                            {bellOpen && (
                                <div style={{
                                    position: 'absolute', top: '44px', right: 0, width: '280px',
                                    background: '#0f0f24', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                                    padding: '12px', zIndex: 100,
                                }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                                        Pending Actions
                                    </div>
                                    {[
                                        { label: 'Campaigns to review', count: notifications.campaigns, href: '/admin/campaigns', color: '#f59e0b' },
                                        { label: 'Sites to review', count: notifications.sites, href: '/admin/sites', color: '#0ea5e9' },
                                        { label: 'Payments pending', count: notifications.payments, href: '/admin/payments', color: '#10b981' },
                                        { label: 'Open tickets', count: notifications.tickets, href: '/admin/support', color: '#8b5cf6' },
                                    ].map(n => n.count > 0 && (
                                        <Link key={n.href} href={n.href} onClick={() => setBellOpen(false)} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '8px 10px', borderRadius: '8px', textDecoration: 'none',
                                            marginBottom: '4px', background: 'rgba(255,255,255,0.03)',
                                        }}>
                                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{n.label}</span>
                                            <span style={{ background: `${n.color}20`, color: n.color, fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>{n.count}</span>
                                        </Link>
                                    ))}
                                    {notifications.total === 0 && <div style={{ fontSize: '13px', color: '#475569', textAlign: 'center', padding: '8px' }}>All clear ✓</div>}
                                </div>
                            )}
                        </div>

                        {/* Admin badge */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                            borderRadius: '8px', padding: '6px 12px',
                        }}>
                            <Shield size={13} color="#8b5cf6" />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa' }}>ADMIN</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1, overflow: 'auto' }}>
                    {children}
                </main>
            </div>

            {/* Toast Container — global */}
            <ToastContainer />
        </div>
    );
}
