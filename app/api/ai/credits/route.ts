import type { NextRequest } from "next/server";

import { getCreditBalance, isValidCreditToken } from "@/lib/ai-credits";

export const runtime = "nodejs";

// Returns the remaining managed-AI credit balance for a wallet token. Read-only; the
// token is a bearer value supplied by the client.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!isValidCreditToken(token)) {
    return Response.json({ creditsRemaining: 0 }, { status: 200 });
  }
  const creditsRemaining = await getCreditBalance(token);
  return Response.json({ creditsRemaining }, { status: 200 });
}
