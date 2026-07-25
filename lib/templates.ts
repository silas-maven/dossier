import type { CvSectionType } from "@/lib/cv-profile";
import {
  getTemplateGuidanceProfile,
  type GuidanceProfileId
} from "@/lib/template-guidance";

export const templateVariants = [
  "banded-grey",
  "gutter-minimal",
  "blue-rules",
  "sidebar-light",
  "sidebar-navy-right",
  "sidebar-icons",
  "sidebar-tan-dots",
  "skills-right-red",
  "boxed-header-dots",
  "skills-right-pink",
  "legal-formal",
  "metrics-banner",
  "campaign-cards",
  "people-soft",
  "scanner-compact",
  "process-left",
  "credentials-top",
  "academic-traditional",
  "mission-impact",
  "executive-brief",
  "portfolio-grid",
  "data-ledger"
] as const;

export const templateFamilies = [
  "classic-single-column",
  "structured-single-column",
  "hybrid-header-two-zone",
  "sidebar-human-first"
] as const;

export const templateThemes = [
  "classic-ink",
  "modern-slate",
  "professional-blue",
  "operational-emerald",
  "editorial-light",
  "navy-contrast",
  "warm-neutral",
  "impact-red",
  "soft-rose",
  "legal-charcoal",
  "revenue-green",
  "campaign-coral",
  "people-teal",
  "recruiter-indigo",
  "process-slate",
  "clinical-navy",
  "academic-burgundy",
  "mission-forest"
] as const;

export const templateAtsModes = ["safe", "balanced", "human-first"] as const;

export const templateShelves = ["Top Rated", "Corporate", "Creative", "Parser-Safe"] as const;

export const templateExperienceLevels = ["Student", "Professional", "Executive"] as const;

export const templateLayouts = ["Single Column", "Split Column"] as const;

export type TemplateVariant = (typeof templateVariants)[number];
export type TemplateFamily = (typeof templateFamilies)[number];
export type TemplateTheme = (typeof templateThemes)[number];
export type TemplateAtsMode = (typeof templateAtsModes)[number];
export type TemplateShelf = (typeof templateShelves)[number];
export type TemplateParserRisk = "Low" | "Moderate";
export type TemplateLayout = (typeof templateLayouts)[number];
export type TemplateExperienceLevel = (typeof templateExperienceLevels)[number];

export const templateIndustryGroups = [
  "technology-data",
  "product-delivery",
  "professional-services",
  "growth-revenue",
  "people-customer",
  "credentials-mission",
  "creative-portfolio"
] as const;

export type TemplateIndustryGroup = (typeof templateIndustryGroups)[number];

export const templateIndustryGroupDefinitions: Record<
  TemplateIndustryGroup,
  { label: string; description: string; industries: string[] }
> = {
  "technology-data": {
    label: "Technology & Data",
    description: "Engineering, analytics, platforms, systems, and technical delivery.",
    industries: ["Software Engineering", "Data & Analytics"]
  },
  "product-delivery": {
    label: "Product, Projects & Operations",
    description: "Roadmaps, programmes, implementation, process, and operational outcomes.",
    industries: ["Product Management", "Project & Program Management", "Operations"]
  },
  "professional-services": {
    label: "Finance, Legal & Consulting",
    description: "Conservative formats for analysis, matters, cases, governance, and executive work.",
    industries: ["Consulting", "Finance & Analysis", "Legal", "Executive Leadership", "General"]
  },
  "growth-revenue": {
    label: "Sales & Marketing",
    description: "Performance-led formats for revenue, pipeline, campaigns, channels, and growth.",
    industries: ["Sales", "Marketing"]
  },
  "people-customer": {
    label: "People & Customer",
    description: "Human-centred formats for HR, recruiting, customer success, and relationship outcomes.",
    industries: ["Human Resources", "Talent Acquisition", "Customer Success"]
  },
  "credentials-mission": {
    label: "Health, Education & Mission",
    description: "Credential and impact-led formats for regulated, academic, and mission-driven work.",
    industries: ["Healthcare", "Education", "Nonprofit"]
  },
  "creative-portfolio": {
    label: "Creative & Portfolio",
    description: "Case-study formats for design, brand, content, and creative operations.",
    industries: ["Design & Creative"]
  }
};

export type CvTemplate = {
  id: string;
  variant: TemplateVariant;
  family: TemplateFamily;
  theme: TemplateTheme;
  isPublic?: boolean;
  atsMode: TemplateAtsMode;
  name: string;
  category: string;
  industry: string;
  shelf: TemplateShelf;
  experienceLevel: TemplateExperienceLevel;
  previewImage: string;
  description: string;
  parserRisk: TemplateParserRisk;
  layout: TemplateLayout;
  bestFor: string[];
  guidance: string[];
  guidanceProfileId: GuidanceProfileId;
  recommendedIndustries: string[];
  recommendedSectionOrder: CvSectionType[];
  capabilities: {
    sidebar: boolean;
    ratings: boolean;
    photo: boolean;
    accentRail: boolean;
  };
  recommendedFormat: string;
};

