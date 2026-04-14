'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle2, Briefcase, Target, Smartphone, X } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useLoginForm } from '@/hooks/useAuthForms';

export default function SaaSLogin() {
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
        <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-white p-4 relative overflow-hidden" style={{ fontFamily: 'var(--font-sans)' }}>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px]"></div>

            <div className="w-full max-w-sm relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center"><div className="w-3.5 h-3.5 bg-[#09090B] rounded-sm"></div></div>
                        <span className="text-[15px] font-semibold tracking-tight">MrPop.io</span>
                    </Link>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur p-8">
                    {twoFARequired ? (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center text-center mb-2">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                                    <Smartphone className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-xl font-bold mb-1">Two-Factor Authentication</h1>
                                <p className="text-sm text-gray-500">Enter the 6-digit code from your authenticator app.</p>
                            </div>
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                                </div>
                            )}
                            <input type="text" inputMode="numeric" maxLength={6} value={twoFAToken}
                                onChange={e => setTwoFAToken(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000" autoFocus
                                className="w-full py-3 text-center text-3xl font-bold tracking-[0.5em] bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20" />
                            <button onClick={handleTwoFA} disabled={loading || twoFAToken.length !== 6}
                                className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <>Verify &amp; Sign In <ArrowRight className="w-4 h-4" /></>}
                            </button>
                            <button onClick={cancelTwoFA} className="w-full py-2 text-sm text-gray-500 hover:text-white flex items-center justify-center gap-1 transition-colors">
                                <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                        </div>
                    ) : (
                    <div>
                        <div className="text-center mb-6">
                            <h1 className="text-xl font-bold mb-1">Welcome back</h1>
                            <p className="text-sm text-gray-500">Sign in to your account</p>
                        </div>

                        {/* Role Toggle */}
                        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-white/5 rounded-lg">
                            <button onClick={() => setRole('publisher')} type="button"
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${role === 'publisher' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                                <Briefcase className="w-3.5 h-3.5" /> Publisher
                            </button>
                            <button onClick={() => setRole('advertiser')} type="button"
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${role === 'advertiser' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                                <Target className="w-3.5 h-3.5" /> Advertiser
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[13px] font-medium text-gray-400 mb-1.5 block">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                                        placeholder="name@company.com" required />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <label className="text-[13px] font-medium text-gray-400">Password</label>
                                    <Link href="/forgot-password" className="text-[12px] text-gray-500 hover:text-white transition-colors">Forgot?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input type="password" name="password" value={formData.password} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
                                        placeholder="••••••••" required />
                                </div>
                            </div>

                            {siteKey && (
                                <div className="flex justify-center my-4 overflow-hidden rounded-lg">
                                    <ReCAPTCHA
                                        sitekey={siteKey}
                                        onChange={(token) => setRecaptchaToken(token)}
                                        theme="dark"
                                    />
                                </div>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-6">
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </form>
                    </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-gray-500">
                            No account? <Link href="/register" className="text-white font-semibold hover:text-gray-300 transition-colors">Create one</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-center gap-6 text-[11px] text-gray-600">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> SSL Secure</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Encrypted</span>
                </div>
            </div>
        </div>
    );
}
