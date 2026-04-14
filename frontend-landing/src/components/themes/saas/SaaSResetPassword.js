'use client';

import Link from 'next/link';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useResetPasswordForm } from '@/hooks/useAuthForms';

export default function SaaSResetPassword() {
    const { formData, loading, error, success, handleChange, handleSubmit } = useResetPasswordForm();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-white p-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px]"></div>
            <div className="w-full max-w-sm relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center"><div className="w-3.5 h-3.5 bg-[#09090B] rounded-sm"></div></div>
                        <span className="text-[15px] font-semibold tracking-tight">MrPop.io</span>
                    </Link>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur p-8">
                    {!success ? (
                        <>
                            <div className="text-center mb-6"><h1 className="text-xl font-bold mb-1">Set new password</h1><p className="text-sm text-gray-500">Choose a strong password</p></div>
                            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div><label className="text-[13px] font-medium text-gray-400 mb-1.5 block">New Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all" placeholder="••••••••" required minLength={6} /></div>
                                <div><label className="text-[13px] font-medium text-gray-400 mb-1.5 block">Confirm Password</label>
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all" placeholder="••••••••" required /></div>
                                <button type="submit" disabled={loading} className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-6 h-6 text-green-400" /></div>
                            <h2 className="text-lg font-bold mb-1">Password reset!</h2>
                            <p className="text-sm text-gray-500">Redirecting to login...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
