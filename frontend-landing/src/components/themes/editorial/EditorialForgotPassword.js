'use client';

import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useForgotPasswordForm } from '@/hooks/useAuthForms';

export default function EditorialForgotPassword() {
    const { email, setEmail, loading, error, success, handleSubmit } = useForgotPasswordForm();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F6] text-[#1A1A1A] p-4" style={{ fontFamily: 'var(--font-serif)' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <Link href="/" className="text-4xl font-black tracking-tight hover:text-red-700 transition-colors">The PR Journal</Link>
                    <div className="w-16 h-0.5 bg-red-700 mx-auto mt-3"></div>
                </div>
                <div className="bg-white border border-gray-300 shadow-sm">
                    <div className="border-b border-gray-300 p-6"><h1 className="text-2xl font-bold">Password Recovery</h1></div>
                    <div className="p-8" style={{ fontFamily: 'var(--font-sans)' }}>
                        {!success ? (
                            <>
                                <p className="text-sm text-gray-500 mb-6">Enter your email below to receive a password reset link.</p>
                                {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm flex items-center gap-3"><AlertCircle className="w-5 h-5" /> {error}</div>}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 bg-[#FBF9F6] text-sm focus:outline-none focus:border-red-700 transition-all" placeholder="name@company.com" required />
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full py-3 bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Check Your Email</h2>
                                <p className="text-sm text-gray-500">Reset link sent to <span className="font-bold text-[#1A1A1A]">{email}</span></p>
                            </div>
                        )}
                        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-700 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
