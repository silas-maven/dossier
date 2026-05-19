import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";

import { getDossierUserCount, trackDossierVisitor } from "@/lib/user-count";

export const runtime = "nodejs";

const VISITOR_COOKIE = "dossier_visitor_id";
const ONE_YEAR = 60 * 60 * 24 * 365;

const isValidVisitorId = (value: string | undefined) =>
  Boolean(value && /^[a-zA-Z0-9_-]{16,80}$/.test(value));

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const existing = cookieStore.get(VISITOR_COOKIE)?.value;
  const visitorId = isValidVisitorId(existing) ? existing! : crypto.randomUUID();

  let path = "/";
  let referrer = "";
  try {
    const body = (await req.json()) as { path?: unknown; referrer?: unknown };
    if (typeof body.path === "string" && body.path.startsWith("/")) path = body.path.slice(0, 240);
    if (typeof body.referrer === "string") referrer = body.referrer.slice(0, 500);
  } catch {
    // Empty or malformed body still counts as a visit.
  }

  const count = await trackDossierVisitor({
    visitorId,
    path,
    referrer,
    userAgent: headerStore.get("user-agent") ?? undefined,
  });

  const response = Response.json({ count: count ?? (await getDossierUserCount()) }, { status: 200 });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${VISITOR_COOKIE}=${visitorId}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${secure}`
  );
  return response;
}
