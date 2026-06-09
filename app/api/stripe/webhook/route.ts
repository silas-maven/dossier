import type { NextRequest } from "next/server";
import Stripe from "stripe";

import { addCredits, isValidCreditToken } from "@/lib/ai-credits";
import { creditsForPriceId } from "@/lib/ai/credit-bundles";

export const runtime = "nodejs";

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

// Credits are granted only here, after Stripe verifies a completed payment. The wallet
// token rides along as client_reference_id (set when the buy link was opened). addCredits
// is idempotent on the session id, so webhook retries never double-credit.
export async function POST(req: NextRequest) {
  if (!secretKey || !webhookSecret) {
    return Response.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const signature = req.headers.get("stripe-signature") ?? "";
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const token = session.client_reference_id ?? "";

    if (isValidCreditToken(token) && session.payment_status === "paid") {
      // Credits are set in session metadata at checkout creation. Fall back to the price
      // id only if metadata is somehow missing.
      let credits = Number.parseInt(session.metadata?.credits ?? "", 10) || 0;
      if (credits <= 0) {
        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
          credits = creditsForPriceId(lineItems.data[0]?.price?.id ?? "");
        } catch {
          credits = 0;
        }
      }

      if (credits > 0) {
        await addCredits({
          sessionId: session.id,
          token,
          credits,
          amount: session.amount_total ?? undefined,
          currency: session.currency ?? undefined
        });
      }
    }
  }

  return Response.json({ received: true }, { status: 200 });
}
