"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchCreditBalance, getOrCreateWalletToken } from "@/lib/ai/wallet";

export type AiMode = "byok" | "dossier";

// Shared state for the "Use Dossier AI" (metered credits) vs bring-your-own-key toggle.
// Used by both the tailor pane and the bullet generator so the logic lives in one place.
export const useManagedAi = () => {
  const [mode, setMode] = useState<AiMode>("byok");
  const [token, setToken] = useState("");
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    // Client-only: the wallet token lives in localStorage and is read once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time external-store sync
    setToken(getOrCreateWalletToken());
  }, []);

  const refreshCredits = useCallback(async () => {
    if (!token) return;
    setCredits(await fetchCreditBalance(token));
  }, [token]);

  useEffect(() => {
    if (mode !== "dossier" || !token) return;
    let active = true;
    void fetchCreditBalance(token).then((value) => {
      if (active) setCredits(value);
    });
    return () => {
      active = false;
    };
  }, [mode, token]);

  return { mode, setMode, token, credits, setCredits, refreshCredits };
};
