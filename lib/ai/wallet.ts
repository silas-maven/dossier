// Client-side helpers for the managed AI credit wallet. The wallet token is a random
// bearer id kept in localStorage; the server DB is the source of truth for the balance,
// so this token only identifies which wallet to charge — editing it grants nothing.

const WALLET_KEY = "dossier:ai-token:v1";

export const getOrCreateWalletToken = (): string => {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(WALLET_KEY);
    if (existing && /^[a-zA-Z0-9_-]{16,80}$/.test(existing)) return existing;
    const token = crypto.randomUUID();
    window.localStorage.setItem(WALLET_KEY, token);
    return token;
  } catch {
    return "";
  }
};

export const fetchCreditBalance = async (token: string): Promise<number> => {
  if (!token) return 0;
  try {
    const res = await fetch(`/api/ai/credits?token=${encodeURIComponent(token)}`);
    if (!res.ok) return 0;
    const data = (await res.json()) as { creditsRemaining?: number };
    return typeof data.creditsRemaining === "number" ? data.creditsRemaining : 0;
  } catch {
    return 0;
  }
};

// Starts a Stripe Checkout Session for a bundle and returns the hosted checkout URL.
// The wallet token rides as client_reference_id + session metadata so the webhook can
// credit the right wallet after payment.
export const startCreditsCheckout = async (token: string, bundle: string): Promise<string | null> => {
  if (!token) return null;
  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, bundle })
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    return typeof data.url === "string" ? data.url : null;
  } catch {
    return null;
  }
};
