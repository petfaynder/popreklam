'use client';

import Link from 'next/link';
import { Mail, Lock, User, Globe, ArrowRight, AlertCircle, Loader2, CheckCircle2, Briefcase, Target } from 'lucide-react';
import { useRegisterForm } from '@/hooks/useAuthForms';

export default function EditorialRegister() {
    const { role, setRole, formData, loading, error, handleChange, handleSubmit } = useRegisterForm();

    return (
        <div className="min-h-screen flex bg-[#FBF9F6] text-[#1A1A1A]" style={{ fontFamily: 'var(--font-serif)' }}>
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 overflow-y-auto max-h-screen">
                <div className="max-w-md mx-auto w-full">
                    <div className="mb-8">
                        <Link href="/" className="text-3xl font-black tracking-tight hover:text-red-700 transition-colors">The PR Journal</Link>
                        <div className="w-12 h-0.5 bg-red-700 mt-2"></div>
                    </div>

                    <h1 className="text-3xl font-bold mb-1">Create Account</h1>
                    <p className="text-gray-500 text-sm mb-8" style={{ fontFamily: 'var(--font-sans)' }}>Join the publishing community</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm flex items-center gap-3" style={{ fontFamily: 'var(--font-sans)' }}>
                            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-0 mb-8 border border-gray-300" style={{ fontFamily: 'var(--font-sans)' }}>
                        <button onClick={() => setRole('publisher')} type="button"
                            className={`flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all border-r border-gray-300 ${role === 'publisher' ? 'bg-[#1A1A1A] text-white' : 'bg-white hover:bg-gray-50'}`}>
                            <Briefcase className="w-3.5 h-3.5" /> Publisher
                        </button>
                        <button onClick={() => setRole('advertiser')} type="button"
                            className={`flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest transition-all ${role === 'advertiser' ? 'bg-red-700 text-white' : 'bg-white hover:bg-gray-50'}`}>
                            <Target className="w-3.5 h-3.5" /> Advertiser
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" style={{ fontFamily: 'var(--font-sans)' }}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 bg-[#FBF9F6] text-sm focus:outline-none focus:border-red-700 transition-all" placeholder="John" required />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 bg-[#FBF9F6] text-sm focus:outline-none focus:border-red-700 transition-all" placeholder="Doe" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 bg-[#FBF9F6] text-sm focus:outline-none focus:border-red-700 transition-all" placeholder="name@company.com" required />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{role === 'publisher' ? 'Website URL' : 'Company Name'}</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 bg-[#FBF9F6] text-sm focus:outline-none focus:border-red-700 transition-all" placeholder={role === 'publisher' ? 'https://example.com' : 'Acme Inc.'} />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 bg-[#FBF9F6] text-sm focus:outline-none focus:border-red-700 transition-all" placeholder="••••••••" required minLength={6} />
                        </div>

                        <div className="flex items-start gap-3 pt-1">
                            <input type="checkbox" className="mt-1 w-4 h-4" required />
                            <p className="text-xs text-gray-500">
                                I agree to the <Link href="/terms" className="text-red-700 font-bold hover:underline">Terms</Link> and <Link href="/privacy" className="text-red-700 font-bold hover:underline">Privacy Policy</Link>.
                            </p>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 text-center" style={{ fontFamily: 'var(--font-sans)' }}>
                        <p className="text-sm text-gray-500">Already a subscriber? <Link href="/login" className="text-red-700 font-bold hover:underline">Sign in</Link></p>
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 bg-[#1A1A1A] text-white items-center justify-center p-16 relative">
                <div className="relative z-10 max-w-lg">
                    <div className="text-xs font-black uppercase tracking-widest text-red-500 mb-4" style={{ fontFamily: 'var(--font-sans)' }}>Why Join Us</div>
                    <h2 className="text-4xl font-bold leading-tight mb-8">{role === 'publisher' ? 'Monetize your content with the highest rates' : 'Reach your target audience globally'}</h2>
                    <div className="space-y-4" style={{ fontFamily: 'var(--font-sans)' }}>
                        {(role === 'publisher'
                            ? ['Weekly payouts via PayPal, Wire, Bitcoin', '100% Fill rate for all geos', 'Anti-AdBlock technology', '24/7 Dedicated support']
                            : ['High-quality direct traffic', 'Advanced targeting', 'Real-time bidding (RTB)', 'Fraud protection included']
                        ).map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 border border-white/10 bg-white/5">
                                <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0" /> <span className="text-sm text-gray-300">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
