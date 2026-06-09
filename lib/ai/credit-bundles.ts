// Credit bundles for the managed AI tier, purchased via Stripe Checkout Sessions.
// Recommended: £1/10 (entry), £2.50/30 (best value), £5/70. Stripe's flat ~20p fee makes
// the £1 bundle fee-inefficient, so the larger two are the value nudge.

// Client-safe catalog (no secrets). Used to render the buy buttons. Credit amounts are
// sized so the largest pack runs out within a heavy user's week (drives repeat purchase);
// the £1 pack is a frictionless on-ramp from the free tier. `label` is shown on receipts.
export const CREDIT_BUNDLES = [
  { key: "small", label: "Spark", credits: 5, amountPence: 100 },
  { key: "medium", label: "Refill", credits: 15, amountPence: 250 },
  { key: "large", label: "Surge", credits: 35, amountPence: 500 }
] as const;

export type CreditBundleKey = (typeof CREDIT_BUNDLES)[number]["key"];

export const creditsForBundle = (key: string): number =>
  CREDIT_BUNDLES.find((bundle) => bundle.key === key)?.credits ?? 0;

// Server-only: maps a bundle key to its Stripe price id (set in env after creation).
export const priceIdForBundle = (key: string): string => {
  const ids: Record<string, string | undefined> = {
    small: process.env.STRIPE_PRICE_SMALL,
    medium: process.env.STRIPE_PRICE_MEDIUM,
    large: process.env.STRIPE_PRICE_LARGE
  };
  return ids[key]?.trim() ?? "";
};

// Server-only reverse lookup, used as a webhook fallback if session metadata is absent.
export const creditsForPriceId = (priceId: string): number => {
  const match = CREDIT_BUNDLES.find((bundle) => priceIdForBundle(bundle.key) === priceId);
  return match?.credits ?? 0;
};
