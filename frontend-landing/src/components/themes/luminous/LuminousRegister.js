'use client';

import Link from 'next/link';
import { Zap, Mail, Lock, User, Globe, ArrowRight, AlertCircle, Loader2, CheckCircle2, Briefcase, Target } from 'lucide-react';
import { useRegisterForm } from '@/hooks/useAuthForms';

export default function LuminousRegister() {
    const { role, setRole, formData, loading, error, handleChange, handleSubmit } = useRegisterForm();

    return (
        <div className="min-h-screen flex relative overflow-hidden bg-slate-950 text-white selection:bg-lime-400 selection:text-slate-900">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-lime-400/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 relative z-10 overflow-y-auto max-h-screen">
                <div className="max-w-md mx-auto w-full">
                    <div className="mb-8">
                        <Link href="/" className="flex items-center gap-2 group w-fit">
                            <div className="w-10 h-10 bg-lime-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(163,255,51,0.3)]">
                                <Zap className="w-6 h-6 text-slate-900 fill-current" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">MrPop.io</span>
                        </Link>
                    </div>

                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-400 mb-8">Join thousands of users maximizing their revenue.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-8 p-1 bg-slate-900/50 rounded-2xl border border-white/10">
                        <button onClick={() => setRole('publisher')} type="button"
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${role === 'publisher' ? 'bg-lime-400 text-slate-900 shadow-[0_0_20px_rgba(163,255,51,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                            <Briefcase className="w-4 h-4" /> Publisher
                        </button>
                        <button onClick={() => setRole('advertiser')} type="button"
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${role === 'advertiser' ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                            <Target className="w-4 h-4" /> Advertiser
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all" placeholder="John" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all" placeholder="Doe" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all" placeholder="name@company.com" required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">{role === 'publisher' ? 'Website URL' : 'Company Name'}</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all" placeholder={role === 'publisher' ? 'https://example.com' : 'Acme Inc.'} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all" placeholder="••••••••" required minLength={6} />
                        </div>

                        <div className="flex items-start gap-3 pt-2">
                            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-600 text-lime-400 focus:ring-lime-400 bg-slate-900" required />
                            <p className="text-xs text-gray-400">
                                I agree to the <Link href="/terms" className="text-lime-400 hover:underline">Terms</Link> and <Link href="/privacy" className="text-lime-400 hover:underline">Privacy Policy</Link>.
                            </p>
                        </div>

                        <button type="submit" disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${role === 'publisher' ? 'bg-lime-400 text-slate-900 hover:bg-lime-300 shadow-[0_0_20px_rgba(163,255,51,0.2)]' : 'bg-sky-500 text-white hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]'}`}>
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-sm text-gray-400">Already have an account? <Link href="/login" className="text-lime-400 font-bold hover:text-lime-300 transition-colors">Sign in</Link></p>
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 to-blue-600/10"></div>
                <div className="relative z-10 max-w-lg p-12">
                    <h2 className="text-4xl font-bold leading-tight mb-6">{role === 'publisher' ? 'Monetize your traffic with highest rates' : 'Reach your target audience globally'}</h2>
                    <div className="space-y-4">
                        {(role === 'publisher'
                            ? ['Weekly payouts via PayPal, Wire, Bitcoin', '100% Fill rate for all geos', 'Anti-AdBlock technology', '24/7 Dedicated support']
                            : ['High-quality direct traffic', 'Advanced targeting', 'Real-time bidding (RTB)', 'Fraud protection included']
                        ).map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${role === 'publisher' ? 'text-lime-400' : 'text-sky-400'}`} /> <span className="font-medium text-gray-200">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
