import { callOpenAiCompatible } from "@/lib/ai/callers";
import type { AiProviderConfig } from "@/lib/ai/types";

// SERVER ONLY. Do not import this module from any client component.
//
// The browser must never learn which models back the managed "Dossier AI" tier. Model
// slugs live here and in server env only — they are never serialized into responses,
// error messages, or NEXT_PUBLIC_* values. To the user it is simply "Dossier AI".

type ManagedEndpoint = "openrouter" | "openai";

type ManagedModel = { endpoint: ManagedEndpoint; model: string };

// Fallback chain: the free gpt-oss-120b model serves requests until it hits OpenRouter's
// free limits (20 req/min, 50/day account-wide), then the cheap paid OpenAI model carries
// the overflow. The nemotron models were dropped after live testing (550b timed out, 120b
// leaked reasoning instead of following instructions). Free slug is fixed; paid fallback
// is env-overridable.
const MANAGED_CHAIN: ManagedModel[] = [
  { endpoint: "openrouter", model: "openai/gpt-oss-120b:free" },
  { endpoint: "openai", model: process.env.MANAGED_AI_FALLBACK_MODEL?.trim() || "gpt-4o-mini" }
];

const PROVIDER_CONFIG: Record<ManagedEndpoint, AiProviderConfig> = {
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    defaultModel: "",
    adapter: "openai-compatible",
    baseUrl: "https://openrouter.ai/api/v1"
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    defaultModel: "",
    adapter: "openai-compatible",
    baseUrl: "https://api.openai.com/v1"
  }
};

const keyFor = (endpoint: ManagedEndpoint) =>
  (endpoint === "openrouter" ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY)?.trim() || "";

// Caps to bound worst-case cost on the paid fallback. ~6-8k input tokens, ~1.5k output.
const MAX_INPUT_CHARS = 24000;
const MAX_OUTPUT_TOKENS = 1500;
// Per-model timeout so a slow/hung free model fails over fast instead of stalling the request.
const PER_MODEL_TIMEOUT_MS = 30000;

// When jsonMode is requested, a response is only acceptable if it actually contains
// parseable JSON. Reasoning-heavy free models sometimes return prose; those must fall
// through to the next model rather than be returned and fail downstream parsing.
const hasParseableJson = (raw: string): boolean => {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return false;
  try {
    JSON.parse(raw.slice(start, end + 1));
    return true;
  } catch {
    return false;
  }
};

export const isManagedAiConfigured = () =>
  Boolean(keyFor("openrouter")) || Boolean(keyFor("openai"));

// Thrown when every model in the chain fails. The message is deliberately generic so no
// model/route detail can leak to the client.
export class ManagedAiUnavailableError extends Error {
  constructor() {
    super("MANAGED_AI_UNAVAILABLE");
    this.name = "ManagedAiUnavailableError";
  }
}

// Runs the prompt through the fallback chain and returns the first non-empty completion.
// Never returns or throws anything that identifies a model.
export const runManagedAi = async ({
  system,
  user,
  jsonMode = true
}: {
  system: string;
  user: string;
  jsonMode?: boolean;
}): Promise<string> => {
  const boundedUser = user.length > MAX_INPUT_CHARS ? user.slice(0, MAX_INPUT_CHARS) : user;

  for (const { endpoint, model } of MANAGED_CHAIN) {
    const apiKey = keyFor(endpoint);
    if (!apiKey) continue;
    try {
      const raw = await callOpenAiCompatible({
        provider: PROVIDER_CONFIG[endpoint],
        apiKey,
        model,
        system,
        user: boundedUser,
        jsonMode,
        maxTokens: MAX_OUTPUT_TOKENS,
        timeoutMs: PER_MODEL_TIMEOUT_MS
      });
      if (!raw.trim()) continue;
      // Reject non-JSON output when JSON was requested, so the next model gets a turn.
      if (jsonMode && !hasParseableJson(raw)) continue;
      return raw;
    } catch {
      // Timeout / rate-limit (429) / 5xx: fall through to the next model.
    }
  }

  throw new ManagedAiUnavailableError();
};
