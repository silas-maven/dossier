import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const normalizeVisitorId = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9._:-]{12,128}$/.test(trimmed) ? trimmed : null;
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const visitorId = normalizeVisitorId((body as { visitorId?: unknown })?.visitorId);
  if (!visitorId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createSupabaseServiceClient();
  } catch {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const now = new Date().toISOString();
  const pathRaw = (body as { path?: unknown })?.path;
  const lastPath = typeof pathRaw === "string" ? pathRaw.slice(0, 256) : null;
  const userAgent = (req.headers.get("user-agent") || "").slice(0, 512) || null;

  const { error: upsertError } = await supabase.from("dossier_visitors").upsert(
    {
      visitor_id: visitorId,
      first_seen: now,
      last_seen: now,
      last_path: lastPath,
      user_agent: userAgent
    },
    { onConflict: "visitor_id", ignoreDuplicates: true }
  );

  if (upsertError) {
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  await supabase
    .from("dossier_visitors")
    .update({
      last_seen: now,
      last_path: lastPath,
      user_agent: userAgent
    })
    .eq("visitor_id", visitorId);

  return NextResponse.json({ ok: true }, { status: 200 });
}
