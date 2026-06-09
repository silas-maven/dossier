import type { NextRequest } from "next/server";
import Stripe from "stripe";

import { isValidCreditToken } from "@/lib/ai-credits";
import { creditsForBundle, priceIdForBundle } from "@/lib/ai/credit-bundles";

export const runtime = "nodejs";

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

// Creates a one-time Checkout Session for a credit bundle. The wallet token travels as
// client_reference_id and in metadata so the webhook can credit it after payment. No
// payment_method_types set — that enables Stripe's dynamic payment methods.
export async function POST(req: NextRequest) {
  if (!secretKey) {
    return Response.json({ error: "Payments are not configured." }, { status: 503 });
  }

  let body: { token?: unknown; bundle?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const bundle = typeof body.bundle === "string" ? body.bundle : "";
  if (!isValidCreditToken(token)) {
    return Response.json({ error: "Missing or invalid credit token." }, { status: 400 });
  }

  const priceId = priceIdForBundle(bundle);
  const credits = creditsForBundle(bundle);
  if (!priceId || credits <= 0) {
    return Response.json({ error: "Unknown credit bundle." }, { status: 400 });
  }

  const origin = req.headers.get("origin") || req.nextUrl.origin;
  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: token,
      metadata: { token, credits: String(credits) },
      success_url: `${origin}/editor?credits=added`,
      cancel_url: `${origin}/editor?credits=cancelled`
    });
    return Response.json({ url: session.url }, { status: 200 });
  } catch {
    return Response.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
