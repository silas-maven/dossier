import type { NextRequest } from "next/server";

import { buildCvAssistPrompt } from "@/lib/ai/prompts";
import { getAiProvider } from "@/lib/ai/providers";
import { parseAiCvAssistResponse } from "@/lib/ai/response";
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

const callOpenAiCompatible = async ({
  provider,
  apiKey,
  model,
  system,
  user
}: {
  provider: AiProviderConfig;
  apiKey: string;
  model: string;
  system: string;
  user: string;
}) => {
  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      ...(provider.id === "openrouter"
        ? {
            "HTTP-Referer": "https://www.your-dossier.xyz",
            "X-Title": "Dossier CV Builder"
          }
        : {})
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: `${JSON_INSTRUCTION}\n\n${user}` }
      ]
    })
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Provider request failed: ${errorText}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content ?? "";
};

const callAnthropic = async ({
  provider,
  apiKey,
  model,
  system,
  user
}: {
  provider: AiProviderConfig;
  apiKey: string;
  model: string;
  system: string;
  user: string;
}) => {
  const res = await fetch(`${provider.baseUrl}/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      temperature: 0.2,
      system,
      messages: [{ role: "user", content: `${JSON_INSTRUCTION}\n\n${user}` }]
    })
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Provider request failed: ${errorText}`);
  }
  const json = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  return json.content?.find((part) => part.type === "text")?.text ?? "";
};

const callGemini = async ({
  provider,
  apiKey,
  model,
  system,
  user
}: {
  provider: AiProviderConfig;
  apiKey: string;
  model: string;
  system: string;
  user: string;
}) => {
  const url = `${provider.baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `${system}\n\n${JSON_INSTRUCTION}\n\n${user}` }]
        }
      ]
    })
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Provider request failed: ${errorText}`);
  }
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
};

const callCohere = async ({
  provider,
  apiKey,
  model,
  system,
  user
}: {
  provider: AiProviderConfig;
  apiKey: string;
  model: string;
  system: string;
  user: string;
}) => {
  const res = await fetch(`${provider.baseUrl}/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `${JSON_INSTRUCTION}\n\n${user}` }
      ]
    })
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Provider request failed: ${errorText}`);
  }
  const json = (await res.json()) as {
    message?: { content?: Array<{ text?: string }> };
  };
  return json.message?.content?.[0]?.text ?? "";
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
