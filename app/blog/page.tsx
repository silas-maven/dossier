import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { formatBlogDate, publishedBlogPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides on building CVs that get read and running a job search that lands interviews.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The Dossier Blog",
    description: "Guides on building CVs that get read and running a job search that lands interviews.",
    url: "/blog",
    type: "website"
  }
};

export default function BlogIndexPage() {
  const posts = publishedBlogPosts();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0d14] text-white">
      <style>{`
        @keyframes blog-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .blog-rise { opacity: 0; animation: blog-rise 820ms cubic-bezier(.16,1,.3,1) forwards; }
        @media (prefers-reduced-motion: reduce) { .blog-rise { animation: none; opacity: 1; } }
      `}</style>

      {/* Background: grid + morphing void blob + edge fades (mirrors the landing hero). */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.06]" />
      <div className="animate-blob pointer-events-none absolute -right-[15%] top-[-12%] h-[60vw] w-[60vw] min-h-[460px] min-w-[460px] border border-white/5 bg-black/40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[35%] bg-gradient-to-l from-[#0a0d14] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-[#0a0d14] to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 lg:py-28">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white/70"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dossier
        </Link>

        <div className="mt-14">
          <p
            className="blog-rise flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.35em] text-blue-300/70"
            style={{ animationDelay: "80ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            The Dossier Blog
          </p>
          <h1
            className="blog-rise mt-6 text-[clamp(3rem,9vw,6.5rem)] font-black uppercase leading-[0.82] tracking-tight"
            style={{ animationDelay: "150ms" }}
          >
            Field
            <br />
            <span style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.55)" }}>Notes</span>
          </h1>
          <p
            className="blog-rise mt-8 max-w-md font-mono text-[11px] uppercase leading-relaxed tracking-[0.15em] text-white/45"
            style={{ animationDelay: "240ms" }}
          >
            Guides on building CVs that get read, and running a job search that actually lands interviews.
          </p>
        </div>

        <div className="mt-16 space-y-4">
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/50">
              New articles are on the way.
            </p>
          ) : (
            posts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="blog-rise group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[0.05] hover:shadow-[0_24px_70px_-20px_rgba(59,130,246,0.35)]"
                style={{ animationDelay: `${330 + index * 90}ms` }}
              >
                <span className="pointer-events-none absolute right-6 top-6 font-mono text-[11px] tracking-[0.25em] text-white/15">
                  {String(index + 1).padStart(3, "0")}
                </span>
                <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                  <span className="text-blue-300/80">{post.tag}</span>
                  <span aria-hidden>·</span>
                  <span>{formatBlogDate(post.date)}</span>
                  <span aria-hidden>·</span>
                  <span>{post.readingMinutes} min read</span>
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">{post.title}</h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-7 text-white/55">{post.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-blue-300">
                  Read
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-blue-400/70 to-transparent transition-all duration-500 group-hover:w-full" />
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
