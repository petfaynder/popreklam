'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useForgotPasswordForm } from '@/hooks/useAuthForms';

export default function BrutalistForgotPassword() {
    const { email, setEmail, loading, error, success, handleSubmit, setRecaptchaToken } = useForgotPasswordForm();
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
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block border-2 border-foreground px-6 py-2 font-black text-3xl uppercase tracking-tighter hover:bg-primary hover:text-white transition-colors shadow-[4px_4px_0px_0px_var(--color-foreground)]">MrPop.io</Link>
                </div>

                <div className="border-2 border-foreground bg-card shadow-[8px_8px_0px_0px_var(--color-foreground)]">
                    <div className="border-b-2 border-foreground p-6 bg-foreground text-background">
                        <h1 className="text-2xl font-black uppercase tracking-wider">Reset Password</h1>
                    </div>
                    <div className="p-8">
                        {!success ? (
                            <>
                                <p className="text-sm text-gray-500 font-bold mb-6">ENTER YOUR EMAIL TO RECEIVE A RESET LINK.</p>
                                {error && <div className="mb-6 p-4 border-2 border-red-500 bg-red-50 flex items-center gap-3 text-red-700 text-sm font-bold"><AlertCircle className="w-5 h-5" /> {error}</div>}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-wider mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 border-foreground bg-background font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="name@company.com" required />
                                        </div>
                                    </div>

                                    {siteKey && (
                                        <div className="flex justify-center my-4 overflow-hidden border-2 border-foreground">
                                            <ReCAPTCHA
                                                sitekey={siteKey}
                                                onChange={(token) => setRecaptchaToken(token)}
                                                theme="light"
                                            />
                                        </div>
                                    )}

                                    <button type="submit" disabled={loading} className="w-full py-4 bg-foreground text-background font-black uppercase tracking-widest border-2 border-foreground hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[4px_4px_0px_0px_var(--color-accent)]">
                                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : 'Send Reset Link'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8" /></div>
                                <h2 className="text-xl font-black uppercase mb-2">Check Your Email</h2>
                                <p className="text-sm text-gray-500 font-bold">We sent a reset link to <span className="text-foreground">{email}</span></p>
                            </div>
                        )}
                        <div className="mt-6 pt-6 border-t-2 border-foreground text-center">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
