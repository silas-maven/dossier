"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import DossierLogoLink from "@/components/navigation/dossier-logo-link";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";

export default function AuthPage() {
  const sanitizeNextPath = (value: string | null) => {
    if (!value) return "/templates?storage=cloud";
    if (!value.startsWith("/")) return "/templates?storage=cloud";
    return value;
  };

  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [next, setNext] = useState("/templates?storage=cloud");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [authConfigured, setAuthConfigured] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextParam = params.get("next");
    setNext(sanitizeNextPath(nextParam));
    setAuthConfigured(Boolean(createSupabaseBrowserClientOrNull()));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClientOrNull();
      if (!supabase) {
        throw new Error(
          "Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
      }
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.replace(next);
      } else {
        const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
        const appBaseUrl = configuredBaseUrl && configuredBaseUrl.length > 0 ? configuredBaseUrl : window.location.origin;
        const emailRedirectTo = `${appBaseUrl}/auth/callback?next=${encodeURIComponent(next)}`;
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo }
        });
        if (signUpError) throw signUpError;
        setMessage("Account created. If email confirmation is enabled, check your inbox.");
        setMode("signin");
      }
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Authentication failed.";
      setError(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-12 md:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <DossierLogoLink />
        <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-border/70 bg-card/80 p-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "signin" ? "Sign in" : "Create account"}
            </h1>
            <p className="text-sm text-muted-foreground">Use email and password to access CV cloud storage.</p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
            {!authConfigured ? (
              <p className="text-sm text-amber-400">
                Supabase auth environment variables are missing in your current runtime.
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading || !authConfigured}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
              className="text-primary hover:underline"
            >
              {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>

            <Link href="/templates" className="text-muted-foreground hover:underline">
              Back
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
