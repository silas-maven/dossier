import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free CV Builder UK",
  description:
    "Free CV builder for UK job seekers. Build ATS-friendly CVs with local-first editing, template selection, and PDF export.",
  alternates: {
    canonical: "/free-cv-builder-uk"
  },
  openGraph: {
    title: "Free CV Builder UK: Dossier",
    description: "UK-focused CV builder guide for fast, professional, ATS-friendly resumes.",
    url: "/free-cv-builder-uk",
    type: "article"
  },
  twitter: {
    card: "summary_large_image",
    title: "Free CV Builder UK: Dossier",
    description: "A free UK CV workflow: pick template, edit live, export PDF.",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Free CV Builder for UK Applications",
  description:
    "How UK job seekers can build professional, ATS-friendly CVs with local-first editing and PDF export.",
  author: { "@type": "Person", name: "Hamza Ntwari", url: "https://hntwari.vercel.app" },
  publisher: { "@type": "Organization", name: "Dossier CV Builder" },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.your-dossier.xyz/free-cv-builder-uk" },
};

export default function FreeCvBuilderUkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[#03050b] px-6 py-14 text-white md:px-12 lg:px-16">
        <article className="mx-auto max-w-4xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">UK Job Search</p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Free CV builder for UK applications</h1>
          <p className="mt-5 text-white/80">
            Dossier helps UK candidates quickly produce professional CVs with a consistent structure, live preview,
            and PDF export.
          </p>

          <h2 className="mt-10 text-xl font-semibold">Workflow</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-white/80">
            <li>Select a template for your target role and ATS risk.</li>
            <li>Import or type your experience into structured sections.</li>
            <li>Review content, tailor it to the job, and export as PDF.</li>
          </ol>

          <h2 className="mt-10 text-xl font-semibold">Why this helps</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-white/80">
            <li>Simple structure for UK hiring workflows.</li>
            <li>Fast iteration before sending applications.</li>
            <li>Free core flow without subscription lock-in.</li>
          </ul>

          <div className="mt-12 rounded-2xl border border-white/15 bg-white/5 p-6">
            <p className="text-sm text-white/75">Build your CV</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/templates"
                className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
              >
                Browse templates
              </Link>
              <Link
                href="/resume-io-alternative"
                className="rounded-lg border border-white/25 bg-transparent px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Compare builders
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
