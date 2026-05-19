import type { CvProfile } from "@/lib/cv-profile";

export type StoredProfileMeta = {
  profileId: string;
  templateId: string;
  profileName: string;
  updatedAt: string;
  localChecksum: string;
};

export type StoredProfileEnvelope = {
  meta: StoredProfileMeta;
  profile: CvProfile;
};
