import type { CvProfile } from "@/lib/cv-profile";

export type ContactLine = {
  kind: "location" | "email" | "phone" | "url";
  value: string;
};

const normalizePhoneDisplay = (value: string) =>
  value
    .trim()
    .replace(/[^\d+().\s-]/g, "")
    .replace(/\s+/g, " ");

const normalizeUrlDisplay = (value: string) => {
  const raw = value.trim();
  const withoutScheme = raw.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const withoutTrailing = withoutScheme.replace(/[),.;]+$/g, "").replace(/\/+$/g, "");
  const host = withoutTrailing.split("/")[0] || withoutTrailing;
  return host;
};

export const contactLines = (profile: CvProfile): ContactLine[] => {
  const lines: ContactLine[] = [];

  if (profile.basics.location) lines.push({ kind: "location", value: profile.basics.location });
  if (profile.basics.email) lines.push({ kind: "email", value: profile.basics.email });
  if (profile.basics.phone) lines.push({ kind: "phone", value: normalizePhoneDisplay(profile.basics.phone) });
  if (profile.basics.url) {
    const display = normalizeUrlDisplay(profile.basics.url);
    if (display) lines.push({ kind: "url", value: display });
  }

  // Guard against bad URL extraction (common: email provider domains).
  const filtered = lines.filter((line) => line.value.trim().toLowerCase() !== "gmail.com");

  // De-dupe identical values (can happen when DOCX header repeats contact line).
  const seen = new Set<string>();
  return filtered.filter((line) => {
    const key = `${line.kind}:${line.value.trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const contactInline = (profile: CvProfile, separator = " • ") =>
  contactLines(profile)
    .map((l) => l.value)
    .filter(Boolean)
    .join(separator);
