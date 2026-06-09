"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { AiMode } from "@/components/editor/use-managed-ai";
import { CREDIT_BUNDLES } from "@/lib/ai/credit-bundles";
import { startCreditsCheckout } from "@/lib/ai/wallet";

const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2).replace(/\.00$/, "")}`;

// Toggle between bring-your-own-key (free, unlimited) and Dossier AI (metered credits).
// In Dossier-AI mode it shows the balance and one-tap buy buttons that start a Stripe
// Checkout Session. No model details are ever surfaced — to the user it is "Dossier AI".
export function AiModeBar({
  mode,
  setMode,
  credits,
  token,
  className
}: {
  mode: AiMode;
  setMode: (mode: AiMode) => void;
  credits: number | null;
  token: string;
  className?: string;
}) {
  const [busyBundle, setBusyBundle] = useState<string | null>(null);

  const buy = async (bundle: string) => {
    if (!token || busyBundle) return;
    setBusyBundle(bundle);
    const url = await startCreditsCheckout(token, bundle);
    if (url) {
      window.location.assign(url);
    } else {
      setBusyBundle(null);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 gap-1 rounded-lg border bg-background p-1">
        <button
          type="button"
          onClick={() => setMode("byok")}
          className={cn(
            "rounded-md px-2 py-1.5 text-xs font-medium transition",
            mode === "byok" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Your API key
        </button>
        <button
          type="button"
          onClick={() => setMode("dossier")}
          className={cn(
            "rounded-md px-2 py-1.5 text-xs font-medium transition",
            mode === "dossier" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Dossier AI
        </button>
      </div>
      {mode === "dossier" && (
        <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">
            Credits: <strong className="text-foreground">{credits ?? "…"}</strong>
            <span className="ml-1">· 1 credit per AI action</span>
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {CREDIT_BUNDLES.map((bundle) => (
              <button
                key={bundle.key}
                type="button"
                disabled={!!busyBundle}
                onClick={() => buy(bundle.key)}
                className="rounded-md border border-primary/30 bg-background px-2 py-1.5 text-center text-xs font-medium transition hover:border-primary/60 hover:bg-primary/10 disabled:opacity-50"
              >
                <span className="block font-semibold">{formatPrice(bundle.amountPence)}</span>
                <span className="block text-[10px] text-muted-foreground">{bundle.credits} credits</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
