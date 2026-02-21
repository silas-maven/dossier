import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { CvProfile, CvSection } from "@/lib/cv-profile";
import { contactInline, contactLines } from "@/lib/contact";
import { formatDateRange } from "@/lib/date-format";
import { parseDescriptionBlocks, type InlineRun } from "@/lib/description-format";
import { ensurePdfFonts } from "@/lib/pdf-fonts";
import { parseSkillEntries } from "@/lib/skill-levels";

type CvPdfDocumentProps = {
  profile: CvProfile;
};

const isSummarySection = (section: CvSection) =>
  section.type === "custom" && section.title.trim().toLowerCase() === "summary";

type TemplateVariant =
  | "banded-grey"
  | "gutter-minimal"
  | "blue-rules"
  | "sidebar-light"
  | "sidebar-navy-right"
  | "sidebar-icons"
  | "sidebar-tan-dots"
  | "skills-right-red"
  | "boxed-header-dots"
  | "skills-right-pink";

const templateVariant = (templateId: string): TemplateVariant => {
  const known: TemplateVariant[] = [
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
  ];
  if (known.includes(templateId as TemplateVariant)) return templateId as TemplateVariant;
  return "banded-grey";
};

const DEFAULT_SECTION_TITLE_SIZE = 10;
const DEFAULT_SECTION_BODY_SIZE = 9;

const sectionTitleSize = (section: CvSection) =>
  clamp(section.style?.titleFontSize ?? DEFAULT_SECTION_TITLE_SIZE, 8, 16);

const sectionBodySize = (section: CvSection) =>
  clamp(section.style?.bodyFontSize ?? DEFAULT_SECTION_BODY_SIZE, 8, 14);

const sectionSkillsColumns = (section: CvSection) =>
  section.style?.skillsColumns === 1 ||
  section.style?.skillsColumns === 2 ||
  section.style?.skillsColumns === 3 ||
  section.style?.skillsColumns === 4
    ? section.style.skillsColumns
    : 4;

const sectionTextAlign = (section: CvSection) => section.style?.textAlign ?? "left";
const sectionUsesBullets = (section: CvSection) =>
  typeof section.style?.enableBullets === "boolean" ? section.style.enableBullets : true;
const sectionBulletBold = (section: CvSection) =>
  typeof section.style?.bulletBold === "boolean" ? section.style.bulletBold : false;
const sectionBulletItalic = (section: CvSection) =>
  typeof section.style?.bulletItalic === "boolean" ? section.style.bulletItalic : false;
const sectionBulletGlyph = (section: CvSection) => {
  if (section.style?.bulletStyle === "square") return "■";
  if (section.style?.bulletStyle === "dash") return "-";
  return "•";
};
const sectionTitleLabel = (section: CvSection) =>
  section.style?.uppercaseTitle ? section.title.toUpperCase() : section.title;
const sectionShowDivider = (section: CvSection) =>
  typeof section.style?.showDivider === "boolean" ? section.style.showDivider : true;

const renderInlinePdf = (
  runs: InlineRun[],
  keyPrefix: string,
  base?: { bold?: boolean; italic?: boolean; underline?: boolean }
) =>
  runs.map((run, index) => (
    <Text
      key={`${keyPrefix}-${index}`}
      style={{
        fontWeight: run.bold || base?.bold ? (700 as const) : (400 as const),
        fontStyle: run.italic || base?.italic ? ("italic" as const) : ("normal" as const),
        textDecoration: run.underline || base?.underline ? ("underline" as const) : ("none" as const)
      }}
    >
      {run.text}
    </Text>
  ));

const skillEntriesFromItem = (item: CvSection["items"][number]) => parseSkillEntries(item.description || "");

const skillLinesFromItem = (item: CvSection["items"][number]) =>
  skillEntriesFromItem(item).map((entry) => entry.name);

