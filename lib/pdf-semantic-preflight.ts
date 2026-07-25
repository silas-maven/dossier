import type { CvProfile } from "@/lib/cv-profile";
import { descriptionToPlainText } from "@/lib/description-format";
import { extractPdfTextFromArrayBuffer } from "@/lib/client-pdf-text";
import { skillEvidenceDetails } from "@/lib/skill-levels";

export type PdfSemanticClaim = {
  id: string;
  source: string;
  text: string;
  excerpt: string;
};

export type PdfSemanticCheck = {
  passed: boolean;
  expectedEvidenceCount: number;
  extractedTextLength: number;
  missing: PdfSemanticClaim[];
};

const normalizeSemanticText = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const compactSemanticText = (value: string) => normalizeSemanticText(value).replace(/\s+/g, "");

const excerptFor = (value: string) => {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > 140 ? `${compact.slice(0, 137)}...` : compact;
};

export const collectPdfSemanticClaims = (profile: CvProfile) => {
  const claims: PdfSemanticClaim[] = [];
  const seen = new Set<string>();

  const addClaim = (source: string, value: string) => {
    const text = value.replace(/^[-*•]\s*/, "").replace(/\s+/g, " ").trim();
    const normalized = normalizeSemanticText(text);
    if (normalized.replace(/\s/g, "").length < 3 || seen.has(normalized)) return;
    seen.add(normalized);
    claims.push({
      id: `${source}:${claims.length}`,
      source,
      text,
      excerpt: excerptFor(text)
    });
  };

  if (profile.basics.summary.trim()) addClaim("Summary", profile.basics.summary);

  for (const section of profile.sections) {
    for (const item of section.items.filter((candidate) => candidate.visible !== false)) {
      const itemSource = item.title.trim()
        ? `${section.title}: ${item.title.trim()}`
        : section.title;

      if (section.type === "skills" || section.title.toLowerCase().includes("skills")) {
        const details = skillEvidenceDetails(item);
        if (details.length > 0) {
          for (const detail of details) addClaim(itemSource, detail.name);
        } else if (item.title.trim()) {
          addClaim(section.title, item.title);
        }
        continue;
      }

      if (item.title.trim()) addClaim(section.title, item.title);
      if (item.subtitle.trim()) addClaim(itemSource, item.subtitle);
      for (const line of descriptionToPlainText(item.description).split("\n")) {
        addClaim(itemSource, line);
      }
      for (const tag of item.tags) addClaim(itemSource, tag);
    }
  }

  return claims;
};

const claimAppearsInText = (claim: PdfSemanticClaim, normalizedPdf: string, compactPdf: string) => {
  const normalizedClaim = normalizeSemanticText(claim.text);
  if (normalizedPdf.includes(normalizedClaim)) return true;

  const compactClaim = compactSemanticText(claim.text);
  return compactClaim.length >= 8 && compactPdf.includes(compactClaim);
};

export const compareProfileEvidenceToPdfText = (
  profile: CvProfile,
  extractedPdfText: string
): PdfSemanticCheck => {
  const claims = collectPdfSemanticClaims(profile);
  const normalizedPdf = normalizeSemanticText(extractedPdfText);
  const compactPdf = compactSemanticText(extractedPdfText);
  const missing = claims.filter(
    (claim) => !claimAppearsInText(claim, normalizedPdf, compactPdf)
  );

  return {
    passed: missing.length === 0,
    expectedEvidenceCount: claims.length,
    extractedTextLength: extractedPdfText.trim().length,
    missing
  };
};

export const verifyPdfSemanticParity = async (profile: CvProfile, blob: Blob) => {
  const extraction = await extractPdfTextFromArrayBuffer(await blob.arrayBuffer());
  return {
    pages: extraction.pages,
    semantic: compareProfileEvidenceToPdfText(profile, extraction.text)
  };
};
