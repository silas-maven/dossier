import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resume.io Alternative (Free, Local-First)",
  description:
    "Compare Dossier and Resume.io for free CV building, local-first privacy, and ATS-friendly PDF export.",
  alternates: {
    canonical: "/resume-io-alternative"
  },
  openGraph: {
    title: "Resume.io Alternative: Dossier CV Builder",
    description:
      "A practical comparison for job seekers who want a free CV builder with local mode and PDF export.",
    url: "/resume-io-alternative",
    type: "article"
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume.io Alternative: Dossier CV Builder",
    description: "Free CV builder comparison focused on privacy, speed, and ATS-friendly output.",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Resume.io Alternative for Free CV Building",
  description:
    "A practical comparison between Dossier and Resume.io covering cost, privacy, ATS readiness, and export speed.",
  author: { "@type": "Person", name: "Hamza Ntwari", url: "https://hntwari.vercel.app" },
  publisher: { "@type": "Organization", name: "Dossier CV Builder" },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://your-dossier.xyz/resume-io-alternative" },
};

export default function ResumeIoAlternativePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[#03050b] px-6 py-14 text-white md:px-12 lg:px-16">
        <article className="mx-auto max-w-4xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">Comparison</p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Resume.io alternative for free CV building</h1>
          <p className="mt-5 text-white/80">
            If you need a practical Resume.io alternative, Dossier is built for fast editing, template switching,
            and PDF export without forcing paid subscriptions for core flow.
          </p>

          <h2 className="mt-10 text-xl font-semibold">What to compare</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-white/80">
            <li>Cost for core workflow: create, edit, preview, export.</li>
            <li>Privacy model: local-first editing vs account-only flow.</li>
            <li>ATS readiness: clean structure and predictable spacing.</li>
            <li>Speed: live editing feedback and export reliability.</li>
          </ul>

          <h2 className="mt-10 text-xl font-semibold">Why job seekers choose Dossier</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-white/80">
            <li>Start in local mode without mandatory signup.</li>
            <li>Optional cloud sync with per-user account scoping.</li>
            <li>Template-first workflow with live preview and PDF export.</li>
          </ul>

          <div className="mt-12 rounded-2xl border border-white/15 bg-white/5 p-6">
            <p className="text-sm text-white/75">Next step</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/storage"
                className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
              >
                Try Dossier free
              </Link>
              <Link
                href="/templates"
                className="rounded-lg border border-white/25 bg-transparent px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                View templates
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
