import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AtSign, Briefcase, Globe, GraduationCap, MapPin, Phone, Sparkles } from "lucide-react";
import type { CvProfile, CvSection } from "@/lib/cv-profile";
import { contactInline, contactLines } from "@/lib/contact";
import { formatDateRange } from "@/lib/date-format";
import { parseDescriptionBlocks, type InlineRun } from "@/lib/description-format";
import { parseSkillEntries } from "@/lib/skill-levels";
import { resolveTemplateTheme, resolveTemplateVariant } from "@/lib/templates";
import { cn } from "@/lib/utils";

type CvLivePreviewProps = {
  profile: CvProfile;
  templateName: string;
};

const sectionHasVisibleItems = (section: CvSection) =>
  section.items.some((item) => item.visible && (item.title || item.subtitle || item.description));

const isSummarySection = (section: CvSection) =>
  section.type === "custom" && section.title.trim().toLowerCase() === "summary";

const bulletGlyph = (style: CvSection["style"]["bulletStyle"]) => {
  if (style === "square") return "■";
  if (style === "dash") return "-";
  return "•";
};

const skillLabel = (section: CvSection, value: string, suppressBullets = false) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (section.style.enableBullets && !suppressBullets) {
    return `${bulletGlyph(section.style.bulletStyle)} ${trimmed}`;
  }
  return trimmed;
};

const resolveLiveFontStack = (fontFamily: CvProfile["style"]["fontFamily"]) => {
  if (fontFamily === "serif") {
    return {
      headingFont: "\"Times New Roman\", Times, serif",
      bodyFont: "Georgia, \"Times New Roman\", Times, serif"
    };
  }
  if (fontFamily === "mono") {
    return {
      headingFont: "Menlo, Monaco, Consolas, \"Courier New\", monospace",
      bodyFont: "Menlo, Monaco, Consolas, \"Courier New\", monospace"
    };
  }
  if (fontFamily === "system-native") {
    return {
      headingFont: "ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
      bodyFont: "ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif"
    };
  }
  if (fontFamily === "product-modern") {
    return {
      headingFont: "\"Open Sans\", \"Dossier Body\", \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
      bodyFont: "\"Open Sans\", \"Dossier Body\", \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif"
    };
  }
  return {
    headingFont: "\"Dossier Heading\", sans-serif",
    bodyFont: "\"Dossier Body\", sans-serif"
  };
};

const templateTone = (templateId: string) => {
  if (templateId === "times-serif") {
    return {
      titleClass: "font-serif tracking-tight",
      sectionTitleClass: "font-serif text-base tracking-wide"
    };
  }

  if (templateId === "mono-minimal") {
    return {
      titleClass: "font-mono tracking-tight",
      sectionTitleClass: "font-mono text-sm uppercase tracking-[0.2em]"
    };
  }

  return {
    titleClass: "font-semibold tracking-tight",
    sectionTitleClass: "font-semibold text-sm uppercase tracking-[0.18em]"
  };
};

