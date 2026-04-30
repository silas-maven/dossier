"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  useTextScramble,
  useWordReveal,
  useOutlineReveal,
  useFadeUp,
  useCardEntrance,
  useCardTilt,
  useMagnetic,
  useCounter,
  useParallaxGrid,
  useBlobMouseTracking,
} from "./use-landing-effects";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type ExperienceHeroProps = {
  ctaHref: string;
  templateCount: number;
  userCount?: number | null;
};

/* ------------------------------------------------------------------ */
/*  Tilt Card Wrapper                                                  */
/* ------------------------------------------------------------------ */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useCardTilt(ref);

  return (
    <div
      ref={ref}
      data-card
      className="group relative overflow-hidden rounded-[20px] border border-white/5 bg-[#0a0d14]/80 p-8 backdrop-blur-md transition-colors hover:bg-[#0d111a] cursor-pointer"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Glossy highlight overlay */}
      <div
        data-highlight
        className="pointer-events-none absolute inset-0 rounded-[20px]"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15), transparent 60%)",
          opacity: 0,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Counter Display                                                    */
/* ------------------------------------------------------------------ */
function CounterValue({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useCounter(ref, value, 1.5);

  return (
    <>
      <span ref={ref}>0</span>{suffix}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Hero                                                          */
/* ------------------------------------------------------------------ */
export default function ExperienceHero({ ctaHref, templateCount, userCount }: ExperienceHeroProps) {
  // Refs for animations
  const labelRef = useRef<HTMLSpanElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);

  // Wire up effects
  useTextScramble(labelRef, "DOSSIER CV BUILDER", 200);
  useWordReveal(titleContainerRef, 0.5);
  useOutlineReveal(outlineRef, 1.1);
  useFadeUp(descRef, 1.6);
  useFadeUp(ctaRef, 1.9);
  useCardEntrance(cardsRef, 1.4);
  useMagnetic(ctaRef, 0.25);
  useParallaxGrid(gridRef);
  useBlobMouseTracking(blobRef);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0a0d14] text-white">
      {/* Inline keyframes */}
      <style>{`
        @keyframes brutalist-blob {
          0% { border-radius: 40% 60% 55% 45% / 50% 40% 60% 50%; transform: rotate(0deg); }
          50% { border-radius: 60% 40% 45% 55% / 40% 50% 50% 60%; transform: rotate(180deg) scale(1.05); }
          100% { border-radius: 40% 60% 55% 45% / 50% 40% 60% 50%; transform: rotate(360deg); }
        }
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.07; }
        }
      `}</style>

      {/* ── Background Layers ── */}

      {/* Parallax Grid */}
      <div
        ref={gridRef}
        className="pointer-events-none absolute -inset-4"
        style={{ animation: "grid-pulse 8s ease-in-out infinite" }}
      >
        <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Brutalist Void Blob */}
      <div
        ref={blobRef}
        className="pointer-events-none absolute"
        style={{
          top: "10%",
          right: "-10%",
          width: "70vw",
          height: "70vw",
          minWidth: "600px",
          minHeight: "600px",
          backgroundColor: "#000000",
          border: "1px solid rgba(255,255,255,0.05)",
          animation: "brutalist-blob 30s linear infinite",
          zIndex: 0,
        }}
      />

      {/* Edge fade overlays */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[35%] bg-gradient-to-l from-[#0a0d14]/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-[#0a0d14] to-transparent" />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col justify-center px-6 py-12 lg:px-12 xl:px-20">
        <div className="grid gap-16 lg:grid-cols-[1fr_400px] lg:gap-8 xl:grid-cols-[1fr_460px]">

          {/* Left Column: Typography & CTA */}
          <div className="flex flex-col justify-center">
            {/* Label with text scramble */}
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span
                ref={labelRef}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/80"
                aria-label="Dossier CV Builder"
              >
                &nbsp;
              </span>
            </div>

            {/* Title — word-by-word reveal */}
            <div ref={titleContainerRef} className="mt-12 flex flex-col">
              <h1 className="text-[clamp(4rem,12vw,9rem)] font-black uppercase leading-[0.85] tracking-tight text-white">
                {["Build", "CVs", "That"].map((word) => (
                  <span key={word} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
                    <span data-reveal-word className="inline-block">
                      {word}
                    </span>
                  </span>
                ))}
              </h1>

              {/* Outline text — scale reveal */}
              <h1
                ref={outlineRef}
                className="mt-2 text-[clamp(4rem,12vw,9rem)] font-black uppercase leading-[0.85] tracking-tight"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "1px rgba(255,255,255,0.6)",
                  opacity: 0,
                }}
              >
                Look Hired
              </h1>
            </div>

            {/* Description — fade up */}
            <p
              ref={descRef}
              className="mt-14 max-w-xl font-mono text-[11px] uppercase leading-relaxed tracking-[0.15em] text-white/50"
              style={{ opacity: 0 }}
            >
              Craft professional resumes with structured templates,
              <br className="hidden sm:block" />
              local-first editing, and export-ready layouts for fintech,
              <br className="hidden sm:block" />
              consulting, and project delivery roles.
            </p>

            {/* CTA — magnetic + fill animation */}
            <div ref={ctaRef} className="mt-14 flex items-center" style={{ opacity: 0 }}>
              <Link
                href={ctaHref}
                className="group relative inline-flex h-16 items-center justify-center gap-4 overflow-hidden rounded-full bg-white px-10 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-black transition-transform hover:scale-105 active:scale-95"
                aria-label="Browse Templates"
              >
                <span className="relative z-10">Browse Templates</span>
                <ArrowUpRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-white via-white to-neutral-200 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Right Column: Information Cards */}
          <div ref={cardsRef} className="flex flex-col justify-center gap-6">
            {/* Card 1 */}
            <TiltCard>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                  001 // Template Library
                </span>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <h3 className="text-3xl font-bold text-white">
                  <CounterValue value={templateCount} suffix="+ Styles" />
                </h3>
                <div className="h-[1px] w-12 bg-white/20 group-hover:bg-white/40 transition-colors" />
              </div>
              <div className="mt-8 flex flex-col gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">
                <p>Fintech + Consulting</p>
                <p>Consistent PDF exports</p>
              </div>
            </TiltCard>

            {/* Card 2 */}
            <TiltCard>
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
            </TiltCard>

            {/* Card 3 */}
            <TiltCard>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                  003 // Community
                </span>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <h3 className="text-3xl font-bold text-white">
                  {userCount ? (
                    <CounterValue value={userCount} suffix=" Users" />
                  ) : (
                    "Active Users"
                  )}
                </h3>
                <div className="h-[1px] w-12 bg-white/20 group-hover:bg-white/40 transition-colors" />
              </div>
              <div className="mt-8 flex flex-col gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">
                <p>Unique visitors (local + cloud)</p>
                <p>Cloud remains per-user secured</p>
              </div>
            </TiltCard>
          </div>

        </div>
      </div>
    </main>
  );
}
