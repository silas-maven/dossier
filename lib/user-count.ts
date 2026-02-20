import { createSupabaseServerClientOrNull } from "@/lib/supabase/ssr";

export const getDossierUserCount = async (): Promise<number | null> => {
  const supabase = await createSupabaseServerClientOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("dossier_app_metrics")
    .select("total_users")
    .eq("id", 1)
    .maybeSingle();

  if (error) return null;
  if (!data || typeof data.total_users !== "number") return null;
  return data.total_users;
};
