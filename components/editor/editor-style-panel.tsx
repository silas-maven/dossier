"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CvProfile, CvSectionStyle, CvStyle } from "@/lib/cv-profile";

type EditorStylePanelProps = {
  templateId: string;
  style: CvStyle;
  sections: CvProfile["sections"];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  onStyleChange: <K extends keyof CvStyle>(field: K, value: CvStyle[K]) => void;
  onSelectedSectionStyleChange: <K extends keyof CvSectionStyle>(
    field: K,
    value: CvSectionStyle[K]
  ) => void;
  className?: string;
};

export default function EditorStylePanel({
  templateId,
  style,
  sections,
  selectedSectionId,
  onSelectSection,
  onStyleChange,
  onSelectedSectionStyleChange,
  className
}: EditorStylePanelProps) {
  const showAccentColor = new Set([
    "banded-grey",
    "blue-rules",
    "skills-right-red",
    "skills-right-pink",
    "sidebar-tan-dots"
  ]).has(templateId);
  const showSidebarColor = new Set([
    "sidebar-light",
    "sidebar-navy-right",
    "sidebar-icons",
    "sidebar-tan-dots",
    "boxed-header-dots"
  ]).has(templateId);

  const selectedSection =
    sections.find((section) => section.id === selectedSectionId) ?? sections[0] ?? null;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Style</CardTitle>
          <CardDescription>Controls for this template. Affects PDF export and preview output.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
          <label className="space-y-1">
            <span className="text-sm font-medium">Font</span>
            <select
              value={style.fontFamily}
              onChange={(event) => onStyleChange("fontFamily", event.target.value as CvStyle["fontFamily"])}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
              <option value="mono">Mono</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Base font size (PDF)</span>
            <input
              type="number"
              min={9}
              max={12}
              step={1}
              value={style.baseFontSize}
              onChange={(event) => onStyleChange("baseFontSize", Number(event.target.value || 10))}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Profile text alignment</span>
            <select
              value={style.summaryAlign}
              onChange={(event) => onStyleChange("summaryAlign", event.target.value as CvStyle["summaryAlign"])}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>

          {showAccentColor ? (
            <label className="space-y-1">
              <span className="text-sm font-medium">Accent color</span>
              <input
                type="color"
                value={style.accentColor}
                onChange={(event) => onStyleChange("accentColor", event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          ) : null}

          <label className="space-y-1">
            <span className="text-sm font-medium">Line spacing</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={2}
                step={0.1}
                value={style.lineSpacing}
                onChange={(event) => onStyleChange("lineSpacing", Number(event.target.value))}
                className="h-10 w-full"
              />
              <input
                type="number"
                min={1}
                max={2}
                step={0.1}
                value={style.lineSpacing}
                onChange={(event) => onStyleChange("lineSpacing", Number(event.target.value || 1.35))}
                className="h-10 w-24 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Page margins (px)</span>
            <input
              type="number"
              min={12}
              max={96}
              step={1}
              value={style.pageMarginPx}
              onChange={(event) => onStyleChange("pageMarginPx", Number(event.target.value || 42))}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Date format</span>
            <select
              value={style.dateFormat}
              onChange={(event) =>
                onStyleChange("dateFormat", event.target.value as CvStyle["dateFormat"])
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="mon_year">Jan 2024</option>
              <option value="slash_month_year">01/2024</option>
              <option value="year">2024</option>
            </select>
          </label>

          {showSidebarColor ? (
            <label className="space-y-1">
              <span className="text-sm font-medium">Sidebar color</span>
              <input
                type="color"
                value={style.sidebarColor}
                onChange={(event) => onStyleChange("sidebarColor", event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Selected Section Style</CardTitle>
          <CardDescription>
            Choose a section and tune typography. These controls apply only to that section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sections yet. Add one in the Content panel.</p>
          ) : (
            <>
              <label className="space-y-1">
                <span className="text-sm font-medium">Section</span>
                <select
                  value={selectedSection?.id ?? ""}
                  onChange={(event) => onSelectSection(event.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title} ({section.type})
                    </option>
                  ))}
                </select>
              </label>

              {selectedSection ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                  <label className="space-y-1">
                    <span className="text-sm font-medium">Section title size (PDF)</span>
                    <input
                      type="number"
                      min={8}
                      max={16}
                      step={1}
                      value={selectedSection.style.titleFontSize}
                      onChange={(event) =>
                        onSelectedSectionStyleChange("titleFontSize", Number(event.target.value || 10))
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium">Section body size (PDF)</span>
                    <input
                      type="number"
                      min={8}
                      max={14}
                      step={1}
                      value={selectedSection.style.bodyFontSize}
                      onChange={(event) =>
                        onSelectedSectionStyleChange("bodyFontSize", Number(event.target.value || 9))
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>

                  {selectedSection.type === "skills" ? (
                    <label className="space-y-1">
                      <span className="text-sm font-medium">Skills columns (main layouts)</span>
                      <select
                        value={String(selectedSection.style.skillsColumns)}
                        onChange={(event) =>
                          onSelectedSectionStyleChange(
                            "skillsColumns",
                            Number(event.target.value) as CvSectionStyle["skillsColumns"]
                          )
                        }
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="1">1 column</option>
                        <option value="2">2 columns</option>
                        <option value="3">3 columns</option>
                        <option value="4">4 columns</option>
                      </select>
                    </label>
                  ) : (
                    <div className="flex flex-wrap items-end gap-4 rounded-md border bg-muted/20 px-3 py-2">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedSection.style.headingBold}
                          onChange={(event) =>
                            onSelectedSectionStyleChange("headingBold", event.target.checked)
                          }
                          className="h-4 w-4 rounded border"
                        />
                        Subheading lines bold
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedSection.style.headingItalic}
                          onChange={(event) =>
                            onSelectedSectionStyleChange("headingItalic", event.target.checked)
                          }
                          className="h-4 w-4 rounded border"
                        />
                        Subheading lines italic
                      </label>
                    </div>
                  )}

                  <label className="space-y-1">
                    <span className="text-sm font-medium">Text alignment</span>
                    <select
                      value={selectedSection.style.textAlign}
                      onChange={(event) =>
                        onSelectedSectionStyleChange(
                          "textAlign",
                          event.target.value as CvSectionStyle["textAlign"]
                        )
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                      <option value="justify">Justify</option>
                    </select>
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSection.style.enableBullets}
                      onChange={(event) =>
                        onSelectedSectionStyleChange("enableBullets", event.target.checked)
                      }
                      className="h-4 w-4 rounded border"
                    />
                    Enable Bullet Points
                  </label>

                  {selectedSection.style.enableBullets ? (
                    <>
                      <label className="space-y-1">
                        <span className="text-sm font-medium">Bullet style</span>
                        <select
                          value={selectedSection.style.bulletStyle}
                          onChange={(event) =>
                            onSelectedSectionStyleChange(
                              "bulletStyle",
                              event.target.value as CvSectionStyle["bulletStyle"]
                            )
                          }
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="disc">Disc (•)</option>
                          <option value="square">Square (■)</option>
                          <option value="dash">Dash (-)</option>
                        </select>
                      </label>
                      <div className="flex flex-wrap items-end gap-4 rounded-md border bg-muted/20 px-3 py-2">
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedSection.style.bulletBold}
                            onChange={(event) =>
                              onSelectedSectionStyleChange("bulletBold", event.target.checked)
                            }
                            className="h-4 w-4 rounded border"
                          />
                          Bullet lines bold
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedSection.style.bulletItalic}
                            onChange={(event) =>
                              onSelectedSectionStyleChange("bulletItalic", event.target.checked)
                            }
                            className="h-4 w-4 rounded border"
                          />
                          Bullet lines italic
                        </label>
                      </div>
                    </>
                  ) : null}

                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSection.style.uppercaseTitle}
                      onChange={(event) =>
                        onSelectedSectionStyleChange("uppercaseTitle", event.target.checked)
                      }
                      className="h-4 w-4 rounded border"
                    />
                    Uppercase Section Title
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSection.style.showDivider}
                      onChange={(event) =>
                        onSelectedSectionStyleChange("showDivider", event.target.checked)
                      }
                      className="h-4 w-4 rounded border"
                    />
                    Show horizontal line under title
                  </label>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
