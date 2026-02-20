import { createEmptyProfile, createEmptySection, type CvProfile } from "@/lib/cv-profile";

export const seedExampleProfile = (templateId: string): CvProfile => {
  const profile = createEmptyProfile(templateId);
  profile.name = "Seeded Example CV";

  profile.basics = {
    name: "Alex Example",
    headline: "Product-minded software engineer",
    email: "alex@example.com",
    phone: "+1 (555) 555-5555",
    url: "https://example.com",
    location: "San Francisco, CA",
    summary:
      "Product-minded software engineer with a focus on reliability, UX, and shipping high-quality systems."
  };

  const experience = createEmptySection("experience");
  experience.title = "Experience";
  experience.items = [
    {
      id: experience.items[0]!.id,
      title: "Senior Software Engineer",
      subtitle: "ExampleCo",
      dateRange: "2023 - Present",
      description:
        "- Led a refactor that reduced page load time by 35%.\n- Built a typed API client and CI checks that prevented regressions.",
      tags: ["TypeScript", "Next.js", "Performance"],
      visible: true
    },
    {
      id: `${experience.items[0]!.id}-2`,
      title: "Software Engineer",
      subtitle: "AnotherCo",
      dateRange: "2020 - 2023",
      description:
        "- Owned key customer flows end-to-end.\n- Improved reliability by instrumenting alerts and runbooks.",
      tags: ["React", "Observability"],
      visible: true
    }
  ];

  const projects = createEmptySection("projects");
  projects.title = "Projects";
  projects.items = [
    {
      id: projects.items[0]!.id,
      title: "Dossier (CV Builder)",
      subtitle: "Local-first resume editor",
      dateRange: "2026",
      description:
        "- Built a template picker with expanding cards.\n- Implemented local persistence and a live preview.",
      tags: ["Next.js", "IndexedDB", "UX"],
      visible: true
    }
  ];

  const skills = createEmptySection("skills");
  skills.title = "Skills";
  skills.items = [
    {
      id: skills.items[0]!.id,
      title: "Core",
      subtitle: "",
      dateRange: "",
      description: "TypeScript, React, Next.js, Node.js, SQL, Testing",
      tags: [],
      visible: true
    }
  ];

  const education = createEmptySection("education");
  education.title = "Education";
  education.items = [
    {
      id: education.items[0]!.id,
      title: "B.S. Computer Science",
      subtitle: "Example University",
      dateRange: "2016 - 2020",
      description: "",
      tags: [],
      visible: true
    }
  ];

  profile.sections = [experience, projects, skills, education];
  return profile;
};
