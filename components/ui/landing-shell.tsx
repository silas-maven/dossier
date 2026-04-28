"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  useLenis,
  useScrollProgress,
  useCursorFollower,
  useClipReveal,
  useScrollStagger,
} from "@/components/ui/use-landing-effects";

/* ------------------------------------------------------------------ */
/*  Landing Shell — Client wrapper for scroll effects                  */
/* ------------------------------------------------------------------ */
export default function LandingShell({ children }: { children: React.ReactNode }) {
  const compareTitleRef = useRef<HTMLHeadingElement>(null);
  const compareGridRef = useRef<HTMLDivElement>(null);

  // Global effects
  useLenis();
  useScrollProgress();
  useCursorFollower();

  // Scroll-triggered reveals
  useClipReveal(compareTitleRef);
  useScrollStagger(compareGridRef);

  return (
    <>
      {children}

      {/* Compare Section — scroll-triggered */}
      <section className="border-t border-white/10 bg-[#03050b] px-6 py-16 md:px-12 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <h2
            ref={compareTitleRef}
            className="text-xl font-semibold text-white md:text-2xl"
          >
            Compare CV builder options
          </h2>
          <p className="mt-3 text-sm text-white/70">
            Practical guides for choosing a free CV builder based on privacy, ATS quality, and export flow.
          </p>
          <div
            ref={compareGridRef}
            className="mt-6 grid gap-3 sm:grid-cols-4"
          >
            {[
              { href: "/ai-resume-optimizer", label: "AI ATS Optimizer" },
              { href: "/resume-io-alternative", label: "Resume.io alternative" },
              { href: "/zety-alternative", label: "Zety alternative" },
              { href: "/free-cv-builder-uk", label: "Free CV builder UK" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-stagger-item
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:translate-y-[-2px]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
