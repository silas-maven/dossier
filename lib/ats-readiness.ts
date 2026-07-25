import type { CvProfile, CvSection, CvItem } from "@/lib/cv-profile";
import { analyzeCvFit, CV_FIT_LIMITS } from "@/lib/cv-fit";
import type { CvTemplate } from "@/lib/templates";
import { containsTerm } from "@/lib/text-match";

// Re-exported for existing tests/imports that reference it from this module.
export { containsTerm };

export type AtsReadinessBand = "Excellent" | "Good" | "Needs work" | "Risky";

export type AtsReadinessCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

export type AtsReadinessGroup = {
  id: "parser" | "structure" | "evidence" | "fit" | "jobMatch";
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
  // Role terms extracted from the job description that did NOT appear in the CV.
  // Empty when no job description (or no terms) is supplied.
  missingKeywords: string[];
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
  "projects",
  "awards",
  "volunteering",
  "languages",
  "patents",
  "publications",
  "interests",
  "hobbies",
  "references"
]);

// Measurable-outcome detector. Requires real numeric/quantitative context (percent,
// multiplier, currency, scale) or an outcome verb. A bare integer is NOT a metric on
// its own, so dates like "2019" or "1 year" no longer pass as outcomes.
const metricPattern =
  /(\d+\s*%|\b\d+(?:\.\d+)?\s*x\b|[\$£€]\s*\d|\b\d+(?:\.\d+)?\s*(?:k|m|bn|million|billion)\b|kpi|revenue|pipeline|quota|reduced|increased|improved|saved|grew|cut|delivered|shipped)/i;
