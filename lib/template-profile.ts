import type { CvProfile, CvSection, CvStyle } from "@/lib/cv-profile";
import { parseSkillEntries } from "@/lib/skill-levels";
import {
  getTemplateById,
  resolveTemplateAtsMode,
  resolveTemplateSectionOrder
} from "@/lib/templates";

const SAFE_FONT_FAMILIES = new Set<CvStyle["fontFamily"]>(["sans", "serif", "system-native"]);

export const sanitizeStyleForTemplate = (style: CvStyle, templateId: string): CvStyle => {
  const template = getTemplateById(templateId);
  const atsMode = resolveTemplateAtsMode(templateId);

  const next: CvStyle = {
    ...style,
    sidebarColor: template.capabilities.sidebar ? style.sidebarColor : style.sidebarColor,
    fontFamily: style.fontFamily,
    summaryAlign: style.summaryAlign
  };

  if (atsMode === "safe") {
    if (!SAFE_FONT_FAMILIES.has(next.fontFamily)) {
      next.fontFamily = "sans";
    }
    next.summaryAlign = "left";
  }

  return next;
};

const sortSectionsByPreferredOrder = (sections: CvSection[], orderedTypes: string[]) => {
  const indexMap = new Map(orderedTypes.map((type, index) => [type, index]));

  return [...sections].sort((a, b) => {
    const aIndex = indexMap.has(a.type) ? (indexMap.get(a.type) as number) : Number.MAX_SAFE_INTEGER;
    const bIndex = indexMap.has(b.type) ? (indexMap.get(b.type) as number) : Number.MAX_SAFE_INTEGER;

    if (aIndex !== bIndex) return aIndex - bIndex;
    return 0;
  });
};

export const reorderSectionsForTemplate = (sections: CvSection[], templateId: string): CvSection[] =>
  sortSectionsByPreferredOrder(sections, resolveTemplateSectionOrder(templateId));

const normalizeSkillSection = (section: CvSection): CvSection => {
  if (section.type !== "skills") return section;

  return {
    ...section,
    items: section.items.map((item) => {
      const title = item.title.trim();
      const description = item.description.trim();
      const shouldMoveTitleToDescription =
        !description &&
        !!title &&
        (parseSkillEntries(title).length > 1 || /[|,;]/.test(title));

      if (!shouldMoveTitleToDescription) return item;

      return {
        ...item,
        title: "",
        description: title
      };
    })
  };
};

export const normalizeProfileForTemplate = (profile: CvProfile, templateId: string): CvProfile => ({
  ...profile,
  templateId,
  style: sanitizeStyleForTemplate(profile.style, templateId),
  sections: reorderSectionsForTemplate(profile.sections.map(normalizeSkillSection), templateId)
});
