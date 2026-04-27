import type { AiProviderConfig, AiProviderId } from "@/lib/ai/types";

export const aiProviders: AiProviderConfig[] = [
  {
    id: "openai",
    label: "OpenAI",
    defaultModel: "gpt-4o-mini",
    adapter: "openai-compatible",
    baseUrl: "https://api.openai.com/v1"
  },
  {
    id: "anthropic",
    label: "Anthropic",
    defaultModel: "claude-3-5-haiku-latest",
    adapter: "anthropic",
    baseUrl: "https://api.anthropic.com/v1"
  },
  {
    id: "google-gemini",
    label: "Google Gemini",
    defaultModel: "gemini-1.5-flash",
    adapter: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta"
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    defaultModel: "openai/gpt-4o-mini",
    adapter: "openai-compatible",
    baseUrl: "https://openrouter.ai/api/v1"
  },
  {
    id: "mistral",
    label: "Mistral",
    defaultModel: "mistral-small-latest",
    adapter: "openai-compatible",
    baseUrl: "https://api.mistral.ai/v1"
  },
  {
    id: "groq",
    label: "Groq",
    defaultModel: "llama-3.1-70b-versatile",
    adapter: "openai-compatible",
    baseUrl: "https://api.groq.com/openai/v1"
  },
  {
    id: "together",
    label: "Together AI",
    defaultModel: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    adapter: "openai-compatible",
    baseUrl: "https://api.together.xyz/v1"
  },
  {
    id: "xai",
    label: "xAI",
    defaultModel: "grok-2-latest",
    adapter: "openai-compatible",
    baseUrl: "https://api.x.ai/v1"
  },
  {
    id: "cohere",
    label: "Cohere",
    defaultModel: "command-r-plus",
    adapter: "cohere",
    baseUrl: "https://api.cohere.com/v2"
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    defaultModel: "deepseek-chat",
    adapter: "openai-compatible",
    baseUrl: "https://api.deepseek.com/v1"
  }
];

const providerMap = new Map(aiProviders.map((provider) => [provider.id, provider]));

export const getAiProvider = (id: AiProviderId) => providerMap.get(id) ?? null;
