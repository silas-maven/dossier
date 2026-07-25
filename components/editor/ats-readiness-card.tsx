"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, FileSearch, Info, ShieldCheck, X } from "lucide-react";

import { analyzeAtsReadiness } from "@/lib/ats-readiness";
import { analyzeCvFit, CV_FIT_LIMITS } from "@/lib/cv-fit";
import type { CvProfile } from "@/lib/cv-profile";
import type { CvTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

type AtsReadinessCardProps = {
  profile: CvProfile;
  template: CvTemplate;
  jobDescription?: string;
  compact?: boolean;
  enableLocalJobCheck?: boolean;
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
  compact = false,
  enableLocalJobCheck = !compact && jobDescription === undefined
}: AtsReadinessCardProps) {
  const [showToast, setShowToast] = useState(false);
  const [localJobDescription, setLocalJobDescription] = useState("");
  const activeJobDescription = jobDescription ?? localJobDescription;
  const result = useMemo(
    () => analyzeAtsReadiness(profile, template, activeJobDescription),
    [activeJobDescription, profile, template]
  );
  const fit = useMemo(() => analyzeCvFit(profile), [profile]);
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
        {!compact ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              {
                label: "Words",
                value: `${fit.visibleWords}/${CV_FIT_LIMITS.visibleWords}`,
                warning: fit.visibleWords > CV_FIT_LIMITS.visibleWords
              },
              {
                label: "Skills",
                value: `${fit.skillCount}/${CV_FIT_LIMITS.skills}`,
                warning: fit.skillCount > CV_FIT_LIMITS.skills
              },
              {
                label: "Bullets",
                value: `${fit.bulletCount}/${CV_FIT_LIMITS.bullets}`,
                warning: fit.bulletCount > CV_FIT_LIMITS.bullets
              },
              {
                label: "Page target",
                value: `${fit.pageTarget} max`,
                warning: false
              }
            ].map((metric) => (
              <div
                key={metric.label}
                className={cn(
                  "rounded-xl border bg-white/[0.035] p-3",
                  metric.warning ? "border-amber-300/30" : "border-white/10"
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  {metric.label}
                </p>
                <p className={cn("mt-1 text-sm font-bold", metric.warning ? "text-amber-200" : "text-white")}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
        {!compact && (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {result.groups
              .filter((group) => group.id !== "jobMatch" || Boolean(activeJobDescription.trim()))
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

        {enableLocalJobCheck ? (
          <details className="mt-4 rounded-xl border border-white/10 bg-black/10 p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-white/82">
              <span className="flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-blue-200" />
                Check against a job description
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-200/80">
                Local · no AI
              </span>
            </summary>
            <p className="mt-2 text-xs leading-5 text-white/52">
              Paste the role text to compare terminology locally. Nothing is sent to an AI provider.
            </p>
            <textarea
              value={localJobDescription}
              onChange={(event) => setLocalJobDescription(event.target.value)}
              className="mt-3 h-32 w-full resize-y rounded-xl border border-white/10 bg-[#07101f] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-300/40"
              placeholder="Paste the job description..."
            />
            {activeJobDescription.trim() ? (
              <div className="mt-3">
                <p className="text-xs font-semibold text-white/70">
                  {result.missingKeywords.length
                    ? `${result.missingKeywords.length} role terms are not yet represented`
                    : "No missing role terms detected by the local check"}
                </p>
                {result.missingKeywords.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result.missingKeywords.slice(0, 12).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border border-amber-300/20 bg-amber-300/8 px-2 py-1 text-[11px] text-amber-100"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </details>
        ) : null}

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
            Dossier checks parser safety, section structure, evidence quality, content fit, and local job-match coverage.
            It is a transparent readiness estimate, not a score from a specific employer ATS.
          </p>
        </div>
      ) : null}
    </>
  );
}
