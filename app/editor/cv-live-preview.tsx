import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AtSign, Briefcase, Globe, GraduationCap, MapPin, Phone, Sparkles } from "lucide-react";
import type { CvProfile, CvSection } from "@/lib/cv-profile";
import { contactInline, contactLines } from "@/lib/contact";
import { formatDateRange } from "@/lib/date-format";
import { parseDescriptionBlocks, type InlineRun } from "@/lib/description-format";
import { parseSkillEntries } from "@/lib/skill-levels";
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
  const tone = templateTone(profile.templateId);
  const isSkillsRightPink = profile.templateId === "skills-right-pink";
  const isSidebarTemplate =
    profile.templateId === "sidebar-light" ||
    profile.templateId === "sidebar-navy-right" ||
    profile.templateId === "sidebar-icons" ||
    profile.templateId === "sidebar-tan-dots" ||
    profile.templateId === "boxed-header-dots";
  const profileSummary = (profile.basics.summary || "").trim();
  const usesSkillDots =
    profile.templateId === "sidebar-tan-dots" ||
    profile.templateId === "boxed-header-dots";
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
              <div key={`${item.id}-${index}`} className="flex items-start gap-2">
                <span className={cn("mt-0.5", textClass)} style={{ fontSize: bodySize }}>
                  {block.kind === "numbered" ? `${numberedIndex}.` : bulletGlyph(section.style.bulletStyle)}
                </span>
                <p
                  className={cn("break-words whitespace-pre-wrap", textClass)}
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

  if (profile.templateId === "sidebar-light") {
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
            <header className="pb-2">
              <h2
                className="text-[44px] font-bold uppercase leading-[0.9] tracking-[0.06em] text-foreground"
                style={{ fontFamily: headingFont }}
              >
                {profile.basics.name || "Your Name"}
              </h2>
              {headline ? <p className="mt-2 text-sm text-muted-foreground">{headline}</p> : null}
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
                    <div className="mt-2 space-y-2">
                      {section.items
                        .filter((item) => item.visible)
                        .flatMap((item) =>
                          parseSkillEntries(item.description).map((entry, index) => (
                            <div key={`${item.id}-${index}`}>
                              <p className="text-xs text-foreground">{entry.name}</p>
                              <div className="mt-1 h-[3px] w-full bg-foreground/90" />
                            </div>
                          ))
                        )}
                    </div>
                  </section>
                ))}

                {certSections.map((section) => (
                  <section key={section.id}>
                    <h3 className="text-sm tracking-[0.16em] text-foreground" style={{ fontFamily: headingFont }}>
                      {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                    </h3>
                    <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                      {section.items.filter((item) => item.visible).map((item) => (
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
                    <h3 className="text-lg uppercase tracking-[0.12em] text-foreground" style={{ fontFamily: headingFont }}>
                      Profile
                    </h3>
                    <div className="mt-1 h-0.5 w-8 bg-foreground/85" />
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      <span style={{ display: "block", textAlign: summaryAlign, lineHeight: lineSpacing }}>{summary}</span>
                    </p>
                  </section>
                ) : null}

                {mainSections.map((section) => (
                  <section key={section.id}>
                    <h3 className="text-lg uppercase tracking-[0.12em] text-foreground" style={{ fontFamily: headingFont }}>
                      {section.style.uppercaseTitle ? section.title.toUpperCase() : section.title}
                    </h3>
                    <div className="mt-1 h-0.5 w-8 bg-foreground/85" />
                    <div className="mt-2 space-y-3">
                      {section.items.filter((item) => item.visible).map((item) => (
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

  if (profile.templateId === "sidebar-icons") {
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
                        .filter((item) => item.visible)
                        .flatMap((item) =>
                          parseSkillEntries(item.description).map((entry, index) => (
                            <div key={`${item.id}-${index}`}>
                              <p className="text-xs text-foreground">{entry.name}</p>
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
                        {section.items.filter((item) => item.visible).map((item) => (
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
                        .filter((item) => item.visible)
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
                        .filter((item) => item.visible)
                        .flatMap((item) =>
                          parseSkillEntries(item.description).map((entry, index) => (
                            <div key={`${item.id}-${index}`}>
                              <p className="text-sm text-foreground">{entry.name}</p>
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
                          .filter((item) => item.visible)
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
                                      {entry.name}
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
                    {section.type === "skills" ? (
                      <div
                        className="mt-2 grid gap-x-4 gap-y-2"
                        style={{
                          gridTemplateColumns: `repeat(${section.style.skillsColumns}, minmax(0, 1fr))`
                        }}
                      >
                        {section.items
                          .filter((item) => item.visible)
                          .flatMap((item, itemIndex) =>
                            parseSkillEntries(item.description).map((entry, entryIndex) => (
                              <p
                                key={`${item.id}-${itemIndex}-${entryIndex}`}
                                className="break-words text-muted-foreground"
                                style={{ fontSize: `${Math.max(11, section.style.bodyFontSize + 3)}px` }}
                              >
                                {entry.name}
                              </p>
                            ))
                          )}
                      </div>
                    ) : (
                      <div className="mt-2 space-y-3">
                        {section.items
                          .filter((item) => item.visible)
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
