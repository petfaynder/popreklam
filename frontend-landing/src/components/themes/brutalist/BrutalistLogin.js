'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle2, Briefcase, Target, Smartphone, X } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useLoginForm } from '@/hooks/useAuthForms';

export default function BrutalistLogin() {
    const {
        role, setRole, formData, loading, error,
        handleChange, handleSubmit, setRecaptchaToken,
        twoFARequired, twoFAToken, setTwoFAToken, handleTwoFA, cancelTwoFA,
    } = useLoginForm();
    const [siteKey, setSiteKey] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/auth/public-settings');
                const data = await response.json();
                if (data.recaptcha_site_key) setSiteKey(data.recaptcha_site_key);
            } catch (err) {
                console.error("Failed to fetch public settings", err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen flex bg-background text-foreground">
            {/* Left — Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16">
                <div className="max-w-md mx-auto w-full">
                    <div className="mb-8">
                        <Link href="/" className="inline-block border-2 border-foreground px-4 py-1 font-black text-xl uppercase tracking-tighter hover:bg-primary hover:text-white transition-colors shadow-[4px_4px_0px_0px_var(--color-foreground)]">
                            MrPop.io
                        </Link>
                    </div>

                    {/* ── 2FA Challenge Screen ─────────────────────────────── */}
                    {twoFARequired ? (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center bg-primary/10">
                                    <Smartphone className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black uppercase">2FA Verification</h1>
                                    <p className="text-gray-500 font-bold text-xs uppercase">Enter code from your authenticator app.</p>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 border-2 border-red-500 bg-red-50 flex items-center gap-3 text-red-700 text-sm font-bold">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                                </div>
                            )}

                            <input
                                type="text" inputMode="numeric" maxLength={6}
                                value={twoFAToken}
                                onChange={e => setTwoFAToken(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full py-4 text-center text-4xl font-black tracking-[0.5em] border-2 border-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                                autoFocus
                            />

                            <button onClick={handleTwoFA} disabled={loading || twoFAToken.length !== 6}
                                className="w-full py-4 font-black uppercase tracking-widest border-2 border-foreground bg-primary text-white flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_var(--color-accent)] hover:bg-red-600 disabled:opacity-50 mb-3">
                                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : <>Verify &amp; Sign In <ArrowRight className="w-5 h-5" /></>}
                            </button>

                            <button onClick={cancelTwoFA} className="w-full py-3 font-bold uppercase text-sm flex items-center justify-center gap-2 text-gray-500 hover:text-foreground transition-colors">
                                <X className="w-4 h-4" /> Cancel
                            </button>
                        </>
                    ) : (
                        /* ── Normal Login Form ──────────────────────────────── */
                        <>
                            <h1 className="text-3xl font-black uppercase mb-1">Sign In</h1>
                            <p className="text-gray-500 font-bold text-sm mb-8">ACCESS YOUR DASHBOARD.</p>

                            {error && (
                                <div className="mb-6 p-4 border-2 border-red-500 bg-red-50 flex items-center gap-3 text-red-700 text-sm font-bold">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                                </div>
                            )}

                            {/* Role Toggle */}
                            <div className="grid grid-cols-2 gap-0 mb-8 border-2 border-foreground">
                                <button onClick={() => setRole('publisher')} type="button"
                                    className={`flex items-center justify-center gap-2 py-3 font-black uppercase text-sm transition-all border-r-2 border-foreground ${role === 'publisher' ? 'bg-foreground text-background' : 'bg-background text-foreground hover:bg-gray-100'}`}>
                                    <Briefcase className="w-4 h-4" /> Publisher
                                </button>
                                <button onClick={() => setRole('advertiser')} type="button"
                                    className={`flex items-center justify-center gap-2 py-3 font-black uppercase text-sm transition-all ${role === 'advertiser' ? 'bg-primary text-white' : 'bg-background text-foreground hover:bg-gray-100'}`}>
                                    <Target className="w-4 h-4" /> Advertiser
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-foreground bg-background font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="name@company.com" required />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-black uppercase tracking-wider">Password</label>
                                        <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline uppercase">Forgot?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="password" name="password" value={formData.password} onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-foreground bg-background font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="••••••••" required />
                                    </div>
                                </div>

                                {siteKey && (
                                    <div className="flex justify-center my-4 overflow-hidden border-2 border-foreground">
                                        <ReCAPTCHA sitekey={siteKey} onChange={(token) => setRecaptchaToken(token)} theme="light" />
                                    </div>
                                )}

                                <button type="submit" disabled={loading}
                                    className={`w-full py-4 font-black uppercase tracking-widest border-2 border-foreground flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_var(--color-accent)] ${role === 'publisher' ? 'bg-foreground text-background hover:bg-primary hover:text-white' : 'bg-primary text-white hover:bg-red-600'} disabled:opacity-50`}>
                                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing In...</> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t-2 border-foreground text-center">
                                <p className="text-sm font-bold">No account? <Link href="/register" className="text-primary underline uppercase">Register Now</Link></p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right — Side Panel */}
            <div className="hidden lg:flex w-1/2 bg-foreground text-background items-center justify-center p-16 relative overflow-hidden">
                <div className="absolute top-8 right-8 w-24 h-24 border-4 border-primary rotate-12"></div>
                <div className="absolute bottom-12 left-12 w-16 h-16 bg-primary"></div>
                <div className="relative z-10 max-w-lg">
                    {twoFARequired ? (
                        <>
                            <h2 className="text-5xl font-black uppercase leading-tight mb-8">SECURE<br />ACCESS</h2>
                            <p className="font-bold text-background/70 text-sm uppercase">Your account is protected with two-factor authentication. Enter the code from your authenticator app to continue.</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-5xl font-black uppercase leading-tight mb-8">
                                {role === 'publisher' ? 'YOUR REVENUE\nAWAITS' : 'REACH YOUR\nAUDIENCE'}
                            </h2>
                            <div className="space-y-4">
                                {(role === 'publisher'
                                    ? ['Weekly payouts via PayPal, Wire, Bitcoin', '100% Fill rate for all geos', 'Anti-AdBlock technology', 'Real-time earnings dashboard']
                                    : ['High-quality direct traffic', 'Advanced geo & device targeting', 'Real-time bidding (RTB)', 'Fraud protection included']
                                ).map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 border-2 border-background/20">
                                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                                        <span className="font-bold text-sm uppercase">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
