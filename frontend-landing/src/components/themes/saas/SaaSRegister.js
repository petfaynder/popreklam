'use client';

import Link from 'next/link';
import { Mail, Lock, User, Globe, ArrowRight, AlertCircle, Loader2, CheckCircle2, Briefcase, Target } from 'lucide-react';
import { useRegisterForm } from '@/hooks/useAuthForms';

export default function SaaSRegister() {
    const { role, setRole, formData, loading, error, handleChange, handleSubmit } = useRegisterForm();

    return (
        <div className="min-h-screen flex bg-[#09090B] text-white" style={{ fontFamily: 'var(--font-sans)' }}>
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 overflow-y-auto max-h-screen relative z-10">
                <div className="max-w-md mx-auto w-full">
                    <div className="mb-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center"><div className="w-3.5 h-3.5 bg-[#09090B] rounded-sm"></div></div>
                            <span className="text-[15px] font-semibold tracking-tight">MrPop.io</span>
                        </Link>
                    </div>

                    <h1 className="text-2xl font-bold mb-1">Create your account</h1>
                    <p className="text-gray-500 text-sm mb-8">Start maximizing your revenue in minutes</p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-8 p-1 bg-white/5 rounded-xl border border-white/10">
                        <button onClick={() => setRole('publisher')} type="button"
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === 'publisher' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>
                            <Briefcase className="w-4 h-4" /> Publisher
                        </button>
                        <button onClick={() => setRole('advertiser')} type="button"
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === 'advertiser' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>
                            <Target className="w-4 h-4" /> Advertiser
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[13px] font-medium text-gray-400 mb-1.5 block">First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all" placeholder="John" required />
                            </div>
                            <div>
                                <label className="text-[13px] font-medium text-gray-400 mb-1.5 block">Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all" placeholder="Doe" required />
                            </div>
                        </div>

                        <div>
                            <label className="text-[13px] font-medium text-gray-400 mb-1.5 block">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all" placeholder="name@company.com" required />
                        </div>

                        <div>
                            <label className="text-[13px] font-medium text-gray-400 mb-1.5 block">{role === 'publisher' ? 'Website URL' : 'Company Name'}</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all" placeholder={role === 'publisher' ? 'https://example.com' : 'Acme Inc.'} />
                        </div>

                        <div>
                            <label className="text-[13px] font-medium text-gray-400 mb-1.5 block">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all" placeholder="••••••••" required minLength={6} />
                        </div>

                        <div className="flex items-start gap-3 pt-1">
                            <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-white/5" required />
                            <p className="text-[12px] text-gray-500">
                                I agree to the <Link href="/terms" className="text-white hover:text-gray-300 underline">Terms</Link> and <Link href="/privacy" className="text-white hover:text-gray-300 underline">Privacy Policy</Link>.
                            </p>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-gray-500">Already have an account? <Link href="/login" className="text-white font-semibold">Sign in</Link></p>
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden border-l border-white/5">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px]"></div>
                <div className="relative z-10 max-w-lg p-12">
                    <h2 className="text-3xl font-bold mb-8 leading-tight">{role === 'publisher' ? 'Monetize your traffic with top rates' : 'Reach your target audience globally'}</h2>
                    <div className="space-y-3">
                        {(role === 'publisher'
                            ? ['Weekly payouts via PayPal, Wire, Bitcoin', '100% Fill rate for all geos', 'Anti-AdBlock technology included', '24/7 Dedicated support']
                            : ['High-quality direct traffic', 'Advanced targeting', 'Real-time bidding (RTB)', 'Fraud protection included']
                        ).map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" /> <span className="text-sm text-gray-300">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
