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
  "skills-right-pink"
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
  "editorial-light",
  "navy-contrast",
  "warm-neutral",
  "impact-red",
  "soft-rose"
] as const;

export const templateAtsModes = ["safe", "balanced", "human-first"] as const;

export const templateShelves = ["Top Rated", "Corporate", "Creative", "ATS-Safe"] as const;

export const templateExperienceLevels = ["Student", "Professional", "Executive"] as const;

export const templateLayouts = ["Single Column", "Split Column"] as const;

export type TemplateVariant = (typeof templateVariants)[number];
export type TemplateFamily = (typeof templateFamilies)[number];
export type TemplateTheme = (typeof templateThemes)[number];
export type TemplateAtsMode = (typeof templateAtsModes)[number];
export type TemplateShelf = (typeof templateShelves)[number];
export type TemplateAtsFit = "Strong" | "Balanced";
export type TemplateLayout = (typeof templateLayouts)[number];
export type TemplateExperienceLevel = (typeof templateExperienceLevels)[number];

export type CvTemplate = {
  id: string;
  variant: TemplateVariant;
  family: TemplateFamily;
  theme: TemplateTheme;
  atsMode: TemplateAtsMode;
  name: string;
  category: string;
  industry: string;
  shelf: TemplateShelf;
  experienceLevel: TemplateExperienceLevel;
  previewImage: string;
  description: string;
  atsFit: TemplateAtsFit;
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
    focus: "Best when ATS safety and date visibility matter most."
  },
  "structured-single-column": {
    label: "Structured Single Column",
    description: "Modern ATS-safe layout with stronger rhythm for tech, product, analytics, and operations roles.",
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
    focus: "Best for networking and human review, not strict ATS portals."
  }
};

export const templateThemeLabels: Record<TemplateTheme, string> = {
  "classic-ink": "Classic Ink",
  "modern-slate": "Modern Slate",
  "professional-blue": "Professional Blue",
  "editorial-light": "Editorial Light",
  "navy-contrast": "Navy Contrast",
  "warm-neutral": "Warm Neutral",
  "impact-red": "Impact Red",
  "soft-rose": "Soft Rose"
};

