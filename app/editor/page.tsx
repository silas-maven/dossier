import { getTemplateById } from "@/lib/templates";
import { getTemplateGuidanceProfile } from "@/lib/template-guidance";
import EditorForm from "@/app/editor/editor-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DossierLogoLink from "@/components/navigation/dossier-logo-link";

type EditorPageProps = {
  searchParams: Promise<{ template?: string; storage?: string }>;
};

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const { template } = await searchParams;

  const selectedTemplate = getTemplateById(template);
  const guidanceProfile = getTemplateGuidanceProfile(selectedTemplate.guidanceProfileId);

  return (
    <main className="min-h-screen bg-background px-3 py-8 md:px-6 xl:px-8">
      <div className="mx-auto w-full max-w-[2100px] space-y-6">
        <DossierLogoLink />
        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button asChild variant="secondary" size="sm">
              <Link href="/templates">
                <ChevronLeft className="h-4 w-4" />
                Back to templates
              </Link>
            </Button>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Editor
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Build your CV</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Template selected: {selectedTemplate.name} ({selectedTemplate.layout}, {selectedTemplate.atsMode} mode).
          </p>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {guidanceProfile.label}: {selectedTemplate.guidance[0]}
          </p>
        </div>
        <EditorForm
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.name}
          preferredStorageMode="local"
        />
      </div>
    </main>
  );
}
