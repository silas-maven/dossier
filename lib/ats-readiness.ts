import type { CvProfile, CvSection, CvItem } from "@/lib/cv-profile";
import type { CvTemplate } from "@/lib/templates";

export type AtsReadinessBand = "Excellent" | "Good" | "Needs work" | "Risky";

export type AtsReadinessCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

export type AtsReadinessGroup = {
  id: "parser" | "structure" | "evidence" | "jobMatch";
  label: string;
  score: number;
  maxScore: number;
  checks: AtsReadinessCheck[];
};

export type AtsReadinessResult = {
  score: number;
  band: AtsReadinessBand;
  summary: string;
  disclaimer: string;
  groups: AtsReadinessGroup[];
};

const standardSectionNames = new Set([
  "profile",
  "summary",
  "professional summary",
  "experience",
  "work experience",
  "employment history",
  "education",
  "skills",
  "technical skills",
  "certifications",
  "certificates",
  "projects"
]);

const metricPattern = /(\d+%|\d+\+?|\$|£|€|kpi|revenue|pipeline|quota|reduced|increased|improved|saved|grew|cut|delivered|shipped)/i;
const datePattern = /\b(present|current|20\d{2}|19\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i;

const textFromHtml = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const visibleSections = (profile: CvProfile) =>
  profile.sections.filter((section) => section.items.some((item) => item.visible !== false));

const visibleItems = (section: CvSection) =>
  section.items.filter((item) => item.visible !== false && hasItemContent(item));

const hasItemContent = (item: CvItem) =>
  Boolean(item.title.trim() || item.subtitle.trim() || item.dateRange.trim() || textFromHtml(item.description).trim() || item.tags.length);

const cvText = (profile: CvProfile) =>
  [
    profile.basics.name,
    profile.basics.headline,
    profile.basics.summary,
    profile.basics.location,
    ...profile.sections.flatMap((section) => [
      section.title,
      ...visibleItems(section).flatMap((item) => [
        item.title,
        item.subtitle,
        item.dateRange,
        textFromHtml(item.description),
        item.tags.join(" ")
      ])
    ])
  ]
    .join(" ")
    .toLowerCase();

const meaningfulJobTerms = (jobDescription: string) =>
  Array.from(
    new Set(
      jobDescription
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, " ")
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term.length > 3)
        .filter(
          (term) =>
            ![
              "with",
              "that",
              "this",
              "from",
              "will",
              "your",
              "have",
              "role",
              "team",
              "work",
              "able",
              "must",
              "and/or"
            ].includes(term)
        )
    )
  ).slice(0, 40);

const scoreChecks = (checks: AtsReadinessCheck[], maxScore: number) =>
  Math.round((checks.filter((check) => check.passed).length / checks.length) * maxScore);

const buildParserGroup = (profile: CvProfile, template: CvTemplate): AtsReadinessGroup => {
  const sections = visibleSections(profile);
  const checks: AtsReadinessCheck[] = [
    {
      id: "template-risk",
      label: "Low parser-risk template",
      passed: template.parserRisk === "Low",
      detail:
        template.parserRisk === "Low"
          ? "The selected template uses a simpler reading order."
          : "The selected template has stronger visual hierarchy, so export validation matters more."
    },
    {
      id: "standard-alignment",
      label: "Left-aligned content",
      passed: profile.style.summaryAlign === "left" && sections.every((section) => section.style.textAlign === "left"),
      detail: "Left-aligned text is less likely to create extraction or reading-order issues."
    },
    {
      id: "readable-font-size",
      label: "Readable font sizing",
      passed: profile.style.baseFontSize >= 9 && sections.every((section) => section.style.bodyFontSize >= 8),
      detail: "Very small type can reduce recruiter readability and export quality."
    },
    {
      id: "no-empty-visible-sections",
      label: "No empty visible sections",
      passed: sections.every((section) => visibleItems(section).length > 0),
      detail: "Empty headings make imported or exported CVs look broken."
    }
  ];

  return {
    id: "parser",
    label: "Parser safety",
    maxScore: 25,
    score: scoreChecks(checks, 25),
    checks
  };
};

const buildStructureGroup = (profile: CvProfile): AtsReadinessGroup => {
  const sections = visibleSections(profile);
  const normalizedTitles = sections.map((section) => section.title.trim().toLowerCase());
  const hasSectionType = (type: CvSection["type"]) => sections.some((section) => section.type === type);
  const checks: AtsReadinessCheck[] = [
    {
      id: "contact",
      label: "Core contact details",
      passed: Boolean(profile.basics.name.trim() && (profile.basics.email.trim() || profile.basics.phone.trim())),
      detail: "Name plus email or phone should be present before exporting."
    },
    {
      id: "target-title",
      label: "Target title/headline",
      passed: Boolean(profile.basics.headline.trim()),
      detail: "A clear target title helps humans and matching systems interpret the CV."
    },
    {
      id: "summary",
      label: "Summary/profile",
      passed: Boolean(profile.basics.summary.trim()) || normalizedTitles.some((title) => title.includes("summary") || title.includes("profile")),
      detail: "A short profile gives role context before experience."
    },
    {
      id: "experience",
      label: "Experience section",
      passed: hasSectionType("experience"),
      detail: "Most application workflows expect a clear experience section."
    },
    {
      id: "skills",
      label: "Skills section",
      passed: hasSectionType("skills"),
      detail: "Skills should be grouped clearly instead of buried inside long paragraphs."
    },
    {
      id: "standard-headings",
      label: "Standard section headings",
      passed: normalizedTitles.every((title) => title === "" || standardSectionNames.has(title) || title.length <= 32),
      detail: "Standard headings are easier for parsers and recruiters to classify."
    }
  ];

  return {
    id: "structure",
    label: "Structure",
    maxScore: 30,
    score: scoreChecks(checks, 30),
    checks
  };
};

