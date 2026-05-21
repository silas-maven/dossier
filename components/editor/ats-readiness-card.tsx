"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Info, ShieldCheck, X } from "lucide-react";

import { analyzeAtsReadiness } from "@/lib/ats-readiness";
import type { CvProfile } from "@/lib/cv-profile";
import type { CvTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

type AtsReadinessCardProps = {
  profile: CvProfile;
  template: CvTemplate;
  jobDescription?: string;
  compact?: boolean;
};

const bandTone = {
  Excellent: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  Good: "border-blue-400/40 bg-blue-500/10 text-blue-200",
  "Needs work": "border-amber-400/40 bg-amber-500/10 text-amber-200",
  Risky: "border-red-400/40 bg-red-500/10 text-red-200"
} as const;

export default function AtsReadinessCard({
  profile,
  template,
  jobDescription,
  compact = false
}: AtsReadinessCardProps) {
  const [showToast, setShowToast] = useState(false);
  const result = useMemo(
    () => analyzeAtsReadiness(profile, template, jobDescription),
    [profile, template, jobDescription]
  );
  const topIssues = result.groups
    .flatMap((group) => group.checks.map((check) => ({ ...check, group: group.label })))
    .filter((check) => !check.passed)
    .slice(0, compact ? 2 : 4);

  const explain = () => {
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 6500);
  };

  return (
    <>
      <section className="rounded-2xl border border-blue-400/20 bg-[linear-gradient(135deg,rgba(37,99,235,0.14),rgba(3,5,9,0.84))] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/80">
              <ShieldCheck className="h-4 w-4" />
              ATS readiness estimate
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <p className="text-4xl font-black tracking-tight text-white">{result.score}</p>
              <p className="pb-1 text-sm font-semibold text-white/60">/100</p>
              <span className={cn("mb-1 rounded-full border px-2.5 py-1 text-xs font-semibold", bandTone[result.band])}>
                {result.band}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={explain}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-blue-300/40 hover:text-white"
          >
            <Info className="h-4 w-4" />
            Explain
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-white/68">{result.summary}</p>
        {!compact && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {result.groups
              .filter((group) => group.id !== "jobMatch" || Boolean(jobDescription?.trim()))
              .map((group) => (
                <div key={group.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">{group.label}</p>
                    <p className="text-sm font-bold text-white">
                      {group.score}/{group.maxScore}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {topIssues.length > 0 ? (
          <div className="mt-4 space-y-2">
            {topIssues.map((issue) => (
              <p key={issue.id} className="flex gap-2 text-xs leading-5 text-white/58">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                <span>
                  <span className="font-semibold text-white/78">{issue.label}:</span> {issue.detail}
                </span>
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            No major readiness issues detected by the deterministic checks.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/50">
          <span>{result.disclaimer}</span>
          <Link href="/ats-readiness-engine" className="font-semibold text-blue-200 underline underline-offset-4">
            How this engine works
          </Link>
        </div>
      </section>

      {showToast ? (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-blue-300/25 bg-[#07111f]/95 p-4 text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="absolute right-3 top-3 rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Dismiss ATS readiness explanation"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="pr-8 text-sm font-semibold">What this score means</p>
          <p className="mt-2 text-xs leading-5 text-white/65">
            Dossier checks parser safety, section structure, evidence quality, and job-match coverage when a job
            description is provided. It is a transparent readiness estimate, not a score from a specific employer ATS.
          </p>
        </div>
      ) : null}
    </>
  );
}