const renderDescriptionParts = (
  itemId: string,
  section: CvSection,
  pdfStyles: ReturnType<typeof StyleSheet.create>
) => {
  const bodySize = sectionBodySize(section);
  const headingSize = clamp(bodySize + 0.5, 8, 15);
  const textAlign = sectionTextAlign(section);
  return (description: string) => {
    const blocks = parseDescriptionBlocks(description);
    let numberedIndex = 0;

    return blocks.map((block, index) => {
      if (block.kind === "numbered") {
        numberedIndex += 1;
      } else {
        numberedIndex = 0;
      }

      if ((block.kind === "bullet" || block.kind === "numbered") && sectionUsesBullets(section)) {
        return (
          <View key={`${itemId}-b-${index}`} style={pdfStyles.bulletRow} wrap={false}>
            <Text style={[pdfStyles.bulletGlyph, { fontSize: bodySize }]}>
              {block.kind === "numbered" ? `${numberedIndex}.` : sectionBulletGlyph(section)}
            </Text>
            <Text
              style={[
                pdfStyles.bulletText,
                {
                  fontSize: bodySize,
                  textAlign,
                  fontWeight: sectionBulletBold(section) ? (700 as const) : (400 as const),
                  fontStyle: sectionBulletItalic(section) ? ("italic" as const) : ("normal" as const)
                }
              ]}
            >
              {renderInlinePdf(block.runs, `${itemId}-b-inline-${index}`, {
                bold: sectionBulletBold(section),
                italic: sectionBulletItalic(section)
              })}
            </Text>
          </View>
        );
      }

      return (
        <Text
          key={`${itemId}-p-${index}`}
          style={[
            pdfStyles.itemDesc,
            {
              fontSize: block.kind === "heading" ? headingSize : bodySize,
              fontWeight: block.kind === "heading" && section.style.headingBold ? (700 as const) : (400 as const),
              fontStyle:
                block.kind === "heading" && section.style.headingItalic ? ("italic" as const) : ("normal" as const),
              textAlign
            }
          ]}
        >
          {renderInlinePdf(block.runs, `${itemId}-p-inline-${index}`, {
            bold: block.kind === "heading" && section.style.headingBold,
            italic: block.kind === "heading" && section.style.headingItalic
          })}
        </Text>
      );
    });
  };
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const isDarkHex = (hex: string) => {
  const raw = hex.trim().replace(/^#/, "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => `${c}${c}`)
          .join("")
      : raw;
  if (full.length !== 6) return true;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return true;
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luma < 0.55;
};

const usesDossierSansByDefault = (variant: TemplateVariant) =>
  variant === "sidebar-light" ||
  variant === "sidebar-icons" ||
  variant === "sidebar-navy-right" ||
  variant === "sidebar-tan-dots" ||
  variant === "boxed-header-dots" ||
  variant === "skills-right-pink";

const resolvePdfFontPair = (
  variant: TemplateVariant,
  fontFamily: CvProfile["style"]["fontFamily"]
) => {
  if (fontFamily === "serif") {
    return { bodyFont: "Times-Roman", headingFont: "Times-Bold" };
  }
  if (fontFamily === "mono") {
    return { bodyFont: "Courier", headingFont: "Courier-Bold" };
  }
  if (fontFamily === "system-native" || fontFamily === "product-modern") {
    return { bodyFont: "Helvetica", headingFont: "Helvetica-Bold" };
  }
  if (usesDossierSansByDefault(variant)) {
    return { bodyFont: "DossierBody", headingFont: "DossierHeading" };
  }
  return { bodyFont: "Helvetica", headingFont: "Helvetica-Bold" };
};

const stylesFor = (variant: TemplateVariant, style: CvProfile["style"]) => {
  const pageMargin = clamp(style.pageMarginPx || 42, 12, 96);
  const lineHeight = clamp(style.lineSpacing || 1.35, 1, 2);
  const base = {
    paddingTop: pageMargin,
    paddingBottom: pageMargin,
    paddingHorizontal: pageMargin,
    fontSize: clamp(style.baseFontSize || 10, 8, 13),
    color: "#111827"
  };

  const { bodyFont } = resolvePdfFontPair(variant, style.fontFamily);

  const fallbackAccent =
    variant === "blue-rules"
      ? "#2563EB"
      : variant === "skills-right-red"
        ? "#DC2626"
        : variant === "skills-right-pink"
          ? "#F43F5E"
          : variant === "sidebar-tan-dots"
            ? "#B08968"
            : "#111827";

  const accent = style.accentColor || fallbackAccent;
  const sidebarBg = style.sidebarColor || "#0B2F4A";
  const sidebarIsDark = isDarkHex(sidebarBg);
  const sidebarLabel = sidebarIsDark ? "#E2E8F0" : "#111827";
  const sidebarText = sidebarIsDark ? "#F1F5F9" : "#1F2937";
  const sidebarMuted = sidebarIsDark ? "#CBD5E1" : "#374151";

  return StyleSheet.create({
    page: {
      ...base,
      fontFamily: bodyFont,
      fontSize: base.fontSize,
      paddingHorizontal: variant === "gutter-minimal" ? Math.max(24, pageMargin - 6) : base.paddingHorizontal
    },
    header: {
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
      borderBottomStyle: "solid"
    },
    name: {
      fontSize: 18,
      fontWeight: 700 as const
    },
    headline: {
      marginTop: 4,
      fontSize: 10,
      color: "#374151"
    },
    summary: {
      marginTop: 6,
      fontSize: 10,
      color: "#374151",
      lineHeight
    },
    contact: {
      marginTop: 8,
      fontSize: variant === "gutter-minimal" ? 8.5 : 9,
      color: "#4B5563"
    },
    section: {
      marginTop: variant === "gutter-minimal" ? 12 : 14
    },
    sectionTitle: {
      fontSize: 10,
      letterSpacing: variant === "gutter-minimal" ? 1.8 : 1.3,
      textTransform: "none" as const,
      color:
        variant === "banded-grey" ||
        variant === "gutter-minimal" ||
        variant === "blue-rules" ||
        variant === "skills-right-red" ||
        variant === "skills-right-pink"
          ? accent
          : "#111827",
      fontWeight: 700 as const
    },
    sectionHeader: {
      paddingBottom: 3,
      borderBottomWidth:
        variant === "gutter-minimal" ||
        variant === "blue-rules" ||
        variant === "sidebar-light" ||
        variant === "sidebar-navy-right" ||
        variant === "sidebar-icons" ||
        variant === "skills-right-red" ||
        variant === "skills-right-pink"
          ? 1
          : 0,
      borderBottomColor:
        variant === "gutter-minimal" ||
        variant === "blue-rules" ||
        variant === "sidebar-light" ||
        variant === "sidebar-navy-right" ||
        variant === "sidebar-icons" ||
        variant === "skills-right-red" ||
        variant === "skills-right-pink"
          ? accent
          : "transparent",
      borderBottomStyle: "solid"
    },
    item: {
      marginTop: 8
    },
    itemTop: {
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
      gap: 10
    },
    itemMain: {
      flexGrow: 1,
      flexShrink: 1,
      paddingRight: 8
    },
    itemTitle: {
      fontSize: 10,
      fontWeight: 700 as const
    },
    itemSubtitle: {
      marginTop: 1,
      fontSize: 9,
      color: "#374151"
    },
    itemDate: {
      fontSize: 9,
      color: "#6B7280",
      width: 96,
      textAlign: "right" as const,
      flexShrink: 0
    },
    itemDesc: {
      marginTop: 4,
      fontSize: 9,
      color: "#374151",
      lineHeight,
      flexShrink: 1
    },
    bulletRow: {
      marginTop: 3,
      flexDirection: "row" as const,
      gap: 6
    },
    bulletGlyph: {
      fontSize: 9,
      color: "#374151"
    },
    bulletText: {
      flexGrow: 1,
      fontSize: 9,
      color: "#374151",
      lineHeight
    },
    tags: {
      marginTop: 3,
      fontSize: 8.5,
      color: "#6B7280"
    },
    emptyHint: {
      marginTop: 18,
      fontSize: 10,
      color: "#6B7280"
    },
    // portfolio split layout
    split: {
      flexDirection: "row" as const,
      gap: 18,
      width: "100%"
    },
    side: {
      width: 185,
      padding: 14,
      backgroundColor: sidebarBg,
      color: sidebarText
    },
    fintechSplit: {
      flexDirection: "row" as const,
      gap: 18,
      width: "100%"
    },
    fintechSide: {
      width: 185,
      padding: 14,
      backgroundColor: sidebarBg,
      color: sidebarText
    },
    main: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0
    },
    sideBlock: {
      marginTop: 12
    },
    sideLabel: {
      fontSize: 9,
      letterSpacing: 1.5,
      textTransform: "uppercase" as const,
      color: sidebarLabel,
      fontWeight: 700 as const
    },
    sideText: {
      marginTop: 4,
      fontSize: 9,
      color: sidebarText,
      lineHeight
    },
    pmRow: {
      marginTop: 8,
      flexDirection: "row" as const,
      gap: 10
    },
    pmDate: {
      width: 92,
      fontSize: 8.5,
      color: "#6B7280"
    },
    pmBody: {
      flexGrow: 1
    },
    pmLine: {
      width: 10,
      alignItems: "center" as const
    },
    pmDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: accent,
      marginTop: 3
    },
    pmStem: {
      marginTop: 2,
      width: 1,
      flexGrow: 1,
      backgroundColor: "#E5E7EB"
    },
    // banded / classic centered header
    centerHeader: {
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
      borderBottomStyle: "solid",
      alignItems: "center" as const
    },
    bandTitleWrap: {
      marginTop: 14,
      backgroundColor: "#F3F4F6",
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6
    },
    bandTitle: {
      fontSize: 10,
      letterSpacing: 1.6,
      textTransform: "uppercase" as const,
      fontWeight: 700 as const,
      color: "#111827"
    },
    // executive layout
    execRow: {
      flexDirection: "row" as const,
      gap: 16,
      marginTop: 14,
      width: "100%"
    },
    execSide: {
      width: 190,
      padding: 12,
      backgroundColor: sidebarBg,
      borderRadius: 10
    },
    execMain: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0
    },
    execSideTitle: {
      fontSize: 9,
      letterSpacing: 1.6,
      textTransform: "uppercase" as const,
      fontWeight: 700 as const,
      color: sidebarLabel
    },
    execSideText: {
      marginTop: 4,
      fontSize: 9,
      color: sidebarText,
      lineHeight
    },
    execSideMuted: {
      marginTop: 2,
      fontSize: 8.5,
      color: sidebarMuted,
      lineHeight
    }
  });
};

