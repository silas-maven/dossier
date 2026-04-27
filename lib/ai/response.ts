import type { CvProfile } from "@/lib/cv-profile";
import type { AiCvAssistResponse, AiCvFinding, AiCvSuggestion } from "@/lib/ai/types";

const extractJson = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI response did not contain JSON.");
  return trimmed.slice(start, end + 1);
};

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const profileValueMatches = (profile: CvProfile, suggestion: AiCvSuggestion) => {
  if (suggestion.target.kind === "summary") {
    return profile.basics.summary === suggestion.current;
  }

  const sectionId = "sectionId" in suggestion.target ? suggestion.target.sectionId : "";
  const section = profile.sections.find((candidate) => candidate.id === sectionId);
  if (!section) return false;

  if (suggestion.target.kind === "section_title") {
    return section.title === suggestion.current;
  }

  const itemId = "itemId" in suggestion.target ? suggestion.target.itemId : "";
  const item = section.items.find((candidate) => candidate.id === itemId);
  if (!item) return false;

  if (suggestion.target.kind === "item_title") {
    return item.title === suggestion.current;
  }

  return item.description === suggestion.current;
};

const normalizeFinding = (candidate: unknown): AiCvFinding | null => {
  if (!candidate || typeof candidate !== "object") return null;
  const source = candidate as Record<string, unknown>;
  const severity = source.severity === "critical" || source.severity === "warning" ? source.severity : "info";
  const title = asString(source.title).trim();
  const detail = asString(source.detail).trim();
  if (!title || !detail) return null;
  return { title, severity, detail };
};

const normalizeSuggestion = (candidate: unknown): AiCvSuggestion | null => {
  if (!candidate || typeof candidate !== "object") return null;
  const source = candidate as Record<string, unknown>;
  const target = source.target;
  if (!target || typeof target !== "object") return null;
  const targetSource = target as Record<string, unknown>;
  const kind = targetSource.kind;
  if (
    kind !== "summary" &&
    kind !== "item_description" &&
    kind !== "item_title" &&
    kind !== "section_title"
  ) {
    return null;
  }

  const base = {
    id: asString(source.id).trim() || crypto.randomUUID(),
    title: asString(source.title).trim(),
    rationale: asString(source.rationale).trim(),
    current: asString(source.current),
    replacement: asString(source.replacement)
  };
  if (!base.title || !base.rationale || !base.replacement || base.current === base.replacement) return null;

  if (kind === "summary") {
    return { ...base, target: { kind } };
  }

  const sectionId = asString(targetSource.sectionId).trim();
  if (!sectionId) return null;

  if (kind === "section_title") {
    return { ...base, target: { kind, sectionId } };
  }

  const itemId = asString(targetSource.itemId).trim();
  if (!itemId) return null;
  return { ...base, target: { kind, sectionId, itemId } };
};

export const parseAiCvAssistResponse = (rawText: string, profile: CvProfile): AiCvAssistResponse => {
  const parsed = JSON.parse(extractJson(rawText)) as Record<string, unknown>;
  const score = typeof parsed.score === "number" && Number.isFinite(parsed.score)
    ? Math.max(0, Math.min(100, Math.round(parsed.score)))
    : 0;
  const summary = asString(parsed.summary).trim() || "AI review completed.";
  const findings = Array.isArray(parsed.findings)
    ? parsed.findings.map(normalizeFinding).filter((finding): finding is AiCvFinding => Boolean(finding))
    : [];
  const suggestions = Array.isArray(parsed.suggestions)
    ? parsed.suggestions
        .map(normalizeSuggestion)
        .filter((suggestion): suggestion is AiCvSuggestion => Boolean(suggestion))
        .filter((suggestion) => profileValueMatches(profile, suggestion))
        .slice(0, 8)
    : [];

  return { score, summary, findings, suggestions };
};
