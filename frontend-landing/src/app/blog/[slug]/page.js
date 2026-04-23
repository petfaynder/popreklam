/**
 * Blog post page — Server Component wrapper.
 *
 * Why this file exists:
 *   - The actual post UI (BlogPostClient) uses hooks and must be 'use client'.
 *   - Next.js only allows `generateMetadata` in Server Components.
 *   - Solution: this file is the Server Component that exports metadata,
 *     and it renders the Client Component (BlogPostClient) below.
 *
 * https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */

import BlogPostClient from './BlogPostClient';
import { MOCK_POSTS } from '@/lib/wordpress';

const BASE_URL = 'https://mrpop.io';

/**
 * Generates unique SEO metadata for every blog post.
 * Google and AI crawlers read this server-rendered HTML — not JS.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;

  // Try WordPress API first
  let post = null;
  try {
    const res = await fetch(
      `${process.env.WORDPRESS_URL || 'https://blog.mrpop.io'}/wp-json/wp/v2/posts?slug=${slug}&_fields=title,excerpt,date,modified,_links&_embed`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const [wpPost] = await res.json();
      if (wpPost) {
        post = {
          title: wpPost.title?.rendered?.replace(/<[^>]*>/g, '') || slug,
          excerpt: wpPost.excerpt?.rendered?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
          date: wpPost.date,
          coverImage: wpPost._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
          author: wpPost._embedded?.author?.[0]?.name || 'MrPop.io Team',
        };
      }
    }
  } catch {
    // WordPress not available — fall through to mock data
  }

  // Fall back to mock data
  if (!post) {
    const mockPost = MOCK_POSTS.find((p) => p.slug === slug) || MOCK_POSTS[0];
    post = {
      title: mockPost.title,
      excerpt: mockPost.excerpt,
      date: mockPost.date,
      coverImage: mockPost.coverImage || null,
      author: mockPost.author,
    };
  }

  const postUrl = `${BASE_URL}/blog/${slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: postUrl,
      siteName: 'MrPop.io',
      publishedTime: post.date,
      authors: [post.author],
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
        : [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: `${post.title} | MrPop.io Blog` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [`${BASE_URL}/og-image.png`],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

// The actual page renders the client component
export default function BlogPostPage() {
  return <BlogPostClient />;
}
