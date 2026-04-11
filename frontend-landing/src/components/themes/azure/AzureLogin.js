'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Mail, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle2, Briefcase, Target, Smartphone, X } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useLoginForm } from '@/hooks/useAuthForms';

export default function AzureLogin() {
    const { role, setRole, formData, loading, error, handleChange, handleSubmit, setRecaptchaToken, twoFARequired, twoFAToken, setTwoFAToken, handleTwoFA, cancelTwoFA } = useLoginForm();
    const [siteKey, setSiteKey] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/public-settings`);
                const data = await response.json();
                if (data.recaptcha_site_key) {
                    setSiteKey(data.recaptcha_site_key);
                }
            } catch (err) {
                console.error("Failed to fetch public settings", err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 text-white selection:bg-sky-400 selection:text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]"></div>
            <div style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)' }} className="absolute inset-0 bg-[size:60px_60px]"></div>

            <div className="w-full max-w-md relative z-10 px-4">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)] group-hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all">
                            <Zap className="w-6 h-6 text-white fill-current" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">PopReklam</span>
                    </Link>
                </div>

                <div className="p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-white/[0.03]">
                    {twoFARequired ? (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center text-center mb-4">
                                <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)] mb-3">
                                    <Smartphone className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-xl font-bold">Two-Factor Auth</h2>
                                <p className="text-gray-400 text-sm mt-1">Enter the 6-digit code from your authenticator app.</p>
                            </div>
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                                </div>
                            )}
                            <input type="text" inputMode="numeric" maxLength={6} value={twoFAToken}
                                onChange={e => setTwoFAToken(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000" autoFocus
                                className="w-full py-4 text-center text-3xl font-bold tracking-[0.5em] bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-sky-500/50" />
                            <button onClick={handleTwoFA} disabled={loading || twoFAToken.length !== 6}
                                className="w-full py-3.5 rounded-xl font-bold text-white bg-sky-500 hover:bg-sky-400 flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : <>Verify &amp; Sign In <ArrowRight className="w-5 h-5" /></>}
                            </button>
                            <button onClick={cancelTwoFA} className="w-full py-2 text-sm text-gray-500 hover:text-sky-400 flex items-center justify-center gap-1 transition-colors">
                                <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                        </div>
                    ) : (<>
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-gray-400 text-sm">Sign in to your dashboard</p>
                    </div>

                    {/* Role Toggle */}
                    <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-white/5 rounded-xl">
                        <button onClick={() => setRole('publisher')} type="button"
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'publisher' ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'text-gray-400 hover:text-white'}`}>
                            <Briefcase className="w-4 h-4" /> Publisher
                        </button>
                        <button onClick={() => setRole('advertiser')} type="button"
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'advertiser' ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'text-gray-400 hover:text-white'}`}>
                            <Target className="w-4 h-4" /> Advertiser
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-sky-400 transition-colors" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                                    placeholder="name@company.com" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-gray-300">Password</label>
                                <Link href="/forgot-password" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-sky-400 transition-colors" />
                                <input type="password" name="password" value={formData.password} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                                    placeholder="••••••••" required />
                            </div>
                        </div>

                        {siteKey && (
                            <div className="flex justify-center my-4 overflow-hidden rounded-xl">
                                <ReCAPTCHA
                                    sitekey={siteKey}
                                    onChange={(token) => setRecaptchaToken(token)}
                                    theme="dark"
                                />
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${loading ? 'bg-sky-500/70 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]'}`}>
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing In...</> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>
                    </>)}

                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-sm text-gray-400">
                            Don&apos;t have an account? <Link href="/register" className="text-sky-400 font-bold hover:text-sky-300 transition-colors">Create free account</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-6 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Secure SSL</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Encrypted</span>
                </div>
            </div>
        </div>
    );
}
