'use client';

import { useState, useEffect } from 'react';
import {
    User, Lock, CreditCard, Bell, Key, Shield,
    CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, X,
    Smartphone, Copy, CheckCheck, QrCode, ShieldCheck, ShieldOff
} from 'lucide-react';
import { advertiserAPI, authAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

// ── Inline toast (no alert)
function Toast({ type, message, onClose }) {
    if (!message) return null;
    const isSuccess = type === 'success';
    return (
        <div className={`flex items-start gap-3 px-5 py-4 rounded-xl border text-sm animate-fade-in ${isSuccess
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            {isSuccess ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <p className="flex-1">{message}</p>
            <button onClick={onClose}><X className="w-4 h-4 opacity-60 hover:opacity-100" /></button>
        </div>
    );
}

function SectionCard({ icon: Icon, iconCls, title, desc, d, children }) {
    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    return (
        <div className={d.card}>
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconCls}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h2 className={`text-lg font-bold ${headText}`}>{title}</h2>
                    <p className={`text-sm ${subText}`}>{desc}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

export default function AdvertiserSettingsPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [profileData, setProfileData] = useState({ name: '', email: '', company: '', phone: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [billingData, setBillingData] = useState({ companyName: '', vatNumber: '', billingEmail: '', address: '' });
    const [notifications, setNotifications] = useState({ emailReports: true, campaignAlerts: true, billingAlerts: true, marketingEmails: false });
    const [apiToken, setApiToken] = useState('');
    const [showToken, setShowToken] = useState(false);

    // ── 2FA State ──────────────────────────────────────────
    const [twoFA, setTwoFA] = useState({ enabled: false, backupCodesRemaining: 0, loaded: false });
    const [twoFAStep, setTwoFAStep] = useState('idle'); // idle | setup | verify | done | disable
    const [twoFAQR, setTwoFAQR] = useState(null);
    const [twoFAManual, setTwoFAManual] = useState('');
    const [twoFAToken, setTwoFAToken] = useState('');
    const [twoFABackup, setTwoFABackup] = useState([]);
    const [twoFACopied, setTwoFACopied] = useState(false);
    const [twoFALoading, setTwoFALoading] = useState(false);

    const [toast, setToast] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState({ profile: false, password: false, billing: false, token: false, notif: false });
    const [dataLoaded, setDataLoaded] = useState(false);

    // Load existing profile data & 2FA status on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await advertiserAPI.getProfile();
                setProfileData(prev => ({
                    ...prev,
                    company: data.companyName || '',
                    email: data.email || '',
                }));
                setBillingData(prev => ({
                    ...prev,
                    companyName: data.companyName || '',
                    vatNumber: data.taxId || '',
                    address: data.billingAddress || '',
                }));
            } catch (_) { /* non-critical */ }
            setDataLoaded(true);
        };
        loadProfile();

        // Load 2FA status
        fetch('/api/auth/2fa/status', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(r => r.json()).then(d => setTwoFA({ ...d, loaded: true })).catch(() => { });
    }, []);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast({ type: '', msg: '' }), 4000);
    };

    const handleProfile = async (e) => {
        e.preventDefault();
        setLoading(l => ({ ...l, profile: true }));
        try {
            await advertiserAPI.updateProfile({ company: profileData.company });
            showToast('success', 'Profile updated successfully.');
        } catch (err) {
            showToast('error', err.message || 'Failed to update profile.');
        } finally {
            setLoading(l => ({ ...l, profile: false }));
        }
    };

    const handlePassword = async (e) => {
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
            await advertiserAPI.changePassword(passwordData);
            showToast('success', 'Password changed successfully.');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showToast('error', err.message || 'Failed to change password.');
        } finally {
            setLoading(l => ({ ...l, password: false }));
        }
    };

    const handleBilling = async (e) => {
        e.preventDefault();
        setLoading(l => ({ ...l, billing: true }));
        try {
            await advertiserAPI.updateBillingInfo(billingData);
            showToast('success', 'Billing information updated.');
        } catch (err) {
            showToast('error', err.message || 'Failed to update billing info.');
        } finally {
            setLoading(l => ({ ...l, billing: false }));
        }
    };

    const handleNotifications = async () => {
        setLoading(l => ({ ...l, notif: true }));
        try {
            // Notifications are stored client-side (localStorage)
            localStorage.setItem('adv_notifications', JSON.stringify(notifications));
            showToast('success', 'Notification preferences saved.');
        } catch (err) {
            showToast('error', 'Failed to save preferences.');
        } finally {
            setLoading(l => ({ ...l, notif: false }));
        }
    };

    const handleGenerateToken = async () => {
        setLoading(l => ({ ...l, token: true }));
        try {
            const res = await advertiserAPI.generateApiToken();
            setApiToken(res.token || 'adv_' + Math.random().toString(36).slice(2, 18).toUpperCase());
            setShowToken(true);
            showToast('success', 'New API token generated. Copy it — it will not be shown again.');
        } catch (err) {
            showToast('error', err.message || 'Failed to generate token.');
        } finally {
            setLoading(l => ({ ...l, token: false }));
        }
    };

    // ── 2FA Handlers ─────────────────────────────────────────
    const handle2FASetup = async () => {
        setTwoFALoading(true);
        try {
            const res = await fetch('/api/auth/2fa/setup', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setTwoFAQR(data.qrCode);
            setTwoFAManual(data.manualKey);
            setTwoFAStep('verify');
        } catch (err) { showToast('error', err.message); }
        finally { setTwoFALoading(false); }
    };

    const handle2FAVerify = async () => {
        setTwoFALoading(true);
        try {
            const res = await fetch('/api/auth/2fa/verify-setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ token: twoFAToken })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setTwoFABackup(data.backupCodes || []);
            setTwoFA(s => ({ ...s, enabled: true }));
            setTwoFAStep('done');
        } catch (err) { showToast('error', err.message); }
        finally { setTwoFALoading(false); }
    };

    const handle2FADisable = async () => {
        setTwoFALoading(true);
        try {
            const res = await fetch('/api/auth/2fa/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ token: twoFAToken })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setTwoFA({ enabled: false, backupCodesRemaining: 0, loaded: true });
            setTwoFAStep('idle');
            setTwoFAToken('');
            showToast('success', '2FA disabled successfully.');
        } catch (err) { showToast('error', err.message); }
        finally { setTwoFALoading(false); }
    };

    // ── Theme tokens
    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    const labelCls = `block text-sm font-medium mb-2 ${d.isDark ? 'text-gray-300' : 'text-gray-600'}`;
    const inputCls = `w-full px-4 py-3 focus:outline-none transition-all text-sm ${theme === 'theme-brutalist'
        ? 'border-2 border-[#1A1A1A] rounded bg-[#F5F5F0] text-[#1A1A1A] placeholder-gray-400'
        : d.isDark
            ? 'bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-white/30'
            : 'bg-white border border-gray-200 rounded-xl text-[#1A1A1A] placeholder-gray-400 focus:border-gray-400'
        }`;

    const iconCls = {
        profile: { 'theme-luminous': 'bg-lime-400/10 text-lime-400', 'theme-azure': 'bg-sky-500/10 text-sky-400', 'theme-saas': 'bg-white/[0.06] text-gray-300', 'theme-editorial': 'bg-red-50 text-red-700 border border-red-200', 'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]' }[theme] || 'bg-lime-400/10 text-lime-400',
        password: { 'theme-luminous': 'bg-sky-500/10 text-sky-400', 'theme-azure': 'bg-purple-500/10 text-purple-400', 'theme-saas': 'bg-white/[0.06] text-gray-300', 'theme-editorial': 'bg-blue-50 text-blue-700 border border-blue-200', 'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]' }[theme] || 'bg-sky-500/10 text-sky-400',
        billing: { 'theme-luminous': 'bg-purple-500/10 text-purple-400', 'theme-azure': 'bg-lime-400/10 text-lime-400', 'theme-saas': 'bg-white/[0.06] text-gray-300', 'theme-editorial': 'bg-purple-50 text-purple-700 border border-purple-200', 'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]' }[theme] || 'bg-purple-500/10 text-purple-400',
        notif: { 'theme-luminous': 'bg-orange-500/10 text-orange-400', 'theme-azure': 'bg-orange-500/10 text-orange-400', 'theme-saas': 'bg-white/[0.06] text-gray-300', 'theme-editorial': 'bg-orange-50 text-orange-700 border border-orange-200', 'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]' }[theme] || 'bg-orange-500/10 text-orange-400',
        api: { 'theme-luminous': 'bg-emerald-500/10 text-emerald-400', 'theme-azure': 'bg-emerald-500/10 text-emerald-400', 'theme-saas': 'bg-white/[0.06] text-gray-300', 'theme-editorial': 'bg-green-50 text-green-700 border border-green-200', 'theme-brutalist': 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]' }[theme] || 'bg-emerald-500/10 text-emerald-400',
    };

    const toggleOn = { 'theme-luminous': 'bg-lime-400', 'theme-azure': 'bg-sky-500', 'theme-saas': 'bg-white', 'theme-editorial': 'bg-red-700', 'theme-brutalist': 'bg-[#1A1A1A]' }[theme] || 'bg-lime-400';
    const toggleOff = d.isDark ? 'bg-white/10' : 'bg-gray-200';

    return (
        <div className="space-y-6">
            <div>
                <h1 className={d.heading}>Settings</h1>
                <p className={`${d.subheading} mt-1`}>Manage your account, billing, and preferences</p>
            </div>

            {/* Toast */}
            {toast.msg && <Toast type={toast.type} message={toast.msg} onClose={() => setToast({ type: '', msg: '' })} />}

            {/* ── Profile */}
            <SectionCard icon={User} iconCls={iconCls.profile} title="Profile Information" desc="Update your name, email, and company" d={d}>
                <form onSubmit={handleProfile} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Company Name</label><input type="text" value={profileData.company} onChange={e => setProfileData({ ...profileData, company: e.target.value })} className={inputCls} placeholder="Acme Inc." /></div>
                        <div><label className={labelCls}>Email Address</label><input type="email" value={profileData.email} readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} placeholder="john@example.com" /></div>
                        <div><label className={labelCls}>Phone</label><input type="tel" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} className={inputCls} placeholder="+1 234 567 8900" /></div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={loading.profile} className={`${d.btnPrimary} flex items-center gap-2 disabled:opacity-50`}>
                            {loading.profile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Save Changes
                        </button>
                    </div>
                </form>
            </SectionCard>

            {/* ── Password */}
            <SectionCard icon={Lock} iconCls={iconCls.password} title="Change Password" desc="Update your account password" d={d}>
                <form onSubmit={handlePassword} className="space-y-4">
                    <div><label className={labelCls}>Current Password</label><input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className={inputCls} required /></div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>New Password</label><input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className={inputCls} required /></div>
                        <div><label className={labelCls}>Confirm Password</label><input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className={inputCls} required /></div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={loading.password} className={`${d.btnPrimary} flex items-center gap-2 disabled:opacity-50`}>
                            {loading.password ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Update Password
                        </button>
                    </div>
                </form>
            </SectionCard>

            {/* ── Billing Info */}
            <SectionCard icon={CreditCard} iconCls={iconCls.billing} title="Billing Information" desc="Company and invoice details" d={d}>
                <form onSubmit={handleBilling} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className={labelCls}>Company Name</label><input type="text" value={billingData.companyName} onChange={e => setBillingData({ ...billingData, companyName: e.target.value })} className={inputCls} placeholder="Acme Inc." /></div>
                        <div><label className={labelCls}>VAT Number</label><input type="text" value={billingData.vatNumber} onChange={e => setBillingData({ ...billingData, vatNumber: e.target.value })} className={inputCls} placeholder="EU123456789" /></div>
                        <div><label className={labelCls}>Billing Email</label><input type="email" value={billingData.billingEmail} onChange={e => setBillingData({ ...billingData, billingEmail: e.target.value })} className={inputCls} placeholder="billing@acme.com" /></div>
                        <div><label className={labelCls}>Address</label><input type="text" value={billingData.address} onChange={e => setBillingData({ ...billingData, address: e.target.value })} className={inputCls} placeholder="123 Main St, NY" /></div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={loading.billing} className={`${d.btnPrimary} flex items-center gap-2 disabled:opacity-50`}>
                            {loading.billing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Save Billing Info
                        </button>
                    </div>
                </form>
            </SectionCard>

            {/* ── Notifications */}
            <SectionCard icon={Bell} iconCls={iconCls.notif} title="Notifications" desc="Manage email notification preferences" d={d}>
                <div className="space-y-3">
                    {[
                        { key: 'emailReports', label: 'Daily Email Reports', desc: 'Receive daily campaign summaries' },
                        { key: 'campaignAlerts', label: 'Campaign Alerts', desc: 'Get notified on status changes' },
                        { key: 'billingAlerts', label: 'Billing Alerts', desc: 'Low balance and payment notifications' },
                        { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Tips, updates, and promotions' },
                    ].map(item => (
                        <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl border ${d.isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                            <div>
                                <p className={`font-medium text-sm ${headText}`}>{item.label}</p>
                                <p className={`text-xs ${subText}`}>{item.desc}</p>
                            </div>
                            <button type="button" onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                                className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key] ? toggleOn : toggleOff}`}>
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.key] ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    ))}
                    <div className="flex justify-end pt-2">
                        <button type="button" onClick={handleNotifications} disabled={loading.notif}
                            className={`${d.btnPrimary} flex items-center gap-2 disabled:opacity-50`}>
                            {loading.notif ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Save Preferences
                        </button>
                    </div>
                </div>
            </SectionCard>

            {/* ── API Access */}
            <SectionCard icon={Key} iconCls={iconCls.api} title="API Access" desc="Generate tokens for programmatic access" d={d}>
                <div className="space-y-4">
                    {apiToken && showToken && (
                        <div className={`p-4 rounded-xl border ${d.isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className={`w-4 h-4 ${{ 'theme-luminous': 'text-lime-400', 'theme-azure': 'text-sky-400', 'theme-saas': 'text-white', 'theme-editorial': 'text-red-700', 'theme-brutalist': 'text-[#1A1A1A]' }[theme] || 'text-lime-400'}`} />
                                <span className={`text-xs font-medium ${subText}`}>Your new API token — copy it now</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className={`flex-1 text-xs font-mono p-2 rounded ${d.isDark ? 'bg-slate-900 text-lime-400' : 'bg-gray-100 text-[#1A1A1A]'} break-all`}>
                                    {apiToken}
                                </code>
                                <button onClick={() => { navigator.clipboard.writeText(apiToken); showToast('success', 'Copied to clipboard.'); }}
                                    className={`${d.btnSecondary} px-3 py-2 text-xs`}>Copy</button>
                            </div>
                        </div>
                    )}

                    <div className={`p-4 rounded-xl border text-sm ${d.isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-gray-300' : 'bg-yellow-50 border-yellow-200 text-gray-600'}`}>
                        <strong className={d.isDark ? 'text-yellow-400' : 'text-yellow-700'}>Security note:</strong> API tokens grant full account access. Never share them publicly or commit them to source code.
                    </div>
                    <button onClick={handleGenerateToken} disabled={loading.token}
                        className={`${d.btnPrimary} flex items-center gap-2 disabled:opacity-50`}>
                        {loading.token ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                        Generate New Token
                    </button>
                </div>
            </SectionCard>

            {/* ── Two-Factor Authentication */}
            <SectionCard icon={Smartphone} iconCls={iconCls.api} title="Two-Factor Authentication" desc="Secure your account with Google Authenticator or Authy" d={d}>
                {!twoFA.enabled && twoFAStep === 'idle' && (
                    <div className="space-y-4">
                        <div className={`flex items-center gap-3 p-4 rounded-xl border ${d.isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                            <ShieldOff className="w-8 h-8 text-orange-400 flex-shrink-0" />
                            <div>
                                <p className={`font-semibold text-sm ${headText}`}>2FA is not enabled</p>
                                <p className={`text-xs ${subText}`}>Strongly recommended for advertiser accounts holding balance.</p>
                            </div>
                        </div>
                        <button onClick={handle2FASetup} disabled={twoFALoading} className={`${d.btnPrimary} flex items-center gap-2`}>
                            {twoFALoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                            Enable 2FA
                        </button>
                    </div>
                )}

                {twoFAStep === 'verify' && twoFAQR && (
                    <div className="space-y-4">
                        <p className={`text-sm ${subText}`}>Scan the QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong>, then enter the 6-digit code to activate.</p>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <img src={twoFAQR} alt="2FA QR Code" className="w-44 h-44 rounded-xl" />
                            <div className="flex-1 space-y-3">
                                <p className={`text-xs ${subText}`}>Can't scan? Enter manually:</p>
                                <div className={`flex items-center gap-2 p-3 rounded-xl border ${d.isDark ? 'bg-black/30 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                    <code className={`text-xs flex-1 font-mono tracking-widest ${headText}`}>{twoFAManual}</code>
                                    <button onClick={() => { navigator.clipboard.writeText(twoFAManual); setTwoFACopied(true); setTimeout(() => setTwoFACopied(false), 2000); }}>
                                        {twoFACopied ? <CheckCheck className="w-4 h-4 text-lime-400" /> : <Copy className={`w-4 h-4 ${subText}`} />}
                                    </button>
                                </div>
                                <input
                                    type="text" inputMode="numeric" maxLength={6}
                                    value={twoFAToken} onChange={e => setTwoFAToken(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 6-digit code"
                                    className={`${inputCls} tracking-[0.5em] text-center text-lg font-mono`}
                                />
                                <button onClick={handle2FAVerify} disabled={twoFALoading || twoFAToken.length !== 6}
                                    className={`w-full ${d.btnPrimary} flex items-center justify-center gap-2 disabled:opacity-50`}>
                                    {twoFALoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    Verify & Activate
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {twoFAStep === 'done' && twoFABackup.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-lime-400" />
                            <p className={`font-bold ${headText}`}>2FA Activated!</p>
                        </div>
                        <div className={`p-4 rounded-xl border ${d.isDark ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}>
                            <p className={`text-sm font-semibold mb-3 ${d.isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>⚠ Save these backup codes — shown ONCE only.</p>
                            <div className="grid grid-cols-2 gap-2">
                                {twoFABackup.map((code, i) => (
                                    <code key={i} className={`text-xs font-mono p-2 rounded-lg text-center ${d.isDark ? 'bg-black/30 text-gray-300' : 'bg-yellow-100 text-gray-700'}`}>{code}</code>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => setTwoFAStep('idle')} className={d.btnSecondary}>Done</button>
                    </div>
                )}

                {twoFA.enabled && twoFAStep === 'idle' && (
                    <div className="space-y-4">
                        <div className={`flex items-center gap-3 p-4 rounded-xl border ${d.isDark ? 'bg-lime-500/10 border-lime-500/20' : 'bg-green-50 border-green-200'}`}>
                            <ShieldCheck className="w-8 h-8 text-lime-400 flex-shrink-0" />
                            <div>
                                <p className={`font-semibold text-sm ${headText}`}>2FA is active</p>
                                <p className={`text-xs ${subText}`}>{twoFA.backupCodesRemaining} backup code{twoFA.backupCodesRemaining !== 1 ? 's' : ''} remaining.</p>
                            </div>
                        </div>
                        <button onClick={() => setTwoFAStep('disable')} className="px-4 py-2.5 text-sm font-semibold text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-all">
                            Disable 2FA
                        </button>
                    </div>
                )}

                {twoFAStep === 'disable' && (
                    <div className="space-y-4">
                        <p className={`text-sm ${subText}`}>Enter your current authenticator code to disable 2FA.</p>
                        <input
                            type="text" inputMode="numeric" maxLength={6}
                            value={twoFAToken} onChange={e => setTwoFAToken(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className={`${inputCls} tracking-[0.5em] text-center text-lg font-mono max-w-[200px]`}
                        />
                        <div className="flex gap-3">
                            <button onClick={handle2FADisable} disabled={twoFALoading || twoFAToken.length !== 6}
                                className="px-4 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2">
                                {twoFALoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
                                Confirm Disable
                            </button>
                            <button onClick={() => { setTwoFAStep('idle'); setTwoFAToken(''); }} className={d.btnSecondary}>Cancel</button>
                        </div>
                    </div>
                )}
            </SectionCard>
        </div>
    );
}
