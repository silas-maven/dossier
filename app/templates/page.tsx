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

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const { storage } = await searchParams;
  const cookieStore = await cookies();
  const cookieStorage = cookieStore.get(STORAGE_MODE_COOKIE)?.value;

  const chosenMode =
    (isDossierStorageMode(storage) ? storage : null) ??
    (isDossierStorageMode(cookieStorage) ? cookieStorage : null);

  if (!chosenMode) {
    redirect("/storage");
  }
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
