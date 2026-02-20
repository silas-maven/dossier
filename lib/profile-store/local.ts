import type { CvProfile } from "@/lib/cv-profile";
import type { StoredProfileEnvelope, StoredProfileMeta } from "@/lib/profile-store/types";

const INDEX_KEY = "dossier:profiles:index:v1";
const SNAPSHOT_PREFIX = "dossier:profiles:snapshot:v1:";
const TEMPLATE_POINTER_PREFIX = "dossier:profiles:template:v1:";
const LEGACY_TEMPLATE_PREFIX = "dossier:profile:v1:";

const parseJson = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const readIndex = (): StoredProfileMeta[] => {
  if (typeof window === "undefined") return [];
  return parseJson<StoredProfileMeta[]>(localStorage.getItem(INDEX_KEY)) ?? [];
};

const writeIndex = (next: StoredProfileMeta[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(INDEX_KEY, JSON.stringify(next));
};

export const readStoredProfileEnvelope = (profileId: string): StoredProfileEnvelope | null => {
  if (!profileId || typeof window === "undefined") return null;
  return parseJson<StoredProfileEnvelope>(localStorage.getItem(`${SNAPSHOT_PREFIX}${profileId}`));
};

export const saveStoredProfileEnvelope = (envelope: StoredProfileEnvelope, pinToTemplate = true) => {
  if (typeof window === "undefined") return;
  const { meta } = envelope;

  localStorage.setItem(`${SNAPSHOT_PREFIX}${meta.profileId}`, JSON.stringify(envelope));

  const index = readIndex();
  const existingIdx = index.findIndex((item) => item.profileId === meta.profileId);
  if (existingIdx >= 0) {
    index[existingIdx] = meta;
  } else {
    index.push(meta);
  }
  writeIndex(index);

  if (pinToTemplate) {
    localStorage.setItem(`${TEMPLATE_POINTER_PREFIX}${meta.templateId}`, meta.profileId);
  }
};

export const getPinnedProfileIdForTemplate = (templateId: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${TEMPLATE_POINTER_PREFIX}${templateId}`);
};

export const loadLocalProfileForTemplate = (templateId: string): CvProfile | null => {
  if (typeof window === "undefined") return null;

  const pinnedId = getPinnedProfileIdForTemplate(templateId);
  if (pinnedId) {
    const pinned = readStoredProfileEnvelope(pinnedId);
    if (pinned?.profile) return pinned.profile;
  }

  const legacy = parseJson<CvProfile>(localStorage.getItem(`${LEGACY_TEMPLATE_PREFIX}${templateId}`));
  return legacy;
};

export const getStoredProfileMeta = (profileId: string): StoredProfileMeta | null => {
  const env = readStoredProfileEnvelope(profileId);
  return env?.meta ?? null;
};
