import type { CvSectionType } from "@/lib/cv-profile";

export const guidanceProfileIds = [
  "software-engineering",
  "product-management",
  "program-delivery",
  "consulting",
  "finance-analysis",
  "customer-operations",
  "general-professional"
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
      "Prefer single-column layouts for ATS-heavy applications.",
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
      "Human-first layouts are acceptable for direct networking, but ATS-safe versions should still exist."
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
      "Avoid bars, dots, or visual ratings in ATS-safe finance versions."
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
      "Keep an ATS-safe version available for online applications.",
      "Use human-first layouts for direct-share scenarios only."
    ]
  }
];

const profileMap = new Map(templateGuidanceProfiles.map((profile) => [profile.id, profile]));

export const getTemplateGuidanceProfile = (id: GuidanceProfileId) => profileMap.get(id) ?? templateGuidanceProfiles[0];
