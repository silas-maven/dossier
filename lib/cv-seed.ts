import { createEmptyProfile, createEmptySection, type CvProfile } from "@/lib/cv-profile";
import { getTemplateById } from "@/lib/templates";

type SeedScenario = {
  basics: CvProfile["basics"];
  experience: CvProfile["sections"][number]["items"];
  projects?: CvProfile["sections"][number]["items"];
  skills: string;
  education: CvProfile["sections"][number]["items"];
  certifications?: CvProfile["sections"][number]["items"];
};

const generalScenario: SeedScenario = {
  basics: {
    name: "Alex Example",
    headline: "Product-minded software engineer",
    email: "alex@example.com",
    phone: "+1 (555) 555-5555",
    url: "https://example.com",
    location: "London, UK",
    summary:
      "Product-minded software engineer with a focus on reliability, UX, and shipping high-quality systems."
  },
  experience: [
    {
      id: "exp-1",
      title: "Senior Software Engineer",
      subtitle: "ExampleCo",
      dateRange: "2023 - Present",
      description:
        "- Led a refactor that reduced page load time by 35%.\n- Built a typed API client and CI checks that prevented regressions.",
      tags: ["TypeScript", "Next.js", "Performance"],
      visible: true
    },
    {
      id: "exp-2",
      title: "Software Engineer",
      subtitle: "AnotherCo",
      dateRange: "2020 - 2023",
      description:
        "- Owned key customer flows end-to-end.\n- Improved reliability by instrumenting alerts and runbooks.",
      tags: ["React", "Observability"],
      visible: true
    }
  ],
  projects: [
    {
      id: "proj-1",
      title: "Dossier (CV Builder)",
      subtitle: "Local-first resume editor",
      dateRange: "2026",
      description:
        "- Built a template picker with richer comparisons and import guidance.\n- Implemented local persistence and a live preview.",
      tags: ["Next.js", "UX", "PDF"],
      visible: true
    }
  ],
  skills: "TypeScript, React, Next.js, Node.js, SQL, Testing",
  education: [
    {
      id: "edu-1",
      title: "B.S. Computer Science",
      subtitle: "Example University",
      dateRange: "2016 - 2020",
      description: "",
      tags: [],
      visible: true
    }
  ]
};