export const templateFamilyDefinitions: Record<
  TemplateFamily,
  {
    label: string;
    description: string;
    focus: string;
  }
> = {
  "classic-single-column": {
    label: "Classic Single Column",
    description: "Conservative chronology-first layout for finance, consulting, and traditional corporate roles.",
    focus: "Best when parser safety and date visibility matter most."
  },
  "structured-single-column": {
    label: "Structured Single Column",
    description: "Modern parser-friendly layout with stronger rhythm for tech, product, analytics, and operations roles.",
    focus: "Best when you want clean scan speed without a second column."
  },
  "hybrid-header-two-zone": {
    label: "Hybrid Two-Zone",
    description: "Main-column-first layout with a secondary rail or supporting zone for direct review workflows.",
    focus: "Best for balanced ATS and recruiter-facing sends."
  },
  "sidebar-human-first": {
    label: "Sidebar Human-First",
    description: "Expressive layouts with side rails, dot systems, and more visual identity for direct-share PDFs.",
    focus: "Best for networking and human review, not strict upload portals."
  }
};

export const templateThemeLabels: Record<TemplateTheme, string> = {
  "classic-ink": "Classic Ink",
  "modern-slate": "Modern Slate",
  "professional-blue": "Professional Blue",
  "operational-emerald": "Operational Emerald",
  "editorial-light": "Editorial Light",
  "navy-contrast": "Navy Contrast",
  "warm-neutral": "Warm Neutral",
  "impact-red": "Impact Red",
  "soft-rose": "Soft Rose",
  "legal-charcoal": "Legal Charcoal",
  "revenue-green": "Revenue Green",
  "campaign-coral": "Campaign Coral",
  "people-teal": "People Teal",
  "recruiter-indigo": "Recruiter Indigo",
  "process-slate": "Process Slate",
  "clinical-navy": "Clinical Navy",
  "academic-burgundy": "Academic Burgundy",
  "mission-forest": "Mission Forest"
};

const buildTemplate = (
  template: Omit<CvTemplate, "recommendedSectionOrder" | "isPublic"> & Partial<Pick<CvTemplate, "isPublic">>
): CvTemplate => ({
  isPublic: true,
  ...template,
  recommendedSectionOrder: getTemplateGuidanceProfile(template.guidanceProfileId).suggestedSectionOrder
});