const buildTemplate = (
  template: Omit<CvTemplate, "recommendedSectionOrder">
): CvTemplate => ({
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
    previewImage: "/card-images/gutter-minimal.jpg",
    atsFit: "Strong",
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
    variant: "blue-rules",
    family: "structured-single-column",
    theme: "professional-blue",
    atsMode: "safe",
    name: "Product Management Delivery",
    category: "Product",
    industry: "Product Management",
    shelf: "Top Rated",
    experienceLevel: "Professional",
    description: "Structured PM layout for roadmap ownership, experiments, launch outcomes, and cross-functional leadership.",
    previewImage: "/card-images/blue-rules.jpg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["Product Manager", "Growth PM", "Platform PM", "Founding PM"],
    guidance: [
      "Use bullets that connect discovery, prioritization, launch, and measurable business impact.",
      "Show the scope you owned: user segment, product surface, revenue, retention, or adoption.",
      "Keep tools secondary to outcomes unless the posting explicitly emphasizes analytics or delivery platforms."
    ],
    guidanceProfileId: "product-management",
    recommendedIndustries: ["Product Management"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "DOCX first, PDF when requested"
  }),
  buildTemplate({
    id: "technical-pm-delivery",
    variant: "banded-grey",
    family: "classic-single-column",
    theme: "classic-ink",
    atsMode: "safe",
    name: "Technical PM Delivery",
    category: "Program",
    industry: "Project & Program Management",
    shelf: "Top Rated",
    experienceLevel: "Executive",
    description: "ATS-safe program layout for stakeholder-heavy delivery roles with budgets, timelines, and implementation scope.",
    previewImage: "/card-images/banded-grey.jpg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["Technical PM", "Program Manager", "Implementation Lead", "Delivery Manager"],
    guidance: [
      "Quantify project value, budget, timeline, team size, or rollout footprint in each major role.",
      "Show delivery methods and tooling only after outcomes: Agile, Jira, RAID, governance, vendor coordination.",
      "Keep certifications visible but compact so the experience section stays dominant."
    ],
    guidanceProfileId: "program-delivery",
    recommendedIndustries: ["Project & Program Management", "Operations"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "DOCX first, PDF when the employer asks for it"
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
    previewImage: "/card-images/banded-grey.jpg",
    atsFit: "Strong",
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
    previewImage: "/card-images/blue-rules.jpg",
    atsFit: "Strong",
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
    variant: "gutter-minimal",
    family: "structured-single-column",
    theme: "modern-slate",
    atsMode: "safe",
    name: "Data Analytics Clarity",
    category: "Data",
    industry: "Data & Analytics",
    shelf: "ATS-Safe",
    experienceLevel: "Student",
    description: "Compact analytics template for SQL, BI, experimentation, dashboards, and decision-ready reporting.",
    previewImage: "/card-images/gutter-minimal.jpg",
    atsFit: "Strong",
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
    recommendedFormat: "DOCX first, PDF okay for direct applications"
  }),
  buildTemplate({
    id: "operations-execution",
    variant: "gutter-minimal",
    family: "structured-single-column",
    theme: "modern-slate",
    atsMode: "safe",
    name: "Operations Execution",
    category: "Operations",
    industry: "Operations",
    shelf: "Corporate",
    experienceLevel: "Professional",
    description: "Single-column operations resume for process design, SLA improvement, service quality, and delivery reliability.",
    previewImage: "/card-images/gutter-minimal.jpg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["Operations Manager", "Process Improvement", "Service Delivery", "Business Operations"],
    guidance: [
      "Frame bullets around throughput, cost, cycle time, quality, SLA, or process compliance improvements.",
      "Highlight cross-functional coordination only when it explains how you achieved the operational result.",
      "Use a short skills section for systems and methods: Excel, SQL, CRM, ERP, Lean, SOP design."
    ],
    guidanceProfileId: "customer-operations",
    recommendedIndustries: ["Operations", "Customer & Operations"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: true
    },
    recommendedFormat: "DOCX or text-based PDF"
  }),
  buildTemplate({
    id: "customer-success-renewal",
    variant: "banded-grey",
    family: "classic-single-column",
    theme: "classic-ink",
    atsMode: "safe",
    name: "Customer Success Renewal",
    category: "Customer",
    industry: "Customer Success",
    shelf: "Corporate",
    experienceLevel: "Professional",
    description: "Retention-focused ATS layout for onboarding, renewals, adoption, escalations, and account growth.",
    previewImage: "/card-images/banded-grey.jpg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["Customer Success", "Account Management", "Implementation", "Onboarding"],
    guidance: [
      "Quantify retention, NRR, renewal rate, adoption milestones, or portfolio size wherever possible.",
      "Use experience bullets to show lifecycle ownership, not just relationship management language.",
      "Keep certifications or product badges secondary unless they are a stated hiring requirement."
    ],
    guidanceProfileId: "customer-operations",
    recommendedIndustries: ["Customer Success", "Customer & Operations"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "DOCX first, PDF when the application supports it"
  }),
  buildTemplate({
    id: "banded-grey",
    variant: "banded-grey",
    family: "classic-single-column",
    theme: "classic-ink",
    atsMode: "safe",
    name: "Banded Grey",
    category: "Classic",
    industry: "General",
    shelf: "Top Rated",
    experienceLevel: "Professional",
    description: "Centered header with soft section bands and a traditional single-column reading order.",
    previewImage: "/card-images/banded-grey.jpg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["General applications", "Career pivots", "Traditional employers"],
    guidance: [
      "Use standard headings and keep the strongest experience near the top of page one.",
      "This is the safest all-purpose layout when you want clean chronology without extra design risk.",
      "Keep summary and skills concise so experience owns most of the page."
    ],
    guidanceProfileId: "general-professional",
    recommendedIndustries: ["General", "Finance & Analysis", "Consulting"],
    capabilities: {
      sidebar: false,
      ratings: false,
      photo: false,
      accentRail: false
    },
    recommendedFormat: "DOCX first, text-based PDF also safe"
  }),
  buildTemplate({
    id: "gutter-minimal",
    variant: "gutter-minimal",
    family: "structured-single-column",
    theme: "modern-slate",
    atsMode: "safe",
    name: "Gutter Minimal",
    category: "Minimal",
    industry: "General",
    shelf: "ATS-Safe",
    experienceLevel: "Student",
    description: "Date gutter layout with clean typography, whitespace, and fast recruiter scanning.",
    previewImage: "/card-images/gutter-minimal.jpg",
    atsFit: "Strong",
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
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["Finance", "Program delivery", "Product", "Analytical roles"],
    guidance: [
      "Use this when you want a slightly stronger visual rhythm but still need ATS-safe structure.",
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
    atsFit: "Balanced",
    layout: "Split Column",
    bestFor: ["Portfolio send-outs", "Creative operations", "Human review first"],
    guidance: [
      "Use for direct sharing or networking when a stronger visual identity helps.",
      "For high-volume ATS portals, keep a single-column application version ready as a fallback.",
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
    recommendedFormat: "PDF for direct share, DOCX fallback for ATS portals"
  }),
  buildTemplate({
    id: "sidebar-navy-right",
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
    atsFit: "Balanced",
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
    variant: "sidebar-icons",
    family: "sidebar-human-first",
    theme: "modern-slate",
    atsMode: "human-first",
    name: "Sidebar Icons",
    category: "Consulting",
    industry: "Consulting",
    shelf: "Creative",
    experienceLevel: "Professional",
    description: "Icon-led split-column layout that feels presentation-ready but is less conservative for ATS portals.",
    previewImage: "/card-images/sidebar-icons.jpg",
    atsFit: "Balanced",
    layout: "Split Column",
    bestFor: ["Consulting networking", "Boutique firms", "Direct outreach"],
    guidance: [
      "Use when polish matters and you expect human review early in the process.",
      "Keep experience and outcomes in the main column. The sidebar should only support the story.",
      "Have a single-column counterpart for ATS-heavy applications."
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
    atsFit: "Balanced",
    layout: "Split Column",
    bestFor: ["General networking", "Human-reviewed PDFs", "Brand-forward applications"],
    guidance: [
      "Skill dots are visually useful for humans but not ideal for ATS-first workflows.",
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
    atsFit: "Balanced",
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
    variant: "boxed-header-dots",
    family: "sidebar-human-first",
    theme: "modern-slate",
    atsMode: "human-first",
    name: "Boxed Header Dots",
    category: "Structured Split",
    industry: "Customer & Operations",
    shelf: "Creative",
    experienceLevel: "Professional",
    description: "Framed header and skill-dot sidebar for direct-share versions where layout matters more than ATS safety.",
    previewImage: "/card-images/boxed-header-dots.jpg",
    atsFit: "Balanced",
    layout: "Split Column",
    bestFor: ["Customer-facing roles", "Operations", "Direct recruiter review"],
    guidance: [
      "Treat this as a human-first version and keep a simpler ATS-safe variant ready.",
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
    atsFit: "Balanced",
    layout: "Split Column",
    bestFor: ["Startups", "General outreach", "Human-reviewed applications"],
    guidance: [
      "Use when you want visual differentiation but still need the main story to scan quickly.",
      "Avoid overloading the skills rail with keywords that belong in experience bullets.",
      "Keep a single-column template ready for ATS portals."
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
