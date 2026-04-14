'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';
import ThemePageWrapper from '@/components/ThemePageWrapper';
import { getPosts, getCategories, MOCK_POSTS, MOCK_CATEGORIES } from '@/lib/wordpress';
import BlogSearch from '@/components/blog/BlogSearch';

/* ── Helpers ──────────────────────────────────────────────────────────── */
const CAT = {
    'publisher-tips':    { bg: '#FF3366', fg: '#fff' },
    'advertiser-guide':  { bg: '#3B82F6', fg: '#fff' },
    'technology':        { bg: '#8B5CF6', fg: '#fff' },
    'industry-insights': { bg: '#F59E0B', fg: '#000' },
    'case-study':        { bg: '#10B981', fg: '#fff' },
};
const cc = s => CAT[s] || { bg: '#374151', fg: '#fff' };

function isNew(dateStr) {
    return (Date.now() - new Date(dateStr).getTime()) < 7 * 24 * 60 * 60 * 1000;
}

/* ── UI Atoms ─────────────────────────────────────────────────────────── */
function Pill({ name, slug }) {
    const { bg, fg } = cc(slug);
    return (
        <span className="inline-block text-[11px] font-bold px-3 py-[4px] rounded-full"
            style={{ background: bg, color: fg }}>
            {name}
        </span>
    );
}

function CatLabel({ name, slug }) {
    return (
        <span className="text-[11px] font-black uppercase tracking-widest"
            style={{ color: cc(slug).bg }}>
            {name}
        </span>
    );
}

function NewBadge() {
    return (
        <span className="inline-block text-[9px] font-black uppercase tracking-widest px-1.5 py-[2px] rounded-sm ml-1.5 align-middle"
            style={{ background: '#10B981', color: '#fff' }}>
            New
        </span>
    );
}

function Cover({ src, alt, className = '' }) {
    return (
        <div className={`overflow-hidden rounded-xl bg-foreground/5 ${className}`}>
            {src
                ? <img src={src} alt={alt || ''} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                : <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl font-black text-foreground/10">{alt?.[0]?.toUpperCase()}</span>
                  </div>
            }
        </div>
    );
}

function ViewMore({ href }) {
    return (
        <Link href={href}
            className="flex items-center gap-0.5 text-[15px] text-muted-foreground hover:text-primary transition-colors"
            style={{ fontFamily: '"Georgia","Times New Roman",serif', fontStyle: 'italic' }}>
            View more posts <ChevronRight className="w-4 h-4" style={{ fontStyle: 'normal' }} />
        </Link>
    );
}

/* ── Card variants ────────────────────────────────────────────────────── */
function LeftCard({ post }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block pb-6 mb-6 border-b border-foreground/[0.07] last:border-0 last:mb-0 last:pb-0">
            <Cover src={post.coverImage} alt={post.title} className="w-full h-[130px] mb-3" />
            <CatLabel name={post.primaryCategory} slug={post.primaryCategorySlug} />
            {isNew(post.date) && <NewBadge />}
            <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-3">
                {post.title}
            </h3>
        </Link>
    );
}

function CenterCard({ post }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <Cover src={post.coverImage} alt={post.title} className="w-full h-[300px]" />
            <div className="pt-5">
                <Pill name={post.primaryCategory} slug={post.primaryCategorySlug} />
                {isNew(post.date) && <NewBadge />}
                <h2 className="mt-3 text-[30px] font-bold leading-[1.2] text-foreground group-hover:text-primary transition-colors line-clamp-3">
                    {post.title}
                </h2>
                <p className="mt-2.5 text-[15px] text-muted-foreground leading-relaxed line-clamp-3">
                    {post.excerpt}
                </p>
                <p className="mt-3 text-[13px] text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" />{post.readTime} · {post.dateFormatted}
                </p>
            </div>
        </Link>
    );
}

function RightCard({ post }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block pb-4 mb-4 border-b border-foreground/[0.07] last:border-0 last:mb-0 last:pb-0">
            <CatLabel name={post.primaryCategory} slug={post.primaryCategorySlug} />
            {isNew(post.date) && <NewBadge />}
            <h3 className="mt-1.5 text-[16px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-3">
                {post.title}
            </h3>
        </Link>
    );
}

