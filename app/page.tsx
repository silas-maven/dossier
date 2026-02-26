import type { Metadata } from "next";
import Link from "next/link";
import ExperienceHero from "@/components/ui/experience-hero";
import { cvTemplates } from "@/lib/templates";
import { getDossierUserCount } from "@/lib/user-count";

const resolvePageBase = () => {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      // Fall through.
    }
  }
  return new URL("http://localhost:3000");
};

const metadataBase = resolvePageBase();

export const metadata: Metadata = {
  title: "Free CV Builder for ATS-Friendly Resumes",
  description:
    "Build and export professional CVs with structured templates, local-first editing, and secure cloud sync.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Dossier CV Builder",
    description:
      "Create ATS-friendly resumes with live preview, quick editing, and one-click PDF export.",
    url: "/",
    siteName: "Dossier CV Builder",
    images: ["/icon.svg"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Dossier CV Builder",
    description: "Free local-first CV builder with professional templates and PDF export.",
    images: ["/icon.svg"]
  }
};

export default async function HomePage() {
  const userCount = await getDossierUserCount();
  const baseUrl = metadataBase.toString().replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Dossier CV Builder",
        url: baseUrl,
        description: "Local-first CV builder with professional templates and PDF export."
      },
      {
        "@type": "SoftwareApplication",
        name: "Dossier CV Builder",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD"
        },
        url: baseUrl,
        description:
          "Build ATS-friendly CVs with live editing, template switching, and export-ready PDF output."
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is Dossier free to use?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. You can build and export CVs without a paid subscription."
            }
          },
          {
            "@type": "Question",
            name: "Can I keep my CV data local?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Local mode keeps CV data in your browser."
            }
          },
          {
            "@type": "Question",
            name: "Does Dossier support cloud sync?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Cloud mode uses secure account-based storage for per-user profile sync."
            }
          },
          {
            "@type": "Question",
            name: "Can I export my CV as PDF?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Every template supports PDF export from the editor."
            }
          }
        ]
      },
      {
        "@type": "Person",
        name: "Hamza Ntwari",
        url: "https://hntwari.vercel.app"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExperienceHero ctaHref="/storage" templateCount={cvTemplates.length} userCount={userCount} />
      <section className="border-t border-white/10 bg-[#03050b] px-6 py-12 md:px-12 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold text-white md:text-2xl">Compare CV builder options</h2>
          <p className="mt-3 text-sm text-white/70">
            Practical guides for choosing a free CV builder based on privacy, ATS quality, and export flow.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              href="/resume-io-alternative"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
            >
              Resume.io alternative
            </Link>
            <Link
              href="/zety-alternative"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
            >
              Zety alternative
            </Link>
            <Link
              href="/free-cv-builder-uk"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
            >
              Free CV builder UK
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
