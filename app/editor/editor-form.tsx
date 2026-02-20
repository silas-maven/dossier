"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import RichTextEditor from "@/components/ui/rich-text-editor";
import EditorStylePanel from "@/components/editor/editor-style-panel";
import EditorContentPanel, {
  type ContentTabStatus,
  type EditorContentTab
} from "@/components/editor/editor-content-panel";
import EditorPreviewPanel from "@/components/editor/editor-preview-panel";
import EditorMobileTabs, { type EditorPanelTab } from "@/components/editor/editor-mobile-tabs";
import {
  createEmptyItem,
  createEmptyProfile,
  createEmptySection,
  cvSectionTypes,
  type CvBasics,
  type CvProfile,
  type CvSectionStyle,
  type CvStyle,
  type CvSectionType
} from "@/lib/cv-profile";
import { seedExampleProfile } from "@/lib/cv-seed";
import {
  DEFAULT_SKILL_LEVEL,
  MAX_SKILL_LEVEL,
  MIN_SKILL_LEVEL,
  parseSkillEntries,
  serializeSkillEntries
} from "@/lib/skill-levels";
import {
  getCloudProfileById,
  getCurrentSupabaseUser,
  getLatestCloudProfileByTemplate,
  getStoredProfileMeta,
  loadLocalProfileForTemplate,
  nowIso,
  profileChecksum,
  saveCloudProfile,
  saveStoredProfileEnvelope,
  type ProfileStorageMode,
  type StoredProfileMeta
} from "@/lib/profile-store";
import { cn } from "@/lib/utils";
import { type DossierStorageMode } from "@/lib/storage-mode";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";

type EditorFormProps = {
  templateId: string;
  templateName: string;
  preferredStorageMode?: DossierStorageMode;
};

const tagsFromInput = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const tagsToInput = (tags: string[]) => tags.join(", ");

const BULLET_INPUT_RE = /^[-•*]\s+/;
const DATE_RANGE_LINE_RE =
  /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*[—-]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|Present)|\d{4}\s*[—-]\s*(?:\d{4}|Present))/i;
const ROLE_TITLE_LINE_RE = /^[A-Z][A-Za-z .,'&/()-]+,\s*[A-Z][A-Za-z .,'&/()-]+$/;

const normalizeInlineSpacing = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();

const splitTextLines = (value: string) =>
  value
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => normalizeInlineSpacing(line))
    .filter(Boolean);

const isLikelyHeadingLine = (line: string) => {
  if (!line || BULLET_INPUT_RE.test(line)) return false;
  if (ROLE_TITLE_LINE_RE.test(line) || DATE_RANGE_LINE_RE.test(line)) return true;
  if (/[.!?]$/.test(line)) return false;
  if (line.length > 72) return false;
  return /[A-Za-z]/.test(line);
};

const shouldAppendToBullet = (line: string) => {
  if (!line) return false;
  if (ROLE_TITLE_LINE_RE.test(line) || DATE_RANGE_LINE_RE.test(line)) return false;
  if (isLikelyHeadingLine(line)) return false;
  return true;
};

