import { describe, expect, it } from "vitest";

import {
  analyzeAtsReadiness,
  containsTerm,
  meaningfulJobTerms,
  type AtsReadinessGroup
} from "@/lib/ats-readiness";
import {
  createEmptyProfile,
  createEmptySection,
  createEmptyItem,
  type CvProfile,
  type CvSectionType
} from "@/lib/cv-profile";
import { cvTemplates, getTemplateById } from "@/lib/templates";

const lowRiskTemplate = getTemplateById("software-engineering-lean");
const splitColumnTemplate =
  cvTemplates.find((template) => template.layout === "Split Column") ?? lowRiskTemplate;

type ItemSpec = {
  title?: string;
  subtitle?: string;
  dateRange?: string;
  description?: string;
  tags?: string[];
};

const makeSection = (type: CvSectionType, items: ItemSpec[]) => {
  const section = createEmptySection(type);
  section.items = items.map((spec) => ({
    ...createEmptyItem(),
    title: spec.title ?? "",
    subtitle: spec.subtitle ?? "",
    dateRange: spec.dateRange ?? "",
    description: spec.description ?? "",
    tags: spec.tags ?? []
  }));
  return section;
};

// A reasonably complete profile so individual checks can be toggled in isolation.
const makeProfile = (
  overrides: {
    headline?: string;
    summary?: string;
    email?: string;
    phone?: string;
    experience?: ItemSpec[];
    skills?: ItemSpec[];
  } = {}
): CvProfile => {
  const profile = createEmptyProfile(lowRiskTemplate.id);
  profile.basics.name = "Jane Doe";
  profile.basics.email = overrides.email ?? "jane@example.com";
  profile.basics.phone = overrides.phone ?? "+44 7123 456789";
  profile.basics.headline = overrides.headline ?? "Software Engineer";
  profile.basics.summary = overrides.summary ?? "Backend engineer focused on reliability.";
  profile.sections = [
    makeSection(
      "experience",
      overrides.experience ?? [
        {
          title: "Senior Engineer",
          subtitle: "Acme",
          dateRange: "2021 - Present",
          description: "<ul><li>Reduced latency by 30%.</li></ul>"
        }
      ]
    ),
    makeSection("skills", overrides.skills ?? [{ title: "TypeScript", tags: ["React", "Node"] }])
  ];
  return profile;
};

const groupById = (groups: AtsReadinessGroup[], id: AtsReadinessGroup["id"]) =>
  groups.find((group) => group.id === id);

const checkById = (group: AtsReadinessGroup | undefined, id: string) =>
  group?.checks.find((check) => check.id === id);

describe("containsTerm (boundary-aware matching)", () => {
  it("does not match substrings inside larger words", () => {
    expect(containsTerm("category management goals", "go")).toBe(false);
    expect(containsTerm("thorough analysis required", "is")).toBe(false);
    expect(containsTerm("category", "c")).toBe(false);
  });

  it("matches whole tokens", () => {
    expect(containsTerm("we use go and rust", "go")).toBe(true);
    expect(containsTerm("strong c fundamentals", "c")).toBe(true);
  });

  it("handles c++ and c# as tokens", () => {
    expect(containsTerm("built in c++ and python", "c++")).toBe(true);
    expect(containsTerm("dotnet with c#", "c#")).toBe(true);
    expect(containsTerm("a category of cats", "c++")).toBe(false);
  });
});

describe("meaningfulJobTerms", () => {
  it("drops the it/is/to stopwords that used to leak through the short-token whitelist", () => {
    const terms = meaningfulJobTerms("it is good to lead the team");
    expect(terms).not.toContain("it");
    expect(terms).not.toContain("is");
    expect(terms).not.toContain("to");
  });

  it("keeps whitelisted short skill tokens", () => {
    const terms = meaningfulJobTerms("experience with go and c preferred");
    expect(terms).toContain("go");
    expect(terms).toContain("c");
  });

  it("extracts uppercase acronyms before lowercasing", () => {
    const terms = meaningfulJobTerms("Must know AWS, SQL and ML pipelines");
    expect(terms).toContain("aws");
    expect(terms).toContain("sql");
    expect(terms).toContain("ml");
  });

  it("returns nothing for empty or junk-only input", () => {
    expect(meaningfulJobTerms("")).toEqual([]);
    expect(meaningfulJobTerms("the and for are you our")).toEqual([]);
    expect(meaningfulJobTerms("  is to it  ")).toEqual([]);
  });
});