const visibleSections = (profile: CvProfile) =>
  profile.sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.visible)
    }))
    .filter((section) => section.items.length > 0)
    .filter((section) => !isSummarySection(section));

const contactTwoLine = (profile: CvProfile) => {
  const lines = contactLines(profile);
  const get = (kind: "location" | "email" | "phone" | "url") =>
    lines.find((l) => l.kind === kind)?.value ?? "";
  const line1 = [get("location"), get("email")].filter(Boolean).join(" • ");
  const line2 = [get("phone"), get("url")].filter(Boolean).join(" • ");
  return { line1, line2 };
};

export default function CvPdfDocument({ profile }: CvPdfDocumentProps) {
  ensurePdfFonts();
  const variant = templateVariant(profile.templateId);
  const styles = stylesFor(variant, profile.style);
  const sections = visibleSections(profile);

  const profileSummary = (profile.basics.summary || "").trim();
  const summaryAlign = profile.style.summaryAlign ?? "left";
  const fmtDate = (value: string) => formatDateRange(value, profile.style.dateFormat);

  if (variant === "banded-grey") {
    const email = profile.basics.email?.trim();
    const phone = profile.basics.phone?.trim();
    const location = profile.basics.location?.trim();
    const headline = profile.basics.headline?.trim();
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.centerHeader}>
            <Text style={[styles.name, { fontSize: 22 }]}>{profile.basics.name || "Your Name"}</Text>
            {headline ? <Text style={styles.headline}>{headline}</Text> : null}
            {location ? (
              <Text style={{ marginTop: 6, fontSize: 9, color: "#6B7280" }}>{location}</Text>
            ) : null}
            <View
              style={{
                marginTop: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%"
              }}
            >
              <Text style={{ fontSize: 9, color: "#374151" }}>{phone || ""}</Text>
              <Text style={{ fontSize: 9, color: "#374151" }}>{email || ""}</Text>
            </View>
          </View>

          {profileSummary ? (
            <View>
              <View style={styles.bandTitleWrap}>
                <Text
                  style={[
                    styles.bandTitle,
                    { color: profile.style.accentColor || "#111827", fontSize: DEFAULT_SECTION_TITLE_SIZE }
                  ]}
                >
                  Profile
                </Text>
              </View>
              <Text style={[styles.itemDesc, { textAlign: summaryAlign, marginTop: 10 }]}>
                {profileSummary}
              </Text>
            </View>
          ) : null}

          {sections.map((section) => (
            <View key={section.id}>
              <View style={styles.bandTitleWrap}>
                <Text
                  style={[
                    styles.bandTitle,
                    { color: profile.style.accentColor || "#111827", fontSize: sectionTitleSize(section) }
                  ]}
                >
                  {sectionTitleLabel(section)}
                </Text>
              </View>

              {section.type === "skills" ? (
                <View style={{ marginTop: 6 }}>
                  {section.items.map((item) => {
                    const category = (item.title || "").trim();
                    const skills = skillLinesFromItem(item);
                    if (skills.length === 0) return null;
                    const bodySize = sectionBodySize(section);
                    const columns = sectionSkillsColumns(section);
                    return (
                      <View key={item.id} style={{ marginTop: 6 }}>
                        {category && category.toLowerCase() !== "skills" ? (
                          <Text style={[styles.itemTitle, { fontSize: clamp(bodySize + 1, 8, 16) }]}>
                            {category}
                          </Text>
                        ) : null}
                        <View style={{ marginTop: 3, flexDirection: "row", flexWrap: "wrap" }}>
                          {skills.map((skill, index) => (
                            <Text
                              key={`${item.id}-${index}`}
                              style={{
                                width: `${100 / columns}%`,
                                fontSize: bodySize,
                                color: "#374151",
                                marginTop: 2,
                                paddingRight: 10
                              }}
                            >
                              {skill}
                            </Text>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                section.items.map((item) => (
                    <View key={item.id} style={styles.item}>
                      <View style={styles.itemTop}>
                        <View style={styles.itemMain}>
                          <Text style={[styles.itemTitle, { fontSize: clamp(sectionBodySize(section) + 1, 8, 16) }]}>
                            {item.title || "Title"}
                          </Text>
                          {item.subtitle ? (
                            <Text style={[styles.itemSubtitle, { fontSize: sectionBodySize(section) }]}>
                              {item.subtitle}
                            </Text>
                          ) : null}
                        </View>
                        {item.dateRange ? (
                          <Text style={[styles.itemDate, { fontSize: sectionBodySize(section) }]}>
                            {fmtDate(item.dateRange)}
                          </Text>
                        ) : null}
                      </View>

                    {item.description ? (
                      <View>{renderDescriptionParts(item.id, section, styles)(item.description)}</View>
                    ) : null}
                    {item.tags.length > 0 ? (
                      <Text style={styles.tags}>{item.tags.join(" • ")}</Text>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          ))}
        </Page>
      </Document>
    );
  }

  if (variant === "sidebar-light") {
    const skills = sections.filter((s) => s.type === "skills");
    const sideSections = sections.filter((s) => s.type === "skills" || s.type === "certifications");
    const mainSections = sections.filter((s) => s.type !== "skills" && s.type !== "certifications");
    const headline = profile.basics.headline?.trim();
    const { headingFont, bodyFont } = resolvePdfFontPair(variant, profile.style.fontFamily);
    const accent = profile.style.accentColor || "#232933";
    const sidebarBg = profile.style.sidebarColor || "#EEF2F6";

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={{ paddingBottom: 8 }}>
            <Text
              style={{
                fontFamily: headingFont,
                fontSize: 33,
                fontWeight: 700,
                letterSpacing: 1.8,
                textTransform: "uppercase"
              }}
            >
              {profile.basics.name || "Your Name"}
            </Text>
            {headline ? (
              <Text style={{ marginTop: 6, fontFamily: bodyFont, fontSize: 10, color: "#6B7280" }}>{headline}</Text>
            ) : null}
          </View>
          <View style={{ height: 1, backgroundColor: "#D1D5DB" }} />

          <View style={{ marginTop: 12, flexDirection: "row" }}>
            <View style={{ width: 182, padding: 12, backgroundColor: sidebarBg }}>
              <Text style={{ fontFamily: headingFont, fontSize: 12, letterSpacing: 1.7, color: accent }}>DETAILS</Text>
              <View style={{ marginTop: 6 }}>
                <Text style={{ fontFamily: headingFont, fontSize: 8.5, letterSpacing: 1.1, color: accent }}>ADDRESS</Text>
                <Text style={{ marginTop: 2, fontFamily: bodyFont, fontSize: 8.3, color: "#374151", lineHeight: 1.25 }}>
                  {profile.basics.location || ""}
                </Text>
                <View style={{ height: 8 }} />
                <Text style={{ fontFamily: headingFont, fontSize: 8.5, letterSpacing: 1.1, color: accent }}>PHONE</Text>
                <Text style={{ marginTop: 2, fontFamily: bodyFont, fontSize: 8.3, color: "#374151", lineHeight: 1.25 }}>
                  {profile.basics.phone || ""}
                </Text>
                <View style={{ height: 8 }} />
                <Text style={{ fontFamily: headingFont, fontSize: 8.5, letterSpacing: 1.1, color: accent }}>EMAIL</Text>
                <Text style={{ marginTop: 2, fontFamily: bodyFont, fontSize: 8.3, color: "#374151", lineHeight: 1.25 }}>
                  {profile.basics.email || ""}
                </Text>
                {profile.basics.url ? (
                  <>
                    <View style={{ height: 8 }} />
                    <Text style={{ fontFamily: headingFont, fontSize: 8.5, letterSpacing: 1.1, color: accent }}>WEBSITE</Text>
                    <Text style={{ marginTop: 2, fontFamily: bodyFont, fontSize: 8.3, color: "#374151", lineHeight: 1.25 }}>
                      {contactLines(profile).find((l) => l.kind === "url")?.value ?? ""}
                    </Text>
                  </>
                ) : null}
              </View>

              {skills.length > 0 ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={{ fontFamily: headingFont, fontSize: 12, letterSpacing: 1.7, color: accent }}>SKILLS</Text>
                  {skills.flatMap((section) =>
                    section.items.flatMap((item) => {
                      const out = skillLinesFromItem(item);
                      return out.map((line, index) => (
                        <View key={`${item.id}-${index}`} style={{ marginTop: 7 }}>
                          <Text style={{ fontFamily: bodyFont, fontSize: 8.4, color: "#111827" }}>{line}</Text>
                          <View style={{ height: 3, backgroundColor: "#111827", marginTop: 3, opacity: 0.9 }} />
                        </View>
                      ));
                    })
                  )}
                </View>
              ) : null}

              {sideSections
                .filter((s) => s.type === "certifications")
                .map((section) => (
                  <View key={section.id} style={{ marginTop: 14 }}>
                    <Text style={{ fontFamily: headingFont, fontSize: 12, letterSpacing: 1.7, color: accent }}>
                      {sectionTitleLabel(section)}
                    </Text>
                    {section.items.map((item) => (
                      <View key={item.id} style={{ marginTop: 6 }}>
                        <Text style={{ fontFamily: bodyFont, fontSize: 8.5, color: "#111827" }}>{item.title}</Text>
                        {item.subtitle ? (
                          <Text style={{ marginTop: 1, fontFamily: bodyFont, fontSize: 8.3, color: "#374151" }}>{item.subtitle}</Text>
                        ) : null}
                        {item.dateRange ? (
                          <Text style={{ marginTop: 1, fontFamily: bodyFont, fontSize: 8.1, color: "#6B7280" }}>
                            {fmtDate(item.dateRange)}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ))}
            </View>

            <View style={{ width: 15 }} />

            <View style={{ flexGrow: 1, flexShrink: 1, fontFamily: bodyFont }}>
              {profileSummary ? (
                <View style={styles.section}>
                  <View minPresenceAhead={96} wrap={false}>
                    <Text style={{ fontFamily: headingFont, fontSize: 13, letterSpacing: 1.7, color: accent }}>PROFILE</Text>
                    <View style={{ marginTop: 3, width: 32, height: 2, backgroundColor: accent }} />
                  </View>
                  <Text style={[styles.itemDesc, { textAlign: summaryAlign, fontFamily: bodyFont }]}>{profileSummary}</Text>
                </View>
              ) : null}

              {mainSections.map((section) => (
                <View key={section.id} style={styles.section} minPresenceAhead={160}>
                  <View minPresenceAhead={96} wrap={false}>
                    <Text style={{ fontFamily: headingFont, fontSize: 13, letterSpacing: 1.7, color: accent }}>
                      {sectionTitleLabel(section)}
                    </Text>
                    <View style={{ marginTop: 3, width: 32, height: 2, backgroundColor: accent }} />
                  </View>
                  {section.items.map((item) => (
                    <View key={item.id} style={styles.item}>
                      <View style={styles.itemTop}>
                        <View style={styles.itemMain}>
                          <Text style={[styles.itemTitle, { fontFamily: bodyFont }]}>{item.title || "Title"}</Text>
                          {item.subtitle ? (
                            <Text style={[styles.itemSubtitle, { fontFamily: bodyFont }]}>{item.subtitle}</Text>
                          ) : null}
                        </View>
                        {item.dateRange ? (
                          <Text style={[styles.itemDate, { width: 102, fontFamily: bodyFont }]}>{fmtDate(item.dateRange)}</Text>
                        ) : null}
                      </View>
                      {item.description ? (
                        <View>{renderDescriptionParts(item.id, section, styles)(item.description)}</View>
                      ) : null}
                      {item.tags.length > 0 ? (
                        <Text style={[styles.tags, { fontFamily: bodyFont }]}>{item.tags.join(" • ")}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  if (variant === "sidebar-navy-right") {
    const skills = sections.filter((s) => s.type === "skills");
    const mainSections = sections.filter((s) => s.type !== "skills");
    const headline = profile.basics.headline?.trim();

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.fintechSplit}>
            <View style={styles.main}>
              <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <Text style={[styles.name, { fontSize: 22 }]}>{profile.basics.name || "Your Name"}</Text>
                {headline ? <Text style={styles.headline}>{headline}</Text> : null}
              </View>

              {profileSummary ? (
                <View style={[styles.section, { marginTop: 10 }]}>
                  <Text style={[styles.sectionTitle, { color: "#111827" }]}>Profile</Text>
                  <Text style={[styles.itemDesc, { textAlign: summaryAlign }]}>{profileSummary}</Text>
                </View>
              ) : null}
              {mainSections.map((section) => (
                <View key={section.id} style={styles.section} minPresenceAhead={160}>
                  <View style={[styles.sectionHeader, !sectionShowDivider(section) ? { borderBottomWidth: 0, paddingBottom: 0 } : {}]} minPresenceAhead={96} wrap={false}>
                    <Text style={styles.sectionTitle}>{sectionTitleLabel(section)}</Text>
                  </View>
                  {section.items.map((item) => (
                    <View key={item.id} style={styles.item}>
                      <View style={styles.itemTop}>
                        <View style={styles.itemMain}>
                          <Text style={styles.itemTitle}>{item.title || "Title"}</Text>
                          {item.subtitle ? (
                            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                          ) : null}
                        </View>
                        {item.dateRange ? <Text style={styles.itemDate}>{fmtDate(item.dateRange)}</Text> : null}
                      </View>
                      {item.description ? (
                        <View>{renderDescriptionParts(item.id, section, styles)(item.description)}</View>
                      ) : null}
                      {item.tags.length > 0 ? (
                        <Text style={styles.tags}>{item.tags.join(" • ")}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>

            <View style={styles.fintechSide}>
              <View style={styles.sideBlock}>
                <Text style={styles.sideLabel}>Details</Text>
                <Text style={styles.sideText}>{profile.basics.location || ""}</Text>
                <Text style={styles.sideText}>{profile.basics.phone || ""}</Text>
                <Text style={styles.sideText}>{profile.basics.email || ""}</Text>
              </View>

              {skills.map((section) => (
                <View key={section.id} style={styles.sideBlock}>
                  <Text style={styles.sideLabel}>{sectionTitleLabel(section)}</Text>
                  {section.items.flatMap((item) => {
                    const out = skillLinesFromItem(item);
                    return out.map((line, index) => (
                      <View key={`${item.id}-${index}`} style={{ marginTop: 6 }}>
                        <Text style={styles.sideText}>{line}</Text>
                        <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.5)", marginTop: 4 }} />
                      </View>
                    ));
                  })}
                </View>
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  if (variant === "sidebar-icons") {
    const skills = sections.filter((s) => s.type === "skills");
    const mainSections = sections.filter((s) => s.type !== "skills");
    const headline = profile.basics.headline?.trim();
    const url = contactLines(profile).find((l) => l.kind === "url")?.value ?? "";
    const { headingFont, bodyFont } = resolvePdfFontPair(variant, profile.style.fontFamily);
    const accent = profile.style.accentColor || "#1F2937";
    const sidebarBg = profile.style.sidebarColor || "#F8FAFC";

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={{ alignItems: "center", paddingBottom: 8 }}>
            <Text style={{ fontFamily: headingFont, fontSize: 34, letterSpacing: 1.8, color: accent }}>
              {(profile.basics.name || "Your Name").toUpperCase()}
            </Text>
            {headline ? (
              <Text style={{ marginTop: 4, fontFamily: headingFont, fontSize: 9, letterSpacing: 1.2, color: accent }}>
                {headline.toUpperCase()}
              </Text>
            ) : null}
            <View style={{ marginTop: 7, flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {contactLines(profile).map((line) => (
                <View key={line.kind} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: accent }} />
                  <Text style={{ fontFamily: bodyFont, fontSize: 8.2, color: "#4B5563" }}>{line.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 12, flexDirection: "row" as const }}>
            <View style={{ width: 182, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: sidebarBg }}>
              <Text style={{ fontFamily: headingFont, fontSize: 12, letterSpacing: 1.7, color: accent }}>
                • DETAILS •
              </Text>
              <View style={{ marginTop: 6 }}>
                {[profile.basics.location, profile.basics.phone, profile.basics.email, url].filter(Boolean).map((line, idx) => (
                  <View key={`${line}-${idx}`} style={{ marginTop: idx === 0 ? 0 : 3, flexDirection: "row", gap: 4, alignItems: "center" }}>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: accent }} />
                    <Text style={{ fontFamily: bodyFont, fontSize: 8.4, color: "#374151" }}>{line}</Text>
                  </View>
                ))}
              </View>

              {skills.length > 0 ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={{ fontFamily: headingFont, fontSize: 12, letterSpacing: 1.7, color: accent }}>
                    • SKILLS •
                  </Text>
                  {skills.flatMap((section) =>
                    section.items.flatMap((item) =>
                      skillLinesFromItem(item).map((line, index) => (
                        <View key={`${item.id}-${index}`} style={{ marginTop: 7 }}>
                          <Text style={{ fontFamily: bodyFont, fontSize: 8.4, color: "#111827" }}>{line}</Text>
                          <View style={{ height: 2, backgroundColor: accent, marginTop: 3, opacity: 0.85 }} />
                        </View>
                      ))
                    )
                  )}
                </View>
              ) : null}
            </View>

            <View style={{ width: 1, backgroundColor: "#9CA3AF", opacity: 0.55, marginHorizontal: 14 }} />

            <View style={{ flexGrow: 1, flexShrink: 1 }}>
              {profileSummary ? (
                <View style={styles.section}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }} minPresenceAhead={96} wrap={false}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent }} />
                    <Text style={{ fontFamily: headingFont, fontSize: 12, letterSpacing: 1.6, color: accent }}>
                      PROFILE
                    </Text>
                  </View>
                  <Text style={[styles.itemDesc, { textAlign: summaryAlign, fontFamily: bodyFont }]}>{profileSummary}</Text>
                </View>
              ) : null}

              {mainSections.map((section) => (
                <View key={section.id} style={styles.section} minPresenceAhead={160}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }} minPresenceAhead={96} wrap={false}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent }} />
                    <Text style={{ fontFamily: headingFont, fontSize: 12, letterSpacing: 1.6, color: accent }}>
                      {sectionTitleLabel(section)}
                    </Text>
                  </View>
                  {section.items.map((item) => (
                    <View key={item.id} style={styles.item}>
                      <View style={styles.itemTop}>
                        <View style={styles.itemMain}>
                          <Text style={[styles.itemTitle, { fontFamily: bodyFont }]}>{item.title || "Title"}</Text>
                          {item.subtitle ? <Text style={[styles.itemSubtitle, { fontFamily: bodyFont }]}>{item.subtitle}</Text> : null}
                        </View>
                        {item.dateRange ? (
                          <Text style={[styles.itemDate, { width: 104, fontFamily: bodyFont }]}>{fmtDate(item.dateRange)}</Text>
                        ) : null}
                      </View>
                      {item.description ? (
                        <View>{renderDescriptionParts(item.id, section, styles)(item.description)}</View>
                      ) : null}
                      {item.tags.length > 0 ? (
                        <Text style={[styles.tags, { fontFamily: bodyFont }]}>{item.tags.join(" • ")}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  if (variant === "sidebar-tan-dots") {
    const skills = sections.filter((s) => s.type === "skills");
    const mainSections = sections.filter((s) => s.type !== "skills");
    const headline = profile.basics.headline?.trim();

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={[styles.header, { borderBottomWidth: 0 }]}>
            <Text style={[styles.name, { fontSize: 20 }]}>{profile.basics.name || "Your Name"}</Text>
            {headline ? <Text style={styles.headline}>{headline}</Text> : null}
          </View>

          <View style={styles.execRow}>
            <View style={styles.execSide}>
              <Text style={[styles.execSideTitle, { color: profile.style.accentColor || "#B08968" }]}>Details</Text>
              <View style={{ marginTop: 6 }}>
                <Text style={styles.execSideMuted}>{profile.basics.location || ""}</Text>
                <Text style={styles.execSideMuted}>{profile.basics.phone || ""}</Text>
                <Text style={styles.execSideMuted}>{profile.basics.email || ""}</Text>
              </View>

              {skills.length > 0 ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.execSideTitle, { color: profile.style.accentColor || "#B08968" }]}>Skills</Text>
                  {skills.flatMap((section) =>
                    section.items.flatMap((item) =>
                      skillEntriesFromItem(item).map((entry, index) => (
                        <View key={`${item.id}-${index}`} style={{ marginTop: 10 }}>
                          <Text style={styles.execSideText}>{entry.name}</Text>
                          <View style={{ flexDirection: "row", gap: 4, marginTop: 5 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <View
                                key={i}
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: 3,
                                  backgroundColor:
                                    i < entry.level
                                      ? profile.style.accentColor || "#B08968"
                                      : "rgba(0,0,0,0.12)"
                                }}
                              />
                            ))}
                          </View>
                        </View>
                      ))
                    )
                  )}
                </View>
              ) : null}
            </View>

            <View style={styles.execMain}>
              {profileSummary ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader} minPresenceAhead={96} wrap={false}>
                    <Text style={[styles.sectionTitle, { color: profile.style.accentColor || "#B08968" }]}>
                      Profile
                    </Text>
                  </View>
                  <Text style={[styles.itemDesc, { textAlign: summaryAlign }]}>{profileSummary}</Text>
                </View>
              ) : null}

              {mainSections.map((section) => (
                <View key={section.id} style={styles.section} minPresenceAhead={160}>
                  <View style={[styles.sectionHeader, !sectionShowDivider(section) ? { borderBottomWidth: 0, paddingBottom: 0 } : {}]} minPresenceAhead={96} wrap={false}>
                    <Text style={[styles.sectionTitle, { color: profile.style.accentColor || "#B08968" }]}>
                      {sectionTitleLabel(section)}
                    </Text>
                  </View>
                  {section.items.map((item) => (
                    <View key={item.id} style={styles.item}>
                      <View style={styles.itemTop}>
                        <View style={styles.itemMain}>
                          <Text style={styles.itemTitle}>{item.title || "Title"}</Text>
                          {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
                        </View>
                        {item.dateRange ? <Text style={styles.itemDate}>{fmtDate(item.dateRange)}</Text> : null}
                      </View>
                      {item.description ? (
                        <View>{renderDescriptionParts(item.id, section, styles)(item.description)}</View>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  if (variant === "gutter-minimal") {
    const c = contactTwoLine(profile);
    const headline = profile.basics.headline?.trim();
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.name}>{profile.basics.name || "Your Name"}</Text>
            {headline ? <Text style={styles.headline}>{headline}</Text> : null}
            <View style={{ marginTop: 8 }}>
              <Text style={styles.contact}>{c.line1 || "Contact details"}</Text>
              {c.line2 ? <Text style={styles.contact}>{c.line2}</Text> : null}
            </View>
          </View>

          {profileSummary ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader} minPresenceAhead={96} wrap={false}>
                <Text style={styles.sectionTitle}>Profile</Text>
              </View>
              <Text style={[styles.itemDesc, { textAlign: summaryAlign }]}>{profileSummary}</Text>
            </View>
          ) : null}

          {sections.map((section) => (
            <View key={section.id} style={styles.section} minPresenceAhead={160}>
              <View style={[styles.sectionHeader, !sectionShowDivider(section) ? { borderBottomWidth: 0, paddingBottom: 0 } : {}]} minPresenceAhead={96} wrap={false}>
                <Text style={styles.sectionTitle}>{sectionTitleLabel(section)}</Text>
              </View>
              {section.items.map((item) => (
                <View key={item.id} style={styles.pmRow}>
                  <Text style={styles.pmDate}>{item.dateRange ? fmtDate(item.dateRange) : ""}</Text>
                  <View style={styles.pmBody}>
                    <Text style={styles.itemTitle}>{item.title || "Title"}</Text>
                    {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
                    {item.description ? (
                      <View>{renderDescriptionParts(item.id, section, styles)(item.description)}</View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </Page>
      </Document>
    );
  }

  if (variant === "blue-rules") {
    const headline = profile.basics.headline?.trim();
    const contact = contactTwoLine(profile);
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={[styles.name, { color: profile.style.accentColor || "#2563EB", fontSize: 22 }]}>
              {profile.basics.name || "Your Name"}
            </Text>
            {headline ? <Text style={[styles.headline, { color: "#111827", fontWeight: 700 as const }]}>{headline}</Text> : null}
            <Text style={[styles.contact, { marginTop: 6 }]}>{contact.line1 || "Contact details"}</Text>
            {contact.line2 ? <Text style={styles.contact}>{contact.line2}</Text> : null}
          </View>

          {profileSummary ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader} minPresenceAhead={96} wrap={false}>
                <Text style={styles.sectionTitle}>Profile</Text>
              </View>
              <Text style={[styles.itemDesc, { textAlign: summaryAlign }]}>{profileSummary}</Text>
            </View>
          ) : null}

          {sections.map((section) => (
            <View key={section.id} style={styles.section} minPresenceAhead={160}>
              <View style={[styles.sectionHeader, !sectionShowDivider(section) ? { borderBottomWidth: 0, paddingBottom: 0 } : {}]} minPresenceAhead={96} wrap={false}>
                <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize(section) }]}>
                  {sectionTitleLabel(section)}
                </Text>
              </View>
              {section.type === "skills" ? (
                <View style={{ marginTop: 6 }}>
                  {section.items.map((item) => {
                    const category = (item.title || "").trim();
                    const skills = skillLinesFromItem(item);
                    if (skills.length === 0) return null;
                    const bodySize = sectionBodySize(section);
                    const columns = sectionSkillsColumns(section);

                    return (
                      <View key={item.id} style={{ marginTop: 6 }}>
                        {category && category.toLowerCase() !== "skills" ? (
                          <Text style={[styles.itemTitle, { fontSize: clamp(bodySize + 1, 8, 16) }]}>
                            {category}
                          </Text>
                        ) : null}
                        <View style={{ marginTop: 3, flexDirection: "row", flexWrap: "wrap" }}>
                          {skills.map((skill, index) => (
                            <Text
                              key={`${item.id}-${index}`}
                              style={{
                                width: `${100 / columns}%`,
                                fontSize: bodySize,
                                color: "#374151",
                                marginTop: 2,
                                paddingRight: 10
                              }}
                            >
                              {skill}
                            </Text>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                section.items.map((item) => (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemTop}>
                      <View style={styles.itemMain}>
                        <Text style={[styles.itemTitle, { fontSize: clamp(sectionBodySize(section) + 1, 8, 16) }]}>
                          {item.title || "Title"}
                        </Text>
                        {item.subtitle ? (
                          <Text style={[styles.itemSubtitle, { fontSize: sectionBodySize(section) }]}>
                            {item.subtitle}
                          </Text>
                        ) : null}
                      </View>
                      {item.dateRange ? (
                        <Text style={[styles.itemDate, { fontSize: sectionBodySize(section) }]}>
                          {fmtDate(item.dateRange)}
                        </Text>
                      ) : null}
                    </View>
                    {item.description ? (
                      <View>{renderDescriptionParts(item.id, section, styles)(item.description)}</View>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          ))}
        </Page>
      </Document>
    );
  }

  if (variant === "skills-right-red") {
    const headline = profile.basics.headline?.trim();
    const mainSections = sections.filter((s) => s.type !== "skills");
    const skills = sections.filter((s) => s.type === "skills");
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={[styles.name, { color: profile.style.accentColor || "#DC2626", fontSize: 18 }]}>
              {profile.basics.name || "Your Name"}
            </Text>
            {headline ? (
              <Text style={[styles.headline, { color: "#111827" }]}>{headline}</Text>
            ) : null}
            <Text style={[styles.contact, { marginTop: 6 }]}>
              {contactInline(profile, " • ") || "Contact details"}
            </Text>
          </View>

          <View style={{ marginTop: 14, flexDirection: "row", gap: 18 }}>
            <View style={{ flexGrow: 1 }}>
              {profileSummary ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader} minPresenceAhead={96} wrap={false}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                  </View>
                  <Text style={[styles.itemDesc, { textAlign: summaryAlign }]}>{profileSummary}</Text>
                </View>
              ) : null}

              {mainSections.map((section) => (
                <View key={section.id} style={styles.section} minPresenceAhead={160}>
                  <View style={[styles.sectionHeader, !sectionShowDivider(section) ? { borderBottomWidth: 0, paddingBottom: 0 } : {}]} minPresenceAhead={96} wrap={false}>
                    <Text style={styles.sectionTitle}>{sectionTitleLabel(section)}</Text>
                  </View>
                  {section.items.map((item) => (
                    <View key={item.id} style={styles.item}>
                      <View style={styles.itemTop}>
                        <View style={styles.itemMain}>
                          <Text style={styles.itemTitle}>{item.title || "Title"}</Text>
                          {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
                        </View>
                        {item.dateRange ? <Text style={styles.itemDate}>{fmtDate(item.dateRange)}</Text> : null}
                      </View>
                      {item.description ? (
                        <View>{renderDescriptionParts(item.id, section, styles)(item.description)}</View>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>

            <View style={{ width: 185 }}>
              {skills.map((section) => (
                <View key={section.id} style={{ marginTop: 14 }}>
                  <Text style={[styles.sectionTitle, { color: "#111827" }]}>
                    {sectionTitleLabel(section) || "Skills"}
                  </Text>
                  <View style={{ marginTop: 10 }}>
                    {section.items.flatMap((item) =>
                      skillLinesFromItem(item).map((line, idx) => (
                        <View key={`${item.id}-${idx}`} style={{ marginTop: 8 }}>
                          <Text style={{ fontSize: 9, color: "#111827" }}>{line}</Text>
                          <View style={{ height: 1, backgroundColor: "#D1D5DB", marginTop: 5 }} />
                        </View>
                      ))
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  if (variant === "boxed-header-dots") {
    const skills = sections.filter((s) => s.type === "skills");
    const mainSections = sections.filter((s) => s.type !== "skills");
    const headline = profile.basics.headline?.trim();

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={{ alignItems: "center" as const, marginBottom: 14 }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#111827",
                borderStyle: "solid",
                paddingVertical: 10,
                paddingHorizontal: 18,
                minWidth: 320,
                alignItems: "center" as const
              }}
            >
              <Text style={[styles.name, { fontSize: 16 }]}>{profile.basics.name || "Your Name"}</Text>
              {headline ? (
                <Text style={{ marginTop: 4, fontSize: 9, color: "#374151" }}>{headline}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.split}>
            <View style={styles.side}>
              <View style={styles.sideBlock}>
                <Text style={styles.sideLabel}>Details</Text>
                <Text style={styles.sideText}>{profile.basics.location || ""}</Text>
                <Text style={styles.sideText}>{profile.basics.phone || ""}</Text>
                <Text style={styles.sideText}>{profile.basics.email || ""}</Text>
                {contactLines(profile).find((l) => l.kind === "url")?.value ? (
                  <Text style={styles.sideText}>{contactLines(profile).find((l) => l.kind === "url")?.value}</Text>
                ) : null}
              </View>

              {skills.map((section) => (
                <View key={section.id} style={styles.sideBlock}>
                  <Text style={styles.sideLabel}>{sectionTitleLabel(section)}</Text>
                  {section.items.flatMap((item) =>
                    skillEntriesFromItem(item).map((entry, index) => (
                      <View key={`${item.id}-${index}`} style={{ marginTop: 8 }}>
                        <Text style={styles.sideText}>{entry.name}</Text>
                        <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <View
                              key={i}
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: 3,
                                backgroundColor:
                                  i < entry.level
                                    ? profile.style.accentColor || "#111827"
                                    : "rgba(17,24,39,0.15)"
                              }}
                            />
                          ))}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              ))}
            </View>

            <View style={styles.main}>
              {mainSections.length === 0 ? (
                <Text style={styles.emptyHint}>
                  Add section items in the editor to see them in the PDF export.
                </Text>
              ) : null}

              {profileSummary ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader} minPresenceAhead={96} wrap={false}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                  </View>
                  <Text style={[styles.itemDesc, { textAlign: summaryAlign }]}>{profileSummary}</Text>
                </View>
              ) : null}

              {mainSections.map((section) => (
                <View key={section.id} style={styles.section} minPresenceAhead={160}>
                  <View style={[styles.sectionHeader, !sectionShowDivider(section) ? { borderBottomWidth: 0, paddingBottom: 0 } : {}]} minPresenceAhead={96} wrap={false}>
                    <Text style={styles.sectionTitle}>{sectionTitleLabel(section)}</Text>
                  </View>

                  {section.items.map((item) => (
                    <View key={item.id} style={styles.item}>
                      <View style={styles.itemTop}>
                        <View>
                          <Text style={styles.itemTitle}>{item.title || "Title"}</Text>
                          {item.subtitle ? (
                            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                          ) : null}
                        </View>
                        {item.dateRange ? <Text style={styles.itemDate}>{fmtDate(item.dateRange)}</Text> : null}
                      </View>

                      {item.description ? (
                        <View>{renderDescriptionParts(item.id, section, styles)(item.description)}</View>
                      ) : null}
                      {item.tags.length > 0 ? (
                        <Text style={styles.tags}>{item.tags.join(" • ")}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  if (variant === "skills-right-pink") {
    const headline = profile.basics.headline?.trim();
    const mainSections = sections.filter((s) => s.type !== "skills");
    const skills = sections.filter((s) => s.type === "skills");
    const accent = profile.style.accentColor || "#F43F5E";
    const { headingFont, bodyFont } = resolvePdfFontPair(variant, profile.style.fontFamily);

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={[styles.name, { fontSize: 24, color: accent, fontFamily: headingFont }]}>
              {profile.basics.name || "Your Name"}
            </Text>
            {headline ? <Text style={[styles.headline, { color: accent, fontFamily: bodyFont }]}>{headline}</Text> : null}
            <Text style={[styles.contact, { marginTop: 6, fontFamily: bodyFont }]}>
              {contactInline(profile, " • ") || "Contact details"}
            </Text>
          </View>

          <View style={{ marginTop: 16, flexDirection: "row", gap: 18 }}>
            <View style={{ flexGrow: 1 }}>
              {profileSummary ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader} minPresenceAhead={96} wrap={false}>
                    <Text style={[styles.sectionTitle, { color: accent, fontFamily: headingFont }]}>Profile</Text>
                  </View>
                  <Text style={[styles.itemDesc, { textAlign: summaryAlign, fontFamily: bodyFont }]}>{profileSummary}</Text>
                </View>
              ) : null}

              {mainSections.map((section) => (
                <View key={section.id} style={styles.section} minPresenceAhead={160}>
                  <View
                    style={[
                      styles.sectionHeader,
                      !sectionShowDivider(section) ? { borderBottomWidth: 0, paddingBottom: 0 } : {},
                      { borderBottomColor: accent }
                    ]}
                    minPresenceAhead={96}
                    wrap={false}
                  >
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: accent, fontSize: sectionTitleSize(section), fontFamily: headingFont }
                      ]}
                    >
                      {sectionTitleLabel(section)}
                    </Text>
                  </View>

                  {section.items.map((item) => (
                    <View key={item.id} style={{ marginTop: 10, flexDirection: "row", gap: 12 }}>
                      <Text style={{ width: 96, fontSize: 8.7, color: accent, fontFamily: bodyFont }}>
                        {item.dateRange ? fmtDate(item.dateRange) : ""}
                      </Text>
                      <View style={{ flexGrow: 1 }}>
                        <Text style={[styles.itemTitle, { fontFamily: bodyFont }]}>{item.title || "Title"}</Text>
                        {item.subtitle ? <Text style={[styles.itemSubtitle, { fontFamily: bodyFont }]}>{item.subtitle}</Text> : null}
                        {item.description ? (
                          <View>{renderDescriptionParts(item.id, section, styles)(item.description)}</View>
                        ) : null}
                        {item.tags.length > 0 ? (
                          <Text style={[styles.tags, { fontFamily: bodyFont }]}>{item.tags.join(" • ")}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>

            <View style={{ width: 185 }}>
              {skills.map((section) => (
                <View key={section.id} style={{ marginTop: 14 }}>
                  <Text style={[styles.sectionTitle, { color: accent, fontSize: sectionTitleSize(section), fontFamily: headingFont }]}>
                    {sectionTitleLabel(section) || "Skills"}
                  </Text>
                  <View style={{ marginTop: 10 }}>
                    {section.items.flatMap((item) =>
                      skillEntriesFromItem(item).map((entry, idx) => (
                        <View key={`${item.id}-${idx}`} style={{ marginTop: 10 }}>
                          <Text style={{ fontSize: 9, color: "#111827", fontFamily: bodyFont }}>{entry.name}</Text>
                          <View style={{ flexDirection: "row", gap: 4, marginTop: 6, flexWrap: "wrap" as const }}>
                            {Array.from({ length: 10 }).map((_, i) => (
                              <View
                                key={i}
                                style={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor: i < entry.level * 2 ? accent : "rgba(244,63,94,0.18)"
                                }}
                              />
                            ))}
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.basics.name || "Your Name"}</Text>
          <Text style={styles.contact}>{contactInline(profile) || "Contact details"}</Text>
          {profile.basics.summary ? <Text style={styles.summary}>{profile.basics.summary}</Text> : null}
        </View>

        {sections.length === 0 ? (
          <Text style={styles.emptyHint}>Add section items in the editor to see them in the PDF export.</Text>
        ) : null}

        {sections.map((section) => (
          <View key={section.id} style={styles.section} minPresenceAhead={160}>
            <View style={[styles.sectionHeader, !sectionShowDivider(section) ? { borderBottomWidth: 0, paddingBottom: 0 } : {}]} minPresenceAhead={96} wrap={false}>
              <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize(section) }]}>
                {sectionTitleLabel(section)}
              </Text>
            </View>

            {section.type === "skills" ? (
              <View style={{ marginTop: 6 }}>
                {section.items.map((item) => {
                  const category = (item.title || "").trim();
                  const skills = skillLinesFromItem(item);
                  if (skills.length === 0) return null;
                  const bodySize = sectionBodySize(section);
                  const columns = sectionSkillsColumns(section);

                  return (
                    <View key={item.id} style={{ marginTop: 6 }}>
                      {category && category.toLowerCase() !== "skills" ? (
                        <Text style={[styles.itemTitle, { fontSize: clamp(bodySize + 1, 8, 16) }]}>
                          {category}
                        </Text>
                      ) : null}
                      <View style={{ marginTop: 3, flexDirection: "row", flexWrap: "wrap" }}>
                        {skills.map((skill, index) => (
                          <Text
                            key={`${item.id}-${index}`}
                            style={{
                              width: `${100 / columns}%`,
                              fontSize: bodySize,
                              color: "#374151",
                              marginTop: 2,
                              paddingRight: 10
                            }}
                          >
                            {skill}
                          </Text>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              section.items.map((item) => (
                <View key={item.id} style={styles.item}>
                  <View style={styles.itemTop}>
                    <View style={styles.itemMain}>
                      <Text style={[styles.itemTitle, { fontSize: clamp(sectionBodySize(section) + 1, 8, 16) }]}>
                        {item.title || "Title"}
                      </Text>
                      {item.subtitle ? (
                        <Text style={[styles.itemSubtitle, { fontSize: sectionBodySize(section) }]}>
                          {item.subtitle}
                        </Text>
                      ) : null}
                    </View>
                    {item.dateRange ? (
                      <Text style={[styles.itemDate, { fontSize: sectionBodySize(section) }]}>
                        {fmtDate(item.dateRange)}
                      </Text>
                    ) : null}
                  </View>

                  {item.description ? (
                    <View>{renderDescriptionParts(item.id, section, styles)(item.description)}</View>
                  ) : null}
                  {item.tags.length > 0 ? <Text style={styles.tags}>{item.tags.join(" • ")}</Text> : null}
                </View>
              ))
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
}
