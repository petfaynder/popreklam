'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Zap, Menu, X, Twitter, Linkedin, Facebook } from 'lucide-react';
import useTheme from '@/hooks/useTheme';

const navLinks = [
    { name: 'Advertisers', href: '/for-advertisers' },
    { name: 'Publishers', href: '/for-publishers' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
];

const footerLinks = {
    platform: [
        { name: 'Publishers', href: '/for-publishers' },
        { name: 'Advertisers', href: '/for-advertisers' },
        { name: 'Ad Formats', href: '/ad-formats' },
        { name: 'Smart Link', href: '/smart-link' },
    ],
    resources: [
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Anti-Adblock', href: '/anti-adblock' },
        { name: 'Documentation', href: '/docs' },
        { name: 'Blog', href: '/blog' },
    ],
    company: [
        { name: 'Contact', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Status', href: '/status' },
    ],
    legal: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
    ],
};

/* ─── BRUTALIST ─── */
function BrutalistNav({ pathname, mobileOpen, setMobileOpen }) {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
    }, []);
    return (
        <nav className={`fixed top-0 w-full z-50 transition-all border-b-2 ${scrolled ? 'bg-background border-foreground py-2' : 'bg-transparent border-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center font-bold transform -rotate-3 group-hover:rotate-0 transition-transform"><Zap className="w-6 h-6 fill-current" /></div>
                    <span className="text-2xl font-black tracking-tighter uppercase">MrPop.io</span>
                </Link>
                <div className="hidden lg:flex items-center space-x-6">
                    {navLinks.map(l => <Link key={l.name} href={l.href} className={`text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-white px-2 py-1 transition-colors ${pathname === l.href ? 'bg-primary text-white' : 'text-foreground'}`}>{l.name}</Link>)}
                    <div className="w-0.5 h-6 bg-foreground mx-2"></div>
                    <Link href="/login" className="text-sm font-bold uppercase hover:underline">Login</Link>
                    <Link href="/register" className="bg-accent text-accent-foreground px-5 py-2 font-black uppercase text-sm border-2 border-foreground hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black] transition-all">Get Started</Link>
                </div>
                <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
            </div>
            {mobileOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-background border-b-2 border-foreground p-4 flex flex-col space-y-4">
                    {navLinks.map(l => <Link key={l.name} href={l.href} className="text-lg font-bold uppercase" onClick={() => setMobileOpen(false)}>{l.name}</Link>)}
                    <Link href="/register" className="bg-primary text-white text-center py-3 font-bold uppercase border-2 border-foreground">Get Started</Link>
                </div>
            )}
        </nav>
    );
}

function BrutalistFooter() {
    return (
        <footer className="py-16 px-4 border-t-2 border-foreground bg-background text-foreground">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-5 gap-12 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2"><div className="w-10 h-10 bg-foreground text-background flex items-center justify-center"><Zap className="w-6 h-6 fill-current" /></div><span className="text-2xl font-black uppercase tracking-tighter">MrPop.io</span></div>
                        <p className="font-medium text-sm leading-relaxed border-l-2 border-primary pl-4">The high-performance ad network for serious publishers and advertisers.</p>
                    </div>
                    {[['Platform', footerLinks.platform], ['Resources', footerLinks.resources], ['Company', footerLinks.company], ['Legal', footerLinks.legal]].map(([t, links]) => (
                        <div key={t}><h4 className="font-black uppercase mb-6 text-lg border-b-2 border-border inline-block pb-1">{t}</h4>
                            <ul className="space-y-3 text-sm font-bold">{links.map(l => <li key={l.name}><Link href={l.href} className="hover:text-primary hover:translate-x-1 inline-block transition-transform">{l.name}</Link></li>)}</ul></div>
                    ))}
                </div>
                <div className="pt-8 border-t-2 border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-bold uppercase">
                    <div>© {new Date().getFullYear()} MRPOP.IO</div>
                    <div className="flex gap-4">{[Twitter, Linkedin, Facebook].map((Icon, i) => <Link key={i} href="#" className="border-2 border-foreground p-2 hover:bg-foreground hover:text-background transition-colors"><Icon className="w-5 h-5" /></Link>)}</div>
                </div>
            </div>
        </footer>
    );
}

/* ─── SaaS ─── */
function SaaSNav({ pathname, mobileOpen, setMobileOpen }) {
    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#09090B]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center"><div className="w-3.5 h-3.5 bg-[#09090B] rounded-sm"></div></div><span className="text-[15px] font-semibold tracking-tight text-white">MrPop.io</span></Link>
                <div className="hidden lg:flex items-center gap-6">
                    {navLinks.map(l => <Link key={l.name} href={l.href} className={`text-sm transition-colors ${pathname === l.href ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>{l.name}</Link>)}
                    <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Login</Link>
                    <Link href="/register" className="px-5 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">Get Started</Link>
                </div>
                <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
            </div>
            {mobileOpen && (
                <div className="lg:hidden border-t border-white/10 p-4 flex flex-col space-y-3">
                    {navLinks.map(l => <Link key={l.name} href={l.href} className="text-gray-300 hover:text-white py-2" onClick={() => setMobileOpen(false)}>{l.name}</Link>)}
                    <Link href="/register" className="bg-white text-black text-center py-2.5 rounded-lg font-semibold" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </div>
            )}
        </nav>
    );
}

