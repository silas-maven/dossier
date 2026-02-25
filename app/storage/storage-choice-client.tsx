"use client";

import { useRouter } from "next/navigation";
import { Database, HardDrive } from "lucide-react";

import DossierLogoLink from "@/components/navigation/dossier-logo-link";
import { Button } from "@/components/ui/button";
import { STORAGE_MODE_COOKIE, type DossierStorageMode } from "@/lib/storage-mode";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";

const setModeCookie = (mode: DossierStorageMode) => {
  document.cookie = `${STORAGE_MODE_COOKIE}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
};

export default function StorageChoicePage() {
  const router = useRouter();
  const supabaseConfigured = Boolean(createSupabaseBrowserClientOrNull());

  const chooseLocal = () => {
    setModeCookie("local");
    router.push("/templates?storage=local");
  };

  const chooseCloud = async () => {
    if (!supabaseConfigured) {
      return;
    }
    setModeCookie("cloud");
    const supabase = createSupabaseBrowserClientOrNull();
    if (!supabase) {
      router.push("/auth?next=%2Ftemplates%3Fstorage%3Dcloud");
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      router.push("/templates?storage=cloud");
      return;
    }

    router.push("/auth?next=%2Ftemplates%3Fstorage%3Dcloud");
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <DossierLogoLink />
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Storage Choice
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Choose where your CV data lives</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Local keeps data in your browser only. Cloud stores profiles in Supabase with per-user access.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-border/70 bg-card/80 p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70">
              <HardDrive className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Local storage</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We do not keep your CV data on our servers in this mode.
            </p>
            <Button type="button" className="mt-5" onClick={chooseLocal}>
              Continue with local
            </Button>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card/80 p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70">
              <Database className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Supabase cloud</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Secure account-based storage with profile sync across sessions. Sign in is required.
            </p>
            {!supabaseConfigured ? (
              <p className="mt-2 text-xs text-amber-400">
                Supabase env vars are missing right now. Configure them before cloud login.
              </p>
            ) : null}
            <Button
              type="button"
              className="mt-5"
              onClick={() => void chooseCloud()}
              disabled={!supabaseConfigured}
            >
              Continue with cloud
            </Button>
          </section>
        </div>
      </div>
    </main>
  );
}
