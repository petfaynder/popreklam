'use client';

import Link from 'next/link';
import { Zap, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useResetPasswordForm } from '@/hooks/useAuthForms';

export default function LuminousResetPassword() {
    const { formData, loading, error, success, handleChange, handleSubmit } = useResetPasswordForm();

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 text-white">
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-lime-400/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="w-full max-w-md relative z-10 px-4">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2"><div className="w-10 h-10 bg-lime-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(163,255,51,0.3)]"><Zap className="w-6 h-6 text-slate-900 fill-current" /></div><span className="text-2xl font-bold tracking-tight">MrPop.io</span></Link>
                </div>
                <div className="p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-white/[0.03]">
                    {!success ? (
                        <>
                            <div className="text-center mb-8"><h1 className="text-2xl font-bold mb-2">Set New Password</h1><p className="text-gray-400 text-sm">Choose a strong password for your account</p></div>
                            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3"><AlertCircle className="w-5 h-5" /> {error}</div>}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2"><label className="text-sm font-medium text-gray-300 ml-1">New Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all" placeholder="••••••••" required minLength={6} /></div>
                                <div className="space-y-2"><label className="text-sm font-medium text-gray-300 ml-1">Confirm Password</label>
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all" placeholder="••••••••" required /></div>
                                <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-xl font-bold text-slate-900 flex items-center justify-center gap-2 transition-all ${loading ? 'bg-lime-400/70 cursor-not-allowed' : 'bg-lime-400 hover:bg-lime-300 shadow-[0_0_20px_rgba(163,255,51,0.3)]'}`}>
                                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Resetting...</> : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-lime-400" /></div>
                            <h2 className="text-xl font-bold mb-2">Password Reset!</h2>
                            <p className="text-gray-400 text-sm">Redirecting to login...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
