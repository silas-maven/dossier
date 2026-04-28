import type { Metadata } from "next";
import ExperienceHero from "@/components/ui/experience-hero";
import LandingShell from "@/components/ui/landing-shell";
import { publicCvTemplates } from "@/lib/templates";
import { getDossierUserCount } from "@/lib/user-count";

export const dynamic = "force-dynamic";

const resolvePageBase = () => {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      // Fall through.
    }
  }
  return new URL("https://www.your-dossier.xyz");
};

const metadataBase = resolvePageBase();

export const metadata: Metadata = {
  title: "Free CV Builder for ATS-Friendly Resumes",
  description:
    "Build and export professional CVs with structured templates, local-first editing, and guided AI review.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Dossier CV Builder",
    description:
      "Create ATS-friendly resumes with live preview, quick editing, and one-click PDF export.",
    url: "/",
    siteName: "Dossier CV Builder",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Dossier CV Builder",
    description: "Free local-first CV builder with professional templates and PDF export.",
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
              text: "Yes. Dossier autosaves your working CV in your browser by default."
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
      <LandingShell>
        <ExperienceHero ctaHref="/templates" templateCount={publicCvTemplates.length} userCount={userCount} />
      </LandingShell>
    </>
  );
}
