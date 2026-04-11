'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Globe, ArrowRight, AlertCircle, Loader2, CheckCircle2, Briefcase, Target } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRegisterForm } from '@/hooks/useAuthForms';

export default function BrutalistRegister() {
    const { role, setRole, formData, loading, error, handleChange, handleSubmit, setRecaptchaToken } = useRegisterForm();
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
        <div className="min-h-screen flex bg-background text-foreground">
            {/* Left — Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 overflow-y-auto max-h-screen">
                <div className="max-w-md mx-auto w-full">
                    <div className="mb-8">
                        <Link href="/" className="inline-block border-2 border-foreground px-4 py-1 font-black text-xl uppercase tracking-tighter hover:bg-primary hover:text-white transition-colors shadow-[4px_4px_0px_0px_var(--color-foreground)]">
                            PopReklam
                        </Link>
                    </div>

                    <h1 className="text-3xl font-black uppercase mb-1">Create Account</h1>
                    <p className="text-gray-500 font-bold text-sm mb-8">START MONETIZING TODAY.</p>

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

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-foreground bg-background font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="John" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-foreground bg-background font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Doe" required />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-foreground bg-background font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="name@company.com" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2">{role === 'publisher' ? 'Website URL' : 'Company Name'}</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-foreground bg-background font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" placeholder={role === 'publisher' ? 'https://example.com' : 'Acme Inc.'} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="password" name="password" value={formData.password} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-foreground bg-background font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" required minLength={6} />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 pt-2">
                            <input type="checkbox" className="mt-1 w-4 h-4" required />
                            <p className="text-xs font-bold text-gray-500">
                                I agree to the <Link href="/terms" className="text-primary underline">Terms</Link> and <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
                            </p>
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

                        <button type="submit" disabled={loading}
                            className={`w-full py-4 font-black uppercase tracking-widest border-2 border-foreground flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_var(--color-accent)] ${role === 'publisher' ? 'bg-foreground text-background hover:bg-primary hover:text-white' : 'bg-primary text-white hover:bg-red-600'} disabled:opacity-50`}>
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t-2 border-foreground text-center">
                        <p className="text-sm font-bold">Already have an account? <Link href="/login" className="text-primary underline uppercase">Sign In</Link></p>
                    </div>
                </div>
            </div>

            {/* Right — Side Panel */}
            <div className="hidden lg:flex w-1/2 bg-foreground text-background items-center justify-center p-16 relative overflow-hidden">
                <div className="absolute top-8 right-8 w-24 h-24 border-4 border-primary rotate-12"></div>
                <div className="absolute bottom-12 left-12 w-16 h-16 bg-primary"></div>
                <div className="relative z-10 max-w-lg">
                    <h2 className="text-5xl font-black uppercase leading-tight mb-8">
                        {role === 'publisher' ? 'MONETIZE YOUR TRAFFIC' : 'REACH YOUR AUDIENCE'}
                    </h2>
                    <div className="space-y-4">
                        {(role === 'publisher'
                            ? ['Weekly payouts via PayPal, Wire, Bitcoin', '100% Fill rate for all geos', 'Anti-AdBlock technology', '24/7 Dedicated support']
                            : ['High-quality direct traffic', 'Advanced targeting', 'Real-time bidding (RTB)', 'Fraud protection included']
                        ).map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 border-2 border-background/20">
                                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                                <span className="font-bold text-sm uppercase">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
