'use client';

import Link from 'next/link';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useResetPasswordForm } from '@/hooks/useAuthForms';

export default function BrutalistResetPassword() {
    const { formData, loading, error, success, handleChange, handleSubmit } = useResetPasswordForm();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block border-2 border-foreground px-6 py-2 font-black text-3xl uppercase tracking-tighter shadow-[4px_4px_0px_0px_var(--color-foreground)]">MrPop.io</Link>
                </div>
                <div className="border-2 border-foreground bg-card shadow-[8px_8px_0px_0px_var(--color-foreground)]">
                    <div className="border-b-2 border-foreground p-6 bg-foreground text-background"><h1 className="text-2xl font-black uppercase tracking-wider">New Password</h1></div>
                    <div className="p-8">
                        {!success ? (
                            <>
                                {error && <div className="mb-6 p-4 border-2 border-red-500 bg-red-50 text-red-700 text-sm font-bold flex items-center gap-3"><AlertCircle className="w-5 h-5" /> {error}</div>}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-wider mb-2">New Password</label>
                                        <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border-2 border-foreground bg-background font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" required minLength={6} /></div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-wider mb-2">Confirm Password</label>
                                        <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border-2 border-foreground bg-background font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" required /></div>
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full py-4 bg-foreground text-background font-black uppercase tracking-widest border-2 border-foreground hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[4px_4px_0px_0px_var(--color-accent)]">
                                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Resetting...</> : 'Reset Password'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8" /></div>
                                <h2 className="text-xl font-black uppercase mb-2">Password Reset!</h2>
                                <p className="text-sm text-gray-500 font-bold">Redirecting to login...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
