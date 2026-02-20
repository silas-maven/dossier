export type DossierStorageMode = "local" | "cloud";

export const STORAGE_MODE_COOKIE = "dossier_storage_mode";

export const isDossierStorageMode = (value: unknown): value is DossierStorageMode =>
  value === "local" || value === "cloud";