const scenarios: Record<string, SeedScenario> = {
  "Software Engineering": generalScenario,
  "Product Management": {
    basics: {
      name: "Priya Example",
      headline: "Product manager focused on activation and platform delivery",
      email: "priya@example.com",
      phone: "+44 7700 900111",
      url: "https://example.com/pm",
      location: "Manchester, UK",
      summary:
        "Product manager with 6+ years driving roadmap decisions, launch execution, and measurable growth across B2B SaaS products."
    },
    experience: [
      {
        id: "exp-1",
        title: "Senior Product Manager",
        subtitle: "Northline SaaS",
        dateRange: "2023 - Present",
        description:
          "- Led onboarding redesign that increased 30-day activation by 18%.\n- Prioritized a self-serve roadmap across design, engineering, and customer success for 3 product squads.",
        tags: ["Roadmaps", "Experimentation", "Stakeholder leadership"],
        visible: true
      },
      {
        id: "exp-2",
        title: "Product Manager",
        subtitle: "LaunchPad",
        dateRange: "2020 - 2023",
        description:
          "- Shipped analytics workflow improvements that reduced report creation time by 42%.\n- Introduced product review rituals and a KPI scorecard used by leadership each month.",
        tags: ["Analytics", "B2B SaaS"],
        visible: true
      }
    ],
    projects: [
      {
        id: "proj-1",
        title: "0 to 1 Usage Dashboard",
        subtitle: "Internal product initiative",
        dateRange: "2024",
        description:
          "- Defined event taxonomy with engineering and analytics.\n- Built the dashboard spec used to track activation, retention, and rollout quality.",
        tags: ["SQL", "Amplitude", "Product ops"],
        visible: true
      }
    ],
    skills: "Roadmapping, Product discovery, SQL, Amplitude, A/B testing, Jira",
    education: generalScenario.education
  },
  "Project & Program Management": {
    basics: {
      name: "Hamza Example",
      headline: "Technical project manager for software and delivery programmes",
      email: "hamza@example.com",
      phone: "+44 7700 900222",
      url: "https://example.com/program",
      location: "Birmingham, UK",
      summary:
        "Technical PM with experience delivering software, implementation, and cross-functional transformation programmes with clear governance and measurable delivery outcomes."
    },
    experience: [
      {
        id: "exp-1",
        title: "Technical Project Manager",
        subtitle: "Mercury Digital",
        dateRange: "2022 - Present",
        description:
          "- Delivered a £1.8M platform migration across 6 workstreams and 4 vendors, landing 3 weeks ahead of plan.\n- Built RAID, dependency, and governance routines that cut delivery slippage by 27%.",
        tags: ["Agile", "Governance", "Vendor management"],
        visible: true
      },
      {
        id: "exp-2",
        title: "Programme Coordinator",
        subtitle: "City Systems",
        dateRange: "2019 - 2022",
        description:
          "- Coordinated implementation schedules for 30+ client rollouts.\n- Standardized reporting packs that reduced weekly status prep by 5 hours.",
        tags: ["PMO", "Delivery"],
        visible: true
      }
    ],
    skills: "Jira, RAID logs, Budget tracking, Stakeholder management, Agile, Delivery governance",
    education: generalScenario.education,
    certifications: [
      {
        id: "cert-1",
        title: "PRINCE2 Practitioner",
        subtitle: "",
        dateRange: "2024",
        description: "",
        tags: [],
        visible: true
      },
      {
        id: "cert-2",
        title: "Scrum Master",
        subtitle: "",
        dateRange: "2023",
        description: "",
        tags: [],
        visible: true
      }
    ]
  },
  Consulting: {
    basics: {
      name: "Jordan Example",
      headline: "Consultant focused on operational improvement and client delivery",
      email: "jordan@example.com",
      phone: "+44 7700 900333",
      url: "https://example.com/consulting",
      location: "London, UK",
      summary:
        "Consultant with experience translating analysis into executive-ready recommendations, operating models, and measurable business outcomes."
    },
    experience: [
      {
        id: "exp-1",
        title: "Consultant",
        subtitle: "Apex Advisory",
        dateRange: "2022 - Present",
        description:
          "- Led analysis for a cost transformation programme that identified £3.4M in annual savings.\n- Built steering committee materials and weekly client workplans across finance, operations, and technology stakeholders.",
        tags: ["Problem solving", "Executive communication"],
        visible: true
      },
      {
        id: "exp-2",
        title: "Analyst",
        subtitle: "Apex Advisory",
        dateRange: "2020 - 2022",
        description:
          "- Built interview synthesis and issue trees for 8 client engagements.\n- Automated reporting in Excel and Power BI to reduce turnaround time by 30%.",
        tags: ["Excel", "Power BI"],
        visible: true
      }
    ],
    skills: "Problem structuring, PowerPoint, Excel, Workshop facilitation, Stakeholder management",
    education: generalScenario.education
  },
  "Finance & Analysis": {
    basics: {
      name: "Morgan Example",
      headline: "Financial analyst focused on forecasting and commercial performance",
      email: "morgan@example.com",
      phone: "+44 7700 900444",
      url: "https://example.com/finance",
      location: "Leeds, UK",
      summary:
        "Financial analyst with experience in forecasting, variance analysis, business partnering, and executive reporting for multi-market teams."
    },
    experience: [
      {
        id: "exp-1",
        title: "Financial Analyst",
        subtitle: "Northline Group",
        dateRange: "2022 - Present",
        description:
          "- Managed monthly forecasting for a £24M cost base and improved forecast accuracy by 11%.\n- Built margin analysis packs used in weekly commercial reviews and QBRs.",
        tags: ["FP&A", "Forecasting", "Power BI"],
        visible: true
      },
      {
        id: "exp-2",
        title: "Finance Associate",
        subtitle: "Northline Group",
        dateRange: "2020 - 2022",
        description:
          "- Automated board reporting inputs and reduced month-end prep by 2 days.\n- Supported pricing reviews with scenario models and variance commentary.",
        tags: ["Excel", "Modelling"],
        visible: true
      }
    ],
    skills: "Excel, Financial modelling, Variance analysis, SQL, Power BI, ERP reporting",
    education: generalScenario.education
  },
  "Data & Analytics": {
    basics: {
      name: "Taylor Example",
      headline: "Data analyst turning product and ops data into decisions",
      email: "taylor@example.com",
      phone: "+44 7700 900555",
      url: "https://example.com/data",
      location: "Bristol, UK",
      summary:
        "Data analyst with strong SQL and BI experience, focused on making reporting clearer, faster, and more useful for teams making day-to-day decisions."
    },
    experience: [
      {
        id: "exp-1",
        title: "Data Analyst",
        subtitle: "Signal Metrics",
        dateRange: "2023 - Present",
        description:
          "- Built adoption dashboards used by product and customer success teams across 12 customer segments.\n- Reduced manual reporting time by 80% through SQL models and scheduled BI outputs.",
        tags: ["SQL", "Looker", "dbt"],
        visible: true
      },
      {
        id: "exp-2",
        title: "Reporting Analyst",
        subtitle: "Signal Metrics",
        dateRange: "2020 - 2023",
        description:
          "- Standardized KPI definitions used in executive reporting.\n- Partnered with operations to identify process bottlenecks and cut case ageing by 19%.",
        tags: ["Power BI", "Process analysis"],
        visible: true
      }
    ],
    skills: "SQL, Python, Looker, Power BI, A/B analysis, Spreadsheet modelling",
    education: generalScenario.education
  },
  Operations: {
    basics: {
      name: "Casey Example",
      headline: "Operations manager improving delivery throughput and service quality",
      email: "casey@example.com",
      phone: "+44 7700 900666",
      url: "https://example.com/operations",
      location: "Nottingham, UK",
      summary:
        "Operations leader with experience improving SLA performance, delivery processes, and reporting visibility across fast-moving service teams."
    },
    experience: [
      {
        id: "exp-1",
        title: "Operations Manager",
        subtitle: "BrightLine Services",
        dateRange: "2022 - Present",
        description:
          "- Reduced onboarding cycle time by 32% through process redesign and workflow automation.\n- Improved SLA attainment from 84% to 96% across a 45-person service team.",
        tags: ["SLA", "Process improvement", "Automation"],
        visible: true
      },
      {
        id: "exp-2",
        title: "Business Operations Analyst",
        subtitle: "BrightLine Services",
        dateRange: "2019 - 2022",
        description:
          "- Built weekly KPI packs for leadership and standardized SOPs across 3 regions.\n- Identified process changes that reduced avoidable escalations by 21%.",
        tags: ["Excel", "SOPs"],
        visible: true
      }
    ],
    skills: "Process design, KPI reporting, Excel, SQL, CRM workflows, SOP documentation",
    education: generalScenario.education
  },
  "Customer Success": {
    basics: {
      name: "Riley Example",
      headline: "Customer success manager focused on adoption and renewals",
      email: "riley@example.com",
      phone: "+44 7700 900777",
      url: "https://example.com/customer",
      location: "Glasgow, UK",
      summary:
        "Customer success manager with experience owning onboarding, adoption planning, renewals, and escalations across growth-stage SaaS accounts."
    },
    experience: [
      {
        id: "exp-1",
        title: "Customer Success Manager",
        subtitle: "Northline SaaS",
        dateRange: "2022 - Present",
        description:
          "- Managed a £1.4M ARR portfolio with 96% gross retention and 112% net revenue retention.\n- Built executive business review packs and adoption plans that improved renewal confidence across strategic accounts.",
        tags: ["Renewals", "SaaS", "QBRs"],
        visible: true
      },
      {
        id: "exp-2",
        title: "Onboarding Specialist",
        subtitle: "Northline SaaS",
        dateRange: "2020 - 2022",
        description:
          "- Reduced time-to-first-value by 25% through milestone tracking and standardized training materials.\n- Partnered with support and product teams to close recurring implementation issues.",
        tags: ["Onboarding", "Adoption"],
        visible: true
      }
    ],
    skills: "Renewal management, Adoption planning, QBRs, CRM hygiene, Stakeholder communication",
    education: generalScenario.education
  }
};