const datePattern = /\b(present|current|20\d{2}|19\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i;

const textFromHtml = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

// Detects bullet/list structure from the ORIGINAL html, before textFromHtml collapses
// whitespace (which would otherwise erase the newlines inserted for <br>/</p> and make
// list structure invisible). A hyphen only counts as a bullet when it starts a line, so
// "well-known" inside prose is not mistaken for a bullet.
const htmlHasBullets = (html: string) =>
  /<li[\s>]/i.test(html) ||
  /<\/p>\s*<p[\s>]/i.test(html) ||
  /<br\s*\/?>/i.test(html) ||
  /(^|\n)\s*[•▪‣◦*]/.test(html) ||
  /(^|\n)\s*[-–—]\s+/.test(html);

const SHORT_TERM_WHITELIST = /^(ai|ux|ui|qa|go|c|c\+\+|pr|hr)$/i;

const JOB_STOPWORDS = new Set([
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
  "and/or",
  "the",
  "and",
  "for",
  "are",
  "you",
  "our",
  "can",
  "all",
  "any",
  "not",
  "but",
  "has"
]);

export const meaningfulJobTerms = (jobDescription: string) => {
  // Acronyms (AWS, SQL, ML, ...) must be lifted from the ORIGINAL text before lowercasing,
  // otherwise the case signal is gone. These bypass the length floor so 2-letter skills
  // (ML, QA) survive; they still respect the stopword list.
  const acronyms = (jobDescription.match(/\b[A-Z]{2,4}(?:\+\+|#)?\b/g) ?? [])
    .map((value) => value.toLowerCase())
    .filter((value) => !JOB_STOPWORDS.has(value));

  const tokens = jobDescription
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2 || SHORT_TERM_WHITELIST.test(term))
    .filter((term) => !JOB_STOPWORDS.has(term));

  return Array.from(new Set([...acronyms, ...tokens])).slice(0, 40);
};

// --- Light stemming + synonyms for keyword coverage ---------------------------------

const STEM_SUFFIXES = [
  "ization",
  "isation",
  "ication",
  "ation",
  "ements",
  "ement",
  "ments",
  "ment",
  "ingly",
  "edly",
  "ings",
  "ing",
  "ers",
  "er",
  "ed",
  "es",
  "s",
  "ly"
];

// Iterates to a stable stem so inflections of the same word collapse consistently
// (manage/managed/management -> "manag", develop/developer/development -> "develop"),
// regardless of input length.
const stem = (word: string): string => {
  let current = word;
  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of STEM_SUFFIXES) {
      if (current.endsWith(suffix) && current.length - suffix.length >= 3) {
        current = current.slice(0, -suffix.length);
        changed = true;
        break;
      }
    }
  }
  return current.replace(/e$/, "");
};

const SYNONYMS: Record<string, string[]> = {
  javascript: ["js"],
  js: ["javascript"],
  typescript: ["ts"],
  ts: ["typescript"],
  kubernetes: ["k8s"],
  k8s: ["kubernetes"],
  postgresql: ["postgres", "psql"],
  postgres: ["postgresql", "psql"],
  react: ["reactjs"],
  reactjs: ["react"],
  node: ["nodejs"],
  nodejs: ["node"],
  cicd: ["ci/cd"],
  "ci/cd": ["cicd"],
  aws: ["amazon web services"],
  gcp: ["google cloud platform", "google cloud"],
  ml: ["machine learning"],
  "machine learning": ["ml"]
};

const tokenStems = (text: string): Set<string> => {
  const set = new Set<string>();
  for (const token of text.split(/[^a-z0-9+#]+/)) {
    if (!token) continue;
    set.add(token);
    set.add(stem(token));
  }
  return set;
};

// A term matches the text if it appears verbatim (handles phrases and c++/c#), if any
// synonym appears, or if its stem (or a synonym's stem) is present among the text's
// token stems.
const termMatches = (term: string, text: string, stems: Set<string>): boolean => {
  if (containsTerm(text, term)) return true;
  const synonyms = SYNONYMS[term] ?? [];
  if (synonyms.some((syn) => containsTerm(text, syn))) return true;
  const termStem = stem(term);
  if (termStem.length >= 3 && stems.has(termStem)) return true;
  return synonyms.some((syn) => {
    const synStem = stem(syn);
    return synStem.length >= 3 && stems.has(synStem);
  });
};

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

const skillsText = (profile: CvProfile) =>
  visibleSections(profile)
    .filter((section) => section.type === "skills")
    .flatMap((section) => [
      section.title,
      ...visibleItems(section).flatMap((item) => [
        item.title,
        item.subtitle,
        textFromHtml(item.description),
        item.tags.join(" ")
      ])
    ])
    .join(" ")
    .toLowerCase();

const evidenceText = (profile: CvProfile) =>
  visibleSections(profile)
    .filter((section) => section.type !== "skills")
    .flatMap((section) => [
      section.title,
      ...visibleItems(section).flatMap((item) => [
        item.title,
        item.subtitle,
        textFromHtml(item.description),
        item.tags.join(" ")
      ])
    ])
    .join(" ")
    .toLowerCase();

const scoreChecks = (checks: AtsReadinessCheck[], maxScore: number) =>
  Math.round((checks.filter((check) => check.passed).length / checks.length) * maxScore);

const emailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

const phoneValid = (phone: string) => {
  const trimmed = phone.trim();
  if (!/^[+()\-.\s\d]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

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
      id: "single-column-layout",
      label: "Single-column reading order",
      passed: template.layout === "Single Column" && !template.capabilities.sidebar,
      detail:
        template.layout === "Single Column" && !template.capabilities.sidebar
          ? "A single-column layout keeps reading order linear for stricter parsers."
          : "Multi-column or sidebar layouts can scramble reading order in stricter parsers; prefer a single-column template for upload portals."
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
  const email = profile.basics.email.trim();
  const phone = profile.basics.phone.trim();
  const contactPresent = Boolean(email || phone);
  const contactWellFormed = contactPresent && (email ? emailValid(email) : true) && (phone ? phoneValid(phone) : true);
  const checks: AtsReadinessCheck[] = [
    {
      id: "contact",
      label: "Core contact details",
      passed: Boolean(profile.basics.name.trim() && contactPresent),
      detail: "Name plus email or phone should be present before exporting."
    },
    {
      id: "contact-format",
      label: "Valid contact format",
      passed: contactWellFormed,
      detail: contactWellFormed
        ? "Contact details parse as a real email and/or phone number."
        : "Add a well-formed email (name@domain.tld) or phone number so screeners can reach you."
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
      passed: normalizedTitles.every((title) => title === "" || standardSectionNames.has(title)),
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
  // Detect bullets from the raw html, not the whitespace-collapsed text.
  const hasBullets = experienceItems.some((item) => htmlHasBullets(item.description));
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

const buildFitGroup = (profile: CvProfile): AtsReadinessGroup => {
  const fit = analyzeCvFit(profile);
  const checks: AtsReadinessCheck[] = [
    {
      id: "visible-word-budget",
      label: "Visible word budget",
      passed: fit.visibleWords <= CV_FIT_LIMITS.visibleWords,
      detail: `${fit.visibleWords}/${CV_FIT_LIMITS.visibleWords} visible words. Keep evidence focused instead of shrinking the type.`
    },
    {
      id: "summary-budget",
      label: "Concise profile",
      passed: fit.summaryWords <= CV_FIT_LIMITS.summaryWords,
      detail: `${fit.summaryWords}/${CV_FIT_LIMITS.summaryWords} profile words.`
    },
    {
      id: "skill-budget",
      label: "Role-focused skills",
      passed: fit.skillCount <= CV_FIT_LIMITS.skills,
      detail: `${fit.skillCount}/${CV_FIT_LIMITS.skills} unique skills. Keep only skills that strengthen the target application.`
    },
    {
      id: "duplicate-skills",
      label: "No duplicate skills",
      passed: fit.duplicateSkills.length === 0,
      detail: fit.duplicateSkills.length
        ? `Merge repeated or synonymous skills: ${fit.duplicateSkills.slice(0, 4).join(", ")}.`
        : "Each skill appears once in the skills inventory."
    },
    {
      id: "bullet-budget",
      label: "Evidence density",
      passed: fit.bulletCount <= CV_FIT_LIMITS.bullets,
      detail: `${fit.bulletCount}/${CV_FIT_LIMITS.bullets} evidence bullets.`
    },
    {
      id: "readable-density",
      label: "Readable density",
      passed: !fit.issues.some((issue) => issue.id === "font-size"),
      detail: "Overflow should be fixed by prioritising content, not by making text too small."
    }
  ];

  return {
    id: "fit",
    label: "Content fit",
    maxScore: 20,
    score: scoreChecks(checks, 20),
    checks
  };
};

type JobMatch = {
  group: AtsReadinessGroup;
  hasJob: boolean;
  missingKeywords: string[];
};

const buildJobMatch = (profile: CvProfile, jobDescription?: string): JobMatch => {
  const terms = meaningfulJobTerms(jobDescription ?? "");
  const hasJob = terms.length > 0;
  const allText = cvText(profile);
  const skillText = skillsText(profile);
  const proofText = evidenceText(profile);
  const allStems = tokenStems(allText);
  const skillStems = tokenStems(skillText);
  const proofStems = tokenStems(proofText);

  const matched: string[] = [];
  const missingKeywords: string[] = [];
  // A term backed by role/project evidence is more valuable than an unsupported
  // skills-list mention. This prevents keyword stuffing from improving the score.
  let weightedCoverage = 0;
  for (const term of terms) {
    const inSkills = termMatches(term, skillText, skillStems);
    const inEvidence = termMatches(term, proofText, proofStems);
    const anywhere = inSkills || inEvidence || termMatches(term, allText, allStems);
    if (inSkills && inEvidence) {
      weightedCoverage += 1;
      matched.push(term);
    } else if (inEvidence) {
      weightedCoverage += 0.85;
      matched.push(term);
    } else if (inSkills) {
      weightedCoverage += 0.65;
      matched.push(term);
    } else if (anywhere) {
      weightedCoverage += 0.45;
      matched.push(term);
    } else {
      missingKeywords.push(term);
    }
  }
  const coverage = hasJob ? weightedCoverage / terms.length : 0;

  const termSet = new Set(terms);
  const termStemSet = new Set(terms.map(stem));
  const headlineTokens = profile.basics.headline
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/[^a-z0-9+#]/g, ""))
    .filter(Boolean);
  const headlineAligned =
    hasJob && headlineTokens.some((token) => termSet.has(token) || termStemSet.has(stem(token)));

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
      passed: hasJob && coverage >= 0.45,
      detail: hasJob
        ? `${matched.length} of ${terms.length} extracted role terms appear in the CV.`
        : "Job-match scoring is skipped until a job description is supplied."
    },
    {
      id: "headline-match",
      label: "Headline aligns to role",
      passed: headlineAligned,
      detail: "The headline should echo the role family without keyword stuffing."
    }
  ];

  const headlineCheck = checks.find((check) => check.id === "headline-match");
  const score = hasJob ? Math.round(coverage * 14) + (headlineCheck?.passed ? 6 : 0) : 0;

  return {
    group: {
      id: "jobMatch",
      label: "Job match",
      maxScore: 20,
      score,
      checks
    },
    hasJob,
    missingKeywords: hasJob ? missingKeywords : []
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
  const jobMatch = buildJobMatch(profile, jobDescription);
  // Gate on extracted terms, not raw text: a paste of only short/stopwords yields no
  // terms, so the 20-point jobMatch group must drop out of the denominator rather than
  // sit there with unearnable points and silently tank the score.
  const hasJobDescription = jobMatch.hasJob;

  const groups: AtsReadinessGroup[] = [
    buildParserGroup(profile, template),
    buildStructureGroup(profile),
    buildEvidenceGroup(profile),
    buildFitGroup(profile)
  ];
  if (hasJobDescription) groups.push(jobMatch.group);

  // Group scores are individually rounded for display. The headline normalizes their sum
  // over the active max (100 with a job description, 80 without), so displayed group
  // scores reconcile exactly when a job description is present and scale by 1.25 otherwise.
  const maxScore = groups.reduce((sum, group) => sum + group.maxScore, 0);
  const rawScore = groups.reduce((sum, group) => sum + group.score, 0);
  const score = Math.round((rawScore / maxScore) * 100);
  const band = bandForScore(score);

  return {
    score,
    band,
    summary: hasJobDescription
      ? "Estimated from parser safety, structure, evidence, content fit, and target-job coverage."
      : "Estimated from parser safety, structure, evidence, and content fit. Add a job description for local role-match scoring.",
    disclaimer:
      "This is not a Workday, Greenhouse, Lever, Taleo, iCIMS, or Ashby score. It is Dossier's readiness estimate based on transparent checks.",
    groups,
    missingKeywords: hasJobDescription ? jobMatch.missingKeywords : []
  };
};