function SaaSFooter() {
    return (
        <footer className="border-t border-white/10 bg-[#09090B]">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-5 gap-10 mb-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center"><div className="w-3.5 h-3.5 bg-[#09090B] rounded-sm"></div></div><span className="text-sm font-semibold text-white">MrPop.io</span></div>
                        <p className="text-sm text-gray-500 leading-relaxed">The modern ad network for publishers and advertisers.</p>
                    </div>
                    {[['Platform', footerLinks.platform], ['Resources', footerLinks.resources], ['Company', footerLinks.company], ['Legal', footerLinks.legal]].map(([t, links]) => (
                        <div key={t}><h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">{t}</h4>
                            <ul className="space-y-2.5">{links.map(l => <li key={l.name}><Link href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">{l.name}</Link></li>)}</ul></div>
                    ))}
                </div>
                <div className="pt-8 border-t border-white/5 flex justify-between items-center text-xs text-gray-600">
                    <span>© {new Date().getFullYear()} MrPop.io</span>
                    <div className="flex gap-4">{[Twitter, Linkedin, Facebook].map((Icon, i) => <Link key={i} href="#" className="text-gray-600 hover:text-white transition-colors"><Icon className="w-4 h-4" /></Link>)}</div>
                </div>
            </div>
        </footer>
    );
}

/* ─── EDITORIAL ─── */
function EditorialNav({ pathname, mobileOpen, setMobileOpen }) {
    return (
        <nav className="sticky top-0 z-50 border-b border-gray-300 bg-[#FBF9F6]/90 backdrop-blur-xl" style={{ fontFamily: 'var(--font-serif)' }}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-black tracking-tight text-[#1A1A1A] hover:text-red-700 transition-colors">The PR Journal</Link>
                <div className="hidden lg:flex items-center gap-6" style={{ fontFamily: 'var(--font-sans)' }}>
                    {navLinks.map(l => <Link key={l.name} href={l.href} className={`text-xs font-bold uppercase tracking-widest transition-colors ${pathname === l.href ? 'text-red-700' : 'text-gray-500 hover:text-[#1A1A1A]'}`}>{l.name}</Link>)}
                    <div className="w-px h-5 bg-gray-300"></div>
                    <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#1A1A1A]">Login</Link>
                    <Link href="/register" className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">Subscribe</Link>
                </div>
                <button className="lg:hidden text-[#1A1A1A]" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
            </div>
            {mobileOpen && (
                <div className="lg:hidden border-t border-gray-300 p-4 flex flex-col space-y-3 bg-[#FBF9F6]" style={{ fontFamily: 'var(--font-sans)' }}>
                    {navLinks.map(l => <Link key={l.name} href={l.href} className="text-sm font-bold uppercase text-[#1A1A1A]" onClick={() => setMobileOpen(false)}>{l.name}</Link>)}
                    <Link href="/register" className="bg-[#1A1A1A] text-white text-center py-2.5 font-bold uppercase text-sm" onClick={() => setMobileOpen(false)}>Subscribe</Link>
                </div>
            )}
        </nav>
    );
}

function EditorialFooter() {
    return (
        <footer className="border-t border-gray-300 bg-[#FBF9F6] text-[#1A1A1A]">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-5 gap-10 mb-10">
                    <div className="space-y-3">
                        <span className="text-xl font-black tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>The PR Journal</span>
                        <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>The publisher's guide to advertising excellence.</p>
                    </div>
                    {[['Platform', footerLinks.platform], ['Resources', footerLinks.resources], ['Company', footerLinks.company], ['Legal', footerLinks.legal]].map(([t, links]) => (
                        <div key={t} style={{ fontFamily: 'var(--font-sans)' }}><h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">{t}</h4>
                            <ul className="space-y-2.5">{links.map(l => <li key={l.name}><Link href={l.href} className="text-sm text-gray-500 hover:text-red-700 transition-colors">{l.name}</Link></li>)}</ul></div>
                    ))}
                </div>
                <div className="pt-8 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400" style={{ fontFamily: 'var(--font-sans)' }}>
                    <span>© {new Date().getFullYear()} The PR Journal</span>
                    <div className="flex gap-4">{[Twitter, Linkedin, Facebook].map((Icon, i) => <Link key={i} href="#" className="text-gray-400 hover:text-red-700 transition-colors"><Icon className="w-4 h-4" /></Link>)}</div>
                </div>
            </div>
        </footer>
    );
}

/* ─── LUMINOUS ─── */
function LuminousNav({ pathname, mobileOpen, setMobileOpen }) {
    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-lime-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(163,255,51,0.3)]"><Zap className="w-6 h-6 text-slate-900 fill-current" /></div>
                    <span className="text-2xl font-bold text-white">MrPop.io</span>
                </Link>
                <div className="hidden lg:flex items-center gap-6">
                    {navLinks.map(l => <Link key={l.name} href={l.href} className={`text-sm transition-colors ${pathname === l.href ? 'text-lime-400 font-semibold' : 'text-gray-400 hover:text-white'}`}>{l.name}</Link>)}
                    <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Login</Link>
                    <Link href="/register" className="px-6 py-2.5 bg-lime-400 text-slate-900 rounded-xl font-bold hover:bg-lime-300 transition-all">Get Started</Link>
                </div>
                <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
            </div>
            {mobileOpen && (
                <div className="lg:hidden border-t border-white/10 p-4 flex flex-col space-y-3 bg-slate-950">
                    {navLinks.map(l => <Link key={l.name} href={l.href} className="text-gray-300 hover:text-lime-400 py-2" onClick={() => setMobileOpen(false)}>{l.name}</Link>)}
                    <Link href="/register" className="bg-lime-400 text-slate-900 text-center py-2.5 rounded-xl font-bold" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </div>
            )}
        </nav>
    );
}

function LuminousFooter() {
    return (
        <footer className="border-t border-white/10 bg-slate-950">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-5 gap-10 mb-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2"><div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-slate-900 fill-current" /></div><span className="text-lg font-bold text-white">MrPop.io</span></div>
                        <p className="text-sm text-gray-500 leading-relaxed">Monetize smarter with the next-gen publisher network.</p>
                    </div>
                    {[['Platform', footerLinks.platform], ['Resources', footerLinks.resources], ['Company', footerLinks.company], ['Legal', footerLinks.legal]].map(([t, links]) => (
                        <div key={t}><h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">{t}</h4>
                            <ul className="space-y-2.5">{links.map(l => <li key={l.name}><Link href={l.href} className="text-sm text-gray-500 hover:text-lime-400 transition-colors">{l.name}</Link></li>)}</ul></div>
                    ))}
                </div>
                <div className="pt-8 border-t border-white/5 flex justify-between items-center text-xs text-gray-600">
                    <span>© {new Date().getFullYear()} MrPop.io</span>
                    <div className="flex gap-4">{[Twitter, Linkedin, Facebook].map((Icon, i) => <Link key={i} href="#" className="text-gray-600 hover:text-lime-400 transition-colors"><Icon className="w-4 h-4" /></Link>)}</div>
                </div>
            </div>
        </footer>
    );
}

/* ─── AZURE ─── */
function AzureNav({ pathname, mobileOpen, setMobileOpen }) {
    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)]"><Zap className="w-6 h-6 text-white fill-current" /></div>
                    <span className="text-2xl font-bold text-white">MrPop.io</span>
                </Link>
                <div className="hidden lg:flex items-center gap-6">
                    {navLinks.map(l => <Link key={l.name} href={l.href} className={`text-sm transition-colors ${pathname === l.href ? 'text-sky-400 font-semibold' : 'text-gray-400 hover:text-white'}`}>{l.name}</Link>)}
                    <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Login</Link>
                    <Link href="/register" className="px-6 py-2.5 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-400 transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)]">Get Started</Link>
                </div>
                <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
            </div>
            {mobileOpen && (
                <div className="lg:hidden border-t border-white/10 p-4 flex flex-col space-y-3 bg-slate-950">
                    {navLinks.map(l => <Link key={l.name} href={l.href} className="text-gray-300 hover:text-sky-400 py-2" onClick={() => setMobileOpen(false)}>{l.name}</Link>)}
                    <Link href="/register" className="bg-sky-500 text-white text-center py-2.5 rounded-xl font-bold" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </div>
            )}
        </nav>
    );
}

