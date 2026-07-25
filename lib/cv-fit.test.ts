import { describe, expect, it } from "vitest";

import { analyzeCvFit, countVisibleWords } from "@/lib/cv-fit";
import { createEmptyItem, createEmptyProfile, createEmptySection } from "@/lib/cv-profile";

const profileWithContent = () => {
  const profile = createEmptyProfile("software-engineering-lean");
  profile.basics.name = "Jane Doe";
  profile.basics.headline = "Software Engineer";
  profile.basics.summary = "Engineer focused on reliable services.";

  const experience = createEmptySection("experience");
  experience.items = [
    {
      ...createEmptyItem(),
      title: "Senior Engineer",
      subtitle: "Acme",
      dateRange: "2022 - Present",
      description: "<ul><li>Reduced latency by 30%.</li><li>Shipped a safer deployment flow.</li></ul>"
    }
  ];

  const skills = createEmptySection("skills");
  skills.items = [
    {
      ...createEmptyItem(),
      title: "Languages",
      description: "JavaScript::4\nJS::4\nTypeScript::4\nPostgres::3",
      tags: []
    }
  ];
  profile.sections = [experience, skills];
  return profile;
};

describe("countVisibleWords", () => {
  it("counts HTML content without counting markup", () => {
    expect(countVisibleWords("<p>Built <strong>reliable systems</strong>.</p>")).toBe(3);
  });
});

describe("analyzeCvFit", () => {
  it("counts bullets and collapses synonymous duplicate skills", () => {
    const result = analyzeCvFit(profileWithContent());
    expect(result.bulletCount).toBe(2);
    expect(result.skillCount).toBe(3);
    expect(result.duplicateSkills).toContain("JavaScript");
  });

  it("flags excessive skills", () => {
    const profile = profileWithContent();
    const skills = profile.sections.find((section) => section.type === "skills");
    if (!skills) throw new Error("skills fixture missing");
    skills.items[0]!.description = Array.from(
      { length: 18 },
      (_, index) => `Skill ${index + 1}::4`
    ).join("\n");

    expect(analyzeCvFit(profile).issues.some((issue) => issue.id === "skills")).toBe(true);
  });
});
