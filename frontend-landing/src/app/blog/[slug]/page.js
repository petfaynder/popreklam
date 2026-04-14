'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Clock, Calendar, ChevronRight, ArrowLeft, Twitter, Linkedin,
    Facebook, Link2, Check, BookOpen, TrendingUp, ArrowUp, Tag, Eye
} from 'lucide-react';
import ThemePageWrapper from '@/components/ThemePageWrapper';
import { MOCK_POSTS, getPostBySlug, getRelatedPosts } from '@/lib/wordpress';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const CAT_COLORS = {
    'publisher-tips':    { pill: '#FF3366', text: '#fff' },
    'advertiser-guide':  { pill: '#3B82F6', text: '#fff' },
    'technology':        { pill: '#8B5CF6', text: '#fff' },
    'industry-insights': { pill: '#F59E0B', text: '#000' },
    'case-study':        { pill: '#10B981', text: '#fff' },
    'default':           { pill: '#1a1a1a', text: '#fff' },
};
const catColor = (slug) => CAT_COLORS[slug] || CAT_COLORS.default;

const COVER_GRADIENTS = {
    'publisher-tips':    'linear-gradient(135deg, #1a0010 0%, #3d0020 100%)',
    'advertiser-guide':  'linear-gradient(135deg, #000d1a 0%, #001a3d 100%)',
    'technology':        'linear-gradient(135deg, #0d0020 0%, #1a0040 100%)',
    'industry-insights': 'linear-gradient(135deg, #1a1200 0%, #3d2800 100%)',
    'case-study':        'linear-gradient(135deg, #001a0d 0%, #003d1a 100%)',
    'default':           'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
};

// ─── Extract H2/H3 headings from HTML ────────────────────────────────────────
function extractHeadings(html) {
    if (typeof window === 'undefined' || !html) return [];
    const div = document.createElement('div');
    div.innerHTML = html;
    return Array.from(div.querySelectorAll('h2, h3')).map((h, i) => ({
        id: `h-${i}`,
        text: h.textContent || '',
        level: parseInt(h.tagName[1]),
    }));
}

function injectIds(html) {
    if (!html) return '';
    let i = 0;
    return html.replace(/<(h[23])(\s[^>]*)?>/gi, (_, tag, attrs = '') =>
        `<${tag}${attrs} id="h-${i++}">`
    );
}

