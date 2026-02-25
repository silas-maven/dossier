import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { createSupabaseServerClientOrNull } from "@/lib/supabase/ssr";

export const getDossierUserCount = async (): Promise<number | null> => {
  try {
    const service = createSupabaseServiceClient();
    const { count, error } = await service
      .from("dossier_visitors")
      .select("*", { count: "exact", head: true });
    if (!error && typeof count === "number") return count;
  } catch {
    // Fall back to public aggregate metric below when service role env is unavailable.
  }

  const supabase = await createSupabaseServerClientOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("dossier_app_metrics")
    .select("total_visitors,total_users")
    .eq("id", 1)
    .maybeSingle();

  if (error) return null;
  if (!data) return null;
  if (typeof data.total_visitors === "number") return data.total_visitors;
  if (typeof data.total_users === "number") return data.total_users;
  return null;
};
