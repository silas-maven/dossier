import type { CvProfile } from "@/lib/cv-profile";

export type ProfileStorageMode = "local" | "cloud";

export type StoredProfileMeta = {
  profileId: string;
  templateId: string;
  profileName: string;
  mode: ProfileStorageMode;
  updatedAt: string;
  cloudId: string | null;
  localChecksum: string;
  cloudChecksum: string | null;
  cloudUpdatedAt: string | null;
};

export type StoredProfileEnvelope = {
  meta: StoredProfileMeta;
  profile: CvProfile;
};

export type CloudProfileRecord = {
  id: string;
  template_id: string;
  profile_name: string;
  profile_data: CvProfile;
  updated_at: string;
};
