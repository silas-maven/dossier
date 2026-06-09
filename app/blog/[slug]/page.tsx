import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { formatBlogDate, getBlogPost, publishedBlogPosts } from "@/lib/blog/posts";

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.your-dossier.xyz").replace(/\/+$/, "");

export function generateStaticParams() {
  return publishedBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post || post.draft) return { title: "Not found" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article"
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post || post.draft) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: "Hamza Ntwari", url: "https://hntwari.vercel.app" },
    publisher: { "@type": "Organization", name: "Dossier" },
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0d14] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.05]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[45vh] bg-gradient-to-b from-blue-500/[0.07] to-transparent" />
      <style>{`@keyframes post-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}.post-rise{opacity:0;animation:post-rise 720ms cubic-bezier(.16,1,.3,1) forwards}@media(prefers-reduced-motion:reduce){.post-rise{animation:none;opacity:1}}`}</style>
      <article className="post-rise relative z-10 mx-auto max-w-[720px] px-6 py-20 lg:py-24">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white/70"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Blog
        </Link>

        <div className="mt-12 flex flex-wrap items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          <span className="text-blue-300/80">{post.tag}</span>
          <span aria-hidden>·</span>
          <span>{formatBlogDate(post.date)}</span>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>

        <h1 className="mt-5 text-[clamp(2.2rem,5vw,3.5rem)] font-black leading-[1.03] tracking-tight text-white">
          {post.title}
        </h1>
        <div className="mt-6 h-px w-16 bg-gradient-to-r from-blue-400/70 to-transparent" />

        <div className="mt-10 space-y-5">{post.content}</div>
      </article>
    </main>
  );
}