export default function CvLivePreview({ profile, templateName }: CvLivePreviewProps) {
  const variant = resolveTemplateVariant(profile.templateId);
  const theme = resolveTemplateTheme(profile.templateId);
  const tone = templateTone(variant);
  const isSkillsRightPink = variant === "skills-right-pink";
  const isSidebarTemplate =
    variant === "sidebar-light" ||
    variant === "sidebar-navy-right" ||
    variant === "sidebar-icons" ||
    variant === "sidebar-tan-dots" ||
    variant === "boxed-header-dots";
  const profileSummary = (profile.basics.summary || "").trim();
  const usesSkillDots =
    variant === "sidebar-tan-dots" ||
    variant === "boxed-header-dots";
  const usesSkillPills = theme === "operational-emerald";
  const summaryAlign = profile.style.summaryAlign ?? "left";
  const lineSpacing = profile.style.lineSpacing ?? 1.35;
  const accent = profile.style.accentColor || "#F43F5E";
  const { headingFont, bodyFont } = resolveLiveFontStack(profile.style.fontFamily);

  const renderRuns = (
    runs: InlineRun[],
    keyPrefix: string,
    base?: { bold?: boolean; italic?: boolean; underline?: boolean }
  ) =>
    runs.map((run, index) => (
      <span
        key={`${keyPrefix}-${index}`}
        style={{
          fontWeight: run.bold || base?.bold ? 600 : 400,
          fontStyle: run.italic || base?.italic ? "italic" : "normal",
          textDecorationLine: run.underline || base?.underline ? "underline" : "none"
        }}
      >
        {run.text}
      </span>
    ));

  const renderDescription = (
    item: CvSection["items"][number],
    section: CvSection,
    textClass = "text-muted-foreground"
  ) => {
    const blocks = parseDescriptionBlocks(item.description);
    if (blocks.length === 0) return null;

    let numberedIndex = 0;
    return (
      <div className="mt-1 space-y-1">
        {blocks.map((block, index) => {
          const bodySize = `${Math.max(11, section.style.bodyFontSize + 3)}px`;
          if (block.kind === "numbered") {
            numberedIndex += 1;
          } else {
            numberedIndex = 0;
          }

          if ((block.kind === "bullet" || block.kind === "numbered") && section.style.enableBullets) {
            return (
              <div key={`${item.id}-${index}`} className="flex items-start gap-2 min-w-0">
                <span className={cn("mt-0.5 shrink-0", textClass)} style={{ fontSize: bodySize }}>
                  {block.kind === "numbered" ? `${numberedIndex}.` : bulletGlyph(section.style.bulletStyle)}
                </span>
                <p
                  className={cn("break-words whitespace-pre-wrap min-w-0", textClass)}
                  style={{
                    fontSize: bodySize,
                    fontWeight: section.style.bulletBold ? 600 : 400,
                    fontStyle: section.style.bulletItalic ? "italic" : "normal",
                    lineHeight: lineSpacing,
                    textAlign: section.style.textAlign
                  }}
                >
                  {renderRuns(block.runs, `${item.id}-${index}`, {
                    bold: section.style.bulletBold,
                    italic: section.style.bulletItalic
                  })}
                </p>
              </div>
            );
          }

          return (
            <p
              key={`${item.id}-${index}`}
              className={cn("break-words whitespace-pre-wrap", textClass)}
              style={{
                fontSize: bodySize,
                fontWeight: block.kind === "heading" && section.style.headingBold ? 600 : 400,
                fontStyle: block.kind === "heading" && section.style.headingItalic ? "italic" : "normal",
                lineHeight: lineSpacing,
                textAlign: section.style.textAlign
              }}
            >
              {renderRuns(block.runs, `${item.id}-${index}`, {
                bold: block.kind === "heading" && section.style.headingBold,
                italic: block.kind === "heading" && section.style.headingItalic
              })}
            </p>
          );
        })}
      </div>
    );
  };

  if (variant === "sidebar-light") {
    const headline = (profile.basics.headline || "").trim();
    const summary = (profile.basics.summary || "").trim();
    const mainSections = profile.sections
      .filter(sectionHasVisibleItems)
      .filter((section) => !isSummarySection(section))
      .filter((section) => section.type !== "skills" && section.type !== "certifications");
    const skillSections = profile.sections
      .filter(sectionHasVisibleItems)
      .filter((section) => section.type === "skills");
    const certSections = profile.sections
      .filter(sectionHasVisibleItems)
      .filter((section) => section.type === "certifications");

    return (
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>{templateName}</CardDescription>
        </CardHeader>
        <CardContent>
          <article className="overflow-hidden rounded-xl border bg-background p-6" style={{ fontFamily: bodyFont }}>
            <header className="flex gap-4 pb-2">
              <div
                className="w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: accent, opacity: usesSkillPills ? 1 : 0.55 }}
              />
              <div className="min-w-0 flex-1">
                <h2
                  className="text-[44px] font-bold uppercase leading-[0.9] tracking-[0.06em] text-foreground"
                  style={{ fontFamily: headingFont }}
                >
                  {profile.basics.name || "Your Name"}
                </h2>
                {headline ? (
                  <p
                    className="mt-2 text-sm"
                    style={{ color: usesSkillPills ? accent : "rgb(100 116 139)" }}
                  >
                    {headline}
                  </p>
                ) : null}
              </div>
            </header>
            <div className="h-px w-full bg-border" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[188px_minmax(0,1fr)]">
              <aside className="space-y-4 p-3" style={{ backgroundColor: profile.style.sidebarColor }}>
                <section>
                  <h3 className="text-sm tracking-[0.16em] text-foreground" style={{ fontFamily: headingFont }}>
                    DETAILS
                  </h3>
                  <div className="mt-2 space-y-3 text-xs">
                    <div>
                      <p className="tracking-[0.12em] text-foreground/85" style={{ fontFamily: headingFont }}>ADDRESS</p>
                      <p className="mt-1 text-muted-foreground">{profile.basics.location || ""}</p>
                    </div>
                    <div>
                      <p className="tracking-[0.12em] text-foreground/85" style={{ fontFamily: headingFont }}>PHONE</p>
                      <p className="mt-1 text-muted-foreground">{profile.basics.phone || ""}</p>
                    </div>
                    <div>
                      <p className="tracking-[0.12em] text-foreground/85" style={{ fontFamily: headingFont }}>EMAIL</p>
                      <p className="mt-1 break-all text-muted-foreground">{profile.basics.email || ""}</p>
                    </div>
                  </div>
                </section>

                {skillSections.map((section) => (
                  <section key={section.id}>
                    <h3 className="text-sm tracking-[0.16em] text-foreground" style={{ fontFamily: headingFont }}>
                      SKILLS
                    </h3>
                    {usesSkillPills ? (
                      <div className="mt-2 space-y-3">
                        {section.items.filter((item) => item.visible !== false).map((item) => {
                          const entries = parseSkillEntries(item.description);
                          if (entries.length === 0) return null;
                          return (
                            <div key={item.id}>
                              {item.title ? (
                                <p
                                  className="text-[11px] uppercase tracking-[0.12em]"
                                  style={{ color: accent, fontFamily: headingFont }}
                                >
                                  {item.title}
                                </p>
                              ) : null}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {entries.map((entry, index) => (
                                  <span
                                    key={`${item.id}-${index}`}
                                    className="rounded-full border px-2.5 py-1 text-[11px] leading-none text-foreground"
                                    style={{ borderColor: `${accent}55`, backgroundColor: `${accent}14` }}
                                  >
                                    {entry.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {section.items
                          .filter((item) => item.visible !== false)
                          .flatMap((item) =>
                            parseSkillEntries(item.description).map((entry, index) => (
                              <div key={`${item.id}-${index}`}>
                                <p className="text-xs text-foreground">{skillLabel(section, entry.name)}</p>
                                <div className="mt-1 h-[3px] w-full bg-foreground/90" />
                              </div>
                            ))
                          )}
                      </div>
                    )}
                  </section>
                ))}

                {certSections.map((section) => (
                  <section key={section.id}>
                    <h3 className="text-sm tracking-[0.16em] text-foreground" style={{ fontFamily: headingFont }}>
                      {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                    </h3>
                    <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                      {section.items.filter((item) => item.visible !== false).map((item) => (
                        <div key={item.id}>
                          <p className="text-foreground">{item.title}</p>
                          {item.subtitle ? <p>{item.subtitle}</p> : null}
                          {item.dateRange ? <p>{formatDateRange(item.dateRange, profile.style.dateFormat)}</p> : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </aside>

              <div className="space-y-4">
                {summary ? (
                  <section>
                    <h3
                      className="text-lg uppercase tracking-[0.12em] text-foreground"
                      style={{ fontFamily: headingFont, color: usesSkillPills ? accent : undefined }}
                    >
                      Profile
                    </h3>
                    <div
                      className="mt-1 h-0.5 w-8"
                      style={{ backgroundColor: usesSkillPills ? accent : "rgba(15,23,42,0.85)" }}
                    />
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      <span style={{ display: "block", textAlign: summaryAlign, lineHeight: lineSpacing }}>{summary}</span>
                    </p>
                  </section>
                ) : null}

                {mainSections.map((section) => (
                  <section key={section.id}>
                    <h3
                      className="text-lg uppercase tracking-[0.12em] text-foreground"
                      style={{ fontFamily: headingFont, color: usesSkillPills ? accent : undefined }}
                    >
                      {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                    </h3>
                    <div
                      className="mt-1 h-0.5 w-8"
                      style={{ backgroundColor: usesSkillPills ? accent : "rgba(15,23,42,0.85)" }}
                    />
                    <div className="mt-2 space-y-3">
                      {section.items.filter((item) => item.visible !== false).map((item) => (
                        <div key={item.id}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="break-words font-semibold text-foreground">{item.title || "Role / Degree"}</p>
                              {item.subtitle ? <p className="break-words text-sm text-muted-foreground">{item.subtitle}</p> : null}
                            </div>
                            <p className="shrink-0 text-xs text-muted-foreground">
                              {formatDateRange(item.dateRange, profile.style.dateFormat) || "Date range"}
                            </p>
                          </div>
                          {renderDescription(item, section)}
                          {item.tags.length > 0 ? <p className="mt-1 text-xs text-muted-foreground">{item.tags.join(" • ")}</p> : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </article>
        </CardContent>
      </Card>
    );
  }

  if (variant === "sidebar-icons") {
    const headline = (profile.basics.headline || "").trim();
    const summary = (profile.basics.summary || "").trim();
    const mainSections = profile.sections
      .filter(sectionHasVisibleItems)
      .filter((section) => !isSummarySection(section))
      .filter((section) => section.type !== "skills");
    const skillSections = profile.sections
      .filter(sectionHasVisibleItems)
      .filter((section) => section.type === "skills");
    const sideContacts = [
      { icon: MapPin, value: profile.basics.location },
      { icon: Phone, value: profile.basics.phone },
      { icon: AtSign, value: profile.basics.email },
      { icon: Globe, value: profile.basics.url }
    ].filter((item) => item.value);

    const sectionIcon = (type: CvSection["type"]) => {
      if (type === "experience") return Briefcase;
      if (type === "education") return GraduationCap;
      return Sparkles;
    };

    return (
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>{templateName}</CardDescription>
        </CardHeader>
        <CardContent>
          <article className="overflow-hidden rounded-xl border bg-background p-6" style={{ fontFamily: bodyFont }}>
            <header className="text-center">
              <h2 className="text-5xl uppercase tracking-[0.05em] text-foreground" style={{ fontFamily: headingFont }}>
                {profile.basics.name || "Your Name"}
              </h2>
              {headline ? (
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground" style={{ fontFamily: headingFont }}>
                  {headline}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                {sideContacts.map((entry, idx) => {
                  const Icon = entry.icon;
                  return (
                    <span key={`${entry.value}-${idx}`} className="inline-flex items-center gap-1.5">
                      <Icon className="h-3 w-3" />
                      {entry.value}
                    </span>
                  );
                })}
              </div>
            </header>

            <div className="mt-4 grid gap-4 lg:grid-cols-[190px_1px_minmax(0,1fr)]">
              <aside className="space-y-4 p-3" style={{ backgroundColor: profile.style.sidebarColor }}>
                <section>
                  <h3 className="text-sm tracking-[0.16em] text-foreground" style={{ fontFamily: headingFont }}>
                    • DETAILS •
                  </h3>
                  <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                    {sideContacts.map((entry, idx) => {
                      const Icon = entry.icon;
                      return (
                        <p key={`${entry.value}-${idx}`} className="inline-flex items-center gap-1.5 break-words">
                          <Icon className="h-3 w-3" />
                          {entry.value}
                        </p>
                      );
                    })}
                  </div>
                </section>

                {skillSections.map((section) => (
                  <section key={section.id}>
                    <h3 className="text-sm tracking-[0.16em] text-foreground" style={{ fontFamily: headingFont }}>
                      • SKILLS •
                    </h3>
                    <div className="mt-2 space-y-2">
                      {section.items
                        .filter((item) => item.visible !== false)
                        .flatMap((item) =>
                          parseSkillEntries(item.description).map((entry, index) => (
                            <div key={`${item.id}-${index}`}>
                              <p className="text-xs text-foreground">{skillLabel(section, entry.name)}</p>
                              <div className="mt-1 h-[2px] w-full bg-foreground/70" />
                            </div>
                          ))
                        )}
                    </div>
                  </section>
                ))}
              </aside>

              <div className="bg-border" />

              <div className="space-y-4">
                {summary ? (
                  <section>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-foreground" />
                      <h3 className="text-lg uppercase tracking-[0.12em] text-foreground" style={{ fontFamily: headingFont }}>
                        Profile
                      </h3>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      <span style={{ display: "block", textAlign: summaryAlign, lineHeight: lineSpacing }}>{summary}</span>
                    </p>
                  </section>
                ) : null}

                {mainSections.map((section) => {
                  const Icon = sectionIcon(section.type);
                  return (
                    <section key={section.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-foreground" />
                        <h3 className="text-lg uppercase tracking-[0.12em] text-foreground" style={{ fontFamily: headingFont }}>
                          {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                        </h3>
                      </div>
                      <div className="mt-2 space-y-3">
                        {section.items.filter((item) => item.visible !== false).map((item) => (
                          <div key={item.id}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="break-words font-semibold text-foreground">{item.title || "Role / Degree"}</p>
                                {item.subtitle ? <p className="break-words text-sm text-muted-foreground">{item.subtitle}</p> : null}
                              </div>
                              <p className="shrink-0 text-xs text-muted-foreground">
                                {formatDateRange(item.dateRange, profile.style.dateFormat) || "Date range"}
                              </p>
                            </div>
                            {renderDescription(item, section)}
                            {item.tags.length > 0 ? <p className="mt-1 text-xs text-muted-foreground">{item.tags.join(" • ")}</p> : null}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </article>
        </CardContent>
      </Card>
    );
  }

  if (isSkillsRightPink) {
    const headline = (profile.basics.headline || "").trim();
    const summary = (profile.basics.summary || "").trim();
    const mainSections = profile.sections
      .filter(sectionHasVisibleItems)
      .filter((section) => !isSummarySection(section))
      .filter((section) => section.type !== "skills");
    const skillSections = profile.sections
      .filter(sectionHasVisibleItems)
      .filter((section) => section.type === "skills");

    return (
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>{templateName}</CardDescription>
        </CardHeader>
        <CardContent>
          <article className="overflow-hidden rounded-xl border bg-background p-6" style={{ fontFamily: bodyFont }}>
            <header>
              <h2 className="text-[38px] leading-tight text-foreground" style={{ color: accent, fontFamily: headingFont }}>
                {profile.basics.name || "Your Name"}
              </h2>
              {headline ? <p className="mt-1 text-sm" style={{ color: accent }}>{headline}</p> : null}
              <p className="mt-2 break-all text-xs text-muted-foreground">
                {(contactInline(profile, " • ") || "City, Country • email@example.com • +1 (555) 000-0000")
                  .replace(/\s+•\s+/g, " • ")}
              </p>
            </header>

            <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0 space-y-5">
                {summary ? (
                  <section>
                    <h3 className="border-b pb-1 text-lg uppercase tracking-[0.12em]" style={{ color: accent, borderBottomColor: accent, fontFamily: headingFont }}>
                      Profile
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      <span style={{ display: "block", textAlign: summaryAlign, lineHeight: lineSpacing }}>
                        {summary}
                      </span>
                    </p>
                  </section>
                ) : null}

                {mainSections.map((section) => (
                  <section key={section.id}>
                    <h3
                      className="border-b pb-1 text-lg uppercase tracking-[0.12em]"
                      style={{ color: accent, borderBottomColor: accent, fontFamily: headingFont }}
                    >
                      {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                    </h3>
                    <div className="mt-2 space-y-3">
                      {section.items
                        .filter((item) => item.visible !== false)
                        .map((item) => (
                          <div key={item.id} className="grid grid-cols-[86px_minmax(0,1fr)] gap-3">
                            <div className="text-[11px]" style={{ color: accent }}>
                              <p>{formatDateRange(item.dateRange, profile.style.dateFormat) || ""}</p>
                            </div>
                            <div>
                              <p className="break-words font-medium text-foreground">
                                {item.title || "Role / Degree"}
                              </p>
                              {item.subtitle ? (
                                <p className="break-words text-sm text-muted-foreground">{item.subtitle}</p>
                              ) : null}
                              {item.description ? (
                                renderDescription(item, section)
                              ) : null}
                              {item.tags.length > 0 ? (
                                <p className="mt-1 text-xs text-muted-foreground">{item.tags.join(" • ")}</p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                ))}
              </div>

              <aside className="space-y-3 rounded-xl p-3" style={{ backgroundColor: profile.style.sidebarColor }}>
                {skillSections.map((section) => (
                  <section key={section.id}>
                    <h3 className="text-lg uppercase tracking-[0.12em]" style={{ color: accent, fontFamily: headingFont }}>
                      {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                    </h3>
                    <div className="mt-2 space-y-2">
                      {section.items
                        .filter((item) => item.visible !== false)
                        .flatMap((item) =>
                          parseSkillEntries(item.description).map((entry, index) => (
                            <div key={`${item.id}-${index}`}>
                              <p className="text-sm text-foreground">{skillLabel(section, entry.name, true)}</p>
                              <div className="mt-1 flex items-center gap-1">
                                {Array.from({ length: 10 }).map((_, dotIndex) => (
                                  <span
                                    key={dotIndex}
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: dotIndex < entry.level * 2 ? accent : "rgba(244,63,94,0.18)" }}
                                  />
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                    </div>
                  </section>
                ))}
              </aside>
            </div>
          </article>
        </CardContent>
      </Card>
    );
  }

  if (variant === "legal-formal") {
    const headline = (profile.basics.headline || "").trim();
    const mainSections = profile.sections.filter(sectionHasVisibleItems).filter((s) => !isSummarySection(s));

    return (
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>{templateName}</CardDescription>
        </CardHeader>
        <CardContent>
          <article className="overflow-hidden rounded-xl border bg-background p-6 flex flex-row" style={{ fontFamily: bodyFont }}>
            <div className="w-1 mr-5 shrink-0" style={{ backgroundColor: accent }} />
            <div className="flex-1 min-w-0">
              <header className="pb-3 border-b" style={{ borderBottomColor: accent }}>
                <h2 className="text-3xl font-bold uppercase tracking-wide" style={{ color: accent, fontFamily: headingFont }}>
                  {profile.basics.name || "Your Name"}
                </h2>
                {headline ? (
                  <p className="mt-1 text-sm uppercase font-semibold text-muted-foreground" style={{ fontFamily: headingFont }}>
                    {headline}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground" style={{ fontFamily: bodyFont }}>
                  {contactInline(profile)}
                </p>
              </header>

              {profileSummary ? (
                <section className="mt-5">
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap" style={{ fontFamily: bodyFont }}>
                    {profileSummary}
                  </p>
                </section>
              ) : null}

              {mainSections.map((section) => (
                <section key={section.id} className="mt-6">
                  <div className="mb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: accent, fontFamily: headingFont }}>
                      {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                    </h3>
                    <div className="h-0.5 border-t border-b border-foreground w-full" />
                  </div>
                  
                  {section.type === "skills" || section.title.toLowerCase().includes("skills") ? (
                    <div className="mt-2">
                      <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: bodyFont }}>
                        {section.items.filter(item => item.visible !== false).map(item => (item.title || "").trim()).filter(Boolean).join(", ")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {section.items.filter(item => item.visible !== false).map((item) => (
                        <div key={item.id}>
                          <div className="flex flex-wrap justify-between items-baseline gap-2">
                            <div className="flex flex-wrap items-baseline gap-1.5">
                              <span className="font-bold text-foreground text-sm" style={{ fontFamily: headingFont }}>
                                {item.title || "Role"}
                              </span>
                              {item.subtitle ? (
                                <span className="text-sm text-muted-foreground" style={{ fontFamily: bodyFont }}>
                                  · {item.subtitle}
                                </span>
                              ) : null}
                            </div>
                            <span className="text-xs text-muted-foreground" style={{ fontFamily: bodyFont }}>
                              {formatDateRange(item.dateRange, profile.style.dateFormat)}
                            </span>
                          </div>
                          {item.description ? (
                            <div className="mt-1.5 text-sm text-foreground">
                              {renderDescription(item, section)}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </article>
        </CardContent>
      </Card>
    );
  }

  if (variant === "metrics-banner") {
    const headline = (profile.basics.headline || "").trim();
    const metricsSection = profile.sections.find((s) => s.title.toLowerCase().includes("metric") || s.title.toLowerCase().includes("highlight"));
    const mainSections = profile.sections.filter(sectionHasVisibleItems).filter(s => s.id !== metricsSection?.id && !isSummarySection(s));

    let metricBoxes: {label: string, value: string}[] = [];
    
    if (metricsSection && metricsSection.items.length > 0) {
      metricBoxes = metricsSection.items.filter(item => item.visible !== false).slice(0, 4).map(item => ({
        label: item.subtitle || "Metric",
        value: item.title || "0"
      }));
    } else {
      const expText = profile.sections.filter(s => s.type === "experience").flatMap(s => s.items).map(i => i.description).join(" ");
      const matches = expText.match(/(\d+%|\$\d+[MBK]?|\£\d+[MBK]?|\d+\+)/g) || [];
      const unique = [...new Set(matches)].slice(0, 3);
      metricBoxes = unique.map(val => ({ label: "HIGHLIGHT", value: val }));
    }

    return (
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>{templateName}</CardDescription>
        </CardHeader>
        <CardContent>
          <article className="overflow-hidden rounded-xl border bg-background p-8" style={{ fontFamily: bodyFont }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: headingFont }}>
                  {profile.basics.name || "Your Name"}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground" style={{ fontFamily: bodyFont }}>
                  {contactInline(profile)}
                </p>
              </div>
              {headline ? (
                <div className="text-sm font-medium" style={{ color: accent, fontFamily: headingFont }}>
                  {headline}
                </div>
              ) : null}
            </div>

            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
              {metricBoxes.map((box, i) => (
                <div key={i} className="flex-1 min-w-[80px] rounded-md border p-3 flex flex-col items-center justify-center text-center" style={{ borderColor: accent }}>
                  <div className="text-xl font-bold" style={{ color: accent, fontFamily: headingFont }}>{box.value}</div>
                  <div className="text-[10px] uppercase mt-1 text-muted-foreground" style={{ fontFamily: bodyFont }}>{box.label}</div>
                </div>
              ))}
            </div>

            {profileSummary ? (
              <section className="mb-6">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap" style={{ fontFamily: bodyFont }}>
                  {profileSummary}
                </p>
              </section>
            ) : null}

            {mainSections.map((section) => (
              <section key={section.id} className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-1" style={{ color: accent, borderBottomColor: accent, fontFamily: headingFont }}>
                  {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                </h3>
                {section.type === "skills" || section.title.toLowerCase().includes("skills") ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {section.items.filter(i => i.visible !== false).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs border rounded-full text-muted-foreground border-border bg-muted/20" style={{ fontFamily: bodyFont }}>
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 mt-3">
                    {section.items.filter(item => item.visible !== false).map((item) => (
                      <div key={item.id}>
                        <div className="flex flex-wrap justify-between items-baseline gap-2">
                          <div className="flex flex-wrap items-baseline gap-1.5">
                            <span className="font-bold text-foreground text-sm" style={{ fontFamily: headingFont }}>
                              {item.title || "Role"}
                            </span>
                            {item.subtitle ? (
                              <span className="text-sm text-muted-foreground" style={{ fontFamily: headingFont }}>
                                · {item.subtitle}
                              </span>
                            ) : null}
                          </div>
                          <span className="text-xs text-muted-foreground" style={{ fontFamily: bodyFont }}>
                            {formatDateRange(item.dateRange, profile.style.dateFormat)}
                          </span>
                        </div>
                        {item.description ? (
                          <div className="mt-1.5 text-sm text-foreground">
                            {renderDescription(item, section)}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </article>
        </CardContent>
      </Card>
    );
  }

  if (variant === "campaign-cards") {
    const headline = (profile.basics.headline || "").trim();
    const isCampaign = (title: string) => {
      const lower = title.toLowerCase();
      return lower.includes("campaign") || lower.includes("portfolio") || lower.includes("highlight");
    };
    
    const visibleSections = profile.sections.filter(sectionHasVisibleItems).filter(s => !isSummarySection(s));
    const railSections = visibleSections.filter((s) => s.type === "skills" || s.title.toLowerCase().includes("skills") || isCampaign(s.title));
    const mainSections = visibleSections.filter((s) => !railSections.includes(s));

    return (
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>{templateName}</CardDescription>
        </CardHeader>
        <CardContent>
          <article className="overflow-hidden rounded-xl border bg-background p-6 lg:p-8" style={{ fontFamily: bodyFont }}>
            <header className="flex flex-col items-center text-center mb-6">
              <h2 className="text-3xl font-extrabold text-foreground tracking-wide" style={{ fontFamily: headingFont }}>
                {profile.basics.name || "Your Name"}
              </h2>
              {headline ? (
                <p className="mt-1 text-sm font-semibold tracking-wider uppercase" style={{ color: accent, fontFamily: headingFont }}>
                  {headline}
                </p>
              ) : null}
              <div className="w-12 h-0.5 my-3" style={{ backgroundColor: accent }} />
              <p className="text-xs text-muted-foreground" style={{ fontFamily: bodyFont }}>
                {contactInline(profile)}
              </p>
            </header>

            {profileSummary ? (
              <section className="mb-8 px-4 sm:px-8">
                <p className="text-sm leading-relaxed text-muted-foreground text-center whitespace-pre-wrap" style={{ fontFamily: bodyFont }}>
                  {profileSummary}
                </p>
              </section>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8">
              <div className="space-y-6">
                {mainSections.map((section) => (
                  <section key={section.id}>
                    <div className="inline-block px-3 py-1 rounded-lg mb-4" style={{ backgroundColor: accent }}>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-white" style={{ fontFamily: headingFont }}>
                        {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                      </h3>
                    </div>
                    
                    <div className="space-y-5">
                      {section.items.filter(item => item.visible !== false).map((item) => (
                        <div key={item.id}>
                          <h4 className="font-bold text-foreground text-base" style={{ fontFamily: headingFont }}>
                            {item.title || "Role"}
                          </h4>
                          <div className="flex justify-between items-baseline mt-0.5">
                            <span className="text-sm text-muted-foreground" style={{ fontFamily: bodyFont }}>
                              {item.subtitle}
                            </span>
                            <span className="text-xs text-muted-foreground" style={{ fontFamily: bodyFont }}>
                              {formatDateRange(item.dateRange, profile.style.dateFormat)}
                            </span>
                          </div>
                          {item.description ? (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {renderDescription(item, section)}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <aside className="space-y-6">
                {railSections.map((section) => {
                  const isCampaignSection = isCampaign(section.title);
                  return (
                    <section key={section.id}>
                      <h3 className="text-xs font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ fontFamily: headingFont, borderBottomColor: "hsl(var(--border))" }}>
                        {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                      </h3>
                      
                      {isCampaignSection ? (
                        <div className="space-y-3">
                          {section.items.filter(item => item.visible !== false).map((item) => (
                            <div key={item.id} className="bg-muted/30 border rounded-lg p-3">
                              <h4 className="text-sm font-bold" style={{ color: accent, fontFamily: headingFont }}>{item.title}</h4>
                              {item.subtitle ? (
                                <p className="text-xs mt-1 font-semibold text-foreground" style={{ fontFamily: headingFont }}>{item.subtitle}</p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {section.items.filter(item => item.visible !== false).map((item) => (
                            <span key={item.id} className="px-2 py-1 text-[10px] border rounded bg-background" style={{ borderColor: accent, color: accent, fontFamily: bodyFont }}>
                              {item.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </aside>
            </div>
          </article>
        </CardContent>
      </Card>
    );
  }

  if (variant === "people-soft") {
    const headline = (profile.basics.headline || "").trim();
    const mainSections = profile.sections.filter(sectionHasVisibleItems).filter((s) => !isSummarySection(s));
    const accent = profile.style.accentColor || "#0D9488";

    return (
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>{templateName}</CardDescription>
        </CardHeader>
        <CardContent>
          <article className="overflow-hidden rounded-xl border bg-background p-10 pt-10 font-sans" style={{ fontFamily: headingFont }}>
            <header className="text-center mb-8">
              <h2 className="text-2xl font-normal tracking-wide text-gray-900">{profile.basics.name || "Your Name"}</h2>
              {headline ? (
                <p className="mt-1.5 text-[13px] tracking-wide" style={{ color: accent, fontFamily: bodyFont }}>
                  {headline}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-gray-500" style={{ fontFamily: bodyFont }}>
                {contactInline(profile)}
              </p>
            </header>

            {profile.basics.summary && profile.basics.summary.trim().length > 0 ? (
              <section className="mb-8 p-4 bg-gray-50 rounded text-center">
                <p className="text-sm leading-relaxed text-gray-700" style={{ fontFamily: bodyFont }}>
                  {profile.basics.summary}
                </p>
              </section>
            ) : null}

            <div className="space-y-8">
              {mainSections.map((section) => (
                <section key={section.id}>
                  <h3 className="mb-4 pb-2 border-b uppercase tracking-widest text-xs font-medium text-center" style={{ color: accent, borderColor: accent }}>
                    {section.title}
                  </h3>
                  
                  {section.title.toLowerCase().includes("skills") || section.type === "skills" ? (
                    <div className="text-center text-sm text-gray-700 leading-relaxed" style={{ fontFamily: bodyFont }}>
                      {section.items.filter(i => i.visible !== false).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).join("  •  ")}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {section.items.filter(item => item.visible !== false).map((item) => (
                        <div key={item.id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="text-[13px] font-medium text-gray-900">{item.title}</h4>
                            {item.dateRange ? (
                              <span className="text-xs text-gray-500" style={{ fontFamily: bodyFont }}>{formatDateRange(item.dateRange, profile.style.dateFormat)}</span>
                            ) : null}
                          </div>
                          {item.subtitle ? (
                            <div className="text-xs font-medium mb-2" style={{ color: accent }}>{item.subtitle}</div>
                          ) : null}
                          {item.description ? (
                            <div className="text-xs leading-relaxed text-gray-700 mt-1" style={{ fontFamily: bodyFont }}>
                              {renderDescription(item, section)}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </article>
        </CardContent>
      </Card>
    );
  }

  if (variant === "scanner-compact") {
    const headline = (profile.basics.headline || "").trim();
    const mainSections = profile.sections.filter(sectionHasVisibleItems).filter((s) => !isSummarySection(s));
    const accent = profile.style.accentColor || "#4F46E5";

    return (
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>{templateName}</CardDescription>
        </CardHeader>
        <CardContent>
          <article className="overflow-hidden rounded-xl border bg-background p-8 font-sans" style={{ fontFamily: headingFont }}>
            <header className="mb-5 pl-4 border-l-4" style={{ borderColor: accent }}>
              <h2 className="text-2xl font-medium uppercase tracking-wide text-gray-900">{profile.basics.name || "Your Name"}</h2>
              {headline ? (
                <p className="mt-1 text-[13px] uppercase tracking-wide text-gray-600">
                  {headline}
                </p>
              ) : null}
              <p className="mt-2 text-[11px] text-gray-500" style={{ fontFamily: bodyFont }}>
                {contactInline(profile)}
              </p>
            </header>

            {profile.basics.summary && profile.basics.summary.trim().length > 0 ? (
              <section className="mb-4">
                <p className="text-xs leading-relaxed text-gray-900" style={{ fontFamily: bodyFont }}>
                  {profile.basics.summary}
                </p>
              </section>
            ) : null}

            <div className="grid grid-cols-1 gap-y-4">
              {mainSections.map((section) => (
                <section key={section.id}>
                  <div className="bg-gray-100 py-1.5 px-2 mb-3">
                    <h3 className="uppercase tracking-widest text-[11px] font-medium text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  
                  {section.title.toLowerCase().includes("skills") || section.type === "skills" ? (
                    <div className="flex flex-wrap gap-2 px-2">
                      {section.items.filter(i => i.visible !== false).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).map((name, idx) => (
                        <span key={idx} className="text-[10px] font-medium uppercase" style={{ color: accent }}>
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2 px-2">
                      {section.items.filter(item => item.visible !== false).map((item) => (
                        <div key={item.id} className="py-1">
                          <div className="flex justify-between items-baseline">
                            <div className="flex items-baseline">
                              <h4 className="text-xs font-medium text-gray-900">{item.title}</h4>
                              {item.subtitle ? (
                                <span className="text-[11px] text-gray-600 ml-2" style={{ fontFamily: bodyFont }}>| {item.subtitle}</span>
                              ) : null}
                            </div>
                            {item.dateRange ? (
                              <span className="text-[10px] font-medium" style={{ color: accent }}>{formatDateRange(item.dateRange, profile.style.dateFormat)}</span>
                            ) : null}
                          </div>
                          {item.description ? (
                            <div className="text-[11px] leading-relaxed text-gray-700 mt-1" style={{ fontFamily: bodyFont }}>
                              {renderDescription(item, section)}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </article>
        </CardContent>
      </Card>
    );
  }

  if (variant === "process-left") {
    const headline = (profile.basics.headline || "").trim();
    const accent = profile.style.accentColor || "#475569";
    
    const visibleSections = profile.sections.filter(sectionHasVisibleItems);
    const railSections = visibleSections.filter((s) => s.type === "skills" || s.type === "certifications" || s.title.toLowerCase().includes("skills"));
    const mainSections = visibleSections.filter((s) => !railSections.includes(s) && !isSummarySection(s));

    return (
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>{templateName}</CardDescription>
        </CardHeader>
        <CardContent>
          <article className="overflow-hidden rounded-xl border bg-background p-8 font-sans" style={{ fontFamily: headingFont }}>
            <header className="mb-6 pb-4 border-b-2" style={{ borderColor: accent }}>
              <h2 className="text-3xl font-medium tracking-tight text-gray-900">{profile.basics.name || "Your Name"}</h2>
              {headline ? (
                <p className="mt-1.5 text-sm font-medium" style={{ color: accent }}>
                  {headline}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-gray-500" style={{ fontFamily: bodyFont }}>
                {contactInline(profile)}
              </p>
            </header>

            {profile.basics.summary && profile.basics.summary.trim().length > 0 ? (
              <section className="mb-6 pl-3 border-l-2 border-gray-200">
                <p className="text-xs leading-relaxed text-gray-700" style={{ fontFamily: bodyFont }}>
                  {profile.basics.summary}
                </p>
              </section>
            ) : null}

            <div className="flex gap-6">
              <aside className="w-[30%] space-y-6">
                {railSections.map((section) => (
                  <section key={section.id}>
                    <h3 className="uppercase tracking-widest text-[11px] font-medium mb-3" style={{ color: accent }}>
                      {section.title}
                    </h3>
                    <div className="space-y-2">
                      {section.items.filter(item => item.visible !== false).map((item) => (
                        <div key={item.id}>
                          <h4 className="text-[11px] font-medium text-gray-900">{item.title}</h4>
                          {item.subtitle ? (
                            <div className="text-[10px] text-gray-500 mt-0.5" style={{ fontFamily: bodyFont }}>{item.subtitle}</div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </aside>

              <div className="w-[70%] border-l pl-5 border-gray-200 space-y-6">
                {mainSections.map((section) => (
                  <section key={section.id}>
                    <h3 className="uppercase tracking-wide text-sm font-medium text-gray-900 mb-4">
                      {section.title}
                    </h3>
                    
                    <div className="space-y-5">
                      {section.items.filter(item => item.visible !== false).map((item) => (
                        <div key={item.id} className="relative">
                          {/* Process node / dot */}
                          <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent }} />
                          
                          <h4 className="text-[13px] font-medium text-gray-900">{item.title}</h4>
                          <div className="flex justify-between items-baseline mt-0.5 mb-1.5">
                            {item.subtitle ? (
                              <span className="text-[11px] font-medium" style={{ color: accent, fontFamily: bodyFont }}>{item.subtitle}</span>
                            ) : <span />}
                            {item.dateRange ? (
                              <span className="text-[10px] text-gray-400" style={{ fontFamily: bodyFont }}>{formatDateRange(item.dateRange, profile.style.dateFormat)}</span>
                            ) : null}
                          </div>
                          {item.description ? (
                            <div className="text-xs leading-relaxed text-gray-600 mt-1" style={{ fontFamily: bodyFont }}>
                              {renderDescription(item, section)}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </article>
        </CardContent>
      </Card>
    );
  }

  if (variant === "credentials-top") {
    const headline = profile.basics.headline?.trim();
    const contact = contactInline(profile);
    const accent = profile.style.accentColor || "#1E3A8A";
    const { headingFont, bodyFont } = resolveLiveFontStack(profile.style.fontFamily);
    
    const sections = profile.sections.filter(sectionHasVisibleItems).filter((s) => !isSummarySection(s));
    const certsSection = sections.find((s) => s.type === "certifications" || s.title.toLowerCase().includes("licens") || s.title.toLowerCase().includes("cert"));
    const otherSections = sections.filter((s) => s.id !== certsSection?.id);
    const orderedSections = certsSection ? [certsSection, ...otherSections] : sections;

    return (
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>{templateName}</CardDescription>
        </CardHeader>
        <CardContent>
          <article className="overflow-hidden rounded-xl border bg-background text-foreground" style={{ padding: "40px" }}>
            <div style={{ borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingBottom: 16, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h1 style={{ fontFamily: headingFont, fontSize: "2rem", color: accent, textTransform: "uppercase", lineHeight: 1.1 }}>
                  {profile.basics.name || "Your Name"}
                </h1>
                {headline ? (
                  <p style={{ fontFamily: headingFont, fontSize: "1rem", color: "#4B5563", marginTop: 8, textTransform: "uppercase" }}>
                    {headline}
                  </p>
                ) : null}
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.85rem", color: "#6B7280", fontFamily: bodyFont, width: "300px" }}>
                  {contact}
                </p>
              </div>
            </div>

            {profileSummary ? (
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "#111827", fontFamily: bodyFont }}>{profileSummary}</p>
              </div>
            ) : null}

            {orderedSections.map((section) => (
              <section key={section.id} style={{ marginBottom: 24 }}>
                <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: 4, marginBottom: 16 }}>
                  <h2 style={{ fontSize: "1.1rem", fontFamily: headingFont, color: accent, textTransform: "uppercase", letterSpacing: 1, fontWeight: "bold" }}>
                    {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                  </h2>
                </div>
                {section.type === "skills" || section.title.toLowerCase().includes("skills") ? (
                  <div style={{ padding: "0 12px" }}>
                    <p style={{ fontSize: "0.95rem", color: "#374151", fontFamily: bodyFont, lineHeight: 1.6 }}>
                      {section.items.filter(i => i.visible !== false).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).join("  |  ")}
                    </p>
                  </div>
                ) : (
                  section.items.map((item) => (
                    <div key={item.id} style={{ padding: "0 12px", marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                        <h3 style={{ fontSize: "1.1rem", fontFamily: headingFont, color: "#111827" }}>
                          {item.title || ""}
                        </h3>
                        {item.dateRange ? (
                          <span style={{ fontSize: "0.95rem", fontFamily: headingFont, color: accent }}>
                            {formatDateRange(item.dateRange, profile.style.dateFormat)}
                          </span>
                        ) : null}
                      </div>
                      {item.subtitle ? (
                        <p style={{ fontSize: "1rem", fontFamily: bodyFont, color: "#4B5563", marginBottom: 8 }}>
                          {item.subtitle}
                        </p>
                      ) : null}
                      {item.description ? (
                        <div style={{ fontSize: "0.95rem", color: "#111827", lineHeight: 1.5, fontFamily: bodyFont }}>
                          {renderDescription(item, section)}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </section>
            ))}
          </article>
        </CardContent>
      </Card>
    );
  }

  if (variant === "academic-traditional") {
    const headline = profile.basics.headline?.trim();
    const contact = contactInline(profile, "  |  ");
    const accent = profile.style.accentColor || "#7F1D1D"; // academic-burgundy
    const { headingFont, bodyFont } = resolveLiveFontStack(profile.style.fontFamily);

    return (
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>{templateName}</CardDescription>
        </CardHeader>
        <CardContent>
          <article className="overflow-hidden rounded-xl border bg-background text-foreground" style={{ padding: "48px 64px" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{ fontFamily: headingFont, fontSize: "2.25rem", color: "#111827", lineHeight: 1.1 }}>
                {profile.basics.name || "Your Name"}
              </h1>
              {headline ? (
                <p style={{ fontFamily: headingFont, fontSize: "1.25rem", color: accent, marginTop: 8 }}>
                  {headline}
                </p>
              ) : null}
              <p style={{ fontSize: "0.9rem", color: "#4B5563", marginTop: 12, fontFamily: bodyFont }}>
                {contact}
              </p>
            </div>

            {profileSummary ? (
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: "1rem", lineHeight: 1.6, color: "#111827", fontFamily: bodyFont }}>{profileSummary}</p>
              </div>
            ) : null}

            {profile.sections.filter(sectionHasVisibleItems).filter((s) => !isSummarySection(s)).map((section) => (
              <section key={section.id} style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 12, textAlign: "center" }}>
                  <h2 style={{ fontSize: "1.2rem", fontFamily: headingFont, color: accent, textTransform: "uppercase", letterSpacing: 1 }}>
                    {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                  </h2>
                </div>
                {section.type === "skills" || section.title.toLowerCase().includes("skills") ? (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "1rem", color: "#374151", fontFamily: bodyFont, lineHeight: 1.6 }}>
                      {section.items.filter(i => i.visible !== false).flatMap(i => [i.title, ...parseSkillEntries(i.description).map(e => e.name)].filter(Boolean)).join("  •  ")}
                    </p>
                  </div>
                ) : (
                  section.items.map((item) => (
                    <div key={item.id} style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                        <h3 style={{ fontSize: "1.1rem", fontFamily: headingFont, color: "#111827" }}>
                          {item.title || ""}
                        </h3>
                        {item.dateRange ? (
                          <span style={{ fontSize: "0.95rem", fontFamily: bodyFont, color: "#374151" }}>
                            {formatDateRange(item.dateRange, profile.style.dateFormat)}
                          </span>
                        ) : null}
                      </div>
                      {item.subtitle ? (
                        <p style={{ fontSize: "1rem", fontFamily: bodyFont, fontStyle: "italic", color: "#111827", marginBottom: 6 }}>
                          {item.subtitle}
                        </p>
                      ) : null}
                      {item.description ? (
                        <div style={{ fontSize: "1rem", color: "#374151", lineHeight: 1.6, fontFamily: bodyFont }}>
                          {renderDescription(item, section)}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </section>
            ))}
          </article>
        </CardContent>
      </Card>
    );
  }

  if (variant === "mission-impact") {
    const headline = profile.basics.headline?.trim();
    const contact = contactInline(profile);
    const accent = profile.style.accentColor || "#166534"; // mission-forest
    const sidebarBg = profile.style.sidebarColor || "#F0FDF4";
    const { headingFont, bodyFont } = resolveLiveFontStack(profile.style.fontFamily);
    
    const sections = profile.sections.filter(sectionHasVisibleItems).filter((s) => !isSummarySection(s));
    const sidebarSections = sections.filter((s) => s.type === "skills" || s.type === "certifications" || s.title.toLowerCase().includes("skills") || s.title.toLowerCase().includes("award"));
    const mainSections = sections.filter((s) => !sidebarSections.includes(s));

    return (
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>{templateName}</CardDescription>
        </CardHeader>
        <CardContent>
          <article className="overflow-hidden rounded-xl border bg-background text-foreground flex">
            <div style={{ width: "32%", backgroundColor: sidebarBg, padding: "32px 24px", minHeight: "100%" }}>
              
              <h1 style={{ fontFamily: headingFont, fontSize: "1.75rem", color: accent, marginBottom: 8, letterSpacing: -0.5, lineHeight: 1.1 }}>
                {profile.basics.name || "Your Name"}
              </h1>
              {headline ? (
                <p style={{ fontFamily: headingFont, fontSize: "1.1rem", color: "#111827", marginBottom: 16 }}>
                  {headline}
                </p>
              ) : null}
              <p style={{ fontSize: "0.9rem", color: "#4B5563", fontFamily: bodyFont, marginBottom: 32, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {contactInline(profile, "\n")}
              </p>
              
              {sidebarSections.map((section) => (
                <div key={section.id} style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: accent, paddingBottom: 6 }}>
                    <h2 style={{ fontSize: "1rem", fontFamily: headingFont, color: accent, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                    </h2>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {section.items.map((item) => (
                      <div key={item.id}>
                        <h3 style={{ fontSize: "0.95rem", fontFamily: headingFont, color: "#111827" }}>{item.title || ""}</h3>
                        {item.subtitle ? (
                          <p style={{ fontSize: "0.85rem", fontFamily: bodyFont, color: "#4B5563", marginTop: 2 }}>{item.subtitle}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ width: "68%", padding: "40px" }}>
              {profileSummary ? (
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: "1.25rem", fontFamily: headingFont, color: accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Our Mission</h2>
                  <p style={{ fontSize: "1.05rem", lineHeight: 1.6, color: "#374151", fontFamily: bodyFont }}>{profileSummary}</p>
                </div>
              ) : null}

              {mainSections.map((section) => (
                <section key={section.id} style={{ marginBottom: 32 }}>
                  <div style={{ marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingBottom: 8 }}>
                    <h2 style={{ fontSize: "1.25rem", fontFamily: headingFont, color: accent, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                    </h2>
                  </div>
                  {section.items.map((item) => (
                    <div key={item.id} style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                        <h3 style={{ fontSize: "1.1rem", fontFamily: headingFont, color: "#111827" }}>
                          {item.title || ""}
                        </h3>
                        {item.dateRange ? (
                          <span style={{ fontSize: "0.95rem", fontFamily: bodyFont, color: "#6B7280" }}>
                            {formatDateRange(item.dateRange, profile.style.dateFormat)}
                          </span>
                        ) : null}
                      </div>
                      {item.subtitle ? (
                        <p style={{ fontSize: "1rem", fontFamily: headingFont, color: "#4B5563", marginBottom: 8 }}>
                          {item.subtitle}
                        </p>
                      ) : null}
                      {item.description ? (
                        <div style={{ fontSize: "0.95rem", color: "#374151", lineHeight: 1.6, fontFamily: bodyFont }}>
                          {renderDescription(item, section)}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </section>
              ))}
            </div>
          </article>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
        <CardDescription>{templateName}</CardDescription>
      </CardHeader>
      <CardContent>
        <article className="overflow-hidden rounded-xl border bg-background p-6">
          <header className={cn("pb-4 border-b")}>
            <h2 className={cn("text-2xl", tone.titleClass)}>{profile.basics.name || "Your Name"}</h2>
            {profile.basics.headline ? (
              <p className="mt-1 text-sm text-muted-foreground">{profile.basics.headline}</p>
            ) : null}
            {!isSidebarTemplate ? (
              <p className="mt-2 break-words text-sm text-muted-foreground">
                <span style={{ display: "block", textAlign: summaryAlign, lineHeight: lineSpacing }}>
                  {profile.basics.summary || "Your professional summary will appear here."}
                </span>
              </p>
            ) : null}
            {!isSidebarTemplate ? (
              <p className="mt-3 break-all text-xs text-muted-foreground">
                {(contactInline(profile, " • ") || "City, Country • email@example.com • +1 (555) 000-0000")
                  .replace(/\s+•\s+/g, " • ")}
              </p>
            ) : null}
          </header>

          <div
            className={cn(
              "mt-4 gap-6",
              isSidebarTemplate ? "grid grid-cols-[180px_minmax(0,1fr)]" : "block"
            )}
          >
            {isSidebarTemplate ? (
              <aside className="space-y-4">
                <section>
                  <h3 className={cn("text-foreground", tone.sectionTitleClass)}>Details</h3>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {contactLines(profile).map((line) => (
                      <p key={line.kind} className="break-words">
                        {line.value}
                      </p>
                    ))}
                  </div>
                </section>
                {profile.sections
                  .filter(sectionHasVisibleItems)
                  .filter((section) => section.type === "skills")
                  .map((section) => (
                    <section key={section.id}>
                      <h3
                        className={cn("text-foreground", tone.sectionTitleClass)}
                        style={{
                          fontSize: `${Math.max(13, section.style.titleFontSize + 4)}px`,
                          textTransform: section.style.uppercaseTitle ? "uppercase" : "none",
                          borderBottom: section.style.showDivider ? "1px solid hsl(var(--border))" : "none",
                          paddingBottom: section.style.showDivider ? "0.25rem" : 0
                        }}
                      >
                        {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                      </h3>
                      <div className="mt-2 space-y-2">
                        {section.items
                          .filter((item) => item.visible !== false)
                          .map((item) => (
                            <div key={item.id}>
                              {item.title ? <p className="text-sm font-medium">{item.title}</p> : null}
                              <div className="mt-1 space-y-2">
                                {parseSkillEntries(item.description).map((entry, index) => (
                                  <div key={`${item.id}-${index}`}>
                                    <p
                                      className="text-muted-foreground"
                                      style={{ fontSize: `${Math.max(11, section.style.bodyFontSize + 3)}px` }}
                                    >
                                      {skillLabel(section, entry.name, usesSkillDots)}
                                    </p>
                                    {usesSkillDots ? (
                                      <div className="mt-1 flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, dotIndex) => (
                                          <span
                                            key={dotIndex}
                                            className={cn(
                                              "h-1.5 w-1.5 rounded-full",
                                              dotIndex < entry.level
                                                ? "bg-foreground"
                                                : "bg-muted-foreground/30"
                                            )}
                                          />
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </section>
                  ))}
              </aside>
            ) : null}

            <div className="min-w-0 space-y-5">
              {isSidebarTemplate && profileSummary ? (
                <section>
                  <h3 className={cn("text-foreground", tone.sectionTitleClass)}>Profile</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                    <span style={{ display: "block", textAlign: summaryAlign, lineHeight: lineSpacing }}>
                      {profileSummary}
                    </span>
                  </p>
                </section>
              ) : null}
              {profile.sections
                .filter(sectionHasVisibleItems)
                .filter((section) => !isSummarySection(section))
                .filter((section) => (isSidebarTemplate ? section.type !== "skills" : true))
                .map((section) => (
                  <section key={section.id}>
                    <h3
                      className={cn("text-foreground", tone.sectionTitleClass)}
                      style={{
                        fontSize: `${Math.max(13, section.style.titleFontSize + 4)}px`,
                        textTransform: section.style.uppercaseTitle ? "uppercase" : "none",
                        borderBottom: section.style.showDivider ? "1px solid hsl(var(--border))" : "none",
                        paddingBottom: section.style.showDivider ? "0.25rem" : 0
                      }}
                    >
                      {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                    </h3>
                    {section.type === "skills" || section.title.toLowerCase().includes("skills") ? (
                      <div
                        className="mt-2 grid gap-x-4 gap-y-2"
                        style={{
                          gridTemplateColumns: `repeat(${Math.max(2, section.style.skillsColumns)}, minmax(0, 1fr))`
                        }}
                      >
                        {section.items
                          .filter((item) => item.visible !== false)
                          .flatMap((item, itemIndex) =>
                            parseSkillEntries(item.description).map((entry, entryIndex) => (
                              <p
                                key={`${item.id}-${itemIndex}-${entryIndex}`}
                                className="break-words text-muted-foreground"
                                style={{ fontSize: `${Math.max(11, section.style.bodyFontSize + 3)}px` }}
                              >
                                {skillLabel(section, entry.name)}
                              </p>
                            ))
                          )}
                      </div>
                    ) : (
                      <div className="mt-2 space-y-3">
                        {section.items
                          .filter((item) => item.visible !== false)
                          .map((item) => (
                            <div key={item.id}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="break-words font-medium text-foreground"
                                    style={{ fontSize: `${Math.max(12, section.style.bodyFontSize + 4)}px` }}
                                  >
                                    {item.title || "Role / Degree"}
                                  </p>
                                  <p
                                    className="break-words text-muted-foreground"
                                    style={{ fontSize: `${Math.max(11, section.style.bodyFontSize + 3)}px` }}
                                  >
                                    {item.subtitle || "Company / School"}
                                  </p>
                                </div>
                                <p
                                  className="shrink-0 text-right text-muted-foreground"
                                  style={{ fontSize: `${Math.max(10, section.style.bodyFontSize + 2)}px` }}
                                >
                                  {formatDateRange(item.dateRange, profile.style.dateFormat) || "Date range"}
                                </p>
                              </div>
                              {renderDescription(item, section)}
                              {item.tags.length > 0 ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {item.tags.join(" • ")}
                                </p>
                              ) : null}
                            </div>
                          ))}
                      </div>
                    )}
                  </section>
                ))}
            </div>
          </div>
        </article>
      </CardContent>
    </Card>
  );
}