// ─── READING PROGRESS ────────────────────────────────────────────────────────
function ReadingProgress() {
    const [pct, setPct] = useState(0);
    useEffect(() => {
        const fn = () => {
            const el = document.documentElement;
            setPct(el.scrollHeight - el.clientHeight > 0
                ? (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100 : 0);
        };
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);
    return (
        <div className="fixed top-0 left-0 right-0 z-[999] h-[3px] bg-foreground/10">
            <div className="h-full bg-primary transition-all duration-75" style={{ width: `${pct}%` }} />
        </div>
    );
}

// ─── STICKY SHARE (left vertical) ────────────────────────────────────────────
function ShareSidebar({ title }) {
    const [copied, setCopied] = useState(false);
    const href = typeof window !== 'undefined' ? window.location.href : '';
    const eu = encodeURIComponent(href);
    const et = encodeURIComponent(title);

    const copy = () => { navigator.clipboard.writeText(href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    return (
        <div className="hidden xl:flex flex-col items-center gap-2 sticky top-28 self-start pt-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground [writing-mode:vertical-lr] rotate-180 mb-1">
                Share
            </span>
            {[
                { href: `https://twitter.com/intent/tweet?text=${et}&url=${eu}`, Icon: Twitter },
                { href: `https://linkedin.com/sharing/share-offsite/?url=${eu}`, Icon: Linkedin },
                { href: `https://facebook.com/sharer/sharer.php?u=${eu}`, Icon: Facebook },
            ].map(({ href: h, Icon }) => (
                <a key={h} href={h} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                    <Icon className="w-4 h-4" />
                </a>
            ))}
            <button onClick={copy}
                className={`w-9 h-9 border-2 flex items-center justify-center transition-all ${copied ? 'bg-primary border-primary text-white' : 'border-foreground hover:bg-foreground hover:text-background'}`}>
                {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            </button>
            <div className="w-px h-8 bg-foreground/20 mt-2" />
        </div>
    );
}

// ─── TABLE OF CONTENTS ───────────────────────────────────────────────────────
function TOC({ headings, activeId }) {
    if (!headings.length) return null;
    return (
        <div className="border-2 border-foreground overflow-hidden">
            <div className="border-b-2 border-foreground bg-foreground text-background px-4 py-3 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest">Contents</span>
            </div>
            <div className="p-3">
                {headings.map((h, i) => (
                    <a key={h.id} href={`#${h.id}`}
                        onClick={e => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                        className={`flex items-start gap-2.5 py-2 px-2 text-sm leading-snug transition-all border-l-2
                            ${h.level === 3 ? 'ml-4 text-xs' : ''}
                            ${activeId === h.id
                                ? 'border-primary text-primary font-bold bg-primary/5'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30 font-medium'
                            }`}>
                        <span className={`text-[10px] font-black tabular-nums shrink-0 mt-0.5 ${activeId === h.id ? 'text-primary' : 'text-muted-foreground/40'}`}>
                            {String(i + 1).padStart(2, '0')}
                        </span>
                        {h.text}
                    </a>
                ))}
            </div>
        </div>
    );
}

// ─── RELATED CARD ────────────────────────────────────────────────────────────
function RelatedCard({ post }) {
    const c = catColor(post.primaryCategorySlug);
    const grad = COVER_GRADIENTS[post.primaryCategorySlug] || COVER_GRADIENTS.default;
    return (
        <Link href={`/blog/${post.slug}`} className="group flex gap-4 border-b-2 border-foreground/10 last:border-0 py-4 hover:bg-foreground/3 px-2 -mx-2 transition-colors">
            {/* Thumbnail */}
            <div className="relative w-20 h-16 shrink-0 overflow-hidden border border-foreground/20"
                style={{ background: grad }}>
                {post.coverImage
                    ? <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                    : <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white/10">{post.title.charAt(0)}</span>
                }
                <div className="absolute inset-y-0 left-0 w-0.5" style={{ background: c.pill }} />
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: c.pill }}>
                    {post.primaryCategory}
                </span>
                <p className="text-sm font-black uppercase tracking-tight leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-bold">
                    <Clock className="w-3 h-3" />{post.readTime}
                </p>
            </div>
        </Link>
    );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function BlogPostPage() {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [showUp, setShowUp] = useState(false);

    useEffect(() => {
        async function load() {
            // Try WordPress API first
            try {
                const wpPost = await getPostBySlug(slug);
                if (wpPost) { setArticle(wpPost); return; }
            } catch { /* WordPress not available */ }
            // Fall back to mock data
            const found = MOCK_POSTS.find(p => p.slug === slug) || MOCK_POSTS[0];
            setArticle(found);
        }
        load();
    }, [slug]);

    useEffect(() => {
        if (article?.content) setHeadings(extractHeadings(article.content));
    }, [article]);

    useEffect(() => {
        const fn = () => {
            setShowUp(window.scrollY > 500);
            for (let i = headings.length - 1; i >= 0; i--) {
                const el = document.getElementById(headings[i].id);
                if (el && el.getBoundingClientRect().top < 150) { setActiveId(headings[i].id); return; }
            }
            setActiveId('');
        };
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, [headings]);

    if (!article) return (
        <ThemePageWrapper>
            {() => <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-1 bg-primary animate-pulse" />
            </div>}
        </ThemePageWrapper>
    );

    const c = catColor(article.primaryCategorySlug);
    const grad = COVER_GRADIENTS[article.primaryCategorySlug] || COVER_GRADIENTS.default;
    const related = MOCK_POSTS.filter(p => p.id !== article.id).slice(0, 4);
    const moreInCat = MOCK_POSTS.filter(p => p.id !== article.id && p.primaryCategorySlug === article.primaryCategorySlug).slice(0, 3);

    return (
        <ThemePageWrapper>
            {() => (
                <div className="bg-background">
                    <ReadingProgress />

                    {/* ── BREADCRUMB ──────────────────────────────────── */}
                    <div className="border-b border-foreground/10">
                        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                            <ChevronRight className="w-3 h-3 opacity-30" />
                            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                            <ChevronRight className="w-3 h-3 opacity-30" />
                            <span className="font-black uppercase tracking-wider" style={{ color: c.pill }}>
                                {article.primaryCategory}
                            </span>
                        </div>
                    </div>

                    {/* ── COVER + TITLE HERO ──────────────────────────── */}
                    <div className="relative w-full overflow-hidden border-b-4 border-foreground" style={{ minHeight: '400px' }}>
                        {/* Background */}
                        {article.coverImage
                            ? <img src={article.coverImage} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
                            : (
                                <div className="absolute inset-0" style={{ background: grad }}>
                                    {/* Grid pattern */}
                                    <div className="absolute inset-0 opacity-20" style={{
                                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.12) 39px, rgba(255,255,255,0.12) 40px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.12) 79px, rgba(255,255,255,0.12) 80px)'
                                    }} />
                                    {/* Big title initial */}
                                    <div className="absolute right-12 bottom-4 text-[280px] font-black leading-none select-none uppercase" style={{ color: 'rgba(255,255,255,0.04)' }}>
                                        {article.title.charAt(0)}
                                    </div>
                                    {/* Color left bar */}
                                    <div className="absolute left-0 inset-y-0 w-2" style={{ background: c.pill }} />
                                </div>
                            )
                        }
                        {/* Gradient overlay for text */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Content on image */}
                        <div className="relative max-w-5xl mx-auto px-8 pt-20 pb-10 flex flex-col justify-end min-h-[400px]">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-5">
                                <span className="px-3 py-1.5 text-[11px] font-black uppercase tracking-widest"
                                    style={{ background: c.pill, color: c.text }}>
                                    {article.primaryCategory}
                                </span>
                                {article.tags.slice(0, 2).map(t => (
                                    <span key={t} className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border border-white/30 text-white/80">
                                        {t}
                                    </span>
                                ))}
                            </div>
                            {/* Title */}
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.92] text-white drop-shadow-lg max-w-4xl">
                                {article.title}
                            </h1>
                        </div>
                    </div>

                    {/* ── META BAR ────────────────────────────────────── */}
                    <div className="border-b-2 border-foreground bg-background">
                        <div className="max-w-5xl mx-auto px-8 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 border-2 border-foreground bg-foreground text-background flex items-center justify-center font-black text-base shrink-0">
                                    {article.author.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">By</div>
                                    <div className="text-sm font-black">{article.author}</div>
                                </div>
                            </div>
                            <div className="h-6 w-px bg-foreground/20 hidden sm:block" />
                            <span className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                                <Calendar className="w-4 h-4" />{article.dateFormatted}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm font-black text-primary">
                                <Clock className="w-4 h-4" />{article.readTime}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                                <Eye className="w-4 h-4" />2.4K views
                            </span>
                            {/* Share row */}
                            <div className="ml-auto flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Share:</span>
                                {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                                    <button key={i}
                                        className="w-8 h-8 border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                                        <Icon className="w-3.5 h-3.5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── LEAD EXCERPT ────────────────────────────────── */}
                    <div className="border-b border-foreground/10 bg-foreground/[0.025]">
                        <div className="max-w-5xl mx-auto px-8 py-6">
                            <p className="text-lg font-medium text-muted-foreground leading-relaxed border-l-4 pl-5"
                                style={{ borderColor: c.pill }}>
                                {article.excerpt}
                            </p>
                        </div>
                    </div>

                    {/* ── BODY: share | article | sidebar ─────────────── */}
                    <div className="max-w-7xl mx-auto px-6 py-10">
                        <div className="flex gap-8 xl:gap-12 items-start">

                            {/* Left: vertical share bar */}
                            <ShareSidebar title={article.title} />

                            {/* Center: article */}
                            <article className="flex-1 min-w-0 max-w-3xl">
                                <div className="blog-prose"
                                    dangerouslySetInnerHTML={{ __html: injectIds(article.content) }} />

                                {/* Tags */}
                                {article.tags.length > 0 && (
                                    <div className="mt-12 pt-8 border-t-2 border-foreground/20 flex flex-wrap gap-2 items-center">
                                        <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                                        {article.tags.map(t => (
                                            <span key={t} className="px-3 py-1.5 border-2 border-foreground text-xs font-black uppercase hover:bg-foreground hover:text-background transition-all cursor-pointer">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Author bio */}
                                <div className="mt-10 border-2 border-foreground p-6 flex gap-5 relative overflow-hidden bg-card">
                                    <div className="absolute left-0 inset-y-0 w-1" style={{ background: c.pill }} />
                                    <div className="w-14 h-14 border-2 border-foreground bg-foreground text-background flex items-center justify-center font-black text-xl shrink-0">
                                        {article.author.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Written by</div>
                                        <div className="text-lg font-black uppercase tracking-tight">{article.author}</div>
                                        <div className="text-xs font-bold text-muted-foreground mb-3">MrPop.io Editorial Team</div>
                                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                            The MrPop.io team brings years of expertise in digital advertising, publisher monetization, and performance marketing — helping publishers and advertisers grow with data-driven strategies.
                                        </p>
                                    </div>
                                </div>

                                {/* Mobile share */}
                                <div className="xl:hidden mt-6 flex items-center justify-between border-2 border-foreground p-4">
                                    <span className="text-xs font-black uppercase tracking-wider">Share this:</span>
                                    <div className="flex gap-2">
                                        {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                                            <button key={i} className="w-8 h-8 border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                                                <Icon className="w-3.5 h-3.5" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </article>

                            {/* Right: sticky sidebar */}
                            <aside className="hidden lg:block w-72 shrink-0">
                                <div className="sticky top-24 space-y-5">
                                    <TOC headings={headings} activeId={activeId} />

                                    {/* CTA */}
                                    <div className="border-2 border-foreground bg-foreground text-background p-5 relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-5 border-8 border-primary" />
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">★ Join Now</div>
                                        <h3 className="text-sm font-black uppercase tracking-tight leading-tight mb-2">
                                            Maximize Your Ad Revenue
                                        </h3>
                                        <p className="text-xs text-background/50 mb-4 leading-relaxed font-medium">
                                            10,000+ publishers trust MrPop.io for premium monetization.
                                        </p>
                                        <Link href="/register" className="block w-full py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest text-center hover:bg-accent transition-colors">
                                            Get Started Free →
                                        </Link>
                                        <Link href="/for-advertisers" className="block w-full py-2 mt-1 text-[10px] font-bold uppercase tracking-widest text-center text-background/40 hover:text-background transition-colors">
                                            I'm an Advertiser
                                        </Link>
                                    </div>

                                    {/* Trending */}
                                    <div className="border-2 border-foreground overflow-hidden">
                                        <div className="border-b-2 border-foreground bg-foreground text-background px-4 py-3 flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-xs font-black uppercase tracking-widest">Trending</span>
                                        </div>
                                        <div className="p-4">
                                            {related.map(p => <RelatedCard key={p.id} post={p} />)}
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>

                    {/* ── MORE IN THIS CATEGORY ──────────────────────── */}
                    {moreInCat.length > 0 && (
                        <section className="border-t-4 border-foreground">
                            <div className="max-w-7xl mx-auto px-6 py-12">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-1" style={{ background: c.pill }} />
                                        <h2 className="text-xl font-black uppercase tracking-tighter">
                                            More in {article.primaryCategory}
                                        </h2>
                                    </div>
                                    <Link href={`/blog?category=${article.primaryCategorySlug}`}
                                        className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
                                        View all <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                <div className="grid md:grid-cols-3 gap-5">
                                    {moreInCat.map(post => {
                                        const pc = catColor(post.primaryCategorySlug);
                                        const pg = COVER_GRADIENTS[post.primaryCategorySlug] || COVER_GRADIENTS.default;
                                        return (
                                            <Link key={post.id} href={`/blog/${post.slug}`}
                                                className="group border-2 border-foreground hover:shadow-[4px_4px_0_var(--color-primary)] transition-all bg-card block">
                                                <div className="relative h-36 overflow-hidden" style={{ background: pg }}>
                                                    {post.coverImage
                                                        ? <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                                                        : <>
                                                            <div className="absolute inset-y-0 left-0 w-1" style={{ background: pc.pill }} />
                                                            <span className="absolute inset-0 flex items-center justify-center text-6xl font-black text-white/5">{post.title.charAt(0)}</span>
                                                        </>
                                                    }
                                                    <span className="absolute top-3 left-3 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
                                                        style={{ background: pc.pill, color: pc.text }}>
                                                        {post.primaryCategory}
                                                    </span>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="text-sm font-black uppercase tracking-tight leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-2 font-bold">
                                                        <span>{post.dateFormatted}</span>
                                                        <span className="text-primary flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />{post.readTime}
                                                        </span>
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── NEWSLETTER ────────────────────────────────────── */}
                    <section className="border-t-4 border-foreground bg-foreground text-background">
                        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-2">Newsletter</p>
                                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Stay Ahead.</h3>
                            </div>
                            <div className="flex gap-3 w-full md:max-w-md">
                                <input type="email" placeholder="your@email.com"
                                    className="flex-1 px-4 py-3 bg-transparent border-2 border-background/20 text-background text-sm font-semibold outline-none focus:border-primary placeholder:text-background/30" />
                                <button className="px-6 py-3 bg-primary text-white font-black uppercase text-sm whitespace-nowrap">
                                    Subscribe →
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* ── BACK TO TOP ───────────────────────────────────── */}
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className={`fixed bottom-8 right-8 z-50 w-11 h-11 border-2 border-foreground bg-background shadow-[4px_4px_0_var(--color-foreground)] flex items-center justify-center hover:bg-foreground hover:text-background transition-all duration-300 ${showUp ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <ArrowUp className="w-4 h-4" />
                    </button>
                </div>
            )}
        </ThemePageWrapper>
    );
}
