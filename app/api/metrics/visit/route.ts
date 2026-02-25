import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const normalizeVisitorId = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9._:-]{12,128}$/.test(trimmed) ? trimmed : null;
};

const normalizeHost = (value: string | null | undefined) =>
  (value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];

const isBlockedRequestHost = (host: string) =>
  !host ||
  host === "localhost" ||
  host === "127.0.0.1" ||
  host === "0.0.0.0" ||
  host === "::1" ||
  host.endsWith(".localhost");

const isBlockedReferrerHost = (host: string) =>
  !host ||
  host === "localhost" ||
  host === "127.0.0.1" ||
  host === "0.0.0.0" ||
  host === "::1" ||
  host.endsWith(".localhost") ||
  host === "vercel.com" ||
  host.endsWith(".vercel.com");

const normalizeText = (value: unknown, max: number) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
};

const parseReferrer = (value: string | null) => {
  if (!value) return { raw: null as string | null, host: null as string | null, path: null as string | null };
  try {
    const parsed = new URL(value);
    const host = normalizeHost(parsed.host);
    const path = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.slice(0, 180) : "";
    return {
      raw: `${parsed.origin}${path}`.slice(0, 320),
      host: host || null,
      path: path || null
    };
  } catch {
    return { raw: null as string | null, host: null as string | null, path: null as string | null };
  }
};

const normalizeUtmToken = (value: string | null) => {
  if (!value) return null;
  const token = value.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 64);
  return token || null;
};

const resolveSource = ({
  search,
  payloadReferrer,
  headerReferrer,
  appHost
}: {
  search: string | null;
  payloadReferrer: string | null;
  headerReferrer: string | null;
  appHost: string;
}) => {
  const params = new URLSearchParams(search || "");
  const utmSource = normalizeUtmToken(params.get("utm_source"));
  const utmMedium = normalizeUtmToken(params.get("utm_medium"));
  const utmCampaign = normalizeUtmToken(params.get("utm_campaign"));
  if (utmSource) {
    const key = `utm:${utmSource}${utmMedium ? `:${utmMedium}` : ""}${utmCampaign ? `:${utmCampaign}` : ""}`.slice(
      0,
      180
    );
    const label = [utmSource, utmMedium, utmCampaign].filter(Boolean).join(" / ");
    return {
      sourceKey: key,
      sourceLabel: label,
      referrerRaw: null as string | null
    };
  }

  const ref = parseReferrer(payloadReferrer || headerReferrer);
  if (ref.host && ref.host !== appHost && !isBlockedReferrerHost(ref.host)) {
    const label = `${ref.host}${ref.path || ""}`.slice(0, 180);
    return {
      sourceKey: `ref:${label}`.slice(0, 180),
      sourceLabel: label,
      referrerRaw: ref.raw
    };
  }

  return {
    sourceKey: "direct",
    sourceLabel: "direct",
    referrerRaw: ref.raw
  };
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

  const requestHost = normalizeHost(req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host);
  if (isBlockedRequestHost(requestHost)) {
    return NextResponse.json({ ok: true, skipped: "non_public_host" }, { status: 202 });
  }

  let supabase;
  try {
    supabase = createSupabaseServiceClient();
  } catch {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const now = new Date().toISOString();
  const pathRaw = normalizeText((body as { path?: unknown })?.path, 180);
  const searchRaw = normalizeText((body as { search?: unknown })?.search, 120);
  const payloadReferrer = normalizeText((body as { referrer?: unknown })?.referrer, 320);
  const headerReferrer = normalizeText(req.headers.get("referer"), 320);
  const lastPath = pathRaw ? `${pathRaw}${searchRaw || ""}`.slice(0, 256) : null;
  const userAgent = (req.headers.get("user-agent") || "").slice(0, 512) || null;
  const { sourceKey, sourceLabel, referrerRaw } = resolveSource({
    search: searchRaw,
    payloadReferrer,
    headerReferrer,
    appHost: requestHost
  });

  const { data: existingVisitor, error: existingError } = await supabase
    .from("dossier_visitors")
    .select("visitor_id")
    .eq("visitor_id", visitorId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  if (!existingVisitor) {
    const { error: insertError } = await supabase.from("dossier_visitors").insert({
      visitor_id: visitorId,
      first_seen: now,
      last_seen: now,
      last_path: lastPath,
      user_agent: userAgent,
      first_source_key: sourceKey,
      first_source_label: sourceLabel,
      first_referrer: referrerRaw,
      last_source_key: sourceKey,
      last_source_label: sourceLabel,
      last_referrer: referrerRaw
    });

    if (!insertError) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const duplicateInsert =
      insertError.code === "23505" ||
      insertError.message.toLowerCase().includes("duplicate key") ||
      insertError.details?.toLowerCase().includes("already exists");
    if (!duplicateInsert) {
      return NextResponse.json({ ok: false }, { status: 202 });
    }
  }

  const { error: updateError } = await supabase
    .from("dossier_visitors")
    .update({
      last_seen: now,
      last_path: lastPath,
      user_agent: userAgent,
      last_source_key: sourceKey,
      last_source_label: sourceLabel,
      last_referrer: referrerRaw
    })
    .eq("visitor_id", visitorId);

  if (updateError) {
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
