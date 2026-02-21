export const cvSectionTypes = [
  "experience",
  "education",
  "skills",
  "certifications",
  "projects",
  "custom"
] as const;

export type CvSectionType = (typeof cvSectionTypes)[number];

export type CvBasics = {
  name: string;
  headline: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: string;
};

export type CvItem = {
  id: string;
  title: string;
  subtitle: string;
  dateRange: string;
  description: string;
  tags: string[];
  visible: boolean;
};

export type CvSectionStyle = {
  titleFontSize: number;
  bodyFontSize: number;
  headingBold: boolean;
  headingItalic: boolean;
  bulletBold: boolean;
  bulletItalic: boolean;
  skillsColumns: 1 | 2 | 3 | 4;
  textAlign: "left" | "center" | "right" | "justify";
  enableBullets: boolean;
  bulletStyle: "disc" | "square" | "dash";
  uppercaseTitle: boolean;
  showDivider: boolean;
};

export type CvSection = {
  id: string;
  type: CvSectionType;
  title: string;
  style: CvSectionStyle;
  items: CvItem[];
};

export type CvStyle = {
  // Template-specific styling controls (kept intentionally small to stay stable).
  fontFamily: "sans" | "serif" | "mono";
  baseFontSize: number; // PDF base font size (9-12)
  summaryAlign: "left" | "center" | "right";
  lineSpacing: number;
  pageMarginPx: number;
  dateFormat: "mon_year" | "slash_month_year" | "year";
  accentColor: string; // hex
  sidebarColor: string; // hex
};

export type CvProfile = {
  id: string;
  name: string;
  templateId: string;
  style: CvStyle;
  basics: CvBasics;
  sections: CvSection[];
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createEmptyItem = (): CvItem => ({
  id: createId(),
  title: "",
  subtitle: "",
  dateRange: "",
  description: "",
  tags: [],
  visible: true
});

export const createEmptySection = (type: CvSectionType = "experience"): CvSection => ({
  id: createId(),
  type,
  title: type === "certifications" ? "Certificates" : type[0].toUpperCase() + type.slice(1),
  style: {
    titleFontSize: 10,
    bodyFontSize: 9,
    headingBold: true,
    headingItalic: false,
    bulletBold: false,
    bulletItalic: false,
    skillsColumns: 4,
    textAlign: "left",
    enableBullets: true,
    bulletStyle: "disc",
    uppercaseTitle: true,
    showDivider: true
  },
  items: [createEmptyItem()]
});

const defaultStyleForTemplate = (templateId: string): CvStyle => {
  const base: CvStyle = {
    fontFamily: "sans",
    baseFontSize: 10,
    summaryAlign: "left",
    lineSpacing: 1.35,
    pageMarginPx: 42,
    dateFormat: "mon_year",
    accentColor: "#2563EB",
    sidebarColor: "#0B2F4A"
  };

  if (templateId === "banded-grey") return { ...base, fontFamily: "serif", accentColor: "#111827", sidebarColor: "#F3F4F6" };
  if (templateId === "gutter-minimal") return { ...base, fontFamily: "sans", accentColor: "#111827", sidebarColor: "#F3F4F6" };
  if (templateId === "blue-rules") return { ...base, fontFamily: "sans", accentColor: "#2563EB", sidebarColor: "#F3F4F6" };
  if (templateId === "sidebar-light") return { ...base, fontFamily: "sans", accentColor: "#232933", sidebarColor: "#EEF2F6" };
  if (templateId === "sidebar-navy-right") return { ...base, fontFamily: "sans", accentColor: "#111827", sidebarColor: "#0B2F4A" };
  if (templateId === "sidebar-icons") return { ...base, fontFamily: "sans", accentColor: "#1F2937", sidebarColor: "#F8FAFC" };
  if (templateId === "sidebar-tan-dots") return { ...base, fontFamily: "sans", accentColor: "#B08968", sidebarColor: "#FAF7F2" };
  if (templateId === "skills-right-red") return { ...base, fontFamily: "serif", accentColor: "#DC2626", sidebarColor: "#FFFFFF" };
  if (templateId === "boxed-header-dots") return { ...base, fontFamily: "sans", accentColor: "#111827", sidebarColor: "#F3F4F6" };
  if (templateId === "skills-right-pink") return { ...base, fontFamily: "sans", accentColor: "#F43F5E", sidebarColor: "#FFF1F6" };
  return base;
};

export const createEmptyProfile = (templateId: string): CvProfile => ({
  id: createId(),
  name: "My CV Profile",
  templateId,
  style: defaultStyleForTemplate(templateId),
  basics: {
    name: "",
    headline: "",
    email: "",
    phone: "",
    url: "",
    summary: "",
    location: ""
  },
  sections: [createEmptySection("experience"), createEmptySection("education")]
});