function AzureFooter() {
    return (
        <footer className="border-t border-white/10 bg-slate-950">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-5 gap-10 mb-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2"><div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-white fill-current" /></div><span className="text-lg font-bold text-white">MrPop.io</span></div>
                        <p className="text-sm text-gray-500 leading-relaxed">Reach your audience with precision targeting.</p>
                    </div>
                    {[['Platform', footerLinks.platform], ['Resources', footerLinks.resources], ['Company', footerLinks.company], ['Legal', footerLinks.legal]].map(([t, links]) => (
                        <div key={t}><h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">{t}</h4>
                            <ul className="space-y-2.5">{links.map(l => <li key={l.name}><Link href={l.href} className="text-sm text-gray-500 hover:text-sky-400 transition-colors">{l.name}</Link></li>)}</ul></div>
                    ))}
                </div>
                <div className="pt-8 border-t border-white/5 flex justify-between items-center text-xs text-gray-600">
                    <span>© {new Date().getFullYear()} MrPop.io</span>
                    <div className="flex gap-4">{[Twitter, Linkedin, Facebook].map((Icon, i) => <Link key={i} href="#" className="text-gray-600 hover:text-sky-400 transition-colors"><Icon className="w-4 h-4" /></Link>)}</div>
                </div>
            </div>
        </footer>
    );
}

