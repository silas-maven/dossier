import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import TemplatesPickClient from "@/app/templates/templates-pick-client";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";
import {
  isDossierStorageMode,
  STORAGE_MODE_COOKIE,
  type DossierStorageMode
} from "@/lib/storage-mode";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

type TemplatesPageProps = {
  searchParams: Promise<{ storage?: string }>;
};

export const metadata: Metadata = {
  title: "CV Templates",
  description:
    "Browse professional CV templates and start editing instantly with live preview and PDF export.",
  alternates: {
    canonical: "/templates"
  },
  openGraph: {
    title: "Dossier CV Templates",
    description: "Compare resume layouts and pick the best template for your role.",
    url: "/templates",
    images: ["/icon.svg"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Dossier CV Templates",
    description: "Choose from multiple ATS-friendly CV templates.",
    images: ["/icon.svg"]
  }
};

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const { storage } = await searchParams;
  const cookieStore = await cookies();
  const cookieStorage = cookieStore.get(STORAGE_MODE_COOKIE)?.value;

  const chosenMode =
    (isDossierStorageMode(storage) ? storage : null) ??
    (isDossierStorageMode(cookieStorage) ? cookieStorage : null) ??
    "local";

  if (chosenMode === "cloud") {
    if (!hasSupabasePublicEnv()) {
      redirect("/storage");
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth?next=%2Ftemplates%3Fstorage%3Dcloud");
    }
  }

  return <TemplatesPickClient storageMode={chosenMode as DossierStorageMode} />;
}
