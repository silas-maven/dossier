import type { CvProfile, CvSection } from "@/lib/cv-profile";
import { parseDescriptionBlocks } from "@/lib/description-format";
import { parseSkillEntries } from "@/lib/skill-levels";

export const CV_FIT_LIMITS = {
  visibleWords: 900,
  summaryWords: 120,
  skills: 16,
  bullets: 24,
  pages: 2
} as const;

export type CvFitIssue = {
  id: "words" | "summary" | "skills" | "duplicate-skills" | "bullets" | "font-size";
  label: string;
  detail: string;
  severity: "warning" | "error";
};

export type CvFitResult = {
  visibleWords: number;
  summaryWords: number;
  skillCount: number;
  bulletCount: number;
  duplicateSkills: string[];
  pageTarget: number;
  issues: CvFitIssue[];
};

const visibleItems = (section: CvSection) =>
  section.items.filter(
    (item) =>
      item.visible !== false &&
      Boolean(
        item.title.trim() ||
          item.subtitle.trim() ||
          item.dateRange.trim() ||
          item.description.trim() ||
          item.tags.length
      )
  );

export const plainTextFromHtml = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<li[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

export const countVisibleWords = (value: string) =>
  plainTextFromHtml(value).match(/[A-Za-z0-9][A-Za-z0-9+#&/'’.-]*/g)?.length ?? 0;

const normalizedSkillKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b(?:js|javascript)\b/g, "javascript")
    .replace(/\b(?:ts|typescript)\b/g, "typescript")
    .replace(/\b(?:postgres|postgresql)\b/g, "postgresql")
    .replace(/\b(?:k8s|kubernetes)\b/g, "kubernetes")
    .replace(/\s+/g, " ")
    .trim();

export const profileSkillNames = (profile: CvProfile) =>
  profile.sections
    .filter((section) => section.type === "skills")
    .flatMap((section) =>
      visibleItems(section).flatMap((item) => [
        ...parseSkillEntries(item.description).map((entry) => entry.name),
        ...item.tags
      ])
    )
    .map((skill) => skill.trim())
    .filter(Boolean);

const bulletCountForSection = (section: CvSection) =>
  visibleItems(section).reduce(
    (total, item) =>
      total +
      parseDescriptionBlocks(item.description).filter(
        (block) => block.kind === "bullet" || block.kind === "numbered"
      ).length,
    0
  );

const profileVisibleText = (profile: CvProfile) =>
  [
    profile.basics.name,
    profile.basics.headline,
    profile.basics.email,
    profile.basics.phone,
    profile.basics.url,
    profile.basics.location,
    profile.basics.summary,
    ...profile.sections.flatMap((section) => [
      section.title,
      ...visibleItems(section).flatMap((item) => [
        item.title,
        item.subtitle,
        item.dateRange,
        item.description,
        item.tags.join(" ")
      ])
    ])
  ].join(" ");

export const analyzeCvFit = (profile: CvProfile): CvFitResult => {
  const skills = profileSkillNames(profile);
  const skillCounts = new Map<string, { label: string; count: number }>();
  for (const skill of skills) {
    const key = normalizedSkillKey(skill);
    const current = skillCounts.get(key);
    skillCounts.set(key, {
      label: current?.label ?? skill,
      count: (current?.count ?? 0) + 1
    });
  }

  const duplicateSkills = Array.from(skillCounts.values())
    .filter((entry) => entry.count > 1)
    .map((entry) => entry.label);
  const visibleWords = countVisibleWords(profileVisibleText(profile));
  const summaryWords = countVisibleWords(profile.basics.summary);
  const skillCount = skillCounts.size;
  const bulletCount = profile.sections.reduce(
    (total, section) => total + bulletCountForSection(section),
    0
  );
  const smallestBodySize = profile.sections.reduce(
    (smallest, section) => Math.min(smallest, section.style.bodyFontSize),
    profile.style.baseFontSize
  );

  const issues: CvFitIssue[] = [];
  if (visibleWords > CV_FIT_LIMITS.visibleWords) {
    issues.push({
      id: "words",
      label: "Visible word budget exceeded",
      detail: `${visibleWords} words are visible; keep the professional CV at or below ${CV_FIT_LIMITS.visibleWords}.`,
      severity: "error"
    });
  }
  if (summaryWords > CV_FIT_LIMITS.summaryWords) {
    issues.push({
      id: "summary",
      label: "Profile is too long",
      detail: `${summaryWords} words are in the profile; keep it below ${CV_FIT_LIMITS.summaryWords} so evidence stays dominant.`,
      severity: "warning"
    });
  }
  if (skillCount > CV_FIT_LIMITS.skills) {
    issues.push({
      id: "skills",
      label: "Skills need prioritising",
      detail: `${skillCount} unique skills are visible; keep the strongest ${CV_FIT_LIMITS.skills} for this role.`,
      severity: "error"
    });
  }
  if (duplicateSkills.length) {
    issues.push({
      id: "duplicate-skills",
      label: "Duplicate skills detected",
      detail: `Merge repeated or synonymous entries: ${duplicateSkills.slice(0, 4).join(", ")}.`,
      severity: "warning"
    });
  }
  if (bulletCount > CV_FIT_LIMITS.bullets) {
    issues.push({
      id: "bullets",
      label: "Evidence is too dense",
      detail: `${bulletCount} bullets are visible; keep the strongest ${CV_FIT_LIMITS.bullets} across the document.`,
      severity: "error"
    });
  }
  if (profile.style.baseFontSize < 9 || smallestBodySize < 8.5) {
    issues.push({
      id: "font-size",
      label: "Text has been compressed",
      detail: "Do not solve overflow with tiny type. Remove low-value content before reducing font size.",
      severity: "error"
    });
  }

  return {
    visibleWords,
    summaryWords,
    skillCount,
    bulletCount,
    duplicateSkills,
    pageTarget: CV_FIT_LIMITS.pages,
    issues
  };
};
