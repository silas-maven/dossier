"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import DossierLogoLink from "@/components/navigation/dossier-logo-link";
import TemplateCarousel from "@/components/ui/template-carousel";
import { cvTemplates, type CvTemplate } from "@/lib/templates";
import type { DossierStorageMode } from "@/lib/storage-mode";
import AuthStatusButton from "@/components/auth/auth-status-button";

type TemplatesPickClientProps = {
  storageMode: DossierStorageMode;
};

export default function TemplatesPickClient({ storageMode }: TemplatesPickClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSelect = (template: CvTemplate) => {
    router.push(`/editor?template=${template.id}&storage=${storageMode}`);
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
              Storage mode: <span className="font-medium text-foreground">{storageMode}</span>{" "}
              <Link href="/storage" className="underline underline-offset-2">
                Change
              </Link>
            </p>
          </div>
          <AuthStatusButton nextPath={`/templates?storage=${storageMode}`} />
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Compare layouts, preview each style, and pick the one you want to edit. You can swap styles
          later without rewriting your content.
        </p>

        <div className="mt-8">
          <TemplateCarousel
            templates={cvTemplates}
            loading={loading}
            error={error}
            onRetry={() => {
              setLoading(true);
              setTimeout(() => {
                setError(false);
                setLoading(false);
              }, 500);
            }}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </main>
  );
}
