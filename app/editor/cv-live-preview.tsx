import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CvProfile, CvSection } from "@/lib/cv-profile";
import { contactInline, contactLines } from "@/lib/contact";
import { formatDateRange } from "@/lib/date-format";
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

type InlinePart = {
  text: string;
  bold: boolean;
  italic: boolean;
};

type DescriptionPart =
  | { kind: "bullet"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "para"; text: string };

const BULLET_RE = /^[-•*]\s+(.*)$/;
const stripInlineMarkers = (text: string) =>
  text
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");

const parseInlineParts = (text: string): InlinePart[] => {
  if (!text) return [];
  const tokenRe = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const out: InlinePart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      out.push({ text: text.slice(lastIndex, match.index), bold: false, italic: false });
    }
    const token = match[0];
    if (token.startsWith("***")) {
      out.push({ text: token.slice(3, -3), bold: true, italic: true });
    } else if (token.startsWith("**")) {
      out.push({ text: token.slice(2, -2), bold: true, italic: false });
    } else {
      out.push({ text: token.slice(1, -1), bold: false, italic: true });
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    out.push({ text: text.slice(lastIndex), bold: false, italic: false });
  }
  return out.filter((part) => part.text.length > 0);
};

const looksLikeSubheadingLine = (line: string) => {
  if (!line || BULLET_RE.test(line)) return false;
  if (/[.!?]$/.test(line)) return false;
  if (line.length > 72) return false;
  return /[A-Za-z]/.test(line);
};

const parseDescriptionParts = (value: string): DescriptionPart[] =>
  (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const bullet = line.match(BULLET_RE);
      if (bullet?.[1]) return { kind: "bullet", text: bullet[1].trim() } as DescriptionPart;
      const cleanedLine = stripInlineMarkers(line);
      if (looksLikeSubheadingLine(cleanedLine)) return { kind: "heading", text: cleanedLine } as DescriptionPart;
      return { kind: "para", text: cleanedLine } as DescriptionPart;
    });

const bulletGlyph = (style: CvSection["style"]["bulletStyle"]) => {
  if (style === "square") return "■";
  if (style === "dash") return "-";
  return "•";
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
  const isSidebarTemplate =
    profile.templateId === "sidebar-light" ||
    profile.templateId === "sidebar-navy-right" ||
    profile.templateId === "sidebar-icons" ||
    profile.templateId === "sidebar-tan-dots" ||
    profile.templateId === "boxed-header-dots";
  const profileSummary = (profile.basics.summary || "").trim();
  const usesSkillDots =
    profile.templateId === "sidebar-tan-dots" ||
    profile.templateId === "boxed-header-dots" ||
    profile.templateId === "skills-right-pink";
  const summaryAlign = profile.style.summaryAlign ?? "left";
  const lineSpacing = profile.style.lineSpacing ?? 1.35;

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
                              {item.description ? (
                                <div className="mt-1 space-y-1">
                                  {parseDescriptionParts(item.description).map((part, index) => {
                                    const segments = parseInlineParts(part.text);
                                    if (part.kind === "bullet" && section.style.enableBullets) {
                                      return (
                                        <div key={`${item.id}-${index}`} className="flex items-start gap-2">
                                          <span
                                            className="mt-0.5 text-muted-foreground"
                                            style={{ fontSize: `${Math.max(11, section.style.bodyFontSize + 3)}px` }}
                                          >
                                            {bulletGlyph(section.style.bulletStyle)}
                                          </span>
                                          <p
                                            className="break-words text-muted-foreground"
                                            style={{
                                              fontSize: `${Math.max(11, section.style.bodyFontSize + 3)}px`,
                                              lineHeight: lineSpacing,
                                              textAlign: section.style.textAlign
                                            }}
                                          >
                                            {segments.map((segment, segIndex) => (
                                              <span
                                                key={`${item.id}-${index}-${segIndex}`}
                                                className={cn(
                                                  segment.bold && "font-semibold",
                                                  segment.italic && "italic"
                                                )}
                                              >
                                                {segment.text}
                                              </span>
                                            ))}
                                          </p>
                                        </div>
                                      );
                                    }

                                    return (
                                      <p
                                        key={`${item.id}-${index}`}
                                        className="break-words text-muted-foreground"
                                        style={{
                                          fontSize: `${Math.max(11, section.style.bodyFontSize + 3)}px`,
                                          fontWeight:
                                            part.kind === "heading" && section.style.headingBold ? 600 : 400,
                                          fontStyle:
                                            part.kind === "heading" && section.style.headingItalic
                                              ? "italic"
                                              : "normal",
                                          lineHeight: lineSpacing,
                                          textAlign: section.style.textAlign
                                        }}
                                      >
                                        {segments.map((segment, segIndex) => (
                                          <span
                                            key={`${item.id}-${index}-${segIndex}`}
                                            className={cn(
                                              segment.bold && "font-semibold",
                                              segment.italic && "italic"
                                            )}
                                          >
                                            {segment.text}
                                          </span>
                                        ))}
                                      </p>
                                    );
                                  })}
                                </div>
                              ) : null}
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
