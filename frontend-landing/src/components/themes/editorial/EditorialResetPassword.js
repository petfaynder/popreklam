'use client';

import Link from 'next/link';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useResetPasswordForm } from '@/hooks/useAuthForms';

export default function EditorialResetPassword() {
    const { formData, loading, error, success, handleChange, handleSubmit } = useResetPasswordForm();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F6] text-[#1A1A1A] p-4" style={{ fontFamily: 'var(--font-serif)' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <Link href="/" className="text-4xl font-black tracking-tight hover:text-red-700 transition-colors">The PR Journal</Link>
                    <div className="w-16 h-0.5 bg-red-700 mx-auto mt-3"></div>
                </div>
                <div className="bg-white border border-gray-300 shadow-sm">
                    <div className="border-b border-gray-300 p-6"><h1 className="text-2xl font-bold">Set New Password</h1></div>
                    <div className="p-8" style={{ fontFamily: 'var(--font-sans)' }}>
                        {!success ? (
                            <>
                                {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm flex items-center gap-3"><AlertCircle className="w-5 h-5" /> {error}</div>}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div><label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">New Password</label>
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 bg-[#FBF9F6] text-sm focus:outline-none focus:border-red-700 transition-all" placeholder="••••••••" required minLength={6} /></div>
                                    <div><label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Confirm Password</label>
                                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 bg-[#FBF9F6] text-sm focus:outline-none focus:border-red-700 transition-all" placeholder="••••••••" required /></div>
                                    <button type="submit" disabled={loading} className="w-full py-3 bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Password Reset!</h2>
                                <p className="text-sm text-gray-500">Redirecting to login...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
