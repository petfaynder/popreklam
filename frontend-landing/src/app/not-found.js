'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft, HelpCircle, Zap, AlertTriangle, FileQuestion, Compass } from 'lucide-react';
import useTheme from '@/hooks/useTheme';
import { getThemeClasses } from '@/lib/themeUtils';

export default function NotFound() {
    const theme = useTheme();
    const t = getThemeClasses(theme);

    // Theme-specific configuration
    const isBrutalist = theme === 'theme-brutalist';
    const isEditorial = theme === 'theme-editorial';
    const isSaas = theme === 'theme-saas';
    const isLuminous = theme === 'theme-luminous';
    const isAzure = theme === 'theme-azure';

    const quickLinks = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/for-publishers', label: 'Publishers', icon: null },
        { href: '/for-advertisers', label: 'Advertisers', icon: null },
        { href: '/contact', label: 'Support', icon: HelpCircle },
    ];

    if (isBrutalist) {
        return (
            <div className={`min-h-screen ${t.pageBg} flex flex-col items-center justify-center p-6 relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="relative z-10 max-w-2xl w-full text-center border-4 border-black bg-white p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-black text-white text-4xl font-black uppercase inline-block px-6 py-2 mb-8 transform -rotate-2">
                        Error 404
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-6 tracking-tighter">
                        PAGE NOT FOUND
                    </h1>
                    <p className="text-xl font-bold border-y-4 border-black py-4 mb-8 bg-yellow-400">
                        The content you are looking for has been moved or deleted.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="px-8 py-4 bg-black text-white font-black uppercase tracking-wider hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(128,128,128,1)]">
                            Back to Home
                        </Link>
                        <button onClick={() => window.history.back()} className="px-8 py-4 bg-white text-black border-4 border-black font-black uppercase tracking-wider hover:bg-gray-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isEditorial) {
        return (
            <div className={`min-h-screen ${t.pageBg} flex flex-col items-center justify-center p-6 bg-[#FBF9F6]`}>
                <div className="max-w-3xl w-full border-t border-b border-black py-12 text-center">
                    <div className="font-serif text-sm italic mb-4 text-gray-500">Vol. 404 — The Missing Page</div>
                    <h1 className="font-serif text-6xl md:text-8xl font-bold mb-6 tracking-tight text-[#1A1A1A]">
                        Page Not Found
                    </h1>
                    <div className="w-24 h-1 bg-red-700 mx-auto mb-8"></div>
                    <p className="font-serif text-2xl text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed">
                        "We apologize for the inconvenience, but the article or page you requested could not be located in our archives."
                    </p>
                    <div className="flex items-center justify-center gap-6">
                        <Link href="/" className="text-red-700 font-bold hover:underline underline-offset-4 flex items-center gap-2">
                            <Home className="w-4 h-4" /> Return to Front Page
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link href="/contact" className="text-[#1A1A1A] font-bold hover:underline underline-offset-4">
                            Contact Editor
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isLuminous) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-lime-500/10 via-slate-950/50 to-slate-950"></div>
                <div className="relative z-10 text-center max-w-2xl">
                    <div className="w-24 h-24 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-lime-400/30 shadow-[0_0_40px_rgba(163,255,51,0.2)]">
                        <AlertTriangle className="w-10 h-10 text-lime-400" />
                    </div>
                    <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 mb-2">
                        404
                    </h1>
                    <h2 className="text-2xl font-bold text-lime-400 mb-6 uppercase tracking-widest text-shadow-glow">System Error</h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
                        The requested signal could not be established. The target coordinates are invalid or have been relocated.
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                        <Link href="/" className="px-6 py-3 bg-lime-400 text-slate-950 font-bold rounded-xl hover:bg-lime-300 transition-all shadow-[0_0_20px_rgba(163,255,51,0.3)]">
                            Reinitialize
                        </Link>
                        <button onClick={() => window.history.back()} className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                            Abort
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isAzure) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>

                <div className="relative z-10 glass-premium p-12 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl max-w-2xl w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-sky-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-sky-500/30">
                        <Compass className="w-10 h-10 text-sky-400" />
                    </div>
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                        Lost in Space?
                    </h1>
                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                        The page you are looking for doesn't exist. It might have been moved or deleted. Let's get you back on track.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/25">
                            Back Home
                        </Link>
                        <Link href="/contact" className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Default (SaaS)
    return (
        <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center p-6">
            <div className="max-w-lg w-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-8">
                    <FileQuestion className="w-8 h-8 text-gray-400" />
                </div>
                <h1 className="text-4xl font-semibold mb-3 tracking-tight">Page not found</h1>
                <p className="text-gray-500 mb-10">
                    Sorry, we couldn't find the page you're looking for.
                </p>

                <div className="grid grid-cols-1 gap-3 mb-8">
                    {quickLinks.map((link, i) => (
                        <Link key={i} href={link.href} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-3">
                                {link.icon && <link.icon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />}
                                <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{link.label}</span>
                            </div>
                            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-white rotate-180 transition-all" />
                        </Link>
                    ))}
                </div>

                <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
                    Go back to home page
                </Link>
            </div>
        </div>
    );
}
