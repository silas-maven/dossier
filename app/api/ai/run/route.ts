import type { NextRequest } from "next/server";

import { consumeCredit, isValidCreditToken, refundCredit } from "@/lib/ai-credits";
import { isManagedAiConfigured, runManagedAi } from "@/lib/ai/managed";
import {
  buildCvAssistPrompt,
  buildGenerateBulletPrompt,
  buildMatchJdPrompt
} from "@/lib/ai/prompts";
import { parseAiCvAssistResponse } from "@/lib/ai/response";
import { scrubFreeText } from "@/lib/ai/sanitize";
import { aiAssistActions, type AiAssistAction, type AiCvAssistContext } from "@/lib/ai/types";
import type { CvProfile } from "@/lib/cv-profile";

export const runtime = "nodejs";

// Generic, model-agnostic copy. No response or error from this route may reveal which
// model/route served the request.
const BUSY_MESSAGE = "Dossier AI is busy right now. Please try again in a moment.";

const managedFeatures = ["cv_assist", "match_jd", "generate_bullet"] as const;
type ManagedFeature = (typeof managedFeatures)[number];

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = str(body.token);
  if (!isValidCreditToken(token)) {
    return Response.json({ error: "Missing or invalid credit token." }, { status: 400 });
  }

  const feature = body.feature as ManagedFeature;
  if (!managedFeatures.includes(feature)) {
    return Response.json({ error: "Unsupported AI feature." }, { status: 400 });
  }

  // Validate feature-specific input before spending a credit.
  if (feature === "cv_assist") {
    const action = body.action as AiAssistAction;
    if (!aiAssistActions.includes(action)) {
      return Response.json({ error: "Unsupported AI action." }, { status: 400 });
    }
    if (!body.profile || typeof body.profile !== "object" || !body.context || typeof body.context !== "object") {
      return Response.json({ error: "Missing CV profile or context." }, { status: 400 });
    }
  } else if (feature === "match_jd") {
    if (!str(body.profileText) || !str(body.jobDescription)) {
      return Response.json({ error: "Profile text and job description are required." }, { status: 400 });
    }
  } else if (feature === "generate_bullet") {
    if (!str(body.action) || !str(body.result)) {
      return Response.json({ error: "Action and result are required." }, { status: 400 });
    }
  }

  if (!isManagedAiConfigured()) {
    return Response.json({ error: BUSY_MESSAGE }, { status: 503 });
  }

  // Spend one credit atomically. Refunded below if the model call fails entirely.
  const creditsRemaining = await consumeCredit(token);
  if (creditsRemaining === null) {
    return Response.json(
      { error: "You have no Dossier AI credits left.", code: "insufficient_credits" },
      { status: 402 }
    );
  }

  try {
    if (feature === "cv_assist") {
      const profile = body.profile as CvProfile;
      const context = body.context as AiCvAssistContext;
      const action = body.action as AiAssistAction;
      // buildCvAssistPrompt drops the contact block and redacts in-body PII internally.
      const { system, user } = buildCvAssistPrompt({ action, profile, context });
      const raw = await runManagedAi({ system, user, jsonMode: true });
      const result = parseAiCvAssistResponse(raw, profile);
      return Response.json({ ...result, creditsRemaining }, { status: 200 });
    }

    if (feature === "match_jd") {
      const safeProfileText = scrubFreeText(str(body.profileText));
      const { system, user } = buildMatchJdPrompt(safeProfileText, str(body.jobDescription));
      const raw = await runManagedAi({ system, user, jsonMode: true });
      const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(clean);
      return Response.json({ ...result, creditsRemaining }, { status: 200 });
    }

    // generate_bullet
    const { system, user } = buildGenerateBulletPrompt({
      action: scrubFreeText(str(body.action)),
      metric: scrubFreeText(str(body.metric)) || undefined,
      result: scrubFreeText(str(body.result)),
      roleTitle: scrubFreeText(str(body.roleTitle)) || undefined
    });
    const raw = await runManagedAi({ system, user, jsonMode: false });
    return Response.json(
      { bullet: raw.trim().replace(/^[-*•]\s*/, ""), creditsRemaining },
      { status: 200 }
    );
  } catch {
    // Total model failure (or unparseable output): give the credit back, stay generic.
    await refundCredit(token);
    return Response.json({ error: BUSY_MESSAGE }, { status: 502 });
  }
}
