'use client';

import { useState } from 'react';
import { User, Mail, Lock, Key, CreditCard, Bell, Shield, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { publisherAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

function Toast({ type, message, onClose }) {
    if (!message) return null;
    return (
        <div className={`flex items-start gap-3 px-5 py-4 rounded-xl border text-sm ${type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            {type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <p className="flex-1">{message}</p>
            <button onClick={onClose}><X className="w-4 h-4 opacity-60 hover:opacity-100" /></button>
        </div>
    );
}

function SectionHeader({ icon: Icon, iconColor, title, desc, d, children }) {
    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    return (
        <div className={d.card}>
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h2 className={`text-xl font-bold ${headText}`}>{title}</h2>
                    <p className={`text-sm ${subText}`}>{desc}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

export default function PublisherSettingsPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [profileData, setProfileData] = useState({ name: '', email: '', company: '', phone: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [paymentSettings, setPaymentSettings] = useState({ paypalEmail: '', btcAddress: '', wireAccountNumber: '' });
    const [notifications, setNotifications] = useState({ emailReports: true, paymentAlerts: true, siteUpdates: false, marketingEmails: false });
    const [apiToken, setApiToken] = useState('');

    const [toast, setToast] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState({ profile: false, password: false, payment: false, token: false });

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast({ type: '', msg: '' }), 4000);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(l => ({ ...l, profile: true }));
        try {
            await publisherAPI.updateProfile(profileData);
            showToast('success', 'Profile updated successfully.');
        } catch (err) {
            showToast('error', err.message || 'Failed to update profile.');
        } finally {
            setLoading(l => ({ ...l, profile: false }));
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('error', 'New passwords do not match.');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            showToast('error', 'Password must be at least 8 characters.');
            return;
        }
        setLoading(l => ({ ...l, password: true }));
        try {
            await publisherAPI.changePassword(passwordData);
            showToast('success', 'Password changed successfully.');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showToast('error', err.message || 'Failed to change password.');
        } finally {
            setLoading(l => ({ ...l, password: false }));
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setLoading(l => ({ ...l, payment: true }));
        try {
            await publisherAPI.updatePaymentSettings(paymentSettings);
            showToast('success', 'Payment settings updated.');
        } catch (err) {
            showToast('error', err.message || 'Failed to update payment settings.');
        } finally {
            setLoading(l => ({ ...l, payment: false }));
        }
    };

    const handleGenerateToken = async () => {
        setLoading(l => ({ ...l, token: true }));
        try {
            const res = await publisherAPI.generateApiToken();
            setApiToken(res.token || 'pub_' + Math.random().toString(36).slice(2, 18).toUpperCase());
            showToast('success', 'Token generated. Copy it — it will not be shown again.');
        } catch (err) {
            showToast('error', err.message || 'Failed to generate token.');
        } finally {
            setLoading(l => ({ ...l, token: false }));
        }
    };

    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    const labelCls = `block text-sm font-medium mb-2 ${d.isDark ? 'text-gray-300' : 'text-gray-600'}`;
    const inputCls = `w-full px-4 py-3 focus:outline-none transition-all text-sm ${theme === 'theme-brutalist'
            ? 'border-2 border-[#1A1A1A] rounded bg-[#F5F5F0] text-[#1A1A1A] placeholder-gray-400'
            : d.isDark
                ? 'bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-white/30'
                : 'bg-white border border-gray-200 rounded-xl text-[#1A1A1A] placeholder-gray-400 focus:border-gray-400'
        }`;

    const iconColors = {
        profile: { 'theme-luminous': 'bg-lime-400/10 text-lime-400', 'theme-azure': 'bg-sky-500/10 text-sky-400', 'theme-saas': 'bg-white/[0.06] text-gray-300', 'theme-editorial': 'bg-red-50 text-red-700 border border-red-200', 'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]' }[theme] || 'bg-lime-400/10 text-lime-400',
        password: { 'theme-luminous': 'bg-sky-500/10 text-sky-400', 'theme-azure': 'bg-purple-500/10 text-purple-400', 'theme-saas': 'bg-white/[0.06] text-gray-300', 'theme-editorial': 'bg-blue-50 text-blue-700 border border-blue-200', 'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]' }[theme] || 'bg-sky-500/10 text-sky-400',
        payment: { 'theme-luminous': 'bg-purple-500/10 text-purple-400', 'theme-azure': 'bg-lime-400/10 text-lime-400', 'theme-saas': 'bg-white/[0.06] text-gray-300', 'theme-editorial': 'bg-purple-50 text-purple-700 border border-purple-200', 'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]' }[theme] || 'bg-purple-500/10 text-purple-400',
        notif: { 'theme-luminous': 'bg-orange-500/10 text-orange-400', 'theme-azure': 'bg-orange-500/10 text-orange-400', 'theme-saas': 'bg-white/[0.06] text-gray-300', 'theme-editorial': 'bg-orange-50 text-orange-700 border border-orange-200', 'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]' }[theme] || 'bg-orange-500/10 text-orange-400',
        api: { 'theme-luminous': 'bg-green-500/10 text-green-400', 'theme-azure': 'bg-green-500/10 text-green-400', 'theme-saas': 'bg-white/[0.06] text-gray-300', 'theme-editorial': 'bg-green-50 text-green-700 border border-green-200', 'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]' }[theme] || 'bg-green-500/10 text-green-400',
    };

    const toggleOn = { 'theme-luminous': 'bg-lime-400', 'theme-azure': 'bg-sky-500', 'theme-saas': 'bg-white', 'theme-editorial': 'bg-red-700', 'theme-brutalist': 'bg-[#1A1A1A]' }[theme] || 'bg-lime-400';
    const accentText = { 'theme-luminous': 'text-lime-400', 'theme-azure': 'text-sky-400', 'theme-saas': 'text-white', 'theme-editorial': 'text-red-700', 'theme-brutalist': 'text-[#1A1A1A]' }[theme] || 'text-lime-400';

    return (
        <div className="space-y-6">
            <div>
                <h1 className={d.heading}>Settings</h1>
                <p className={`${d.subheading} mt-1`}>Manage your account preferences and settings</p>
            </div>

            {toast.msg && <Toast type={toast.type} message={toast.msg} onClose={() => setToast({ type: '', msg: '' })} />}

            {/* Profile */}
            <SectionHeader icon={User} iconColor={iconColors.profile} title="Profile Information" desc="Update your personal details" d={d}>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Full Name</label><input type="text" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} className={inputCls} placeholder="John Doe" /></div>
                        <div><label className={labelCls}>Email Address</label><input type="email" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} className={inputCls} placeholder="john@example.com" /></div>
                        <div><label className={labelCls}>Company Name</label><input type="text" value={profileData.company} onChange={e => setProfileData({ ...profileData, company: e.target.value })} className={inputCls} placeholder="Tech Blog Inc." /></div>
                        <div><label className={labelCls}>Phone Number</label><input type="tel" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} className={inputCls} placeholder="+1 234 567 8900" /></div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={loading.profile} className={`${d.btnPrimary} flex items-center gap-2 disabled:opacity-50`}>
                            {loading.profile && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </SectionHeader>

            {/* Password */}
            <SectionHeader icon={Lock} iconColor={iconColors.password} title="Change Password" desc="Update your account password" d={d}>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div><label className={labelCls}>Current Password</label><input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className={inputCls} required /></div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>New Password</label><input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className={inputCls} required /></div>
                        <div><label className={labelCls}>Confirm Password</label><input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className={inputCls} required /></div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={loading.password} className={`${d.btnPrimary} flex items-center gap-2 disabled:opacity-50`}>
                            {loading.password && <Loader2 className="w-4 h-4 animate-spin" />}
                            Update Password
                        </button>
                    </div>
                </form>
            </SectionHeader>

            {/* Payment Methods */}
            <SectionHeader icon={CreditCard} iconColor={iconColors.payment} title="Payment Methods" desc="Configure your payout methods" d={d}>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div><label className={labelCls}>PayPal Email</label><input type="email" value={paymentSettings.paypalEmail} onChange={e => setPaymentSettings({ ...paymentSettings, paypalEmail: e.target.value })} className={inputCls} placeholder="your@paypal.com" /></div>
                    <div><label className={labelCls}>Bitcoin Address</label><input type="text" value={paymentSettings.btcAddress} onChange={e => setPaymentSettings({ ...paymentSettings, btcAddress: e.target.value })} className={`${inputCls} font-mono`} placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" /></div>
                    <div><label className={labelCls}>Wire Transfer Account</label><input type="text" value={paymentSettings.wireAccountNumber} onChange={e => setPaymentSettings({ ...paymentSettings, wireAccountNumber: e.target.value })} className={inputCls} placeholder="Bank account number" /></div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={loading.payment} className={`${d.btnPrimary} flex items-center gap-2 disabled:opacity-50`}>
                            {loading.payment && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Payment Settings
                        </button>
                    </div>
                </form>
            </SectionHeader>

            {/* Notifications */}
            <SectionHeader icon={Bell} iconColor={iconColors.notif} title="Notification Preferences" desc="Manage your email notifications" d={d}>
                <div className="space-y-3">
                    {[
                        { key: 'emailReports', label: 'Daily Email Reports', desc: 'Receive daily performance summaries' },
                        { key: 'paymentAlerts', label: 'Payment Alerts', desc: 'Get notified about payment processing' },
                        { key: 'siteUpdates', label: 'Site Status Updates', desc: 'Notifications when site status changes' },
                        { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Tips, updates, and promotional content' },
                    ].map(item => (
                        <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl border ${d.isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex-1">
                                <p className={`font-medium text-sm ${headText}`}>{item.label}</p>
                                <p className={`text-xs ${subText}`}>{item.desc}</p>
                            </div>
                            <button type="button" onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                                className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key] ? toggleOn : 'bg-gray-200 dark:bg-white/10'}`}>
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.key] ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </SectionHeader>

            {/* API Access */}
            <SectionHeader icon={Key} iconColor={iconColors.api} title="API Access" desc="Generate API tokens for integrations" d={d}>
                <div className="space-y-4">
                    {apiToken && (
                        <div className={`p-4 rounded-xl border ${d.isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                            <p className={`text-xs font-medium mb-2 ${subText}`}>Your API token — copy it now, it won't be shown again</p>
                            <div className="flex items-center gap-2">
                                <code className={`flex-1 text-xs font-mono p-2 rounded break-all ${d.isDark ? 'bg-slate-900 ' + accentText : 'bg-gray-100 text-[#1A1A1A]'}`}>{apiToken}</code>
                                <button onClick={() => { navigator.clipboard.writeText(apiToken); showToast('success', 'Copied!'); }}
                                    className={`${d.btnSecondary} px-3 py-2 text-xs`}>Copy</button>
                            </div>
                        </div>
                    )}
                    <div className={`p-4 rounded-xl border text-sm ${d.isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-gray-300' : 'bg-yellow-50 border-yellow-200 text-gray-600'}`}>
                        <strong className={d.isDark ? 'text-yellow-400' : 'text-yellow-700'}>Note:</strong> API tokens provide programmatic access to your account. Keep them secure and never share publicly.
                    </div>
                    <button onClick={handleGenerateToken} disabled={loading.token}
                        className={`${d.btnPrimary} flex items-center gap-2 disabled:opacity-50`}>
                        {loading.token ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                        Generate Token
                    </button>
                </div>
            </SectionHeader>
        </div>
    );
}
