import type { NextRequest } from "next/server";

import {
  callAnthropic,
  callCohere,
  callGemini,
  callOpenAiCompatible
} from "@/lib/ai/callers";
import { getAiProvider } from "@/lib/ai/providers";
import { buildMatchJdPrompt } from "@/lib/ai/prompts";
import { scrubFreeText } from "@/lib/ai/sanitize";
import { aiProviderIds, type AiProviderId } from "@/lib/ai/types";

export const runtime = "nodejs";

const requireString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

type MatchJDPayload = {
  providerId: AiProviderId;
  apiKey: string;
  model?: string;
  profileText: string;
  jobDescription: string;
};

const parsePayload = (raw: unknown): MatchJDPayload => {
  const payload = raw as Partial<MatchJDPayload> | null;
  if (!payload || typeof payload !== "object") throw new Error("Invalid request.");

  const providerId = payload.providerId;
  if (!providerId || !aiProviderIds.includes(providerId)) throw new Error("Unsupported AI provider.");

  const apiKey = requireString(payload.apiKey);
  if (!apiKey) throw new Error("Missing AI provider key.");

  const profileText = requireString(payload.profileText);
  if (!profileText) throw new Error("Profile text is required.");

  const jobDescription = requireString(payload.jobDescription);
  if (!jobDescription) throw new Error("Job description is required.");

  return {
    providerId,
    apiKey,
    model: requireString(payload.model) || undefined,
    profileText,
    jobDescription
  };
};

export async function POST(req: NextRequest) {
  try {
    const payload = parsePayload(await req.json());
    const provider = getAiProvider(payload.providerId);
    if (!provider) {
      return Response.json({ error: "Unsupported AI provider." }, { status: 400 });
    }

    // Defense in depth: the client already sanitizes, but scrub any contact PII that
    // slips through (emails/phones/URLs) before it reaches the provider.
    const safeProfileText = scrubFreeText(payload.profileText);
    const { system, user } = buildMatchJdPrompt(safeProfileText, payload.jobDescription);

    const model = payload.model || provider.defaultModel;

    const raw =
      provider.adapter === "anthropic"
        ? await callAnthropic({ provider, apiKey: payload.apiKey, model, system, user, jsonMode: true })
        : provider.adapter === "gemini"
          ? await callGemini({ provider, apiKey: payload.apiKey, model, system, user, jsonMode: true })
          : provider.adapter === "cohere"
            ? await callCohere({ provider, apiKey: payload.apiKey, model, system, user, jsonMode: true })
            : await callOpenAiCompatible({ provider, apiKey: payload.apiKey, model, system, user, jsonMode: true });

    if (!raw.trim()) throw new Error("Provider returned no content.");
    
    // Parse the JSON output safely
    const cleanRaw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanRaw);

    return Response.json(result, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "JD Matching failed.";
    const status =
      message.includes("Missing") ||
      message.includes("Unsupported") ||
      message.includes("Invalid") ||
      message.includes("Provider request failed") ||
      message.includes("required") ||
      message.includes("Unexpected token")
        ? 400
        : 502;
    return Response.json(
      {
        error:
          status === 400
            ? message
            : "AI provider request failed. Check the provider, model, and key, then try again."
      },
      { status }
    );
  }
}
