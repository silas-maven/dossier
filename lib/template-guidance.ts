import type { CvSectionType } from "@/lib/cv-profile";

export const guidanceProfileIds = [
  "software-engineering",
  "product-management",
  "program-delivery",
  "consulting",
  "finance-analysis",
  "customer-operations",
  "general-professional",
  "legal-counsel",
  "sales-revenue",
  "marketing-performance",
  "human-resources",
  "talent-acquisition",
  "operations-process",
  "healthcare-delivery",
  "education-academic",
  "nonprofit-mission"
] as const;

export type GuidanceProfileId = (typeof guidanceProfileIds)[number];

export type TemplateGuidanceProfile = {
  id: GuidanceProfileId;
  label: string;
  industries: string[];
  suggestedSectionOrder: CvSectionType[];
  summaryAdvice: string[];
  experienceAdvice: string[];
  skillsAdvice: string[];
  atsNotes: string[];
};

const engineeringOrder: CvSectionType[] = [
  "experience",
  "skills",
  "projects",
  "education",
  "certifications",
  "custom"
];

const productOrder: CvSectionType[] = [
  "experience",
  "skills",
  "projects",
  "education",
  "custom",
  "certifications"
];

const corporateOrder: CvSectionType[] = [
  "experience",
  "education",
  "certifications",
  "skills",
  "projects",
  "custom"
];

const customerOpsOrder: CvSectionType[] = [
  "experience",
  "skills",
  "certifications",
  "education",
  "custom",
  "projects"
];

const strictCredentialOrder: CvSectionType[] = [
  "custom",
  "experience",
  "education",
  "certifications",
  "skills",
  "projects"
];

const revenueOrder: CvSectionType[] = [
  "custom",
  "experience",
  "skills",
  "certifications",
  "education",
  "projects"
];

const peopleOrder: CvSectionType[] = [
  "custom",
  "experience",
  "certifications",
  "education",
  "skills",
  "projects"
];

const serviceOrder: CvSectionType[] = [
  "custom",
  "experience",
  "education",
  "skills",
  "certifications",
  "projects"
];