export const cvTemplates: CvTemplate[] = [
  buildTemplate({
    id: "software-engineering-lean",
    variant: "gutter-minimal",
    family: "structured-single-column",
    theme: "modern-slate",
    atsMode: "safe",
    name: "Software Engineering Lean",
    category: "Engineering",
    industry: "Software Engineering",
    shelf: "Top Rated",
    experienceLevel: "Professional",
    description: "Single-column engineering resume tuned for shipped systems, stack clarity, and measurable delivery.",
    previewImage: "/template-previews/software-engineering-lean.webp",
    parserRisk: "Low",
    layout: "Single Column",
    bestFor: ["Backend", "Frontend", "Full-stack", "Platform"],
    guidance: [
      "Lead with shipped product scope, reliability wins, and concrete performance metrics.",
      "Keep a dedicated technical skills section with languages, frameworks, cloud, and tooling.",
      "If you are early-career, keep one strong projects section instead of filling space with weak summaries."
    ],
    guidanceProfileId: "software-engineering",
    recommendedIndustries: ["Software Engineering", "Data & Analytics"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "DOCX first, text-based PDF also safe"
  }),
  buildTemplate({
    id: "product-management-delivery",
    variant: "skills-right-pink",
    family: "hybrid-header-two-zone",
    theme: "soft-rose",
    atsMode: "balanced",
    name: "Product Management Delivery",
    category: "Product",
    industry: "Product Management",
    shelf: "Top Rated",
    experienceLevel: "Professional",
    description: "Two-zone PM layout for roadmap ownership, product judgment, and cross-functional execution with a modern product-led feel.",
    previewImage: "/template-previews/product-management-delivery.webp",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Product Manager", "Growth PM", "Platform PM", "Founding PM"],
    guidance: [
      "Use bullets that connect discovery, prioritization, launch, and measurable business impact.",
      "Show the scope you owned: user segment, product surface, revenue, retention, or adoption.",
      "Keep tools secondary to outcomes unless the posting explicitly emphasizes analytics or delivery platforms."
    ],
    guidanceProfileId: "product-management",
    recommendedIndustries: ["Product Management"],
    capabilities: {
      sidebar: true,
      ratings: true,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "PDF for direct review, DOCX fallback for upload portals"
  }),
  buildTemplate({
    id: "technical-pm-delivery",
    variant: "sidebar-navy-right",
    family: "hybrid-header-two-zone",
    theme: "navy-contrast",
    atsMode: "balanced",
    name: "Technical PM Delivery",
    category: "Program",
    industry: "Project & Program Management",
    shelf: "Top Rated",
    experienceLevel: "Executive",
    description: "Navy two-zone delivery layout for stakeholder-heavy programs with cadence, governance, and implementation scope.",
    previewImage: "/template-previews/technical-pm-delivery.webp",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Technical PM", "Program Manager", "Implementation Lead", "Delivery Manager"],
    guidance: [
      "Quantify project value, budget, timeline, team size, or rollout footprint in each major role.",
      "Show delivery methods and tooling only after outcomes: Agile, Jira, RAID, governance, vendor coordination.",
      "Keep certifications visible but compact so the experience section stays dominant."
    ],
    guidanceProfileId: "program-delivery",
    recommendedIndustries: ["Project & Program Management", "Operations"],
    capabilities: {
      sidebar: true,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "PDF for direct review, DOCX fallback for portal applications"
  }),
  buildTemplate({
    id: "consulting-case-brief",
    variant: "banded-grey",
    family: "classic-single-column",
    theme: "classic-ink",
    atsMode: "safe",
    name: "Consulting Case Brief",
    category: "Consulting",
    industry: "Consulting",
    shelf: "Corporate",
    experienceLevel: "Executive",
    description: "Clean consulting template for structured problem solving, client impact, analysis, and executive-ready bullets.",
    previewImage: "/template-previews/consulting-case-brief.webp",
    parserRisk: "Low",
    layout: "Single Column",
    bestFor: ["Management Consulting", "Strategy", "Transformation", "Advisory"],
    guidance: [
      "Write bullets as problem, action, result. Avoid generic delivery language that hides the client outcome.",
      "Prioritize quantified impact, presentation cadence, and stakeholder seniority over long task lists.",
      "Use a concise summary only if it adds a clear practice focus or sector specialization."
    ],
    guidanceProfileId: "consulting",
    recommendedIndustries: ["Consulting"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "DOCX or text-based PDF"
  }),
  buildTemplate({
    id: "finance-analyst-structured",
    variant: "blue-rules",
    family: "structured-single-column",
    theme: "professional-blue",
    atsMode: "safe",
    name: "Finance Analyst Structured",
    category: "Finance",
    industry: "Finance & Analysis",
    shelf: "Corporate",
    experienceLevel: "Executive",
    description: "Conservative finance layout built for scan speed, metrics density, and tool visibility without visual clutter.",
    previewImage: "/template-previews/finance-analyst-structured.webp",
    parserRisk: "Low",
    layout: "Single Column",
    bestFor: ["FP&A", "Financial Analyst", "Commercial Finance", "Corporate Strategy"],
    guidance: [
      "Emphasize forecasts, reporting cadence, model ownership, variance analysis, and decision support.",
      "Use hard numbers in bullets: revenue, margin, savings, reporting cycles, forecast accuracy, or deal size.",
      "List Excel, SQL, BI, and ERP tools in a clean skills block instead of embedding them across every bullet."
    ],
    guidanceProfileId: "finance-analysis",
    recommendedIndustries: ["Finance & Analysis"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "DOCX first, PDF acceptable if text-based"
  }),
  buildTemplate({
    id: "data-analytics-clarity",
    variant: "data-ledger",
    family: "structured-single-column",
    theme: "modern-slate",
    atsMode: "safe",
    name: "Data Analytics Clarity",
    category: "Data",
    industry: "Data & Analytics",
    shelf: "Parser-Safe",
    experienceLevel: "Student",
    description: "Technical evidence ledger for SQL, BI, experimentation, data products, and decision-ready reporting.",
    previewImage: "/template-previews/data-analytics-clarity.webp",
    parserRisk: "Low",
    layout: "Single Column",
    bestFor: ["Data Analyst", "BI Analyst", "Insights", "Analytics Engineer"],
    guidance: [
      "Make every role show a decision or process that improved because of your analysis.",
      "Keep tools and languages explicit: SQL, Python, Excel, Looker, Power BI, Tableau, dbt.",
      "Avoid a long project appendix unless the projects demonstrate experimentation, pipelines, or product impact."
    ],
    guidanceProfileId: "software-engineering",
    recommendedIndustries: ["Data & Analytics", "Software Engineering"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "DOCX first, text-based PDF also safe"
  }),
  buildTemplate({
    id: "operations-execution",
    variant: "sidebar-tan-dots",
    family: "sidebar-human-first",
    theme: "warm-neutral",
    atsMode: "balanced",
    name: "Operations Execution",
    category: "Operations",
    industry: "Operations",
    shelf: "Corporate",
    experienceLevel: "Professional",
    description: "Warm split-column operations layout for process design, SLA improvement, service quality, and delivery reliability.",
    previewImage: "/template-previews/operations-execution.webp",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Operations Manager", "Process Improvement", "Service Delivery", "Business Operations"],
    guidance: [
      "Frame bullets around throughput, cost, cycle time, quality, SLA, or process compliance improvements.",
      "Highlight cross-functional coordination only when it explains how you achieved the operational result.",
      "Use a short skills section for systems and methods: Excel, SQL, CRM, ERP, Lean, SOP design."
    ],
    guidanceProfileId: "customer-operations",
    recommendedIndustries: ["Operations", "Customer & Operations"],
    capabilities: {
      sidebar: true,
      ratings: true,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "PDF for direct review, DOCX fallback for upload portals"
  }),
  buildTemplate({
    id: "customer-success-renewal",
    variant: "sidebar-light",
    family: "sidebar-human-first",
    theme: "operational-emerald",
    atsMode: "balanced",
    name: "Customer Success Renewal",
    category: "Customer",
    industry: "Customer Success",
    shelf: "Corporate",
    experienceLevel: "Professional",
    description: "Two-column customer success layout with an operational sidebar for adoption, renewals, tooling, and portfolio context.",
    previewImage: "/template-previews/customer-success-renewal.webp",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Customer Success", "Account Management", "Implementation", "Onboarding"],
    guidance: [
      "Quantify retention, NRR, renewal rate, adoption milestones, or portfolio size wherever possible.",
      "Use experience bullets to show lifecycle ownership, not just relationship management language.",
      "Keep certifications or product badges secondary unless they are a stated hiring requirement."
    ],
    guidanceProfileId: "customer-operations",
    recommendedIndustries: ["Customer Success", "Customer & Operations"],
    capabilities: {
      sidebar: true,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "PDF for direct review, DOCX fallback for upload portals"
  }),
  buildTemplate({
    id: "legal-counsel-brief",
    isPublic: true,
    variant: "legal-formal",
    family: "classic-single-column",
    theme: "legal-charcoal",
    atsMode: "safe",
    name: "Legal Counsel Brief",
    category: "Legal",
    industry: "Legal",
    shelf: "Corporate",
    experienceLevel: "Executive",
    description: "Formal single-column legal CV for bar admissions, practice areas, representative matters, and conservative screening.",
    previewImage: "/template-previews/legal-counsel-brief.webp",
    parserRisk: "Low",
    layout: "Single Column",
    bestFor: ["Legal Counsel", "Attorney", "Compliance", "Corporate Law"],
    guidance: [
      "Surface bar admissions, jurisdiction, practice area, and target title before broader narrative.",
      "Use formal matter-led bullets with drafting, negotiation, advisory, governance, and risk outcomes.",
      "Keep the layout conservative: no sidebars, icons, ratings, or decorative skill systems."
    ],
    guidanceProfileId: "legal-counsel",
    recommendedIndustries: ["Legal", "Corporate Law", "Compliance"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "DOCX first, text-based PDF also safe"
  }),
  buildTemplate({
    id: "sales-revenue-driver",
    isPublic: true,
    variant: "metrics-banner",
    family: "structured-single-column",
    theme: "revenue-green",
    atsMode: "safe",
    name: "Sales Revenue Driver",
    category: "Sales",
    industry: "Sales",
    shelf: "Top Rated",
    experienceLevel: "Professional",
    description: "Results-first sales CV built around quota attainment, revenue, pipeline, deal size, and account growth proof.",
    previewImage: "/template-previews/sales-revenue-driver.webp",
    parserRisk: "Low",
    layout: "Single Column",
    bestFor: ["Account Executive", "Sales Manager", "Business Development", "Revenue"],
    guidance: [
      "Lead with 3-4 metric highlights: quota, revenue, pipeline, ACV, win rate, or expansion.",
      "Make each role prove measurable performance instead of listing generic sales responsibilities.",
      "Keep CRM, methodology, prospecting, negotiation, and account planning keywords explicit."
    ],
    guidanceProfileId: "sales-revenue",
    recommendedIndustries: ["Sales", "Revenue", "Business Development"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "DOCX first, text-based PDF also safe"
  }),
  buildTemplate({
    id: "marketing-campaign-performance",
    isPublic: true,
    variant: "campaign-cards",
    family: "hybrid-header-two-zone",
    theme: "campaign-coral",
    atsMode: "balanced",
    name: "Marketing Campaign Performance",
    category: "Marketing",
    industry: "Marketing",
    shelf: "Top Rated",
    experienceLevel: "Professional",
    description: "Polished marketing CV for campaign wins, channel ownership, performance metrics, tools, and growth proof.",
    previewImage: "/template-previews/marketing-campaign-performance.webp",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Growth Marketing", "Campaign Manager", "Lifecycle", "Content & Demand Gen"],
    guidance: [
      "Put campaign wins early: pipeline, CAC, ROAS, conversion, engagement, launches, or audience growth.",
      "Use the main experience column for outcomes and the supporting zone for channels, tools, and proof points.",
      "Keep the visual hierarchy modern but restrained so reading order stays obvious."
    ],
    guidanceProfileId: "marketing-performance",
    recommendedIndustries: ["Marketing", "Growth", "Campaigns"],
    capabilities: {
      sidebar: true,
      ratings: true,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "PDF for direct review, DOCX fallback for upload portals"
  }),
  buildTemplate({
    id: "human-resources-people-partner",
    isPublic: true,
    variant: "people-soft",
    family: "classic-single-column",
    theme: "people-teal",
    atsMode: "balanced",
    name: "Human Resources People Partner",
    category: "HR",
    industry: "Human Resources",
    shelf: "Corporate",
    experienceLevel: "Professional",
    description: "Calm, readable HR CV for people partnering, employee relations, policy, HRIS, compliance, and people-program outcomes.",
    previewImage: "/template-previews/human-resources-people-partner.webp",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["HR Business Partner", "People Operations", "Employee Relations", "HR Manager"],
    guidance: [
      "Lead with HR domain, employee population, compliance context, and people-program scope.",
      "Show headcount, retention, cycle time, employee relations, policy, HRIS, or engagement outcomes.",
      "Keep certifications and HRIS visible without letting the sidebar carry critical evidence."
    ],
    guidanceProfileId: "human-resources",
    recommendedIndustries: ["Human Resources", "People Operations", "Employee Relations"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "PDF for direct review, DOCX fallback for upload portals"
  }),
  buildTemplate({
    id: "talent-acquisition-recruiter",
    isPublic: true,
    variant: "scanner-compact",
    family: "structured-single-column",
    theme: "recruiter-indigo",
    atsMode: "balanced",
    name: "Talent Acquisition Recruiter",
    category: "Recruiting",
    industry: "Talent Acquisition",
    shelf: "Parser-Safe",
    experienceLevel: "Professional",
    description: "Fast-scan recruiting CV for sourcing strategy, requisition volume, funnel metrics, tools, and hiring outcomes.",
    previewImage: "/template-previews/talent-acquisition-recruiter.webp",
    parserRisk: "Moderate",
    layout: "Single Column",
    bestFor: ["Recruiter", "Talent Acquisition", "Sourcing", "People Operations"],
    guidance: [
      "Lead with hiring scope: role families, region, requisition load, sourcing channels, and recruiting model.",
      "Show time-to-fill, offer acceptance, pipeline conversion, diversity sourcing, or stakeholder satisfaction.",
      "Keep ATS, CRM, sourcing tools, interviewing, and analytics keywords easy to parse."
    ],
    guidanceProfileId: "talent-acquisition",
    recommendedIndustries: ["Talent Acquisition", "Recruiting", "People Operations"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "DOCX first, text-based PDF also safe"
  }),
  buildTemplate({
    id: "operations-process-lead",
    isPublic: true,
    variant: "process-left",
    family: "hybrid-header-two-zone",
    theme: "process-slate",
    atsMode: "balanced",
    name: "Operations Process Lead",
    category: "Operations",
    industry: "Operations",
    shelf: "Corporate",
    experienceLevel: "Professional",
    description: "Ordered operations CV for process wins, SLA improvement, tools, service quality, and operational reliability.",
    previewImage: "/template-previews/operations-process-lead.webp",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Operations Manager", "Process Improvement", "Service Delivery", "Business Operations"],
    guidance: [
      "Surface process wins early: throughput, cost, cycle time, quality, SLA, or compliance improvement.",
      "Use modular proof points, but keep chronology and measurable experience dominant.",
      "Group systems and methods clearly: Excel, SQL, CRM, ERP, Lean, SOP design, workflow tooling."
    ],
    guidanceProfileId: "operations-process",
    recommendedIndustries: ["Operations", "Business Operations", "Service Delivery"],
    capabilities: {
      sidebar: true,
      ratings: true,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "PDF for direct review, DOCX fallback for upload portals"
  }),
  buildTemplate({
    id: "healthcare-care-delivery",
    isPublic: true,
    variant: "credentials-top",
    family: "classic-single-column",
    theme: "clinical-navy",
    atsMode: "safe",
    name: "Healthcare Care Delivery",
    category: "Healthcare",
    industry: "Healthcare",
    shelf: "Parser-Safe",
    experienceLevel: "Professional",
    description: "Credential-forward healthcare CV for care delivery, compliance, licenses, certifications, patient safety, and clinical operations.",
    previewImage: "/template-previews/healthcare-care-delivery.webp",
    parserRisk: "Low",
    layout: "Single Column",
    bestFor: ["Nursing", "Care Coordination", "Clinical Operations", "Healthcare Administration"],
    guidance: [
      "Put credentials, licenses, care setting, patient population, and compliance signals near the top.",
      "Show quality, safety, documentation, throughput, audit, patient-experience, or caseload outcomes.",
      "Keep the layout formal and single-column so licenses and certifications parse cleanly."
    ],
    guidanceProfileId: "healthcare-delivery",
    recommendedIndustries: ["Healthcare", "Clinical Operations", "Care Delivery"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "DOCX first, text-based PDF also safe"
  }),
  buildTemplate({
    id: "education-academic-practice",
    isPublic: true,
    variant: "academic-traditional",
    family: "classic-single-column",
    theme: "academic-burgundy",
    atsMode: "balanced",
    name: "Education Academic Practice",
    category: "Education",
    industry: "Education",
    shelf: "Parser-Safe",
    experienceLevel: "Professional",
    description: "Clean education CV for teaching, research, service, curriculum work, credentials, and academic contribution.",
    previewImage: "/template-previews/education-academic-practice.webp",
    parserRisk: "Moderate",
    layout: "Single Column",
    bestFor: ["Teaching", "Academic Practice", "Research", "Student Support"],
    guidance: [
      "Lead with teaching area, learner population, research or service focus, and institution type.",
      "Show teaching outcomes, curriculum design, assessment, research, service, or program contribution.",
      "Use custom sections for publications, service, or selected academic work when relevant."
    ],
    guidanceProfileId: "education-academic",
    recommendedIndustries: ["Education", "Academic Practice", "Teaching"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "DOCX first, text-based PDF also safe"
  }),
  buildTemplate({
    id: "nonprofit-mission-delivery",
    isPublic: true,
    variant: "mission-impact",
    family: "sidebar-human-first",
    theme: "mission-forest",
    atsMode: "balanced",
    name: "Nonprofit Mission Delivery",
    category: "Nonprofit",
    industry: "Nonprofit",
    shelf: "Creative",
    experienceLevel: "Professional",
    description: "Warm but restrained nonprofit CV for mission delivery, program wins, fundraising, partnerships, and service outcomes.",
    previewImage: "/template-previews/nonprofit-mission-delivery.webp",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Programme Delivery", "Fundraising", "Partnerships", "Mission Operations"],
    guidance: [
      "Lead with mission area, program scope, beneficiary group, funding environment, or partnership model.",
      "Show program outcomes, grants, fundraising, partnerships, stakeholder engagement, or service delivery.",
      "Balance warmth with operational proof and clear accountability."
    ],
    guidanceProfileId: "nonprofit-mission",
    recommendedIndustries: ["Nonprofit", "Fundraising", "Programme Delivery"],
    capabilities: {
      sidebar: true,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "PDF for direct review, DOCX fallback for upload portals"
  }),
  buildTemplate({
    id: "creative-portfolio-grid",
    isPublic: true,
    variant: "portfolio-grid",
    family: "sidebar-human-first",
    theme: "campaign-coral",
    atsMode: "human-first",
    name: "Creative Portfolio Grid",
    category: "Creative",
    industry: "Design & Creative",
    shelf: "Creative",
    experienceLevel: "Professional",
    description: "Editorial portfolio CV for selected work, creative direction, outcomes, and a compact capability index.",
    previewImage: "/template-previews/creative-portfolio-grid.webp",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Product Design", "Brand Design", "Creative Direction", "Content Design"],
    guidance: [
      "Lead with two or three selected outcomes instead of a decorative software list.",
      "Use project entries as compact case studies: brief, contribution, and result.",
      "Keep a separate single-column export for strict application portals."
    ],
    guidanceProfileId: "marketing-performance",
    recommendedIndustries: ["Design & Creative", "Marketing"],
    capabilities: {
      sidebar: true,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "PDF for portfolios and direct review, ATS-safe template for portals"
  }),
  buildTemplate({
    id: "banded-grey",
    isPublic: true,
    variant: "executive-brief",
    family: "classic-single-column",
    theme: "classic-ink",
    atsMode: "balanced",
    name: "Executive Leadership Brief",
    category: "Leadership",
    industry: "Executive Leadership",
    shelf: "Corporate",
    experienceLevel: "Executive",
    description: "Board-ready leadership brief with an executive mandate, selected impact, and restrained chronology.",
    previewImage: "/template-previews/banded-grey.webp",
    parserRisk: "Low",
    layout: "Single Column",
    bestFor: ["Executive Leadership", "Transformation", "Director", "Chief of Staff"],
    guidance: [
      "Open with leadership scope, operating context, and the change you were accountable for.",
      "Use a short selected-impact strip before the full chronology.",
      "Keep governance, budget, team size, and commercial outcomes explicit."
    ],
    guidanceProfileId: "general-professional",
    recommendedIndustries: ["Executive Leadership", "Consulting", "Operations"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "Text-based PDF for direct review, DOCX fallback for portals"
  }),
  buildTemplate({
    id: "gutter-minimal",
    isPublic: false,
    variant: "gutter-minimal",
    family: "structured-single-column",
    theme: "modern-slate",
    atsMode: "safe",
    name: "Gutter Minimal",
    category: "Minimal",
    industry: "General",
    shelf: "Parser-Safe",
    experienceLevel: "Student",
    description: "Date gutter layout with clean typography, whitespace, and fast recruiter scanning.",
    previewImage: "/card-images/gutter-minimal.jpg",
    parserRisk: "Low",
    layout: "Single Column",
    bestFor: ["Operations", "Engineering", "Analytics", "Modern but safe applications"],
    guidance: [
      "Use crisp bullets with metrics and avoid overlong summaries that slow the read.",
      "The date gutter helps chronology without introducing a risky second column.",
      "Keep section titles standard so ATS parsing remains predictable."
    ],
    guidanceProfileId: "general-professional",
    recommendedIndustries: ["General", "Software Engineering", "Operations"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "DOCX or text-based PDF"
  }),
  buildTemplate({
    id: "blue-rules",
    isPublic: false,
    variant: "blue-rules",
    family: "structured-single-column",
    theme: "professional-blue",
    atsMode: "safe",
    name: "Blue Rules",
    category: "Structured",
    industry: "Finance & Analysis",
    shelf: "Corporate",
    experienceLevel: "Professional",
    description: "Rule-based single-column layout that feels structured without using tables or text boxes.",
    previewImage: "/card-images/blue-rules.jpg",
    parserRisk: "Low",
    layout: "Single Column",
    bestFor: ["Finance", "Program delivery", "Product", "Analytical roles"],
    guidance: [
      "Use this when you want a slightly stronger visual rhythm but still need parser-friendly structure.",
      "Keep contact info and section titles in the main body, not decorative regions.",
      "Prioritize quantified bullets and a compact skills section."
    ],
    guidanceProfileId: "general-professional",
    recommendedIndustries: ["Finance & Analysis", "Product Management", "Project & Program Management"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "DOCX first, PDF when requested"
  }),
  buildTemplate({
    id: "sidebar-light",
    isPublic: false,
    variant: "sidebar-light",
    family: "sidebar-human-first",
    theme: "editorial-light",
    atsMode: "human-first",
    name: "Sidebar Light",
    category: "Editorial",
    industry: "Design & Creative Ops",
    shelf: "Creative",
    experienceLevel: "Student",
    description: "Editorial split-column layout with a stronger visual feel for networking or direct-share versions.",
    previewImage: "/card-images/sidebar-light.jpg",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Portfolio send-outs", "Creative operations", "Human review first"],
    guidance: [
      "Use for direct sharing or networking when a stronger visual identity helps.",
      "For high-volume upload portals, keep a single-column application version ready as a fallback.",
      "Do not hide critical experience details in the sidebar."
    ],
    guidanceProfileId: "general-professional",
    recommendedIndustries: ["Design & Creative Ops", "General"],
    capabilities: {
      sidebar: true,
      ratings: true,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "PDF for direct share, DOCX fallback for upload portals"
  }),
  buildTemplate({
    id: "sidebar-navy-right",
    isPublic: false,
    variant: "sidebar-navy-right",
    family: "hybrid-header-two-zone",
    theme: "navy-contrast",
    atsMode: "balanced",
    name: "Sidebar Navy (Right)",
    category: "Modern",
    industry: "Fintech & Strategy",
    shelf: "Corporate",
    experienceLevel: "Executive",
    description: "High-contrast split-column layout with a more branded look for modern teams and direct review.",
    previewImage: "/card-images/sidebar-navy-right.jpg",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Fintech", "Startups", "Direct recruiter outreach"],
    guidance: [
      "Best used when the reviewer is likely to open the PDF directly rather than rely on ATS extraction.",
      "Keep the main experience column dense and the right rail strictly supplemental.",
      "If in doubt, submit a single-column version to portals and keep this for human-forward channels."
    ],
    guidanceProfileId: "general-professional",
    recommendedIndustries: ["Fintech & Strategy", "Product Management", "Consulting"],
    capabilities: {
      sidebar: true,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "PDF for direct review, DOCX fallback for portals"
  }),
  buildTemplate({
    id: "sidebar-icons",
    isPublic: false,
    variant: "sidebar-icons",
    family: "sidebar-human-first",
    theme: "modern-slate",
    atsMode: "human-first",
    name: "Sidebar Icons",
    category: "Consulting",
    industry: "Consulting",
    shelf: "Creative",
    experienceLevel: "Professional",
    description: "Icon-led split-column layout that feels presentation-ready but is less conservative for upload portals.",
    previewImage: "/card-images/sidebar-icons.jpg",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Consulting networking", "Boutique firms", "Direct outreach"],
    guidance: [
      "Use when polish matters and you expect human review early in the process.",
      "Keep experience and outcomes in the main column. The sidebar should only support the story.",
      "Have a single-column counterpart for strict upload portals."
    ],
    guidanceProfileId: "consulting",
    recommendedIndustries: ["Consulting"],
    capabilities: {
      sidebar: true,
      ratings: true,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "PDF for direct review"
  }),
  buildTemplate({
    id: "sidebar-tan-dots",
    isPublic: false,
    variant: "sidebar-tan-dots",
    family: "sidebar-human-first",
    theme: "warm-neutral",
    atsMode: "human-first",
    name: "Sidebar Tan Dots",
    category: "Warm",
    industry: "General",
    shelf: "Creative",
    experienceLevel: "Professional",
    description: "Warm split-column layout with dot-rated skills for a more expressive direct-share version.",
    previewImage: "/card-images/sidebar-tan-dots.jpg",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["General networking", "Human-reviewed PDFs", "Brand-forward applications"],
    guidance: [
      "Skill dots are visually useful for humans but not ideal for parser-first workflows.",
      "Keep a simpler application version ready if the employer uses a strict portal.",
      "Use this when the aesthetic helps your positioning without replacing substance."
    ],
    guidanceProfileId: "general-professional",
    recommendedIndustries: ["General", "Customer & Operations"],
    capabilities: {
      sidebar: true,
      ratings: true,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "PDF for direct share"
  }),
  buildTemplate({
    id: "skills-right-red",
    isPublic: false,
    variant: "skills-right-red",
    family: "hybrid-header-two-zone",
    theme: "impact-red",
    atsMode: "balanced",
    name: "Skills Right (Red)",
    category: "Impact",
    industry: "Consulting",
    shelf: "Creative",
    experienceLevel: "Executive",
    description: "Split-column consulting layout with a bold accent and a dedicated skills rail.",
    previewImage: "/card-images/skills-right-red.jpg",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Consulting", "Strategy", "Presentation-heavy roles"],
    guidance: [
      "Use for polished PDF sends when you want a sharper contrast and stronger brand tone.",
      "Keep the skills rail short enough that the experience column remains dominant.",
      "If the application is ATS-heavy, move to a single-column template."
    ],
    guidanceProfileId: "consulting",
    recommendedIndustries: ["Consulting", "Fintech & Strategy"],
    capabilities: {
      sidebar: true,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "PDF for direct review, DOCX fallback for portals"
  }),
  buildTemplate({
    id: "boxed-header-dots",
    isPublic: false,
    variant: "boxed-header-dots",
    family: "sidebar-human-first",
    theme: "modern-slate",
    atsMode: "human-first",
    name: "Boxed Header Dots",
    category: "Structured Split",
    industry: "Customer & Operations",
    shelf: "Creative",
    experienceLevel: "Professional",
    description: "Framed header and skill-dot sidebar for direct-share versions where layout matters more than parser safety.",
    previewImage: "/card-images/boxed-header-dots.jpg",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Customer-facing roles", "Operations", "Direct recruiter review"],
    guidance: [
      "Treat this as a human-first version and keep a simpler parser-friendly variant ready.",
      "Do not rely on the sidebar to carry critical keywords or credentials.",
      "Use the main column for chronology and measurable wins."
    ],
    guidanceProfileId: "customer-operations",
    recommendedIndustries: ["Customer & Operations", "Customer Success", "Operations"],
    capabilities: {
      sidebar: true,
      ratings: true,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "PDF for direct share"
  }),
  buildTemplate({
    id: "skills-right-pink",
    isPublic: false,
    variant: "skills-right-pink",
    family: "hybrid-header-two-zone",
    theme: "soft-rose",
    atsMode: "balanced",
    name: "Skills Right (Pink)",
    category: "Expressive",
    industry: "General",
    shelf: "Creative",
    experienceLevel: "Professional",
    description: "Split-column layout with a softer accent and a right-side skills rail for expressive direct sends.",
    previewImage: "/card-images/skills-right-pink.jpg",
    parserRisk: "Moderate",
    layout: "Split Column",
    bestFor: ["Startups", "General outreach", "Human-reviewed applications"],
    guidance: [
      "Use when you want visual differentiation but still need the main story to scan quickly.",
      "Avoid overloading the skills rail with keywords that belong in experience bullets.",
      "Keep a single-column template ready for upload portals."
    ],
    guidanceProfileId: "general-professional",
    recommendedIndustries: ["General", "Design & Creative Ops"],
    capabilities: {
      sidebar: true,
      ratings: true,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "PDF for direct review"
  })
];

const templateMap = new Map(cvTemplates.map((template) => [template.id, template]));

const uniqueSorted = <T extends string>(values: T[]) => Array.from(new Set(values)).sort();

export const getTemplateById = (templateId: string | null | undefined) =>
  (templateId ? templateMap.get(templateId) : null) ?? cvTemplates[0];

export const resolveTemplateVariant = (templateId: string | null | undefined): TemplateVariant =>
  getTemplateById(templateId).variant;

export const resolveTemplateFamily = (templateId: string | null | undefined): TemplateFamily =>
  getTemplateById(templateId).family;

export const resolveTemplateTheme = (templateId: string | null | undefined): TemplateTheme =>
  getTemplateById(templateId).theme;

export const resolveTemplateAtsMode = (templateId: string | null | undefined): TemplateAtsMode =>
  getTemplateById(templateId).atsMode;

export const resolveTemplateGuidanceProfileId = (templateId: string | null | undefined): GuidanceProfileId =>
  getTemplateById(templateId).guidanceProfileId;

export const resolveTemplateSectionOrder = (templateId: string | null | undefined): CvSectionType[] =>
  getTemplateById(templateId).recommendedSectionOrder;

export const templateIndustryOptions = uniqueSorted(cvTemplates.map((template) => template.industry));
export const templateShelfOptions = Array.from(templateShelves);
export const templateLayoutOptions = Array.from(templateLayouts);
export const templateExperienceLevelOptions = Array.from(templateExperienceLevels);
export const templateFamilyOptions = Array.from(templateFamilies);
export const publicCvTemplates = cvTemplates.filter((template) => template.isPublic !== false);

export const getTemplateIndustryGroup = (template: CvTemplate): TemplateIndustryGroup =>
  templateIndustryGroups.find((group) =>
    templateIndustryGroupDefinitions[group].industries.includes(template.industry)
  ) ?? "professional-services";
