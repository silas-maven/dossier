import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileSearch, ShieldCheck, Target, Workflow } from "lucide-react";

export const metadata: Metadata = {
  title: "ATS Readiness Engine",
  description:
    "How Dossier estimates CV readiness using parser-safety, structure, evidence quality, and job-match checks without pretending to be a specific employer ATS.",
  alternates: {
    canonical: "/ats-readiness-engine"
  },
  openGraph: {
    title: "Dossier ATS Readiness Engine",
    description:
      "A transparent CV readiness estimate based on parser-safety, structure, evidence, and role-match signals.",
    url: "/ats-readiness-engine",
    type: "article"
  },
  twitter: {
    card: "summary_large_image",
    title: "Dossier ATS Readiness Engine",
    description:
      "See how Dossier estimates CV readiness without claiming to know a proprietary employer ATS score."
  }
};

const scoringLayers = [
  {
    icon: FileSearch,
    label: "Parser Safety",
    score: "25 pts",
    detail:
      "Checks template reading order, alignment, font sizing, visible empty sections, and layout risk before export."
  },
  {
    icon: Workflow,
    label: "Structure",
    score: "30 pts",
    detail:
      "Checks core contact details, target title, profile/summary, experience, skills, and recognisable section headings."
  },
  {
    icon: CheckCircle2,
    label: "Evidence Quality",
    score: "25 pts",
    detail:
      "Checks whether role entries have dates, bullet-style evidence, extractable skills, and measurable outcomes."
  },
  {
    icon: Target,
    label: "Job Match",
    score: "20 pts",
    detail:
      "When a job description is supplied, checks keyword coverage and headline alignment against the target role."
  }
];

const notClaims = [
  "It is not a Workday, Greenhouse, Lever, Taleo, iCIMS, or Ashby score.",
  "It cannot guarantee an interview or application pass.",
  "It does not invent employers, dates, tools, metrics, or certifications.",
  "It does not replace final human review of the exported PDF."
];

export default function AtsReadinessEnginePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(37,99,235,0.28),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(20,184,166,0.18),transparent_30%),linear-gradient(135deg,#030712_0%,#07111f_48%,#02040a_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
        <div className="absolute -bottom-48 -left-24 h-[32rem] w-[32rem] rounded-full border border-blue-200/10" />
      </div>

      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-10">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-flex items-center gap-3 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
            <ShieldCheck className="h-4 w-4" />
            Transparent CV scoring
          </div>
          <h1 className="mt-8 max-w-4xl text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-[0.86] tracking-[-0.06em]">
            ATS readiness, not fake certainty.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/62">
            Dossier estimates whether a CV is ready for application portals by checking the actual profile structure,
            template risk, evidence quality, and target-job coverage. The score is transparent because proprietary ATS
            platforms do not expose universal scoring rules.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#07111f] transition hover:bg-blue-100"
            >
              Start from a template
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ai-resume-optimizer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:border-blue-200/40"
            >
              Add AI review
            </Link>
          </div>
        </div>

        <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="rounded-[1.5rem] border border-blue-200/15 bg-[#050b14]/88 p-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                    Readiness estimate
                  </p>
                  <div className="mt-5 flex items-end gap-3">
                    <span className="text-7xl font-black tracking-tight">82</span>
                    <span className="pb-2 text-xl font-bold text-white/35">/100</span>
                  </div>
                </div>
                <span className="rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-100">
                  Good
                </span>
              </div>
              <div className="mt-8 space-y-3">
                {scoringLayers.map((layer, index) => (
                  <div
                    key={layer.label}
                    className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[auto_1fr_auto]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-400/10 text-blue-100">
                      <layer.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{layer.label}</p>
                      <p className="mt-1 text-xs leading-5 text-white/50">{layer.detail}</p>
                    </div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/45">{layer.score}</p>
                    <div
                      className="sm:col-span-3 h-1.5 overflow-hidden rounded-full bg-white/10"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-300"
                        style={{ width: `${86 - index * 9}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">Important boundary</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight">What the score does not claim</h2>
            <div className="mt-6 space-y-3">
              {notClaims.map((claim) => (
                <p key={claim} className="flex gap-3 text-sm leading-6 text-white/62">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                  {claim}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-blue-300/15 bg-blue-400/[0.055] p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-blue-100/65">How to use it</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Treat it as a pre-flight check.</h2>
            <p className="mt-5 text-sm leading-7 text-white/62">
              A high score means the CV is structurally cleaner and easier to parse. A lower score tells you where to
              focus: simplify the template, fix section naming, add missing core sections, improve weak bullets, or paste
              the target job description so Dossier can check role-specific coverage.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {["Fix structure", "Improve evidence", "Review job match"].map((step) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-[#050b14]/70 p-4">
                  <p className="text-sm font-bold text-white">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