const buildEvidenceGroup = (profile: CvProfile): AtsReadinessGroup => {
  const experienceItems = visibleSections(profile)
    .filter((section) => section.type === "experience" || section.type === "projects")
    .flatMap(visibleItems);
  const descriptions = experienceItems.map((item) => textFromHtml(item.description)).filter(Boolean);
  const hasMetric = descriptions.some((description) => metricPattern.test(description));
  const hasDates = experienceItems.some((item) => datePattern.test(item.dateRange));
  const hasBullets = descriptions.some((description) => /(^|\n|•|-)\s*\w/.test(description) || description.split(".").length >= 3);
  const checks: AtsReadinessCheck[] = [
    {
      id: "evidence-items",
      label: "Role evidence present",
      passed: experienceItems.length >= 1,
      detail: "Experience or project entries are needed before a readiness estimate is meaningful."
    },
    {
      id: "date-ranges",
      label: "Date ranges present",
      passed: hasDates,
      detail: "Dates help screeners understand chronology and seniority."
    },
    {
      id: "bullet-density",
      label: "Bullet-style evidence",
      passed: hasBullets,
      detail: "Readable bullets are easier to scan than dense paragraphs."
    },
    {
      id: "measurable-outcomes",
      label: "Measurable outcomes",
      passed: hasMetric,
      detail: "Metrics, scale, tools, or outcomes make claims easier to trust."
    },
    {
      id: "skills-tags",
      label: "Structured skill keywords",
      passed: visibleSections(profile).some((section) => section.type === "skills" && visibleItems(section).some((item) => item.tags.length || item.title.trim())),
      detail: "Skills should be represented as extractable text."
    }
  ];

  return {
    id: "evidence",
    label: "Evidence quality",
    maxScore: 25,
    score: scoreChecks(checks, 25),
    checks
  };
};

const buildJobMatchGroup = (profile: CvProfile, jobDescription?: string): AtsReadinessGroup => {
  const terms = meaningfulJobTerms(jobDescription ?? "");
  const text = cvText(profile);
  const matched = terms.filter((term) => text.includes(term));
  const hasJob = terms.length > 0;
  const matchRatio = hasJob ? matched.length / terms.length : 0;
  const checks: AtsReadinessCheck[] = [
    {
      id: "job-description",
      label: "Job description supplied",
      passed: hasJob,
      detail: "Paste a target job description to calculate role-specific keyword coverage."
    },
    {
      id: "keyword-coverage",
      label: "Keyword coverage",
      passed: hasJob && matchRatio >= 0.45,
      detail: hasJob
        ? `${matched.length} of ${terms.length} extracted role terms appear in the CV.`
        : "Job-match scoring is skipped until a job description is supplied."
    },
    {
      id: "headline-match",
      label: "Headline aligns to role",
      passed: hasJob && profile.basics.headline.split(/\s+/).some((term) => terms.includes(term.toLowerCase())),
      detail: "The headline should echo the role family without keyword stuffing."
    }
  ];

  return {
    id: "jobMatch",
    label: "Job match",
    maxScore: 20,
    score: hasJob ? Math.round(matchRatio * 14) + (checks[2].passed ? 6 : 0) : 0,
    checks
  };
};

const bandForScore = (score: number): AtsReadinessBand => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Risky";
};

export const analyzeAtsReadiness = (
  profile: CvProfile,
  template: CvTemplate,
  jobDescription?: string
): AtsReadinessResult => {
  const groups = [
    buildParserGroup(profile, template),
    buildStructureGroup(profile),
    buildEvidenceGroup(profile),
    buildJobMatchGroup(profile, jobDescription)
  ];
  const hasJobDescription = Boolean(jobDescription?.trim());
  const activeGroups = hasJobDescription ? groups : groups.filter((group) => group.id !== "jobMatch");
  const maxScore = activeGroups.reduce((sum, group) => sum + group.maxScore, 0);
  const rawScore = activeGroups.reduce((sum, group) => sum + group.score, 0);
  const score = Math.round((rawScore / maxScore) * 100);
  const band = bandForScore(score);

  return {
    score,
    band,
    summary: hasJobDescription
      ? "Estimated from parser safety, CV structure, evidence quality, and target-job keyword coverage."
      : "Estimated from parser safety, CV structure, and evidence quality. Add a job description for role-match scoring.",
    disclaimer:
      "This is not a Workday, Greenhouse, Lever, Taleo, iCIMS, or Ashby score. It is Dossier's readiness estimate based on transparent checks.",
    groups,
  };
};
