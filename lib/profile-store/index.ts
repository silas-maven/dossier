import type { CvProfile } from "@/lib/cv-profile";

export * from "@/lib/profile-store/types";
export * from "@/lib/profile-store/local";
export * from "@/lib/profile-store/cloud";

export const profileChecksum = (profile: CvProfile) => {
  const text = JSON.stringify(profile);
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33) ^ text.charCodeAt(index);
  }
  return (hash >>> 0).toString(16);
};

export const nowIso = () => new Date().toISOString();
