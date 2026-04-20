import {
  resolveTemplateFamily,
  resolveTemplateTheme
} from "@/lib/templates";
import type {
  TemplateFamily,
  TemplateTheme
} from "@/lib/templates";

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
  fontFamily: "sans" | "serif" | "mono" | "system-native" | "product-modern";
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

export const defaultSectionTitle = (type: CvSectionType): string => {
  if (type === "certifications") return "Certificates";
  if (type === "custom") return "";
  return type[0].toUpperCase() + type.slice(1);
};

export const createEmptySection = (type: CvSectionType = "experience"): CvSection => ({
  id: createId(),
  type,
  title: defaultSectionTitle(type),
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

const familyStylePresets: Record<TemplateFamily, Partial<CvStyle>> = {
  "classic-single-column": {
    fontFamily: "serif",
    pageMarginPx: 42,
    lineSpacing: 1.35,
    summaryAlign: "left"
  },
  "structured-single-column": {
    fontFamily: "sans",
    pageMarginPx: 40,
    lineSpacing: 1.35,
    summaryAlign: "left"
  },
  "hybrid-header-two-zone": {
    fontFamily: "sans",
    pageMarginPx: 38,
    lineSpacing: 1.3,
    summaryAlign: "left"
  },
  "sidebar-human-first": {
    fontFamily: "sans",
    pageMarginPx: 36,
    lineSpacing: 1.3,
    summaryAlign: "left"
  }
};

const themeStylePresets: Record<TemplateTheme, Partial<CvStyle>> = {
  "classic-ink": {
    fontFamily: "serif",
    accentColor: "#111827",
    sidebarColor: "#F3F4F6"
  },
  "modern-slate": {
    fontFamily: "sans",
    accentColor: "#111827",
    sidebarColor: "#F3F4F6"
  },
  "professional-blue": {
    fontFamily: "sans",
    accentColor: "#2563EB",
    sidebarColor: "#F3F4F6"
  },
  "editorial-light": {
    fontFamily: "sans",
    accentColor: "#232933",
    sidebarColor: "#EEF2F6"
  },
  "navy-contrast": {
    fontFamily: "sans",
    accentColor: "#111827",
    sidebarColor: "#0B2F4A"
  },
  "warm-neutral": {
    fontFamily: "sans",
    accentColor: "#B08968",
    sidebarColor: "#FAF7F2"
  },
  "impact-red": {
    fontFamily: "serif",
    accentColor: "#DC2626",
    sidebarColor: "#FFFFFF"
  },
  "soft-rose": {
    fontFamily: "sans",
    accentColor: "#F43F5E",
    sidebarColor: "#FFF1F6"
  }
};

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

  const family = resolveTemplateFamily(templateId);
  const theme = resolveTemplateTheme(templateId);

  return {
    ...base,
    ...familyStylePresets[family],
    ...themeStylePresets[theme]
  };
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
