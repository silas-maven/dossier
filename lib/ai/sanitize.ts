import type { CvBasics, CvProfile } from "@/lib/cv-profile";
import { escapeRegExp } from "@/lib/text-match";

// Removes the candidate's contact PII before any CV text is sent to an AI provider.
// Strategy: pull the known values from `basics` (the structured fields), strip them
// there, then redact those same values wherever they reappear in the free-text body
// (seeded redaction). A general pattern pass also catches emails / phones / URLs that
// were typed somewhere other than the basics block.
//
// Note: employers, dates, and achievements are intentionally preserved — the AI needs
// them, and they are not contact PII. The defensible public claim is therefore
// "we remove your contact details and any place they reappear", not "no personal info".

const PLACEHOLDER = {
  name: "[NAME]",
  email: "[EMAIL]",
  phone: "[PHONE]",
  location: "[LOCATION]",
  url: "[URL]"
} as const;

// First names that are also common English words. Redacting these as name tokens would
// mangle ordinary prose ("will deliver", "mark the release"), so they are skipped as
// standalone name parts. The full name string is still redacted regardless.
const NAME_PART_STOPWORDS = new Set([
  "will",
  "mark",
  "grace",
  "rose",
  "hope",
  "may",
  "june",
  "art",
  "drew",
  "jack",
  "chase",
  "dale",
  "brook",
  "sunny",
  "rich",
  "guy",
  "max",
  "joy",
  "faith",
  "summer",
  "miles"
]);

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s)<>"']+/gi;
// Phone candidates: a digit run with separators or a leading +. Validated in the
// replacer so bare integers / metrics (e.g. "1200", "1,000,000") are not redacted.
const PHONE_RE = /\+?\d[\d().\-\s]{6,}\d/g;

const redactPhones = (text: string) =>
  text.replace(PHONE_RE, (match) => {
    const digits = match.replace(/\D/g, "");
    const hasSeparator = /[ ().\-]/.test(match);
    const hasPlus = match.trim().startsWith("+");
    if (digits.length >= 9 && digits.length <= 15 && (hasSeparator || hasPlus)) {
      return PLACEHOLDER.phone;
    }
    return match;
  });

const buildNameSeeds = (name: string): string[] => {
  const full = name.trim();
  if (!full) return [];
  const seeds = new Set<string>();
  seeds.add(full);
  for (const rawPart of full.split(/\s+/)) {
    const part = rawPart.replace(/[^A-Za-z'-]/g, "");
    if (part.length >= 3 && !NAME_PART_STOPWORDS.has(part.toLowerCase())) {
      seeds.add(part);
    }
  }
  // Longest first so the full name is replaced before its individual parts.
  return Array.from(seeds).sort((a, b) => b.length - a.length);
};

// Boundary-aware replace of a known value (same boundary rules as text-match's
// containsTerm, but replacing). Preserves the leading boundary character.
const redactSeed = (text: string, seed: string, placeholder: string) => {
  const trimmed = seed.trim();
  if (!trimmed) return text;
  const re = new RegExp(`(^|[^A-Za-z0-9+#])(?:${escapeRegExp(trimmed)})(?=[^A-Za-z0-9+#]|$)`, "gi");
  return text.replace(re, (_match, pre: string) => `${pre}${placeholder}`);
};

type Redactor = (text: string) => string;

export const createRedactor = (basics: CvBasics): Redactor => {
  const nameSeeds = buildNameSeeds(basics.name);
  const location = basics.location.trim();
  const url = basics.url.trim();
  const email = basics.email.trim();
  const phone = basics.phone.trim();

  return (text: string) => {
    if (!text) return text;
    let out = text;
    for (const seed of nameSeeds) out = redactSeed(out, seed, PLACEHOLDER.name);
    if (location) out = redactSeed(out, location, PLACEHOLDER.location);
    if (url) out = redactSeed(out, url, PLACEHOLDER.url);
    if (email) out = redactSeed(out, email, PLACEHOLDER.email);
    if (phone) out = redactSeed(out, phone, PLACEHOLDER.phone);
    // General passes catch values typed outside the basics block.
    out = out.replace(EMAIL_RE, PLACEHOLDER.email);
    out = out.replace(URL_RE, PLACEHOLDER.url);
    out = redactPhones(out);
    return out;
  };
};

// General-only scrub (no seeds). Server-side backstop for payloads where the structured
// basics may not be available, e.g. the match-jd profileText string.
export const scrubFreeText = (text: string): string => {
  if (!text) return text;
  let out = text.replace(EMAIL_RE, PLACEHOLDER.email);
  out = out.replace(URL_RE, PLACEHOLDER.url);
  out = redactPhones(out);
  return out;
};

// Returns a deep copy of the profile with contact PII stripped from the basics block and
// redacted across all free-text fields. Used by match-jd (client) and the managed tier.
export const sanitizeProfileForAi = (profile: CvProfile): CvProfile => {
  const redact = createRedactor(profile.basics);
  return {
    ...profile,
    basics: {
      ...profile.basics,
      name: profile.basics.name ? PLACEHOLDER.name : "",
      email: profile.basics.email ? PLACEHOLDER.email : "",
      phone: profile.basics.phone ? PLACEHOLDER.phone : "",
      location: profile.basics.location ? PLACEHOLDER.location : "",
      url: profile.basics.url ? PLACEHOLDER.url : "",
      headline: redact(profile.basics.headline),
      summary: redact(profile.basics.summary)
    },
    sections: profile.sections.map((section) => ({
      ...section,
      title: redact(section.title),
      items: section.items.map((item) => ({
        ...item,
        title: redact(item.title),
        subtitle: redact(item.subtitle),
        description: redact(item.description),
        tags: item.tags.map(redact)
      }))
    }))
  };
};
