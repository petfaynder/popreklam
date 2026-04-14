'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle2, Briefcase, Target, Smartphone, X } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useLoginForm } from '@/hooks/useAuthForms';

export default function EditorialLogin() {
    const { role, setRole, formData, loading, error, handleChange, handleSubmit, setRecaptchaToken, twoFARequired, twoFAToken, setTwoFAToken, handleTwoFA, cancelTwoFA } = useLoginForm();
    const [siteKey, setSiteKey] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/auth/public-settings');
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
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F6] text-[#1A1A1A] p-4" style={{ fontFamily: 'var(--font-serif)' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <Link href="/" className="text-4xl font-black tracking-tight hover:text-red-700 transition-colors">The PR Journal</Link>
                    <div className="w-16 h-0.5 bg-red-700 mx-auto mt-3"></div>
                </div>

                <div className="bg-white border border-gray-300 shadow-sm">
                    <div className="border-b border-gray-300 p-6">
                        <h1 className="text-2xl font-bold">Subscriber Login</h1>
                        <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-sans)' }}>Access your publisher or advertiser dashboard</p>
                    </div>

                    <div className="p-8">
                        {twoFARequired ? (
                            <div className="space-y-4">
                                <div className="flex flex-col items-center text-center mb-4">
                                    <Smartphone className="w-10 h-10 text-red-700 mb-2" />
                                    <h2 className="text-xl font-bold">Two-Factor Authentication</h2>
                                    <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-sans)' }}>Enter the 6-digit code from your authenticator app.</p>
                                </div>
                                {error && (
                                    <div className="p-4 bg-red-50 border-l-4 border-red-600 flex items-center gap-3 text-red-700 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                                    </div>
                                )}
                                <input type="text" inputMode="numeric" maxLength={6} value={twoFAToken}
                                    onChange={e => setTwoFAToken(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000" autoFocus
                                    className="w-full py-3 text-center text-3xl font-bold tracking-[0.5em] border border-gray-300 bg-[#FBF9F6] focus:outline-none focus:border-red-700" />
                                <button onClick={handleTwoFA} disabled={loading || twoFAToken.length !== 6}
                                    className="w-full py-3 font-bold text-xs uppercase tracking-widest bg-red-700 text-white hover:bg-red-800 flex items-center justify-center gap-2 disabled:opacity-50">
                                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <>Verify &amp; Sign In <ArrowRight className="w-4 h-4" /></>}
                                </button>
                                <button onClick={cancelTwoFA} className="w-full py-2 text-sm text-gray-500 hover:text-red-700 flex items-center justify-center gap-1" style={{ fontFamily: 'var(--font-sans)' }}>
                                    <X className="w-3.5 h-3.5" /> Cancel
                                </button>
                            </div>
                        ) : (
                        <>{/* Role Toggle */}
                        <div className="grid grid-cols-2 gap-0 mb-6 border border-gray-300" style={{ fontFamily: 'var(--font-sans)' }}>
                            <button onClick={() => setRole('publisher')} type="button"
                                className={`flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all border-r border-gray-300 ${role === 'publisher' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                                <Briefcase className="w-3.5 h-3.5" /> Publisher
                            </button>
                            <button onClick={() => setRole('advertiser')} type="button"
                                className={`flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all ${role === 'advertiser' ? 'bg-red-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                                <Target className="w-3.5 h-3.5" /> Advertiser
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 flex items-center gap-3 text-red-700 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
                                <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 bg-[#FBF9F6] text-[#1A1A1A] text-sm focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-all"
                                        placeholder="name@company.com" required />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Password</label>
                                    <Link href="/forgot-password" className="text-xs text-red-700 hover:underline font-bold">Forgot?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="password" name="password" value={formData.password} onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 bg-[#FBF9F6] text-[#1A1A1A] text-sm focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-all"
                                        placeholder="••••••••" required />
                                </div>
                            </div>

                            {siteKey && (
                                <div className="flex justify-center my-4 overflow-hidden border border-gray-300">
                                    <ReCAPTCHA
                                        sitekey={siteKey}
                                        onChange={(token) => setRecaptchaToken(token)}
                                        theme="light"
                                    />
                                </div>
                            )}

                            <button type="submit" disabled={loading}
                                className={`w-full py-3 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${role === 'publisher' ? 'bg-[#1A1A1A] text-white hover:bg-red-700' : 'bg-red-700 text-white hover:bg-red-800'}`}>
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing In...</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </form>
                        </>)}

                        <div className="mt-8 pt-6 border-t border-gray-200 text-center" style={{ fontFamily: 'var(--font-sans)' }}>
                            <p className="text-sm text-gray-500">
                                New subscriber? <Link href="/register" className="text-red-700 font-bold hover:underline">Create account</Link>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-center gap-6 text-[10px] text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-sans)' }}>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Secure</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Encrypted</span>
                </div>
            </div>
        </div>
    );
}
