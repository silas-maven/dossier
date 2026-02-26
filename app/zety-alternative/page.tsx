import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zety Alternative (Free CV Builder)",
  description:
    "Looking for a Zety alternative? Compare Dossier for free CV editing, privacy-first options, and ATS-friendly export.",
  alternates: {
    canonical: "/zety-alternative"
  },
  openGraph: {
    title: "Zety Alternative: Dossier CV Builder",
    description:
      "A clear alternative guide for job seekers who need free, fast, ATS-friendly resume creation.",
    url: "/zety-alternative",
    images: ["/icon.svg"],
    type: "article"
  },
  twitter: {
    card: "summary_large_image",
    title: "Zety Alternative: Dossier CV Builder",
    description: "Compare free CV workflows with local-first and cloud-sync options.",
    images: ["/icon.svg"]
  }
};

export default function ZetyAlternativePage() {
  return (
    <main className="min-h-screen bg-[#03050b] px-6 py-14 text-white md:px-12 lg:px-16">
      <article className="mx-auto max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">Comparison</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Zety alternative for ATS-focused CVs</h1>
        <p className="mt-5 text-white/80">
          Dossier is a practical Zety alternative when you want a free workflow with strong template control and
          predictable PDF output.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Decision checklist</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-white/80">
          <li>Can you start editing immediately without payment friction?</li>
          <li>Do templates stay readable and ATS-friendly after export?</li>
          <li>Can you keep data local and still opt into cloud later?</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">Dossier fit</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-white/80">
          <li>Local-first mode available from start.</li>
          <li>Cloud mode is optional and account-scoped.</li>
          <li>Live preview + PDF export for fast iteration before applying.</li>
        </ul>

        <div className="mt-12 rounded-2xl border border-white/15 bg-white/5 p-6">
          <p className="text-sm text-white/75">Start now</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/storage"
              className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
            >
              Start building
            </Link>
            <Link
              href="/free-cv-builder-uk"
              className="rounded-lg border border-white/25 bg-transparent px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              UK-focused guide
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
