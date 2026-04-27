import type { CvProfile } from "@/lib/cv-profile";
import type { GuidanceProfileId } from "@/lib/template-guidance";

export const aiProviderIds = [
  "openai",
  "anthropic",
  "google-gemini",
  "openrouter",
  "mistral",
  "groq",
  "together",
  "xai",
  "cohere",
  "deepseek"
] as const;

export type AiProviderId = (typeof aiProviderIds)[number];

export const aiAssistActions = [
  "ats_review",
  "rewrite_summary",
  "rewrite_bullets",
  "tailor_to_job",
  "skills_gap"
] as const;

export type AiAssistAction = (typeof aiAssistActions)[number];

export type AiProviderConfig = {
  id: AiProviderId;
  label: string;
  defaultModel: string;
  adapter: "openai-compatible" | "anthropic" | "gemini" | "cohere";
  baseUrl: string;
};

export type AiCvAssistContext = {
  templateId: string;
  templateName: string;
  guidanceProfileId: GuidanceProfileId;
  industry: string;
  atsMode: string;
  jobType?: string;
  seniority?: string;
  market?: string;
  jobDescription?: string;
};

export type AiSuggestionTarget =
  | {
      kind: "summary";
    }
  | {
      kind: "item_description";
      sectionId: string;
      itemId: string;
    }
  | {
      kind: "item_title";
      sectionId: string;
      itemId: string;
    }
  | {
      kind: "section_title";
      sectionId: string;
    };

export type AiCvSuggestion = {
  id: string;
  title: string;
  rationale: string;
  target: AiSuggestionTarget;
  current: string;
  replacement: string;
};

export type AiCvFinding = {
  title: string;
  severity: "info" | "warning" | "critical";
  detail: string;
};

export type AiCvAssistResponse = {
  score: number;
  summary: string;
  findings: AiCvFinding[];
  suggestions: AiCvSuggestion[];
};

export type AiCvAssistPayload = {
  providerId: AiProviderId;
  apiKey: string;
  model?: string;
  action: AiAssistAction;
  profile: CvProfile;
  context: AiCvAssistContext;
};
