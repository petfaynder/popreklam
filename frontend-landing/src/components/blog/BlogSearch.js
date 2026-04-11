'use client';

// BlogSearch — Client Island
// Handles: category tab navigation, search input, filtered grid view
// Everything else (TopStories, CatSections) is server-rendered above this

import { useState } from 'react';
import Link from 'next/link';
import { Search, X, Clock } from 'lucide-react';

const CAT = {
    'publisher-tips':    { bg: '#FF3366', fg: '#fff' },
    'advertiser-guide':  { bg: '#3B82F6', fg: '#fff' },
    'technology':        { bg: '#8B5CF6', fg: '#fff' },
    'industry-insights': { bg: '#F59E0B', fg: '#000' },
    'case-study':        { bg: '#10B981', fg: '#fff' },
};
const cc = s => CAT[s] || { bg: '#374151', fg: '#fff' };

function Pill({ name, slug }) {
    const { bg, fg } = cc(slug);
    return <span className="inline-block text-[11px] font-bold px-3 py-[4px] rounded-full" style={{ background: bg, color: fg }}>{name}</span>;
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

function GridCard({ post }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <Cover src={post.coverImage} alt={post.title} className="w-full h-[195px] mb-4" />
            <Pill name={post.primaryCategory} slug={post.primaryCategorySlug} />
            <h3 className="mt-2.5 text-[19px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
            </h3>
            <p className="mt-1.5 text-[14px] text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
            <p className="mt-2 text-[12px] text-muted-foreground flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" />{post.readTime}
            </p>
        </Link>
    );
}

export default function BlogSearch({ allPosts, categories }) {
    const [active, setActive] = useState('all');
    const [search, setSearch] = useState('');

    const isFiltering = active !== 'all' || !!search;

    const filtered = allPosts.filter(p => {
        const matchCat = active === 'all' || p.primaryCategorySlug === active;
        const matchQ = !search
            || p.title.toLowerCase().includes(search.toLowerCase())
            || p.excerpt.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchQ;
    });

    return (
        <>
            {/* ── Category tabs + search ──────────────────────────── */}
            <div className="bg-background border-b border-foreground/10 sticky top-0 z-40 backdrop-blur-sm">
                <div className="max-w-[1220px] mx-auto px-8 flex items-center justify-between">
                    <nav className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        {[{ name: 'All Posts', slug: 'all' }, ...categories].map(c => (
                            <button key={c.slug} onClick={() => setActive(c.slug)}
                                className={`shrink-0 px-5 py-4 text-[14px] font-semibold border-b-2 transition-all whitespace-nowrap ${
                                    active === c.slug
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}>
                                {c.name}
                                {c.count != null && (
                                    <span className="ml-1 text-[11px] text-muted-foreground/60">({c.count})</span>
                                )}
                            </button>
                        ))}
                    </nav>
                    <div className="relative shrink-0 ml-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search articles…"
                            className="pl-10 pr-9 py-2 bg-background border border-foreground/20 rounded-full text-[14px] outline-none focus:border-primary w-52 placeholder:text-muted-foreground transition-colors" />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Filtered results (only shown when filtering) ──── */}
            {isFiltering && (
                <div className="max-w-[1220px] mx-auto px-8 py-10">
                    {filtered.length === 0 ? (
                        <div className="py-32 text-center">
                            <p className="text-7xl font-black text-foreground/10 mb-4">0</p>
                            <p className="text-muted-foreground text-[15px]">No articles found.</p>
                            <button onClick={() => { setSearch(''); setActive('all'); }}
                                className="mt-5 px-6 py-2.5 rounded-full border border-foreground/20 text-[14px] hover:border-primary hover:text-primary transition-all">
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-10">
                                <h1 className="text-2xl font-bold text-foreground">
                                    {search
                                        ? `Results for "${search}"`
                                        : categories.find(c => c.slug === active)?.name}
                                </h1>
                                <span className="text-[14px] text-muted-foreground">{filtered.length} articles</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9">
                                {filtered.map(p => <GridCard key={p.id} post={p} />)}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
