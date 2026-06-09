import type { NextRequest } from "next/server";

import {
  callAnthropic,
  callCohere,
  callGemini,
  callOpenAiCompatible
} from "@/lib/ai/callers";
import { getAiProvider } from "@/lib/ai/providers";
import { buildGenerateBulletPrompt } from "@/lib/ai/prompts";
import { aiProviderIds, type AiProviderId } from "@/lib/ai/types";

export const runtime = "nodejs";

const requireString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

type GenerateBulletPayload = {
  providerId: AiProviderId;
  apiKey: string;
  model?: string;
  action: string;
  metric?: string;
  result: string;
  roleTitle?: string;
};

const parsePayload = (raw: unknown): GenerateBulletPayload => {
  const payload = raw as Partial<GenerateBulletPayload> | null;
  if (!payload || typeof payload !== "object") throw new Error("Invalid request.");

  const providerId = payload.providerId;
  if (!providerId || !aiProviderIds.includes(providerId)) throw new Error("Unsupported AI provider.");

  const apiKey = requireString(payload.apiKey);
  if (!apiKey) throw new Error("Missing AI provider key.");

  const action = requireString(payload.action);
  if (!action) throw new Error("Action is required.");

  const result = requireString(payload.result);
  if (!result) throw new Error("Result is required.");

  return {
    providerId,
    apiKey,
    model: requireString(payload.model) || undefined,
    action,
    metric: requireString(payload.metric) || undefined,
    result,
    roleTitle: requireString(payload.roleTitle) || undefined
  };
};

export async function POST(req: NextRequest) {
  try {
    const payload = parsePayload(await req.json());
    const provider = getAiProvider(payload.providerId);
    if (!provider) {
      return Response.json({ error: "Unsupported AI provider." }, { status: 400 });
    }

    const { system, user } = buildGenerateBulletPrompt({
      action: payload.action,
      metric: payload.metric,
      result: payload.result,
      roleTitle: payload.roleTitle
    });

    const model = payload.model || provider.defaultModel;

    const raw =
      provider.adapter === "anthropic"
        ? await callAnthropic({ provider, apiKey: payload.apiKey, model, system, user, jsonMode: false })
        : provider.adapter === "gemini"
          ? await callGemini({ provider, apiKey: payload.apiKey, model, system, user, jsonMode: false })
          : provider.adapter === "cohere"
            ? await callCohere({ provider, apiKey: payload.apiKey, model, system, user, jsonMode: false })
            : await callOpenAiCompatible({ provider, apiKey: payload.apiKey, model, system, user, jsonMode: false });

    if (!raw.trim()) throw new Error("Provider returned no content.");

    return Response.json({ bullet: raw.trim().replace(/^[-*•]\s*/, "") }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bullet generation failed.";
    const status =
      message.includes("Missing") ||
      message.includes("Unsupported") ||
      message.includes("Invalid") ||
      message.includes("Provider request failed") ||
      message.includes("required")
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
