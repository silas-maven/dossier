import type { NextRequest } from "next/server";

import { buildCvAssistPrompt } from "@/lib/ai/prompts";
import { getAiProvider } from "@/lib/ai/providers";
import { parseAiCvAssistResponse } from "@/lib/ai/response";
import {
  callAnthropic,
  callCohere,
  callGemini,
  callOpenAiCompatible
} from "@/lib/ai/callers";
import {
  aiAssistActions,
  aiProviderIds,
  type AiCvAssistPayload,
  type AiProviderConfig
} from "@/lib/ai/types";

export const runtime = "nodejs";

const JSON_INSTRUCTION = "Return only valid JSON matching the requested schema.";

const requireString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const parsePayload = (raw: unknown): AiCvAssistPayload => {
  const payload = raw as Partial<AiCvAssistPayload> | null;
  if (!payload || typeof payload !== "object") throw new Error("Invalid request.");

  const providerId = payload.providerId;
  if (!providerId || !aiProviderIds.includes(providerId)) throw new Error("Unsupported AI provider.");
  if (!payload.action || !aiAssistActions.includes(payload.action)) throw new Error("Unsupported AI action.");
  if (!payload.profile || typeof payload.profile !== "object") throw new Error("Missing CV profile.");
  if (!payload.context || typeof payload.context !== "object") throw new Error("Missing CV context.");

  const apiKey = requireString(payload.apiKey);
  if (!apiKey) throw new Error("Missing AI provider key.");

  return {
    providerId,
    apiKey,
    model: requireString(payload.model) || undefined,
    action: payload.action,
    profile: payload.profile,
    context: payload.context
  };
};



export async function POST(req: NextRequest) {
  try {
    const payload = parsePayload(await req.json());
    const provider = getAiProvider(payload.providerId);
    if (!provider) {
      return Response.json({ error: "Unsupported AI provider." }, { status: 400 });
    }

    const { system, user } = buildCvAssistPrompt({
      action: payload.action,
      profile: payload.profile,
      context: payload.context
    });
    const model = payload.model || provider.defaultModel;
    const raw =
      provider.adapter === "anthropic"
        ? await callAnthropic({ provider, apiKey: payload.apiKey, model, system, user })
        : provider.adapter === "gemini"
          ? await callGemini({ provider, apiKey: payload.apiKey, model, system, user })
          : provider.adapter === "cohere"
            ? await callCohere({ provider, apiKey: payload.apiKey, model, system, user })
            : await callOpenAiCompatible({ provider, apiKey: payload.apiKey, model, system, user });

    if (!raw.trim()) throw new Error("Provider returned no content.");

    return Response.json(parseAiCvAssistResponse(raw, payload.profile), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI review failed.";
    const status =
      message.includes("Missing") ||
      message.includes("Unsupported") ||
      message.includes("Invalid") ||
      message.includes("Provider request failed")
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
