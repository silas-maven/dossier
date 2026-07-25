"use client";

import { useRouter } from "next/navigation";

import DossierLogoLink from "@/components/navigation/dossier-logo-link";
import TemplateCarousel from "@/components/ui/template-carousel";
import { publicCvTemplates, type CvTemplate } from "@/lib/templates";

export default function TemplatesPickClient() {
  const router = useRouter();

  const handleSelect = (template: CvTemplate) => {
    router.push(`/editor?template=${template.id}`);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <DossierLogoLink />
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Dossier Templates
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Choose your CV style</h1>
            <p className="mt-2 text-xs text-muted-foreground">
              Free to use · no account required · optional AI · local autosave
            </p>
          </div>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Start with your industry, then choose a parser-friendly upload format or a more expressive direct-send
          format. The builder and ATS checks work without AI.
        </p>

        <div className="mt-8">
          <TemplateCarousel templates={publicCvTemplates} onSelect={handleSelect} />
        </div>
      </div>
    </main>
  );
}
