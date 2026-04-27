"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type ExperienceHeroProps = {
  ctaHref: string;
  templateCount: number;
  userCount?: number | null;
};

export default function ExperienceHero({ ctaHref, templateCount, userCount }: ExperienceHeroProps) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#030509] text-white">
      {/* Moving Ambient Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#030509]">
        
        {/* Grid lines - behind the blob */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        {/* Highly Visible Solid Geometric Blob (Slate-900 for stark contrast against #030509) */}
        <div className="absolute left-[20%] top-[10%] w-[120vw] h-[120vw] min-w-[1000px] min-h-[1000px] -translate-y-1/4 mix-blend-normal">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full animate-[spin_40s_linear_infinite]"
            fill="#0f172a" /* This is Slate 900, distinctly lighter than the 030509 background */
          >
            <path 
              d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.3,-46.1C90.8,-33.1,96.9,-17.2,97.4,-1.2C97.9,14.8,92.8,30.9,83.8,44.7C74.8,58.5,61.9,70.1,47.4,78.2C32.9,86.3,16.5,90.9,0.5,90.1C-15.5,89.3,-31,83.1,-45.4,74.6C-59.8,66.1,-73.1,55.3,-82.1,41.4C-91.1,27.5,-95.8,10.5,-94.1,-5.8C-92.4,-22.1,-84.3,-37.7,-73.4,-50.7C-62.5,-63.7,-48.8,-74.1,-34.2,-80.6C-19.6,-87.1,-4.1,-89.7,11,-88.1C26.1,-86.5,41.2,-80.7,44.7,-76.4Z" 
              transform="translate(100 100)" 
            />
          </svg>
        </div>

        {/* Subtle dark gradient overlay to blend edges */}
        <div className="absolute inset-y-0 right-0 w-[40%] bg-gradient-to-l from-[#030509] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-[#030509] to-transparent" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col justify-center px-6 py-12 lg:px-12 xl:px-20">
        <div className="grid gap-16 lg:grid-cols-[1fr_400px] lg:gap-8 xl:grid-cols-[1fr_460px]">
          
          {/* Left Column: Typography & CTA */}
          <div className="flex flex-col justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">
                Dossier CV Builder
              </span>
            </div>

            <div className="mt-12 flex flex-col">
              <h1 className="text-[clamp(4rem,12vw,9rem)] font-black uppercase leading-[0.85] tracking-tight text-white">
                Build CVs
                <br />
                That
              </h1>
              <h1 
                className="mt-2 text-[clamp(4rem,12vw,9rem)] font-black uppercase leading-[0.85] tracking-tight"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "1px rgba(255,255,255,0.6)",
                }}
              >
                Look Hired
              </h1>
            </div>

            <p className="mt-14 max-w-xl font-mono text-[11px] uppercase leading-relaxed tracking-[0.15em] text-white/50">
              Craft professional resumes with structured templates,
              <br className="hidden sm:block" />
              local-first editing, and export-ready layouts for fintech,
              <br className="hidden sm:block" />
              consulting, and project delivery roles.
            </p>

            <div className="mt-16 flex items-center">
              <Link
                href={ctaHref}
                className="group flex items-center gap-6"
                aria-label="Browse Templates"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-transparent transition-all duration-500 ease-out group-hover:scale-110 group-hover:border-white overflow-hidden">
                  <div className="absolute inset-0 translate-y-full bg-white transition-transform duration-500 ease-out group-hover:translate-y-0" />
                  <ArrowUpRight className="relative z-10 h-5 w-5 text-white transition-all duration-500 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black" />
                </div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-500 group-hover:translate-x-2 group-hover:text-white/70">
                  Browse Templates
                </span>
              </Link>
            </div>
          </div>

          {/* Right Column: Information Cards */}
          <div className="flex flex-col justify-center gap-6 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 fill-mode-both">
            {/* Card 1 */}
            <div className="group relative overflow-hidden rounded-[20px] border border-white/5 bg-[#0a0d14]/80 p-8 backdrop-blur-md transition-colors hover:bg-[#0d111a]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                  001 // Template Library
                </span>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <h3 className="text-3xl font-bold text-white">{templateCount}+ Styles</h3>
                <div className="h-[1px] w-12 bg-white/20 group-hover:bg-white/40 transition-colors" />
              </div>
              <div className="mt-8 flex flex-col gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">
                <p>Fintech + Consulting</p>
                <p>Consistent PDF exports</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative overflow-hidden rounded-[20px] border border-white/5 bg-[#0a0d14]/80 p-8 backdrop-blur-md transition-colors hover:bg-[#0d111a]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                  002 // Import + Export
                </span>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <h3 className="text-3xl font-bold text-white">PDF + DOCX In</h3>
                <div className="h-[1px] w-12 bg-white/20 group-hover:bg-white/40 transition-colors" />
              </div>
              <div className="mt-8 flex flex-col gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">
                <p>Auto-map into sections</p>
                <p>Editable before export</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative overflow-hidden rounded-[20px] border border-white/5 bg-[#0a0d14]/80 p-8 backdrop-blur-md transition-colors hover:bg-[#0d111a]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                  003 // Community
                </span>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <h3 className="text-3xl font-bold text-white">
                  {userCount ? `${userCount} Users` : "Active Users"}
                </h3>
                <div className="h-[1px] w-12 bg-white/20 group-hover:bg-white/40 transition-colors" />
              </div>
              <div className="mt-8 flex flex-col gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">
                <p>Unique visitors (local + cloud)</p>
                <p>Cloud remains per-user secured</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
