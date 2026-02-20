"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";

type AuthStatusButtonProps = {
  nextPath?: string;
};

export default function AuthStatusButton({ nextPath }: AuthStatusButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const supabase = useMemo(() => createSupabaseBrowserClientOrNull(), []);
  const authConfigured = Boolean(supabase);
  const next = useMemo(() => nextPath ?? pathname ?? "/templates", [nextPath, pathname]);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setEmail(data.user?.email ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  if (!authConfigured) {
    return (
      <Button type="button" variant="secondary" size="sm" disabled>
        Auth not configured
      </Button>
    );
  }

  if (!email) {
    return (
      <Button asChild variant="secondary" size="sm">
        <Link href={`/auth?next=${encodeURIComponent(next)}`}>Sign in</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-muted-foreground md:block">{email}</span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={async () => {
          const supabase = createSupabaseBrowserClientOrNull();
          if (!supabase) return;
          await supabase.auth.signOut();
          router.replace("/auth");
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