/* ─── THEME CONFIG ─── */
const themeConfig = {
    'theme-brutalist': {
        Nav: BrutalistNav,
        Footer: BrutalistFooter,
        bg: 'bg-background text-foreground',
        pt: 'pt-24',
    },
    'theme-classic': {
        Nav: SaaSNav,
        Footer: SaaSFooter,
        bg: 'bg-[#09090B] text-white',
        pt: '',
    },
    'theme-editorial': {
        Nav: EditorialNav,
        Footer: EditorialFooter,
        bg: 'bg-[#FBF9F6] text-[#1A1A1A]',
        pt: '',
    },
    'theme-luminous': {
        Nav: LuminousNav,
        Footer: LuminousFooter,
        bg: 'bg-slate-950 text-white',
        pt: '',
    },
    'theme-azure': {
        Nav: AzureNav,
        Footer: AzureFooter,
        bg: 'bg-slate-950 text-white',
        pt: '',
    },
};

/**
 * ThemePageWrapper — wraps content pages with themed nav, footer, and background.
 * 
 * Usage:
 *   <ThemePageWrapper>
 *     {(theme) => <PageContent themeId={theme} />}
 *   </ThemePageWrapper>
 * 
 * Children receives Theme ID string for styling decisions.
 */
export default function ThemePageWrapper({ children }) {
    const theme = useTheme();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (!theme) return null;

    const config = themeConfig[theme] || themeConfig['theme-brutalist'];
    const { Nav, Footer, bg, pt } = config;

    return (
        <div className={`min-h-screen ${bg}`}>
            <Nav pathname={pathname} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            <main className={pt}>
                {typeof children === 'function' ? children(theme) : children}
            </main>
            <Footer />
        </div>
    );
}