export const templateGuidanceProfiles: TemplateGuidanceProfile[] = [
  {
    id: "software-engineering",
    label: "Software Engineering",
    industries: ["Software Engineering", "Data & Analytics"],
    suggestedSectionOrder: engineeringOrder,
    summaryAdvice: [
      "Keep the summary short and role-specific. Lead with shipped systems, reliability, or platform scope.",
      "Avoid generic 'passionate engineer' copy. Name the kind of systems or products you build."
    ],
    experienceAdvice: [
      "Use bullets with measurable change: latency, reliability, scale, deployment speed, or customer impact.",
      "Keep the technical context visible without turning each bullet into a stack dump."
    ],
    skillsAdvice: [
      "Group the stack clearly: languages, frameworks, cloud, data, tooling.",
      "Reserve projects for evidence that strengthens the target role rather than repeating work history."
    ],
    atsNotes: [
      "Prefer single-column layouts for strict upload portals.",
      "Do not rely on graphic skill meters or sidebars to carry critical keywords."
    ]
  },
  {
    id: "product-management",
    label: "Product Management",
    industries: ["Product Management"],
    suggestedSectionOrder: productOrder,
    summaryAdvice: [
      "Frame the summary around product surface, user type, and business outcomes you influenced.",
      "Position tools as support, not the headline."
    ],
    experienceAdvice: [
      "Connect discovery, prioritization, launch, and measurable impact in the same bullet set.",
      "Show scope: squad count, revenue impact, adoption, retention, experimentation, or platform ownership."
    ],
    skillsAdvice: [
      "Keep analytics and delivery tools explicit, but secondary to product outcomes.",
      "Projects should show product thinking, not just side builds."
    ],
    atsNotes: [
      "Structured single-column layouts are the safest default.",
      "Balanced layouts can work for direct review, but chronology still needs to dominate."
    ]
  },
  {
    id: "program-delivery",
    label: "Program Delivery",
    industries: ["Project & Program Management", "Operations"],
    suggestedSectionOrder: corporateOrder,
    summaryAdvice: [
      "Lead with delivery scope: programme size, rollout footprint, governance complexity, or stakeholder environment.",
      "Keep certifications visible but compact."
    ],
    experienceAdvice: [
      "Quantify budget, timeline, team size, vendors, workstreams, or deployment footprint.",
      "Use delivery methods and tooling after outcomes, not as a substitute for them."
    ],
    skillsAdvice: [
      "Focus on governance, delivery, reporting, planning, and implementation systems.",
      "Custom sections work well for core-fit or delivery highlights when they stay concise."
    ],
    atsNotes: [
      "Date visibility matters. Keep chronology easy to scan.",
      "Avoid decorative sidebars for portal-first applications."
    ]
  },
  {
    id: "consulting",
    label: "Consulting",
    industries: ["Consulting"],
    suggestedSectionOrder: corporateOrder,
    summaryAdvice: [
      "Use the summary only if it sharpens practice focus, sector expertise, or consulting style.",
      "Avoid vague advisory language with no problem domain."
    ],
    experienceAdvice: [
      "Write bullets as problem, action, result. Client impact matters more than activity lists.",
      "Surface executive communication, analysis quality, and measurable transformation outcomes."
    ],
    skillsAdvice: [
      "Keep tools short. Excel, PowerPoint, BI, and workshop facilitation are enough unless the role is technical.",
      "Human-first layouts are acceptable for direct networking, but parser-friendly versions should still exist."
    ],
    atsNotes: [
      "Traditional single-column templates remain the safest default.",
      "If using a styled PDF, keep the experience column dominant."
    ]
  },
  {
    id: "finance-analysis",
    label: "Finance & Analysis",
    industries: ["Finance & Analysis"],
    suggestedSectionOrder: corporateOrder,
    summaryAdvice: [
      "Lead with planning, forecasting, reporting cadence, or decision support context.",
      "Use summary space to position domain strength rather than motivation."
    ],
    experienceAdvice: [
      "Show revenue, margin, savings, forecast accuracy, reporting ownership, or model scope.",
      "Dates and progression should stay obvious."
    ],
    skillsAdvice: [
      "Keep Excel, SQL, BI, ERP, and modelling tools in a compact skills block.",
      "Education and certifications often deserve stronger placement than in tech resumes."
    ],
    atsNotes: [
      "Serif or conservative structured single-column layouts fit best.",
      "Avoid bars, dots, or visual ratings in parser-friendly finance versions."
    ]
  },
  {
    id: "customer-operations",
    label: "Customer & Operations",
    industries: ["Customer Success", "Customer & Operations", "Operations"],
    suggestedSectionOrder: customerOpsOrder,
    summaryAdvice: [
      "Lead with customer portfolio, service scope, support environment, or operational remit.",
      "Make the summary evidence-based rather than personality-led."
    ],
    experienceAdvice: [
      "Use bullets to show adoption, renewal, SLA, escalation handling, onboarding, or process improvement.",
      "Highlight tooling only when it strengthens the operational story."
    ],
    skillsAdvice: [
      "Group support tools, CRM systems, collaboration tools, and workflow platforms clearly.",
      "Custom sections can work for role-fit summaries or technical strengths if they are concise."
    ],
    atsNotes: [
      "Single-column templates are still the safest application default.",
      "Human-first sidebar versions are better for direct recruiter review than portal submissions."
    ]
  },
  {
    id: "general-professional",
    label: "General Professional",
    industries: ["General", "Design & Creative Ops", "Fintech & Strategy"],
    suggestedSectionOrder: corporateOrder,
    summaryAdvice: [
      "Keep the summary short and directly tied to the target role.",
      "Use the strongest evidence early; avoid decorative filler."
    ],
    experienceAdvice: [
      "Chronology and measurable outcomes should drive the page.",
      "A visually stronger template still needs standard section labels and clear dates."
    ],
    skillsAdvice: [
      "Only include skills that strengthen the target role.",
      "Treat human-first styling as a presentation layer, not the source of substance."
    ],
    atsNotes: [
      "Keep a parser-friendly version available for online applications.",
      "Use human-first layouts for direct-share scenarios only."
    ]
  },
  {
    id: "legal-counsel",
    label: "Legal Counsel",
    industries: ["Legal", "Corporate Law", "Compliance"],
    suggestedSectionOrder: strictCredentialOrder,
    summaryAdvice: [
      "Surface jurisdiction, bar admissions, practice area, and target title before broader narrative.",
      "Keep the summary formal and evidence-led; avoid personality-led positioning."
    ],
    experienceAdvice: [
      "Prioritize representative matters, advisory scope, drafting, negotiation, governance, and risk outcomes.",
      "Keep chronology, employer names, titles, and dates highly visible."
    ],
    skillsAdvice: [
      "Use practice-area keywords and regulatory or compliance domains plainly.",
      "Avoid decorative ratings, icons, or sidebars in legal ATS versions."
    ],
    atsNotes: [
      "Strict parser layout: single-column, conservative, no decorative split layout.",
      "Bar admissions and credentials should be early because they can decide the screen quickly."
    ]
  },
  {
    id: "sales-revenue",
    label: "Sales Revenue",
    industries: ["Sales", "Revenue", "Business Development"],
    suggestedSectionOrder: revenueOrder,
    summaryAdvice: [
      "Lead with quota attainment, market, segment, deal size, and sales motion.",
      "Use a short target-title line and metric highlights instead of a generic profile."
    ],
    experienceAdvice: [
      "Show quota, revenue, pipeline, win rate, ACV, retention, expansion, or territory growth.",
      "Make every major role prove performance, not just responsibilities."
    ],
    skillsAdvice: [
      "Keep CRM, sales methodology, prospecting, negotiation, and account planning keywords clear.",
      "Awards can sit high when they prove ranking or quota performance."
    ],
    atsNotes: [
      "Strict parser layout: bold numbers are fine, but keep the layout conservative and parser-safe.",
      "Revenue proof should appear before long experience detail."
    ]
  },
  {
    id: "marketing-performance",
    label: "Marketing Performance",
    industries: ["Marketing", "Growth", "Campaigns"],
    suggestedSectionOrder: revenueOrder,
    summaryAdvice: [
      "Lead with channel mix, campaign type, audience, and measurable growth or conversion impact.",
      "Keep brand language secondary to performance evidence."
    ],
    experienceAdvice: [
      "Quantify pipeline, CAC, ROAS, conversion, engagement, launches, experiments, or audience growth.",
      "Connect campaign strategy to measurable commercial or audience outcomes."
    ],
    skillsAdvice: [
      "List tools and channels clearly: CRM, analytics, paid media, lifecycle, SEO, content, automation.",
      "Portfolio-style proof belongs in projects only when it strengthens the target role."
    ],
    atsNotes: [
      "Balanced parser layout: modern hierarchy is acceptable if reading order stays obvious.",
      "Avoid visual clutter; use restrained hierarchy and clear standard headings."
    ]
  },
  {
    id: "human-resources",
    label: "Human Resources",
    industries: ["Human Resources", "People Operations", "Employee Relations"],
    suggestedSectionOrder: peopleOrder,
    summaryAdvice: [
      "Lead with HR domain, employee population, business partner scope, and compliance context.",
      "Keep the tone calm, structured, and people-centered without becoming vague."
    ],
    experienceAdvice: [
      "Show employee relations, policy, workforce planning, performance cycles, DEI, engagement, and HRIS outcomes.",
      "Quantify headcount, process improvements, cycle time, compliance, or retention where evidence exists."
    ],
    skillsAdvice: [
      "Put certifications, HRIS, employee relations, compliance, and people-program keywords where scanners can read them.",
      "Keep strengths concise and role-specific."
    ],
    atsNotes: [
      "Balanced parser layout: readable hierarchy matters more than visual flair.",
      "Credentials and compliance signals should be easy to find."
    ]
  },
  {
    id: "talent-acquisition",
    label: "Talent Acquisition",
    industries: ["Talent Acquisition", "Recruiting", "People Operations"],
    suggestedSectionOrder: revenueOrder,
    summaryAdvice: [
      "Lead with hiring scope, role families, sourcing channels, region, and recruiting model.",
      "Use metric highlights for time-to-fill, pipeline, offer acceptance, diversity sourcing, or requisition volume."
    ],
    experienceAdvice: [
      "Show requisition load, roles filled, stakeholder partnership, sourcing strategy, funnel conversion, and ATS/CRM use.",
      "Make tools visible but keep the proof tied to hiring outcomes."
    ],
    skillsAdvice: [
      "Group ATS/CRM, sourcing tools, interviewing, stakeholder management, and analytics clearly.",
      "Avoid generic people-person language unless it is backed by hiring results."
    ],
    atsNotes: [
      "Balanced parser layout: compact and fast-scanning, with KPI proof near the top.",
      "Keep standard headings so recruiting systems parse the profile cleanly."
    ]
  },
  {
    id: "operations-process",
    label: "Operations Process",
    industries: ["Operations", "Business Operations", "Service Delivery"],
    suggestedSectionOrder: customerOpsOrder,
    summaryAdvice: [
      "Lead with process ownership, operating model, service scope, and measurable improvement area.",
      "Keep the positioning ordered and outcome-led rather than task-led."
    ],
    experienceAdvice: [
      "Show throughput, cost, cycle time, quality, SLA, compliance, or process reliability improvements.",
      "Highlight cross-functional coordination only when it explains the operational result."
    ],
    skillsAdvice: [
      "Group systems and methods clearly: Excel, SQL, CRM, ERP, Lean, SOP design, workflow tooling.",
      "Keep tools close to business outcomes, not isolated as filler."
    ],
    atsNotes: [
      "Balanced parser layout: modular structure is acceptable when chronology remains clear.",
      "Avoid decorative layouts that obscure process metrics or dates."
    ]
  },
  {
    id: "healthcare-delivery",
    label: "Healthcare Delivery",
    industries: ["Healthcare", "Clinical Operations", "Care Delivery"],
    suggestedSectionOrder: strictCredentialOrder,
    summaryAdvice: [
      "Lead with credentials, care setting, patient population, compliance, and delivery scope.",
      "Keep the summary formal, credential-forward, and safety-aware."
    ],
    experienceAdvice: [
      "Show patient care, care coordination, documentation, quality, safety, compliance, and workflow outcomes.",
      "Use measurable caseload, quality, throughput, audit, or patient-experience evidence where truthful."
    ],
    skillsAdvice: [
      "Make licenses, certifications, systems, clinical skills, and regulatory keywords explicit.",
      "Do not bury credentials in visual sidebars or decorative areas."
    ],
    atsNotes: [
      "Strict parser layout: credential-forward, single-column, formal layout.",
      "Licenses and certifications should be prominent and easy to parse."
    ]
  },
  {
    id: "education-academic",
    label: "Education Academic",
    industries: ["Education", "Academic Practice", "Teaching"],
    suggestedSectionOrder: serviceOrder,
    summaryAdvice: [
      "Lead with teaching area, learner population, research or service focus, and institution type.",
      "Use slightly more narrative language only when it adds credibility and role fit."
    ],
    experienceAdvice: [
      "Show teaching outcomes, curriculum design, assessment, research, service, student support, or program contribution.",
      "Keep education credentials and publications easy to find when relevant."
    ],
    skillsAdvice: [
      "Group pedagogy, LMS, research methods, assessment, safeguarding, and subject expertise clearly.",
      "Use custom sections for publications, service, or selected academic work when relevant."
    ],
    atsNotes: [
      "Balanced parser layout: clean, calm, credible, and readable.",
      "Do not let narrative sections bury dates, institutions, or credentials."
    ]
  },
  {
    id: "nonprofit-mission",
    label: "Nonprofit Mission",
    industries: ["Nonprofit", "Fundraising", "Programme Delivery"],
    suggestedSectionOrder: serviceOrder,
    summaryAdvice: [
      "Lead with mission area, program scope, beneficiary group, funding environment, or partnership model.",
      "Keep mission language grounded in measurable delivery or fundraising outcomes."
    ],
    experienceAdvice: [
      "Show program outcomes, grants, fundraising, partnerships, stakeholder engagement, volunteer coordination, or service delivery.",
      "Balance warmth with operational proof and clear accountability."
    ],
    skillsAdvice: [
      "Make fundraising tools, CRM, grant writing, program evaluation, partnerships, and reporting keywords explicit.",
      "Use custom highlights for mission wins when they are concise and evidence-backed."
    ],
    atsNotes: [
      "Balanced parser layout: warm but restrained, with standard headings and clear chronology.",
      "Presentation-leaning versions can work for fundraising leadership and direct review."
    ]
  }
];

const profileMap = new Map(templateGuidanceProfiles.map((profile) => [profile.id, profile]));

export const getTemplateGuidanceProfile = (id: GuidanceProfileId) => profileMap.get(id) ?? templateGuidanceProfiles[0];