export function GridCard({ post }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <Cover src={post.coverImage} alt={post.title} className="w-full h-[195px] mb-4" />
            <div className="flex items-center gap-2">
                <Pill name={post.primaryCategory} slug={post.primaryCategorySlug} />
                {isNew(post.date) && <NewBadge />}
            </div>
            <h3 className="mt-2.5 text-[19px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
            </h3>
            <p className="mt-1.5 text-[14px] text-muted-foreground leading-relaxed line-clamp-2">
                {post.excerpt}
            </p>
            <p className="mt-2 text-[12px] text-muted-foreground flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" />{post.readTime}
            </p>
        </Link>
    );
}

/* ── Section layouts ─────────────────────────────────────────────────── */
function TopStories({ posts }) {
    if (posts.length < 2) return null;
    const [p1, p2, p3, p4, p5] = posts;

    return (
        <section className="mb-14">
            <div className="flex items-center gap-5 mb-8">
                <span className="px-6 py-2.5 rounded-full text-[14px] font-black uppercase tracking-wider"
                    style={{ background: '#F59E0B', color: '#000' }}>
                    TOP STORIES
                </span>
                <ViewMore href="/blog" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.1fr_1fr] gap-10">
                <div>{[p1, p2].filter(Boolean).map(p => <LeftCard key={p.id} post={p} />)}</div>
                <CenterCard post={p1} />
                <div>{[p2, p3, p4, p5].filter(Boolean).map(p => <RightCard key={p.id} post={p} />)}</div>
            </div>
        </section>
    );
}

function CatSection({ catData, posts }) {
    if (!posts.length) return null;
    return (
        <section className="mb-12">
            <div className="flex items-center gap-5 mb-7">
                <Pill name={catData.name} slug={catData.slug} />
                <ViewMore href={`/blog?category=${catData.slug}`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9">
                {posts.slice(0, 3).map(p => <GridCard key={p.id} post={p} />)}
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   PAGE — Server Component
   Fetches from WordPress if available, falls back to mock data
   ══════════════════════════════════════════════════════════════════════ */
export default function BlogPage() {
    const [posts, setPosts] = useState(MOCK_POSTS);
    const [categories, setCategories] = useState(MOCK_CATEGORIES);

    useEffect(() => {
        async function load() {
            try {
                const wpResult = await getPosts({ perPage: 20 });
                if (wpResult.posts?.length > 0) {
                    setPosts(wpResult.posts);
                    const cats = await getCategories().catch(() => MOCK_CATEGORIES);
                    setCategories(cats);
                }
            } catch {
                // WordPress not available — already using mock data
            }
        }
        load();
    }, []);

    const grouped = categories
        .map(c => ({ ...c, posts: posts.filter(p => p.primaryCategorySlug === c.slug) }))
        .filter(g => g.posts.length > 0);

    return (
        <ThemePageWrapper>
            {() => (
        <div className="bg-background min-h-screen">
            {/* ── BlogSearch: client island for tabs/search ───── */}
            <BlogSearch allPosts={posts} categories={categories} />

            {/* ── Static content (Server-rendered) ───────────── */}
            <main className="max-w-[1220px] mx-auto px-8 py-12">
                <TopStories posts={posts} />
                <div className="border-t border-foreground/10 pt-10">
                    {grouped.map(g => (
                        <CatSection key={g.id} catData={g} posts={g.posts} />
                    ))}
                </div>
            </main>

            {/* ── Newsletter ──────────────────────────────────── */}
            <section className="bg-foreground text-background mt-4">
                <div className="max-w-[1220px] mx-auto px-8 py-14 grid md:grid-cols-2 gap-14 items-center">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary mb-3">Newsletter</p>
                        <h2 className="text-[36px] font-bold leading-tight mb-3">
                            Stay Ahead.<br />Stay Profitable.
                        </h2>
                        <p className="text-[15px] text-background/50 leading-relaxed">
                            Publisher tips and industry insights — weekly, no spam.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <input type="email" placeholder="your@email.com"
                            className="w-full px-5 py-4 bg-white/10 rounded-lg border border-white/10 text-background text-[15px] outline-none focus:border-primary placeholder:text-background/30" />
                        <button className="w-full py-4 bg-primary text-white font-bold rounded-lg text-[15px] hover:opacity-90 transition-opacity">
                            Subscribe Free →
                        </button>
                        <p className="text-[12px] text-background/30 text-center">
                            1,200+ subscribers · No spam · Unsubscribe anytime
                        </p>
                    </div>
                </div>
                </section>
            </div>
            )}
        </ThemePageWrapper>
    );
}