describe("analyzeAtsReadiness — job-description gating", () => {
  it("excludes the jobMatch group and normalizes over 80 when no JD is supplied", () => {
    const result = analyzeAtsReadiness(makeProfile(), lowRiskTemplate);
    expect(groupById(result.groups, "jobMatch")).toBeUndefined();
    expect(result.missingKeywords).toEqual([]);
    // No contradictory 0/20 jobMatch card lingering in the returned groups.
    expect(result.groups.every((group) => group.id !== "jobMatch")).toBe(true);
    expect(result.summary).toContain("Add a job description");
  });

  it("treats a junk-only JD (no extractable terms) as no JD", () => {
    const result = analyzeAtsReadiness(makeProfile(), lowRiskTemplate, "the and for are to is it");
    expect(groupById(result.groups, "jobMatch")).toBeUndefined();
    expect(result.missingKeywords).toEqual([]);
  });

  it("includes the jobMatch group when the JD yields terms", () => {
    const result = analyzeAtsReadiness(
      makeProfile(),
      lowRiskTemplate,
      "Senior TypeScript engineer building React applications on Node."
    );
    expect(groupById(result.groups, "jobMatch")).toBeDefined();
  });
});

describe("analyzeAtsReadiness — keyword coverage", () => {
  it("does not inflate coverage from substring false positives", () => {
    // None of these JD terms legitimately appear in the CV; substring matching would
    // have falsely matched "go"/"is"/"c" against common words.
    const profile = makeProfile({
      headline: "Chef",
      summary: "I cook food in a busy category of restaurants.",
      experience: [{ title: "Cook", description: "<p>Prepared dishes.</p>" }],
      skills: [{ title: "Cooking" }]
    });
    const result = analyzeAtsReadiness(profile, lowRiskTemplate, "golang rust elixir");
    const jobMatch = groupById(result.groups, "jobMatch");
    expect(checkById(jobMatch, "keyword-coverage")?.passed).toBe(false);
    expect(result.missingKeywords).toEqual(expect.arrayContaining(["golang", "rust", "elixir"]));
  });

  it("matches inflections via light stemming", () => {
    const profile = makeProfile({
      experience: [
        {
          title: "Engineering Manager",
          description: "<ul><li>Led management of a development team.</li></ul>"
        }
      ],
      skills: [{ title: "Leadership" }]
    });
    // JD uses different inflections than the CV (manage vs management, develop vs development).
    const result = analyzeAtsReadiness(profile, lowRiskTemplate, "manage develop deliver");
    expect(result.missingKeywords).not.toContain("manage");
    expect(result.missingKeywords).not.toContain("develop");
  });

  it("matches synonyms (js <-> javascript)", () => {
    const profile = makeProfile({
      skills: [{ title: "JavaScript", tags: ["Kubernetes"] }]
    });
    const result = analyzeAtsReadiness(profile, lowRiskTemplate, "js k8s required");
    expect(result.missingKeywords).not.toContain("js");
    expect(result.missingKeywords).not.toContain("k8s");
  });

  it("weights evidence-backed matches above skills-only mentions", () => {
    const inSkills = makeProfile({
      headline: "Engineer",
      summary: "Engineer.",
      experience: [{ title: "Engineer", description: "<p>Worked on things.</p>" }],
      skills: [{ title: "Rust" }]
    });
    const inBodyOnly = makeProfile({
      headline: "Engineer",
      summary: "Engineer.",
      experience: [{ title: "Engineer", description: "<p>Worked with rust daily.</p>" }],
      skills: [{ title: "Cooking" }]
    });
    const jd = "rust";
    const skillsScore = groupById(analyzeAtsReadiness(inSkills, lowRiskTemplate, jd).groups, "jobMatch")!.score;
    const bodyScore = groupById(analyzeAtsReadiness(inBodyOnly, lowRiskTemplate, jd).groups, "jobMatch")!.score;
    expect(bodyScore).toBeGreaterThan(skillsScore);
  });
});

