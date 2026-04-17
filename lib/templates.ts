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

export type TemplateVariant = (typeof templateVariants)[number];

export type TemplateAtsFit = "Strong" | "Balanced";

export type TemplateLayout = "Single Column" | "Split Column";

export type CvTemplate = {
  id: string;
  variant: TemplateVariant;
  name: string;
  category: string;
  industry: string;
  previewImage: string;
  description: string;
  atsFit: TemplateAtsFit;
  layout: TemplateLayout;
  bestFor: string[];
  guidance: string[];
  recommendedFormat: string;
};

export const cvTemplates: CvTemplate[] = [
  {
    id: "software-engineering-lean",
    variant: "gutter-minimal",
    name: "Software Engineering Lean",
    category: "Engineering",
    industry: "Software Engineering",
    description: "Single-column engineering resume tuned for shipped systems, stack clarity, and measurable delivery.",
    previewImage: "/template-thumbs/gutter-minimal.svg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["Backend", "Frontend", "Full-stack", "Platform"],
    guidance: [
      "Lead with shipped product scope, reliability wins, and concrete performance metrics.",
      "Keep a dedicated technical skills section with languages, frameworks, cloud, and tooling.",
      "If you are early-career, keep one strong projects section instead of filling space with weak summaries."
    ],
    recommendedFormat: "DOCX first, text-based PDF also safe"
  },
  {
    id: "product-management-delivery",
    variant: "blue-rules",
    name: "Product Management Delivery",
    category: "Product",
    industry: "Product Management",
    description: "Structured PM layout for roadmap ownership, experiments, launch outcomes, and cross-functional leadership.",
    previewImage: "/template-thumbs/blue-rules.svg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["Product Manager", "Growth PM", "Platform PM", "Founding PM"],
    guidance: [
      "Use bullets that connect discovery, prioritization, launch, and measurable business impact.",
      "Show the scope you owned: user segment, product surface, revenue, retention, or adoption.",
      "Keep tools secondary to outcomes unless the posting explicitly emphasizes analytics or delivery platforms."
    ],
    recommendedFormat: "DOCX first, PDF when requested"
  },
  {
    id: "technical-pm-delivery",
    variant: "banded-grey",
    name: "Technical PM Delivery",
    category: "Program",
    industry: "Project & Program Management",
    description: "ATS-safe program layout for stakeholder-heavy delivery roles with budgets, timelines, and implementation scope.",
    previewImage: "/template-thumbs/banded-grey.svg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["Technical PM", "Program Manager", "Implementation Lead", "Delivery Manager"],
    guidance: [
      "Quantify project value, budget, timeline, team size, or rollout footprint in each major role.",
      "Show delivery methods and tooling only after outcomes: Agile, Jira, RAID, governance, vendor coordination.",
      "Keep certifications visible but compact so the experience section stays dominant."
    ],
    recommendedFormat: "DOCX first, PDF when the employer asks for it"
  },
  {
    id: "consulting-case-brief",
    variant: "banded-grey",
    name: "Consulting Case Brief",
    category: "Consulting",
    industry: "Consulting",
    description: "Clean consulting template for structured problem solving, client impact, analysis, and executive-ready bullets.",
    previewImage: "/template-thumbs/banded-grey.svg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["Management Consulting", "Strategy", "Transformation", "Advisory"],
    guidance: [
      "Write bullets as problem, action, result. Avoid generic delivery language that hides the client outcome.",
      "Prioritize quantified impact, presentation cadence, and stakeholder seniority over long task lists.",
      "Use a concise summary only if it adds a clear practice focus or sector specialization."
    ],
    recommendedFormat: "DOCX or text-based PDF"
  },
  {
    id: "finance-analyst-structured",
    variant: "blue-rules",
    name: "Finance Analyst Structured",
    category: "Finance",
    industry: "Finance & Analysis",
    description: "Conservative finance layout built for scan speed, metrics density, and tool visibility without visual clutter.",
    previewImage: "/template-thumbs/blue-rules.svg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["FP&A", "Financial Analyst", "Commercial Finance", "Corporate Strategy"],
    guidance: [
      "Emphasize forecasts, reporting cadence, model ownership, variance analysis, and decision support.",
      "Use hard numbers in bullets: revenue, margin, savings, reporting cycles, forecast accuracy, or deal size.",
      "List Excel, SQL, BI, and ERP tools in a clean skills block instead of embedding them across every bullet."
    ],
    recommendedFormat: "DOCX first, PDF acceptable if text-based"
  },
  {
    id: "data-analytics-clarity",
    variant: "gutter-minimal",
    name: "Data Analytics Clarity",
    category: "Data",
    industry: "Data & Analytics",
    description: "Compact analytics template for SQL, BI, experimentation, dashboards, and decision-ready reporting.",
    previewImage: "/template-thumbs/gutter-minimal.svg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["Data Analyst", "BI Analyst", "Insights", "Analytics Engineer"],
    guidance: [
      "Make every role show a decision or process that improved because of your analysis.",
      "Keep tools and languages explicit: SQL, Python, Excel, Looker, Power BI, Tableau, dbt.",
      "Avoid a long project appendix unless the projects demonstrate experimentation, pipelines, or product impact."
    ],
    recommendedFormat: "DOCX first, PDF okay for direct applications"
  },
  {
    id: "operations-execution",
    variant: "gutter-minimal",
    name: "Operations Execution",
    category: "Operations",
    industry: "Operations",
    description: "Single-column operations resume for process design, SLA improvement, service quality, and delivery reliability.",
    previewImage: "/template-thumbs/gutter-minimal.svg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["Operations Manager", "Process Improvement", "Service Delivery", "Business Operations"],
    guidance: [
      "Frame bullets around throughput, cost, cycle time, quality, SLA, or process compliance improvements.",
      "Highlight cross-functional coordination only when it explains how you achieved the operational result.",
      "Use a short skills section for systems and methods: Excel, SQL, CRM, ERP, Lean, SOP design."
    ],
    recommendedFormat: "DOCX or text-based PDF"
  },
  {
    id: "customer-success-renewal",
    variant: "banded-grey",
    name: "Customer Success Renewal",
    category: "Customer",
    industry: "Customer Success",
    description: "Retention-focused ATS layout for onboarding, renewals, adoption, escalations, and account growth.",
    previewImage: "/template-thumbs/banded-grey.svg",
    atsFit: "Strong",
    layout: "Single Column",
    bestFor: ["Customer Success", "Account Management", "Implementation", "Onboarding"],
    guidance: [
      "Quantify retention, NRR, renewal rate, adoption milestones, or portfolio size wherever possible.",
      "Use experience bullets to show lifecycle ownership, not just relationship management language.",
      "Keep certifications or product badges secondary unless they are a stated hiring requirement."
    ],
    recommendedFormat: "DOCX first, PDF when the application supports it"
  },
  {
    id: "banded-grey",
    variant: "banded-grey",
    name: "Banded Grey",
    category: "Classic",
    industry: "General",
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
    recommendedFormat: "DOCX first, text-based PDF also safe"
  },
  {
    id: "gutter-minimal",
    variant: "gutter-minimal",
    name: "Gutter Minimal",
    category: "Minimal",
    industry: "General",
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
    recommendedFormat: "DOCX or text-based PDF"
  },
  {
    id: "blue-rules",
    variant: "blue-rules",
    name: "Blue Rules",
    category: "Structured",
    industry: "Finance & Analysis",
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
    recommendedFormat: "DOCX first, PDF when requested"
  },
  {
    id: "sidebar-light",
    variant: "sidebar-light",
    name: "Sidebar Light",
    category: "Editorial",
    industry: "Design & Creative Ops",
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
    recommendedFormat: "PDF for direct share, DOCX fallback for ATS portals"
  },
  {
    id: "sidebar-navy-right",
    variant: "sidebar-navy-right",
    name: "Sidebar Navy (Right)",
    category: "Modern",
    industry: "Fintech & Strategy",
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
    recommendedFormat: "PDF for direct review, DOCX fallback for portals"
  },
  {
    id: "sidebar-icons",
    variant: "sidebar-icons",
    name: "Sidebar Icons",
    category: "Consulting",
    industry: "Consulting",
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
    recommendedFormat: "PDF for direct review"
  },
  {
    id: "sidebar-tan-dots",
    variant: "sidebar-tan-dots",
    name: "Sidebar Tan Dots",
    category: "Warm",
    industry: "General",
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
    recommendedFormat: "PDF for direct share"
  },
  {
    id: "skills-right-red",
    variant: "skills-right-red",
    name: "Skills Right (Red)",
    category: "Impact",
    industry: "Consulting",
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
    recommendedFormat: "PDF for direct review, DOCX fallback for portals"
  },
  {
    id: "boxed-header-dots",
    variant: "boxed-header-dots",
    name: "Boxed Header Dots",
    category: "Structured Split",
    industry: "Customer & Operations",
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
    recommendedFormat: "PDF for direct share"
  },
  {
    id: "skills-right-pink",
    variant: "skills-right-pink",
    name: "Skills Right (Pink)",
    category: "Expressive",
    industry: "General",
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
    recommendedFormat: "PDF for direct review"
  }
];

const templateMap = new Map(cvTemplates.map((template) => [template.id, template]));

export const getTemplateById = (templateId: string | null | undefined) =>
  (templateId ? templateMap.get(templateId) : null) ?? cvTemplates[0];

export const resolveTemplateVariant = (templateId: string | null | undefined): TemplateVariant =>
  getTemplateById(templateId).variant;

export const templateIndustryOptions = Array.from(new Set(cvTemplates.map((template) => template.industry))).sort();