const formatDescriptionText = (sectionType: CvSectionType, rawText: string) => {
  const lines = splitTextLines(rawText);
  if (lines.length === 0) return "";

  if (sectionType !== "experience" && sectionType !== "projects" && sectionType !== "custom") {
    return lines.join("\n");
  }

  const merged: string[] = [];
  for (const line of lines) {
    const bulletBody = line.replace(BULLET_INPUT_RE, "").trim();
    const isBullet = BULLET_INPUT_RE.test(line);

    if (isBullet) {
      merged.push(`- ${bulletBody}`);
      continue;
    }

    const previous = merged[merged.length - 1];
    if (previous?.startsWith("- ") && shouldAppendToBullet(line)) {
      merged[merged.length - 1] = `${previous} ${line}`.replace(/\s+/g, " ").trim();
      continue;
    }

    merged.push(line);
  }

  const output: string[] = [];
  for (const line of merged) {
    const isHeading = isLikelyHeadingLine(line);
    if (isHeading && output.length > 0 && output[output.length - 1] !== "") {
      output.push("");
    }
    output.push(line);
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
};

const asString = (value: unknown) => (typeof value === "string" ? value : "");
const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const asTags = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

const normalizeProfileShape = (templateId: string, raw: unknown): CvProfile => {
  const fallback = createEmptyProfile(templateId);
  if (!raw || typeof raw !== "object") return fallback;

  const source = raw as Partial<CvProfile> & { sections?: unknown; basics?: unknown; style?: unknown };
  const basics = (source.basics ?? {}) as Partial<CvProfile["basics"]>;
  const style = (source.style ?? {}) as Partial<CvProfile["style"]>;
  const sectionList = Array.isArray(source.sections) ? source.sections : fallback.sections;

  return {
    ...fallback,
    ...source,
    id: asString(source.id) || fallback.id,
    name: asString(source.name) || fallback.name,
    templateId,
    basics: {
      ...fallback.basics,
      name: asString(basics.name),
      headline: asString(basics.headline),
      email: asString(basics.email),
      phone: asString(basics.phone),
      url: asString(basics.url),
      summary: asString(basics.summary),
      location: asString(basics.location)
    },
    style: {
      ...fallback.style,
      fontFamily:
        style.fontFamily === "serif" || style.fontFamily === "mono" || style.fontFamily === "sans"
          ? style.fontFamily
          : fallback.style.fontFamily,
      baseFontSize:
        typeof style.baseFontSize === "number" && Number.isFinite(style.baseFontSize)
          ? style.baseFontSize
          : fallback.style.baseFontSize,
      summaryAlign:
        style.summaryAlign === "left" || style.summaryAlign === "center" || style.summaryAlign === "right"
          ? style.summaryAlign
          : fallback.style.summaryAlign,
      lineSpacing:
        typeof style.lineSpacing === "number" && Number.isFinite(style.lineSpacing)
          ? clampNumber(style.lineSpacing, 1, 2)
          : fallback.style.lineSpacing,
      pageMarginPx:
        typeof style.pageMarginPx === "number" && Number.isFinite(style.pageMarginPx)
          ? clampNumber(style.pageMarginPx, 12, 96)
          : fallback.style.pageMarginPx,
      dateFormat:
        style.dateFormat === "mon_year" ||
        style.dateFormat === "slash_month_year" ||
        style.dateFormat === "year"
          ? style.dateFormat
          : fallback.style.dateFormat,
      accentColor: asString(style.accentColor) || fallback.style.accentColor,
      sidebarColor: asString(style.sidebarColor) || fallback.style.sidebarColor
    },
    sections: sectionList.map((candidate) => {
      const section = candidate as Partial<CvProfile["sections"][number]>;
      const type: CvSectionType = cvSectionTypes.includes(section.type as CvSectionType)
        ? (section.type as CvSectionType)
        : "custom";
      const defaultSection = createEmptySection(type);
      const itemList = Array.isArray(section.items) ? section.items : [];
      const sectionStyle = (section.style ?? {}) as Partial<CvProfile["sections"][number]["style"]>;

      return {
        ...defaultSection,
        ...section,
        id: asString(section.id) || defaultSection.id,
        type,
        title: asString(section.title) || defaultSection.title,
        style: {
          ...defaultSection.style,
          titleFontSize:
            typeof sectionStyle.titleFontSize === "number" && Number.isFinite(sectionStyle.titleFontSize)
              ? sectionStyle.titleFontSize
              : defaultSection.style.titleFontSize,
          bodyFontSize:
            typeof sectionStyle.bodyFontSize === "number" && Number.isFinite(sectionStyle.bodyFontSize)
              ? sectionStyle.bodyFontSize
              : defaultSection.style.bodyFontSize,
          headingBold:
            typeof sectionStyle.headingBold === "boolean"
              ? sectionStyle.headingBold
              : defaultSection.style.headingBold,
          headingItalic:
            typeof sectionStyle.headingItalic === "boolean"
              ? sectionStyle.headingItalic
              : defaultSection.style.headingItalic,
          skillsColumns:
            sectionStyle.skillsColumns === 1 ||
            sectionStyle.skillsColumns === 2 ||
            sectionStyle.skillsColumns === 3 ||
            sectionStyle.skillsColumns === 4
              ? sectionStyle.skillsColumns
              : defaultSection.style.skillsColumns,
          textAlign:
            sectionStyle.textAlign === "left" ||
            sectionStyle.textAlign === "center" ||
            sectionStyle.textAlign === "right" ||
            sectionStyle.textAlign === "justify"
              ? sectionStyle.textAlign
              : defaultSection.style.textAlign,
          enableBullets:
            typeof sectionStyle.enableBullets === "boolean"
              ? sectionStyle.enableBullets
              : defaultSection.style.enableBullets,
          bulletStyle:
            sectionStyle.bulletStyle === "disc" ||
            sectionStyle.bulletStyle === "square" ||
            sectionStyle.bulletStyle === "dash"
              ? sectionStyle.bulletStyle
              : defaultSection.style.bulletStyle,
          uppercaseTitle:
            typeof sectionStyle.uppercaseTitle === "boolean"
              ? sectionStyle.uppercaseTitle
              : defaultSection.style.uppercaseTitle,
          showDivider:
            typeof sectionStyle.showDivider === "boolean"
              ? sectionStyle.showDivider
              : defaultSection.style.showDivider
        },
        items: itemList.map((candidateItem) => {
          const item = candidateItem as Partial<CvProfile["sections"][number]["items"][number]>;
          const defaultItem = createEmptyItem();
          return {
            ...defaultItem,
            ...item,
            id: asString(item.id) || defaultItem.id,
            title: asString(item.title),
            subtitle: asString(item.subtitle),
            dateRange: asString(item.dateRange),
            description: asString(item.description),
            tags: asTags(item.tags),
            visible: typeof item.visible === "boolean" ? item.visible : true
          };
        })
      };
    })
  };
};

const buildMeta = (input: {
  profile: CvProfile;
  templateId: string;
  mode: ProfileStorageMode;
  existing: StoredProfileMeta | null;
  cloudId?: string | null;
  cloudChecksum?: string | null;
  cloudUpdatedAt?: string | null;
}): StoredProfileMeta => {
  const localChecksum = profileChecksum(input.profile);
  return {
    profileId: input.profile.id,
    templateId: input.templateId,
    profileName: input.profile.name,
    mode: input.mode,
    updatedAt: nowIso(),
    cloudId: input.cloudId ?? input.existing?.cloudId ?? null,
    localChecksum,
    cloudChecksum: input.cloudChecksum ?? input.existing?.cloudChecksum ?? null,
    cloudUpdatedAt: input.cloudUpdatedAt ?? input.existing?.cloudUpdatedAt ?? null
  };
};

export default function EditorForm({
  templateId,
  templateName,
  preferredStorageMode
}: EditorFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cloudConfigured = useMemo(() => Boolean(createSupabaseBrowserClientOrNull()), []);

  const [profile, setProfile] = useState<CvProfile>(() => createEmptyProfile(templateId));
  const [isHydrated, setIsHydrated] = useState(false);
  const [importCandidate, setImportCandidate] = useState<CvProfile | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [undoProfile, setUndoProfile] = useState<CvProfile | null>(null);
  const [copiedTemplateId, setCopiedTemplateId] = useState(false);
  const [storageMode, setStorageMode] = useState<ProfileStorageMode>("local");
  const [profileMeta, setProfileMeta] = useState<StoredProfileMeta | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState<EditorPanelTab>("content");
  const [activeContentTab, setActiveContentTab] = useState<EditorContentTab>("import");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [conflictState, setConflictState] = useState<{
    localProfile: CvProfile;
    cloudProfile: CvProfile;
    cloudId: string;
    cloudUpdatedAt: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const fallbackProfile = createEmptyProfile(templateId);
      const localProfile = loadLocalProfileForTemplate(templateId);
      let nextProfile = normalizeProfileShape(templateId, localProfile ?? fallbackProfile);
      let nextMeta = getStoredProfileMeta(nextProfile.id);
      const nextMode: ProfileStorageMode = preferredStorageMode ?? nextMeta?.mode ?? "local";

      if (!nextMeta) {
        nextMeta = buildMeta({
          profile: nextProfile,
          templateId,
          mode: nextMode,
          existing: null
        });
      }

      if (nextMode === "cloud") {
        try {
          const cloudRecord = nextMeta.cloudId
            ? await getCloudProfileById(nextMeta.cloudId)
            : await getLatestCloudProfileByTemplate(templateId);

          if (cloudRecord) {
            const cloudProfile = normalizeProfileShape(templateId, cloudRecord.profile_data);
            const localChecksum = profileChecksum(nextProfile);
            const cloudChecksum = profileChecksum(cloudProfile);
            if (localChecksum !== cloudChecksum) {
              setConflictState({
                localProfile: nextProfile,
                cloudProfile,
                cloudId: cloudRecord.id,
                cloudUpdatedAt: cloudRecord.updated_at
              });
            } else {
              nextProfile = cloudProfile;
              nextMeta = buildMeta({
                profile: nextProfile,
                templateId,
                mode: "cloud",
                existing: nextMeta,
                cloudId: cloudRecord.id,
                cloudChecksum,
                cloudUpdatedAt: cloudRecord.updated_at
              });
            }
          }
        } catch {
          setSyncError("Cloud profile unavailable right now. Using local draft.");
        }
      }

      if (!active) return;
      setProfile(nextProfile);
      setProfileMeta(nextMeta);
      setStorageMode(nextMode);
      setIsHydrated(true);
    };

    void hydrate();
    return () => {
      active = false;
    };
  }, [preferredStorageMode, templateId]);

  useEffect(() => {
    if (!isHydrated) return;
    setProfileMeta((previous) => {
      const nextMeta = buildMeta({
        profile,
        templateId,
        mode: storageMode,
        existing: previous
      });
      saveStoredProfileEnvelope({ meta: nextMeta, profile }, true);
      return nextMeta;
    });
  }, [isHydrated, profile, storageMode, templateId]);

  const startSeed = () => {
    setImportError(null);
    setUndoProfile(profile);
    setProfile(seedExampleProfile(templateId));
    setImportCandidate(null);
  };

  const startImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleImportFile = async (file: File) => {
    setImportError(null);
    setImportLoading(true);
    setImportCandidate(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("templateId", templateId);

      const res = await fetch("/api/parse-cv", { method: "POST", body: formData });
      const json = (await res.json().catch(() => ({}))) as { profile?: CvProfile; error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Import failed");
      }
      if (!json.profile) throw new Error("Import failed");

      // Auto-apply: populate the actual editor fields immediately.
      setUndoProfile(profile);
      const applied = normalizeProfileShape(templateId, {
        ...json.profile,
        id: profile.id,
        templateId
      });
      setProfile(applied);
      setImportCandidate(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Could not import this DOCX.";
      setImportError(message);
    } finally {
      setImportLoading(false);
    }
  };

  const undoLastImport = () => {
    if (!undoProfile) return;
    setProfile(undoProfile);
    setUndoProfile(null);
  };

  const persistProfileToLocal = (
    nextProfile: CvProfile,
    nextMode: ProfileStorageMode,
    overrides?: Partial<StoredProfileMeta>
  ) => {
    setProfileMeta((previous) => {
      const built = buildMeta({
        profile: nextProfile,
        templateId,
        mode: nextMode,
        existing: previous
      });
      const nextMeta = { ...built, ...overrides };
      saveStoredProfileEnvelope({ meta: nextMeta, profile: nextProfile }, true);
      return nextMeta;
    });
  };

  const maybeLoadCloudIntoConflict = async (opts?: { forceCloud?: boolean }) => {
    try {
      const cloudRecord = profileMeta?.cloudId
        ? await getCloudProfileById(profileMeta.cloudId)
        : await getLatestCloudProfileByTemplate(templateId);

      if (!cloudRecord) {
        setSyncMessage("No cloud profile found for this template yet.");
        return;
      }

      const cloudProfile = normalizeProfileShape(templateId, cloudRecord.profile_data);
      const localChecksum = profileChecksum(profile);
      const cloudChecksum = profileChecksum(cloudProfile);

      if (localChecksum !== cloudChecksum) {
        setConflictState({
          localProfile: profile,
          cloudProfile,
          cloudId: cloudRecord.id,
          cloudUpdatedAt: cloudRecord.updated_at
        });
        return;
      }

      setProfile(cloudProfile);
      const nextMode: ProfileStorageMode = opts?.forceCloud ? "cloud" : storageMode;
      setStorageMode(nextMode);
      persistProfileToLocal(cloudProfile, nextMode, {
        cloudId: cloudRecord.id,
        cloudChecksum,
        cloudUpdatedAt: cloudRecord.updated_at,
        mode: nextMode
      });
      setSyncMessage("Cloud profile is already in sync.");
    } catch {
      setSyncError("Could not sync from cloud right now.");
    }
  };

  const saveToCloudNow = async () => {
    setCloudBusy(true);
    setSyncError(null);
    setSyncMessage(null);
    try {
      const user = await getCurrentSupabaseUser();
      if (!user) {
        setSyncError("Sign in is required before using cloud storage.");
        setStorageMode("local");
        return;
      }

      const saved = await saveCloudProfile({
        profile,
        templateId,
        cloudId: profileMeta?.cloudId ?? null
      });
      const normalizedCloud = normalizeProfileShape(templateId, saved.profile_data);
      const cloudChecksum = profileChecksum(normalizedCloud);

      setStorageMode("cloud");
      setProfile(normalizedCloud);
      persistProfileToLocal(normalizedCloud, "cloud", {
        cloudId: saved.id,
        cloudChecksum,
        cloudUpdatedAt: saved.updated_at,
        mode: "cloud"
      });
      setSyncMessage("Saved to cloud.");
    } catch {
      setSyncError("Cloud save failed.");
    } finally {
      setCloudBusy(false);
    }
  };

  const saveLocalNow = () => {
    setSyncError(null);
    setSyncMessage("Saved locally.");
    persistProfileToLocal(profile, "local", {
      mode: "local"
    });
  };

  const setStorageModeWithValidation = async (nextMode: ProfileStorageMode) => {
    setSyncError(null);
    setSyncMessage(null);
    if (nextMode === "local") {
      setStorageMode("local");
      persistProfileToLocal(profile, "local", { mode: "local" });
      return;
    }

    if (!cloudConfigured) {
      setSyncError("Cloud storage is not configured in this environment.");
      return;
    }

    setCloudBusy(true);
    try {
      const user = await getCurrentSupabaseUser();
      if (!user) {
        setSyncError("Sign in is required before switching to cloud mode.");
        setStorageMode("local");
        return;
      }

      setStorageMode("cloud");
      await maybeLoadCloudIntoConflict({ forceCloud: true });
    } finally {
      setCloudBusy(false);
    }
  };

  const updateBasics = <K extends keyof CvBasics>(field: K, value: CvBasics[K]) => {
    setProfile((current) => ({
      ...current,
      basics: {
        ...current.basics,
        [field]: value
      }
    }));
  };

  const updateStyle = <K extends keyof CvStyle>(field: K, value: CvStyle[K]) => {
    const normalizedValue = (() => {
      if (field === "lineSpacing") {
        return clampNumber(Number(value), 1, 2) as CvStyle[K];
      }
      if (field === "pageMarginPx") {
        return clampNumber(Number(value), 12, 96) as CvStyle[K];
      }
      if (field === "baseFontSize") {
        return clampNumber(Number(value), 8, 14) as CvStyle[K];
      }
      if (field === "dateFormat") {
        const next = String(value);
        if (next === "mon_year" || next === "slash_month_year" || next === "year") {
          return next as CvStyle[K];
        }
        return "mon_year" as CvStyle[K];
      }
      return value;
    })();

    setProfile((current) => ({
      ...current,
      style: {
        ...current.style,
        [field]: normalizedValue
      }
    }));
  };

  const updateSectionField = (sectionIndex: number, field: "title" | "type", value: string) => {
    setProfile((current) => {
      const sections = [...current.sections];
      const section = sections[sectionIndex];
      if (!section) return current;
      if (field === "type") {
        sections[sectionIndex] = {
          ...section,
          type: value as CvSectionType
        };
      } else {
        sections[sectionIndex] = {
          ...section,
          title: value
        };
      }
      return { ...current, sections };
    });
  };

  const updateSectionStyleField = <K extends keyof CvSectionStyle>(
    sectionIndex: number,
    field: K,
    value: CvSectionStyle[K]
  ) => {
    setProfile((current) => {
      const sections = [...current.sections];
      const section = sections[sectionIndex];
      if (!section) return current;

      const nextValue = (() => {
        if (field === "titleFontSize") {
          return clampNumber(Number(value), 8, 16);
        }
        if (field === "bodyFontSize") {
          return clampNumber(Number(value), 8, 14);
        }
        if (field === "skillsColumns") {
          return [1, 2, 3, 4].includes(Number(value))
            ? (Number(value) as CvSectionStyle["skillsColumns"])
            : section.style.skillsColumns;
        }
        if (field === "textAlign") {
          return (["left", "center", "right", "justify"].includes(String(value))
            ? value
            : section.style.textAlign) as CvSectionStyle[K];
        }
        if (field === "bulletStyle") {
          return (["disc", "square", "dash"].includes(String(value))
            ? value
            : section.style.bulletStyle) as CvSectionStyle[K];
        }
        return Boolean(value) as CvSectionStyle[K];
      })();

      sections[sectionIndex] = {
        ...section,
        style: {
          ...section.style,
          [field]: nextValue
        }
      };
      return { ...current, sections };
    });
  };

  const selectedSectionIdSafe = useMemo(() => {
    if (profile.sections.length === 0) return null;
    if (selectedSectionId && profile.sections.some((section) => section.id === selectedSectionId)) {
      return selectedSectionId;
    }
    return profile.sections[0]?.id ?? null;
  }, [profile.sections, selectedSectionId]);

  const selectedSectionIndex = useMemo(() => {
    if (!selectedSectionIdSafe) return -1;
    return profile.sections.findIndex((section) => section.id === selectedSectionIdSafe);
  }, [profile.sections, selectedSectionIdSafe]);

  const updateSelectedSectionStyleField = <K extends keyof CvSectionStyle>(
    field: K,
    value: CvSectionStyle[K]
  ) => {
    if (selectedSectionIndex < 0) return;
    updateSectionStyleField(selectedSectionIndex, field, value);
  };

  const addSection = () => {
    const newSection = createEmptySection("custom");
    setProfile((current) => ({
      ...current,
      sections: [...current.sections, newSection]
    }));
    setSelectedSectionId(newSection.id);
  };

  const removeSection = (sectionIndex: number) => {
    setProfile((current) => ({
      ...current,
      sections: current.sections.filter((_, idx) => idx !== sectionIndex)
    }));
  };

  const moveSection = (sectionIndex: number, direction: -1 | 1) => {
    setProfile((current) => {
      const nextIndex = sectionIndex + direction;
      if (nextIndex < 0 || nextIndex >= current.sections.length) {
        return current;
      }
      const sections = [...current.sections];
      const temp = sections[sectionIndex];
      sections[sectionIndex] = sections[nextIndex];
      sections[nextIndex] = temp;
      return { ...current, sections };
    });
  };

  const addItem = (sectionIndex: number) => {
    setProfile((current) => {
      const sections = [...current.sections];
      const section = sections[sectionIndex];
      if (!section) return current;
      sections[sectionIndex] = {
        ...section,
        items: [...section.items, createEmptyItem()]
      };
      return { ...current, sections };
    });
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    setProfile((current) => {
      const sections = [...current.sections];
      const section = sections[sectionIndex];
      if (!section) return current;
      sections[sectionIndex] = {
        ...section,
        items: section.items.filter((_, idx) => idx !== itemIndex)
      };
      return { ...current, sections };
    });
  };

  const updateItemField = (
    sectionIndex: number,
    itemIndex: number,
    field: "title" | "subtitle" | "dateRange" | "description" | "tags" | "visible",
    value: string | boolean
  ) => {
    setProfile((current) => {
      const sections = [...current.sections];
      const section = sections[sectionIndex];
      if (!section) return current;
      const items = [...section.items];
      const item = items[itemIndex];
      if (!item) return current;

      if (field === "tags") {
        items[itemIndex] = { ...item, tags: tagsFromInput(value as string) };
      } else {
        items[itemIndex] = { ...item, [field]: value };
      }

      sections[sectionIndex] = { ...section, items };
      return { ...current, sections };
    });
  };

  const ensureOneItem = (sectionIndex: number) => {
    setProfile((current) => {
      const sections = [...current.sections];
      const section = sections[sectionIndex];
      if (!section) return current;
      if (section.items.length > 0) return current;
      sections[sectionIndex] = { ...section, items: [createEmptyItem()] };
      return { ...current, sections };
    });
  };

  const setSkillEntries = (sectionIndex: number, itemIndex: number, entries: Array<{ name: string; level: number }>) => {
    updateItemField(sectionIndex, itemIndex, "description", serializeSkillEntries(entries));
  };

  const addSkillEntry = (sectionIndex: number, itemIndex: number) => {
    const section = profile.sections[sectionIndex];
    const item = section?.items[itemIndex];
    if (!item) return;
    const entries = parseSkillEntries(item.description);
    entries.push({ name: "New skill", level: DEFAULT_SKILL_LEVEL });
    setSkillEntries(sectionIndex, itemIndex, entries);
  };

  const updateSkillEntry = (
    sectionIndex: number,
    itemIndex: number,
    entryIndex: number,
    field: "name" | "level",
    value: string | number
  ) => {
    const section = profile.sections[sectionIndex];
    const item = section?.items[itemIndex];
    if (!item) return;
    const entries = parseSkillEntries(item.description);
    const entry = entries[entryIndex];
    if (!entry) return;
    entries[entryIndex] = {
      ...entry,
      name: field === "name" ? String(value) : entry.name,
      level:
        field === "level"
          ? Math.min(MAX_SKILL_LEVEL, Math.max(MIN_SKILL_LEVEL, Number(value)))
          : entry.level
    };
    setSkillEntries(sectionIndex, itemIndex, entries);
  };

  const removeSkillEntry = (sectionIndex: number, itemIndex: number, entryIndex: number) => {
    const section = profile.sections[sectionIndex];
    const item = section?.items[itemIndex];
    if (!item) return;
    const entries = parseSkillEntries(item.description).filter((_, index) => index !== entryIndex);
    setSkillEntries(sectionIndex, itemIndex, entries);
  };

  const autoFormatDescription = (sectionIndex: number, itemIndex: number) => {
    const section = profile.sections[sectionIndex];
    const item = section?.items[itemIndex];
    if (!section || !item) return;
    const formatted = formatDescriptionText(section.type, item.description);
    if (formatted === item.description) return;
    updateItemField(sectionIndex, itemIndex, "description", formatted);
  };

  const formatPastedDescription = (sectionIndex: number, itemIndex: number, pasted: string) => {
    const section = profile.sections[sectionIndex];
    const item = section?.items[itemIndex];
    if (!section || !item) return;
    const formatted = formatDescriptionText(section.type, pasted);
    return formatted;
  };

  const contentTabs = useMemo<ContentTabStatus[]>(() => {
    const hasContact = Boolean(
      profile.basics.email.trim() || profile.basics.phone.trim() || profile.basics.url.trim()
    );

    const tabs: ContentTabStatus[] = [
      {
        key: "import",
        label: "Import",
        complete: profile.name.trim().length > 0
      },
      {
        key: "basics",
        label: "Basics",
        complete:
          profile.basics.name.trim().length > 0 &&
          profile.basics.headline.trim().length > 0 &&
          hasContact
      }
    ];

    profile.sections.forEach((section, index) => {
      const visibleItems = section.items.filter((item) => item.visible);
      const hasMeaningfulSectionContent =
        visibleItems.length > 0 &&
        (section.type === "skills"
          ? visibleItems.some((item) =>
              parseSkillEntries(item.description).some((entry) => entry.name.trim().length > 0)
            )
          : section.type === "certifications"
            ? visibleItems.some((item) => item.title.trim().length > 0)
            : visibleItems.some(
                (item) => item.title.trim().length > 0 || item.description.trim().length > 0
              ));
      tabs.push({
        key: `section:${section.id}` as EditorContentTab,
        label: section.title.trim() || `Section ${index + 1}`,
        complete: section.title.trim().length > 0 && hasMeaningfulSectionContent
      });
    });

    return tabs;
  }, [profile]);

  useEffect(() => {
    if (selectedSectionIdSafe !== selectedSectionId) {
      setSelectedSectionId(selectedSectionIdSafe);
    }
  }, [selectedSectionId, selectedSectionIdSafe]);

  useEffect(() => {
    const validActiveTab = contentTabs.some((tab) => tab.key === activeContentTab);
    if (validActiveTab) return;
    if (selectedSectionIdSafe) {
      setActiveContentTab(`section:${selectedSectionIdSafe}`);
      return;
    }
    setActiveContentTab("import");
  }, [activeContentTab, contentTabs, selectedSectionIdSafe]);

  useEffect(() => {
    if (!activeContentTab.startsWith("section:")) return;
    const sectionId = activeContentTab.replace("section:", "");
    if (sectionId && sectionId !== selectedSectionId) {
      setSelectedSectionId(sectionId);
    }
  }, [activeContentTab, selectedSectionId]);

  const handleContentTabChange = (tab: EditorContentTab) => {
    setActiveContentTab(tab);
    if (tab.startsWith("section:")) {
      setSelectedSectionId(tab.replace("section:", ""));
    }
  };

  const handleStyleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setActiveContentTab(`section:${sectionId}`);
  };

  const resolveConflictKeepLocal = async () => {
    if (!conflictState) return;
    setCloudBusy(true);
    setSyncError(null);
    setSyncMessage(null);
    try {
      const saved = await saveCloudProfile({
        profile: conflictState.localProfile,
        templateId,
        cloudId: conflictState.cloudId
      });
      const cloudChecksum = profileChecksum(conflictState.localProfile);
      setStorageMode("cloud");
      setProfile(conflictState.localProfile);
      persistProfileToLocal(conflictState.localProfile, "cloud", {
        cloudId: saved.id,
        cloudChecksum,
        cloudUpdatedAt: saved.updated_at,
        mode: "cloud"
      });
      setSyncMessage("Kept local version and updated cloud.");
      setConflictState(null);
    } catch {
      setSyncError("Could not overwrite cloud profile.");
    } finally {
      setCloudBusy(false);
    }
  };

  const resolveConflictKeepCloud = () => {
    if (!conflictState) return;
    const cloudChecksum = profileChecksum(conflictState.cloudProfile);
    setStorageMode("cloud");
    setProfile(conflictState.cloudProfile);
    persistProfileToLocal(conflictState.cloudProfile, "cloud", {
      cloudId: conflictState.cloudId,
      cloudChecksum,
      cloudUpdatedAt: conflictState.cloudUpdatedAt,
      mode: "cloud"
    });
    setSyncMessage("Loaded cloud version.");
    setConflictState(null);
  };

  const resolveConflictSaveLocalCopy = () => {
    if (!conflictState) return;
    const copy = normalizeProfileShape(templateId, {
      ...conflictState.localProfile,
      id: createEmptyProfile(templateId).id,
      name: `${conflictState.localProfile.name || "CV Profile"} (Local Copy)`
    });
    setStorageMode("local");
    setProfile(copy);
    persistProfileToLocal(copy, "local", {
      cloudId: null,
      cloudChecksum: null,
      cloudUpdatedAt: null,
      mode: "local"
    });
    setSyncMessage("Saved local version as a copy.");
    setConflictState(null);
  };

  const activeContentSection =
    activeContentTab.startsWith("section:")
      ? profile.sections.find((section) => section.id === activeContentTab.replace("section:", "")) ?? null
      : null;
  const activeContentSectionIndex = activeContentSection
    ? profile.sections.findIndex((section) => section.id === activeContentSection.id)
    : -1;

  return (
    <div className="space-y-4">
      <div className="xl:hidden">
        <EditorMobileTabs activeTab={activePanelTab} onTabChange={setActivePanelTab} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[40fr_80fr_60fr] xl:items-start">
        <EditorStylePanel
          templateId={templateId}
          style={profile.style}
          sections={profile.sections}
          selectedSectionId={selectedSectionIdSafe}
          onSelectSection={handleStyleSectionSelect}
          onStyleChange={updateStyle}
          onSelectedSectionStyleChange={updateSelectedSectionStyleField}
          className={cn(
            activePanelTab === "style" ? "block" : "hidden",
            "xl:sticky xl:top-6 xl:block xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pr-1 scrollbar-dark"
          )}
        />

        <div
          className={cn(
            activePanelTab === "content" ? "block" : "hidden",
            "xl:block xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pr-1 scrollbar-dark"
          )}
        >
          <EditorContentPanel
            tabs={contentTabs}
            activeTab={activeContentTab}
            onTabChange={handleContentTabChange}
          >
            {activeContentTab === "import" ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <span>Profile</span>
                    <span className="flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={startSeed}>
                        Seed example CV
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={startImportClick}
                        disabled={importLoading}
                      >
                        {importLoading ? "Importing..." : "Import DOCX"}
                      </Button>
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Selected template: <span className="font-medium text-foreground">{templateName}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>Template ID:</span>
                    <code className="rounded bg-muted px-2 py-1 text-[11px] text-foreground">
                      {templateId}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(templateId);
                          setCopiedTemplateId(true);
                          window.setTimeout(() => setCopiedTemplateId(false), 1200);
                        } catch {
                          // ignore
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      {copiedTemplateId ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <div className="space-y-2 rounded-lg border border-border/70 bg-muted/10 p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Storage location
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={storageMode === "local" ? "default" : "secondary"}
                        onClick={() => void setStorageModeWithValidation("local")}
                        disabled={cloudBusy}
                      >
                        Local
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={storageMode === "cloud" ? "default" : "secondary"}
                        onClick={() => void setStorageModeWithValidation("cloud")}
                        disabled={cloudBusy || !cloudConfigured}
                      >
                        Cloud
                      </Button>
                    </div>
                    {!cloudConfigured ? (
                      <p className="text-xs text-amber-400">
                        Cloud storage is unavailable until Supabase env variables are configured.
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={saveLocalNow}>
                        Save
                      </Button>
                      {storageMode === "cloud" ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => void saveToCloudNow()}
                            disabled={cloudBusy}
                          >
                            {cloudBusy ? "Saving..." : "Save to Cloud"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => void maybeLoadCloudIntoConflict({ forceCloud: true })}
                            disabled={cloudBusy}
                          >
                            Sync from Cloud
                          </Button>
                        </>
                      ) : null}
                    </div>
                    {profileMeta?.cloudUpdatedAt && storageMode === "cloud" ? (
                      <p className="text-xs text-muted-foreground">
                        Cloud updated: {new Date(profileMeta.cloudUpdatedAt).toLocaleString()}
                      </p>
                    ) : null}
                    {syncMessage ? <p className="text-xs text-emerald-400">{syncMessage}</p> : null}
                    {syncError ? <p className="text-xs text-red-500">{syncError}</p> : null}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                    className="hidden"
                    onChange={(event) => {
                      const f = event.target.files?.[0];
                      if (f) void handleImportFile(f);
                      event.target.value = "";
                    }}
                  />
                  <label className="block space-y-1">
                    <span className="text-sm font-medium">Profile name</span>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(event) =>
                        setProfile((current) => ({ ...current, name: event.target.value }))
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="e.g. Full Stack Engineer 2026"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {storageMode === "cloud"
                      ? "Cloud mode active. Local snapshot is still kept for conflict recovery."
                      : "Local mode active. Data stays in your browser unless you sync to cloud."}
                    {!isHydrated ? " (loading...)" : ""}
                  </p>
                  {importError ? <p className="text-xs text-red-700">{importError}</p> : null}
                  {undoProfile ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs text-muted-foreground">Import applied.</p>
                      <Button type="button" variant="secondary" size="sm" onClick={undoLastImport}>
                        Undo
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {activeContentTab === "basics" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Basics</CardTitle>
                  <CardDescription>Core identity details used across all templates.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-sm font-medium">Full name</span>
                    <input
                      type="text"
                      value={profile.basics.name ?? ""}
                      onChange={(event) => updateBasics("name", event.target.value)}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-sm font-medium">Headline</span>
                    <input
                      type="text"
                      value={profile.basics.headline ?? ""}
                      onChange={(event) => updateBasics("headline", event.target.value)}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="e.g. Senior Technical Consultant"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium">Email</span>
                    <input
                      type="email"
                      value={profile.basics.email ?? ""}
                      onChange={(event) => updateBasics("email", event.target.value)}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium">Phone</span>
                    <input
                      type="text"
                      value={profile.basics.phone ?? ""}
                      onChange={(event) => updateBasics("phone", event.target.value)}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium">Website</span>
                    <input
                      type="url"
                      value={profile.basics.url ?? ""}
                      onChange={(event) => updateBasics("url", event.target.value)}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium">Location</span>
                    <input
                      type="text"
                      value={profile.basics.location ?? ""}
                      onChange={(event) => updateBasics("location", event.target.value)}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-sm font-medium">Summary</span>
                    <textarea
                      value={profile.basics.summary ?? ""}
                      onChange={(event) => updateBasics("summary", event.target.value)}
                      className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                </CardContent>
              </Card>
            ) : null}

            {activeContentTab.startsWith("section:") ? (
              activeContentSection && activeContentSectionIndex >= 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Section</CardTitle>
                    <CardDescription>
                      Manage section order and add items for experience, education, projects, and more.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl border border-primary/70 bg-primary/5 p-4 ring-1 ring-primary/30">
                      <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                        <label className="space-y-1">
                          <span className="text-sm font-medium">Section title</span>
                          <input
                            type="text"
                            value={activeContentSection.title}
                            onChange={(event) =>
                              updateSectionField(activeContentSectionIndex, "title", event.target.value)
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-sm font-medium">Type</span>
                          <select
                            value={activeContentSection.type}
                            onChange={(event) =>
                              updateSectionField(activeContentSectionIndex, "type", event.target.value)
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {cvSectionTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="flex items-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => moveSection(activeContentSectionIndex, -1)}
                            disabled={activeContentSectionIndex === 0}
                            aria-label="Move section up"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => moveSection(activeContentSectionIndex, 1)}
                            disabled={activeContentSectionIndex === profile.sections.length - 1}
                            aria-label="Move section down"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => removeSection(activeContentSectionIndex)}
                            aria-label="Remove section"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {activeContentSection.type === "skills" ? (
                          <>
                            {activeContentSection.items.length === 0 ? (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => ensureOneItem(activeContentSectionIndex)}
                              >
                                <Plus className="h-4 w-4" />
                                Add skills list
                              </Button>
                            ) : null}
                            {activeContentSection.items.map((item, itemIndex) => (
                              <div key={item.id} className="rounded-lg border bg-muted/20 p-3">
                                <div className="grid gap-3 md:grid-cols-2">
                                  <label className="space-y-1">
                                    <span className="text-sm font-medium">Category</span>
                                    <input
                                      type="text"
                                      value={item.title}
                                      onChange={(event) =>
                                        updateItemField(
                                          activeContentSectionIndex,
                                          itemIndex,
                                          "title",
                                          event.target.value
                                        )
                                      }
                                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                      placeholder="e.g. API Integration"
                                    />
                                  </label>
                                  <div />
                                  <div className="space-y-2 md:col-span-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">Skills with level</span>
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => addSkillEntry(activeContentSectionIndex, itemIndex)}
                                      >
                                        <Plus className="h-4 w-4" />
                                        Add skill
                                      </Button>
                                    </div>

                                    {parseSkillEntries(item.description).length === 0 ? (
                                      <p className="text-xs text-muted-foreground">
                                        No skills in this category yet.
                                      </p>
                                    ) : null}

                                    {parseSkillEntries(item.description).map((skill, skillIndex) => (
                                      <div
                                        key={`${item.id}-${skillIndex}`}
                                        className="grid gap-2 md:grid-cols-[1fr_120px_auto]"
                                      >
                                        <input
                                          type="text"
                                          value={skill.name}
                                          onChange={(event) =>
                                            updateSkillEntry(
                                              activeContentSectionIndex,
                                              itemIndex,
                                              skillIndex,
                                              "name",
                                              event.target.value
                                            )
                                          }
                                          className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                          placeholder="e.g. API integration"
                                        />
                                        <select
                                          value={String(skill.level)}
                                          onChange={(event) =>
                                            updateSkillEntry(
                                              activeContentSectionIndex,
                                              itemIndex,
                                              skillIndex,
                                              "level",
                                              Number(event.target.value)
                                            )
                                          }
                                          className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                          {Array.from({
                                            length: MAX_SKILL_LEVEL - MIN_SKILL_LEVEL + 1
                                          }).map((_, index) => {
                                            const level = MIN_SKILL_LEVEL + index;
                                            return (
                                              <option key={level} value={level}>
                                                Level {level}/5
                                              </option>
                                            );
                                          })}
                                        </select>
                                        <Button
                                          type="button"
                                          variant="secondary"
                                          size="sm"
                                          onClick={() =>
                                            removeSkillEntry(activeContentSectionIndex, itemIndex, skillIndex)
                                          }
                                          aria-label="Remove skill"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}

                                    <p className="text-xs text-muted-foreground">
                                      Dot-based templates read this level directly. Range: 1 to 5.
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                  <label className="inline-flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={item.visible}
                                      onChange={(event) =>
                                        updateItemField(
                                          activeContentSectionIndex,
                                          itemIndex,
                                          "visible",
                                          event.target.checked
                                        )
                                      }
                                      className="h-4 w-4 rounded border"
                                    />
                                    Visible in this profile
                                  </label>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => removeItem(activeContentSectionIndex, itemIndex)}
                                    aria-label="Remove skill category"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : activeContentSection.type === "certifications" ? (
                          activeContentSection.items.map((item, itemIndex) => (
                            <div key={item.id} className="rounded-lg border bg-muted/20 p-3">
                              <div className="grid gap-3 md:grid-cols-2">
                                <label className="space-y-1 md:col-span-2">
                                  <span className="text-sm font-medium">Certificate</span>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(event) =>
                                      updateItemField(
                                        activeContentSectionIndex,
                                        itemIndex,
                                        "title",
                                        event.target.value
                                      )
                                    }
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="e.g. AWS Certified Solutions Architect"
                                  />
                                </label>
                                <label className="space-y-1">
                                  <span className="text-sm font-medium">Issuer</span>
                                  <input
                                    type="text"
                                    value={item.subtitle}
                                    onChange={(event) =>
                                      updateItemField(
                                        activeContentSectionIndex,
                                        itemIndex,
                                        "subtitle",
                                        event.target.value
                                      )
                                    }
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="e.g. AWS"
                                  />
                                </label>
                                <label className="space-y-1">
                                  <span className="text-sm font-medium">Date</span>
                                  <input
                                    type="text"
                                    value={item.dateRange}
                                    onChange={(event) =>
                                      updateItemField(
                                        activeContentSectionIndex,
                                        itemIndex,
                                        "dateRange",
                                        event.target.value
                                      )
                                    }
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="e.g. Jan 2025"
                                  />
                                </label>
                                <label className="space-y-1 md:col-span-2">
                                  <span className="text-sm font-medium">Notes (optional)</span>
                                  <textarea
                                    value={item.description}
                                    onChange={(event) =>
                                      updateItemField(
                                        activeContentSectionIndex,
                                        itemIndex,
                                        "description",
                                        event.target.value
                                      )
                                    }
                                    className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  />
                                </label>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <label className="inline-flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={item.visible}
                                    onChange={(event) =>
                                      updateItemField(
                                        activeContentSectionIndex,
                                        itemIndex,
                                        "visible",
                                        event.target.checked
                                      )
                                    }
                                    className="h-4 w-4 rounded border"
                                  />
                                  Visible in this profile
                                </label>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => removeItem(activeContentSectionIndex, itemIndex)}
                                  aria-label="Remove certificate"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          activeContentSection.items.map((item, itemIndex) => (
                            <div key={item.id} className="rounded-lg border bg-muted/20 p-3">
                              <div className="grid gap-3 md:grid-cols-2">
                                <label className="space-y-1">
                                  <span className="text-sm font-medium">Title</span>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(event) =>
                                      updateItemField(
                                        activeContentSectionIndex,
                                        itemIndex,
                                        "title",
                                        event.target.value
                                      )
                                    }
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  />
                                </label>
                                <label className="space-y-1">
                                  <span className="text-sm font-medium">Subtitle</span>
                                  <input
                                    type="text"
                                    value={item.subtitle}
                                    onChange={(event) =>
                                      updateItemField(
                                        activeContentSectionIndex,
                                        itemIndex,
                                        "subtitle",
                                        event.target.value
                                      )
                                    }
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  />
                                </label>
                                <label className="space-y-1">
                                  <span className="text-sm font-medium">Date range</span>
                                  <input
                                    type="text"
                                    value={item.dateRange}
                                    onChange={(event) =>
                                      updateItemField(
                                        activeContentSectionIndex,
                                        itemIndex,
                                        "dateRange",
                                        event.target.value
                                      )
                                    }
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="e.g. Jan 2024 - Present"
                                  />
                                </label>
                                <label className="space-y-1">
                                  <span className="text-sm font-medium">Tags (comma-separated)</span>
                                  <input
                                    type="text"
                                    value={tagsToInput(item.tags)}
                                    onChange={(event) =>
                                      updateItemField(
                                        activeContentSectionIndex,
                                        itemIndex,
                                        "tags",
                                        event.target.value
                                      )
                                    }
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="React, TypeScript, Node.js"
                                  />
                                </label>
                                <div className="md:col-span-2">
                                  <RichTextEditor
                                    value={item.description}
                                    onChange={(nextValue) =>
                                      updateItemField(
                                        activeContentSectionIndex,
                                        itemIndex,
                                        "description",
                                        nextValue
                                      )
                                    }
                                    onAutoFormat={() =>
                                      autoFormatDescription(activeContentSectionIndex, itemIndex)
                                    }
                                    onBlur={() =>
                                      autoFormatDescription(activeContentSectionIndex, itemIndex)
                                    }
                                    onPasteText={(pasted) =>
                                      formatPastedDescription(activeContentSectionIndex, itemIndex, pasted) ??
                                      pasted
                                    }
                                  />
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <label className="inline-flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={item.visible}
                                    onChange={(event) =>
                                      updateItemField(
                                        activeContentSectionIndex,
                                        itemIndex,
                                        "visible",
                                        event.target.checked
                                      )
                                    }
                                    className="h-4 w-4 rounded border"
                                  />
                                  Visible in this profile
                                </label>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => removeItem(activeContentSectionIndex, itemIndex)}
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {activeContentSection.type === "skills" ? (
                        <Button
                          type="button"
                          variant="secondary"
                          className="mt-3"
                          onClick={() => addItem(activeContentSectionIndex)}
                        >
                          <Plus className="h-4 w-4" />
                          Add skill category
                        </Button>
                      ) : activeContentSection.type === "certifications" ? (
                        <Button
                          type="button"
                          variant="secondary"
                          className="mt-3"
                          onClick={() => addItem(activeContentSectionIndex)}
                        >
                          <Plus className="h-4 w-4" />
                          Add certificate
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          className="mt-3"
                          onClick={() => addItem(activeContentSectionIndex)}
                        >
                          <Plus className="h-4 w-4" />
                          Add item
                        </Button>
                      )}
                    </div>

                    <Button type="button" onClick={addSection}>
                      <Plus className="h-4 w-4" />
                      Add section
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No section selected</CardTitle>
                    <CardDescription>Add a section to continue.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button type="button" onClick={addSection}>
                      <Plus className="h-4 w-4" />
                      Add section
                    </Button>
                  </CardContent>
                </Card>
              )
            ) : null}
          </EditorContentPanel>
        </div>

        <EditorPreviewPanel
          profile={importCandidate ?? profile}
          templateName={templateName}
          className={cn(
            activePanelTab === "preview" ? "block" : "hidden",
            "xl:sticky xl:top-6 xl:block xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pl-1 scrollbar-dark"
          )}
        />
      </div>

      <Dialog open={Boolean(conflictState)} onOpenChange={(open) => (!open ? setConflictState(null) : null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Local and cloud versions differ</DialogTitle>
            <DialogDescription>
              Choose how to resolve this profile conflict before continuing in cloud mode.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Local profile: {conflictState?.localProfile.name || "Untitled profile"}</p>
            <p>Cloud updated: {conflictState?.cloudUpdatedAt ? new Date(conflictState.cloudUpdatedAt).toLocaleString() : "Unknown"}</p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => void resolveConflictKeepLocal()} disabled={cloudBusy}>
              Keep Local
            </Button>
            <Button type="button" variant="secondary" onClick={resolveConflictKeepCloud} disabled={cloudBusy}>
              Keep Cloud
            </Button>
            <Button type="button" onClick={resolveConflictSaveLocalCopy} disabled={cloudBusy}>
              Save Local as Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