describe("evidence group — bullet detection", () => {
  const evidenceCheck = (description: string) => {
    const profile = makeProfile({ experience: [{ title: "Role", dateRange: "2021", description }] });
    const evidence = groupById(analyzeAtsReadiness(profile, lowRiskTemplate).groups, "evidence");
    return checkById(evidence, "bullet-density")?.passed;
  };

  it("detects <li> bullets", () => {
    expect(evidenceCheck("<ul><li>Did a thing.</li><li>Did another.</li></ul>")).toBe(true);
  });

  it("detects <p>-separated and <br> content", () => {
    expect(evidenceCheck("<p>First point.</p><p>Second point.</p>")).toBe(true);
    expect(evidenceCheck("First line.<br/>Second line.")).toBe(true);
  });

  it("does not treat a hyphenated word in prose as a bullet", () => {
    expect(evidenceCheck("<p>Built a well-known internal platform end-to-end.</p>")).toBe(false);
  });
});

describe("evidence group — measurable outcomes", () => {
  const metricCheck = (description: string) => {
    const profile = makeProfile({ experience: [{ title: "Role", dateRange: "2021", description }] });
    const evidence = groupById(analyzeAtsReadiness(profile, lowRiskTemplate).groups, "evidence");
    return checkById(evidence, "measurable-outcomes")?.passed;
  };

  it("does not count bare years or durations as outcomes", () => {
    expect(metricCheck("<p>Worked here from 2019 for 1 year on the team.</p>")).toBe(false);
  });

  it("counts real quantified outcomes", () => {
    expect(metricCheck("<p>Reduced costs by 20%.</p>")).toBe(true);
    expect(metricCheck("<p>Grew revenue 3x.</p>")).toBe(true);
    expect(metricCheck("<p>Saved $1m annually.</p>")).toBe(true);
  });
});

describe("parser group — layout risk", () => {
  it("passes single-column layout and flags split/sidebar layouts", () => {
    const single = groupById(analyzeAtsReadiness(makeProfile(), lowRiskTemplate).groups, "parser");
    expect(checkById(single, "single-column-layout")?.passed).toBe(true);

    if (splitColumnTemplate.id !== lowRiskTemplate.id) {
      const split = groupById(analyzeAtsReadiness(makeProfile(), splitColumnTemplate).groups, "parser");
      expect(checkById(split, "single-column-layout")?.passed).toBe(false);
    }
  });
});

describe("structure group — contact format validation", () => {
  it("fails contact-format on a malformed email", () => {
    const structure = groupById(
      analyzeAtsReadiness(makeProfile({ email: "not-an-email", phone: "" }), lowRiskTemplate).groups,
      "structure"
    );
    expect(checkById(structure, "contact-format")?.passed).toBe(false);
  });

  it("passes contact-format on a valid email", () => {
    const structure = groupById(
      analyzeAtsReadiness(makeProfile({ email: "jane@example.com", phone: "" }), lowRiskTemplate).groups,
      "structure"
    );
    expect(checkById(structure, "contact-format")?.passed).toBe(true);
  });
});

describe("disclaimer", () => {
  it("preserves the disclaimer string verbatim", () => {
    const result = analyzeAtsReadiness(makeProfile(), lowRiskTemplate);
    expect(result.disclaimer).toBe(
      "This is not a Workday, Greenhouse, Lever, Taleo, iCIMS, or Ashby score. It is Dossier's readiness estimate based on transparent checks."
    );
  });
});
