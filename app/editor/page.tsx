import { cvTemplates } from "@/lib/templates";
import EditorForm from "@/app/editor/editor-form";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";
import AuthStatusButton from "@/components/auth/auth-status-button";
import DossierLogoLink from "@/components/navigation/dossier-logo-link";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { isDossierStorageMode, STORAGE_MODE_COOKIE, type DossierStorageMode } from "@/lib/storage-mode";

type EditorPageProps = {
  searchParams: Promise<{ template?: string; storage?: string }>;
};

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const { template, storage } = await searchParams;
  const cookieStore = await cookies();
  const cookieStorage = cookieStore.get(STORAGE_MODE_COOKIE)?.value;
  const requestedMode: DossierStorageMode =
    (isDossierStorageMode(storage) ? storage : null) ??
    (isDossierStorageMode(cookieStorage) ? cookieStorage : null) ??
    "local";
  const supabaseConfigured = hasSupabasePublicEnv();

  if (requestedMode === "cloud" && !supabaseConfigured) {
    return (
      <main className="min-h-screen bg-background px-3 py-8 md:px-6 xl:px-8">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <DossierLogoLink />
          <Button asChild variant="secondary" size="sm">
            <Link href="/storage">
              <ChevronLeft className="h-4 w-4" />
              Back to storage choice
            </Link>
          </Button>
          <div className="rounded-2xl border border-border/70 bg-card/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Auth Setup Required
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Supabase environment variables are missing
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,
              then restart the dev server.
            </p>
          </div>
        </div>
      </main>
    );
  }
  if (requestedMode === "cloud") {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      const nextTarget = `/editor${
        template || requestedMode
          ? `?${new URLSearchParams({
              ...(template ? { template } : {}),
              storage: requestedMode
            }).toString()}`
          : ""
      }`;
      redirect(`/auth?next=${encodeURIComponent(nextTarget)}`);
    }
  }

  const selectedTemplate = cvTemplates.find((item) => item.id === template) ?? cvTemplates[0];
  const backHref = `/templates?storage=${requestedMode}`;

  return (
    <main className="min-h-screen bg-background px-3 py-8 md:px-6 xl:px-8">
      <div className="mx-auto w-full max-w-[2100px] space-y-6">
        <DossierLogoLink />
        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button asChild variant="secondary" size="sm">
              <Link href={backHref}>
                <ChevronLeft className="h-4 w-4" />
                Back to templates
              </Link>
            </Button>
            {supabaseConfigured ? (
              <AuthStatusButton
                nextPath={`/editor?template=${selectedTemplate.id}&storage=${requestedMode}`}
              />
            ) : null}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Editor
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Build your CV</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Template selected: {selectedTemplate.name} ({selectedTemplate.id}).
          </p>
        </div>
        <EditorForm
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.name}
          preferredStorageMode={requestedMode}
        />
      </div>
    </main>
  );
}
