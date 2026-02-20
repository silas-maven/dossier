import type { CvProfile } from "@/lib/cv-profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CloudProfileRecord } from "@/lib/profile-store/types";

type DossierProfileRow = {
  id: string;
  template_id: string;
  profile_name: string;
  profile_data: CvProfile;
  updated_at: string;
};

const mapRow = (row: DossierProfileRow): CloudProfileRecord => ({
  id: row.id,
  template_id: row.template_id,
  profile_name: row.profile_name,
  profile_data: row.profile_data,
  updated_at: row.updated_at
});

export const getCurrentSupabaseUser = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

export const saveCloudProfile = async (input: {
  profile: CvProfile;
  templateId: string;
  cloudId?: string | null;
}) => {
  const supabase = createSupabaseBrowserClient();
  const user = await getCurrentSupabaseUser();
  if (!user) throw new Error("Sign in required for cloud storage.");

  const payload = {
    id: input.cloudId ?? undefined,
    user_id: user.id,
    profile_name: input.profile.name,
    template_id: input.templateId,
    profile_data: input.profile
  };

  const query = input.cloudId
    ? supabase.from("dossier_profiles").upsert(payload).select("id, template_id, profile_name, profile_data, updated_at").single()
    : supabase.from("dossier_profiles").insert(payload).select("id, template_id, profile_name, profile_data, updated_at").single();

  const { data, error } = await query;
  if (error || !data) throw error ?? new Error("Cloud save failed.");

  return mapRow(data as DossierProfileRow);
};

export const getCloudProfileById = async (cloudId: string) => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("dossier_profiles")
    .select("id, template_id, profile_name, profile_data, updated_at")
    .eq("id", cloudId)
    .single();

  if (error || !data) throw error ?? new Error("Cloud profile not found.");
  return mapRow(data as DossierProfileRow);
};

export const getLatestCloudProfileByTemplate = async (templateId: string) => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("dossier_profiles")
    .select("id, template_id, profile_name, profile_data, updated_at")
    .eq("template_id", templateId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRow(data as DossierProfileRow);
};
