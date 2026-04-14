'use client';

import Link from 'next/link';
import { Zap, Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useForgotPasswordForm } from '@/hooks/useAuthForms';

export default function AzureForgotPassword() {
    const { email, setEmail, loading, error, success, handleSubmit } = useForgotPasswordForm();

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 text-white selection:bg-sky-400 selection:text-slate-900">
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]"></div>
            <div style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)' }} className="absolute inset-0 bg-[size:60px_60px]"></div>
            <div className="w-full max-w-md relative z-10 px-4">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)]"><Zap className="w-6 h-6 text-white fill-current" /></div>
                        <span className="text-2xl font-bold tracking-tight">MrPop.io</span>
                    </Link>
                </div>
                <div className="p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-white/[0.03]">
                    {!success ? (
                        <>
                            <div className="text-center mb-8"><h1 className="text-2xl font-bold mb-2">Forgot Password</h1><p className="text-gray-400 text-sm">Enter your email to receive a reset link</p></div>
                            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3"><AlertCircle className="w-5 h-5" /> {error}</div>}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-sky-400 transition-colors" />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all" placeholder="name@company.com" required />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${loading ? 'bg-sky-500/70 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]'}`}>
                                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-sky-400" /></div>
                            <h2 className="text-xl font-bold mb-2">Check Your Email</h2>
                            <p className="text-gray-400 text-sm">Reset link sent to <span className="text-sky-400 font-medium">{email}</span></p>
                        </div>
                    )}
                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