export const seedExampleProfile = (templateId: string): CvProfile => {
  const profile = createEmptyProfile(templateId);
  const template = getTemplateById(templateId);
  const scenario = scenarios[template.industry] ?? generalScenario;

  profile.name = `${template.name} Seed`;
  profile.basics = scenario.basics;

  const experience = createEmptySection("experience");
  experience.title = "Experience";
  experience.items = scenario.experience;

  const education = createEmptySection("education");
  education.title = "Education";
  education.items = scenario.education;

  const skills = createEmptySection("skills");
  skills.title = "Skills";
  skills.items = [
    {
      id: "skills-1",
      title: "Core",
      subtitle: "",
      dateRange: "",
      description: scenario.skills,
      tags: [],
      visible: true
    }
  ];

  const sections = [experience];

  if (scenario.projects && scenario.projects.length > 0) {
    const projects = createEmptySection("projects");
    projects.title = "Projects";
    projects.items = scenario.projects;
    sections.push(projects);
  }

  sections.push(skills);

  if (scenario.certifications && scenario.certifications.length > 0) {
    const certifications = createEmptySection("certifications");
    certifications.title = "Certificates";
    certifications.items = scenario.certifications;
    sections.push(certifications);
  }

  sections.push(education);
  profile.sections = sections;
  return profile;
};
