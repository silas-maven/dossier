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

const focusedScenario = (input: {
  name: string;
  headline: string;
  summary: string;
  role: string;
  company: string;
  bullets: [string, string];
  previousRole: string;
  previousBullets: [string, string];
  skills: string;
  educationTitle?: string;
  certifications?: string[];
  projects?: SeedScenario["projects"];
}): SeedScenario => ({
  basics: {
    name: input.name,
    headline: input.headline,
    email: `${input.name.toLowerCase().split(" ")[0]}@example.com`,
    phone: "+44 7700 900888",
    url: "https://example.com",
    location: "London, UK",
    summary: input.summary
  },
  experience: [
    {
      id: "exp-1",
      title: input.role,
      subtitle: input.company,
      dateRange: "2022 - Present",
      description: `- ${input.bullets[0]}\n- ${input.bullets[1]}`,
      tags: [],
      visible: true
    },
    {
      id: "exp-2",
      title: input.previousRole,
      subtitle: input.company,
      dateRange: "2019 - 2022",
      description: `- ${input.previousBullets[0]}\n- ${input.previousBullets[1]}`,
      tags: [],
      visible: true
    }
  ],
  skills: input.skills,
  projects: input.projects,
  education: [
    {
      ...generalScenario.education[0]!,
      title: input.educationTitle ?? generalScenario.education[0]!.title
    }
  ],
  certifications: input.certifications?.map((title, index) => ({
    id: `cert-${index + 1}`,
    title,
    subtitle: "",
    dateRange: "",
    description: "",
    tags: [],
    visible: true
  }))
});

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
  },
  Legal: focusedScenario({
    name: "Amelia Example",
    headline: "Commercial counsel for technology and regulated services",
    summary:
      "Commercial counsel advising product, sales, and leadership teams on complex contracts, governance, privacy, and operational risk.",
    role: "Senior Legal Counsel",
    company: "Northbridge Group",
    bullets: [
      "Negotiated technology and services agreements worth more than £18M while reducing average review time by 28%.",
      "Advised executive stakeholders on privacy, regulatory, and product-launch risk across the UK and EU."
    ],
    previousRole: "Legal Counsel",
    previousBullets: [
      "Built contract playbooks and fallback positions used across sales and procurement.",
      "Managed external counsel and matter reporting across four jurisdictions."
    ],
    skills: "Commercial contracts, Data privacy, Corporate governance, Regulatory advice, Negotiation",
    educationTitle: "LL.B. Law",
    certifications: ["Solicitor - England & Wales"]
  }),
  Sales: focusedScenario({
    name: "Marcus Example",
    headline: "Enterprise account executive for complex B2B sales",
    summary:
      "Enterprise seller with a record of building pipeline, navigating multi-stakeholder deals, and growing strategic accounts.",
    role: "Enterprise Account Executive",
    company: "SignalCloud",
    bullets: [
      "Closed £2.8M in annual contract value at 118% of quota across financial-services accounts.",
      "Built a £6.2M qualified pipeline and improved win rate from 24% to 34%."
    ],
    previousRole: "Account Executive",
    previousBullets: [
      "Won the region's largest new logo through a six-month consultative sales cycle.",
      "Created mutual action plans that reduced late-stage deal slippage by 22%."
    ],
    skills: "Enterprise sales, Pipeline management, MEDDPICC, Negotiation, Salesforce, Account planning"
  }),
  Marketing: focusedScenario({
    name: "Nadia Example",
    headline: "Growth marketer connecting campaigns to pipeline",
    summary:
      "Growth marketer with experience across demand generation, lifecycle, content, and performance programmes for B2B products.",
    role: "Growth Marketing Lead",
    company: "Northstar Labs",
    bullets: [
      "Generated £3.1M in sourced pipeline while reducing blended cost per lead by 26%.",
      "Built a lifecycle programme that increased trial-to-paid conversion from 14% to 20%."
    ],
    previousRole: "Campaign Manager",
    previousBullets: [
      "Led integrated launches across paid, partner, email, and content channels.",
      "Introduced campaign reporting that connected channel spend to opportunity value."
    ],
    skills: "Demand generation, Lifecycle marketing, HubSpot, Paid media, Content strategy, Attribution"
  }),
  "Human Resources": focusedScenario({
    name: "Leila Example",
    headline: "People partner for scaling organisations",
    summary:
      "People partner supporting leaders through growth, employee relations, organisational change, and people-program delivery.",
    role: "Senior People Partner",
    company: "Brightline Group",
    bullets: [
      "Supported a 420-person organisation through restructuring while maintaining 92% regrettable-talent retention.",
      "Redesigned manager enablement and reduced employee-relations case duration by 31%."
    ],
    previousRole: "HR Business Partner",
    previousBullets: [
      "Advised leaders on performance, policy, workforce planning, and complex cases.",
      "Implemented an HRIS workflow that cut onboarding administration by 40%."
    ],
    skills: "Employee relations, Organisational design, Workforce planning, HRIS, Policy, Coaching"
  }),
  "Talent Acquisition": focusedScenario({
    name: "Noah Example",
    headline: "Talent acquisition partner for technical hiring",
    summary:
      "Recruiter experienced in technical and go-to-market hiring, sourcing strategy, stakeholder partnership, and funnel improvement.",
    role: "Senior Talent Partner",
    company: "Foundry Systems",
    bullets: [
      "Filled 64 roles across engineering and product while reducing median time-to-fill from 52 to 38 days.",
      "Built sourcing experiments that increased qualified underrepresented candidates by 36%."
    ],
    previousRole: "Technical Recruiter",
    previousBullets: [
      "Managed 18 concurrent requisitions with a 91% offer-acceptance rate.",
      "Created interviewer training and scorecards used across five departments."
    ],
    skills: "Technical recruiting, Sourcing, Greenhouse, LinkedIn Recruiter, Funnel analytics, Interview design"
  }),
  Healthcare: focusedScenario({
    name: "Sofia Example",
    headline: "Registered nurse focused on safe, coordinated care",
    summary:
      "Registered nurse with experience in acute care, patient education, multidisciplinary coordination, and quality improvement.",
    role: "Senior Staff Nurse",
    company: "Riverside NHS Trust",
    bullets: [
      "Coordinated care for a 28-bed unit while maintaining 98% medication-audit compliance.",
      "Introduced discharge education that reduced avoidable readmissions by 12%."
    ],
    previousRole: "Staff Nurse",
    previousBullets: [
      "Delivered evidence-based care across complex medical and surgical caseloads.",
      "Mentored six newly qualified nurses through preceptorship."
    ],
    skills: "Clinical assessment, Care planning, Medication safety, Patient education, Documentation",
    educationTitle: "B.Sc. Adult Nursing",
    certifications: ["NMC Registered Nurse", "Immediate Life Support"]
  }),
  Education: focusedScenario({
    name: "Daniel Example",
    headline: "Lecturer and programme lead in digital practice",
    summary:
      "Educator combining inclusive teaching, curriculum design, research-informed practice, and programme leadership.",
    role: "Senior Lecturer",
    company: "Westbridge University",
    bullets: [
      "Redesigned a 240-student module and increased first-time pass rates by 11 percentage points.",
      "Led programme review and accreditation evidence across a team of 14 lecturers."
    ],
    previousRole: "Lecturer",
    previousBullets: [
      "Delivered seminars, assessment, supervision, and student-support interventions.",
      "Published applied research and presented findings at two sector conferences."
    ],
    skills: "Curriculum design, Assessment, Research, Student support, Programme leadership",
    educationTitle: "Ph.D. Education"
  }),
  Nonprofit: focusedScenario({
    name: "Aisha Example",
    headline: "Programme leader for community and youth services",
    summary:
      "Mission-driven programme leader experienced in service delivery, partnerships, grants, safeguarding, and measurable community outcomes.",
    role: "Head of Programmes",
    company: "FuturePath Foundation",
    bullets: [
      "Expanded youth-employment services from two to six boroughs, supporting 1,400 participants annually.",
      "Secured £1.2M in grant renewals through stronger outcomes reporting and funder relationships."
    ],
    previousRole: "Programme Manager",
    previousBullets: [
      "Managed delivery partners, safeguarding, budgets, and frontline performance.",
      "Introduced beneficiary feedback that increased programme completion by 17%."
    ],
    skills: "Programme delivery, Fundraising, Partnerships, Safeguarding, Impact measurement"
  }),
  "Executive Leadership": focusedScenario({
    name: "Elliot Example",
    headline: "Operations executive leading scale and transformation",
    summary:
      "Executive leader with responsibility for multi-region operations, transformation, commercial performance, and organisational capability.",
    role: "Chief Operating Officer",
    company: "Northbridge Services",
    bullets: [
      "Led a three-year operating-model transformation that increased EBITDA by £9.4M.",
      "Scaled service delivery across five markets while improving customer retention to 94%."
    ],
    previousRole: "Operations Director",
    previousBullets: [
      "Owned a £42M budget and a 380-person organisation across operations and customer delivery.",
      "Integrated two acquisitions while maintaining service levels and key-talent retention."
    ],
    skills: "Operating strategy, Transformation, P&L ownership, Board reporting, Organisational design"
  }),
  "Design & Creative": focusedScenario({
    name: "Maya Example",
    headline: "Product designer shaping complex digital services",
    summary:
      "Product designer combining research, systems thinking, interaction design, and cross-functional delivery for high-stakes services.",
    role: "Senior Product Designer",
    company: "Common Thread Studio",
    bullets: [
      "Redesigned onboarding for a regulated platform and increased successful completion by 23%.",
      "Built a shared design system adopted across four product squads and 30 core workflows."
    ],
    previousRole: "Product Designer",
    previousBullets: [
      "Led discovery, prototyping, and usability testing for B2B and consumer products.",
      "Translated research into service blueprints and measurable product experiments."
    ],
    skills: "Product design, User research, Figma, Prototyping, Design systems, Service design",
    educationTitle: "B.A. Interaction Design",
    projects: [
      {
        id: "proj-1",
        title: "Accessible account recovery",
        subtitle: "Service redesign",
        dateRange: "2025",
        description:
          "- Simplified a high-friction support journey across web and assisted channels.\n- Increased successful self-service recovery by 31%.",
        tags: ["Service design", "Accessibility"],
        visible: true
      },
      {
        id: "proj-2",
        title: "Design system adoption",
        subtitle: "Cross-product platform",
        dateRange: "2024",
        description:
          "- Defined contribution standards and migration guidance.\n- Reduced duplicate component work across four squads.",
        tags: ["Design systems", "Governance"],
        visible: true
      }
    ]
  })
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
