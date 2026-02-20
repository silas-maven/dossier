import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv, getSupabasePublicEnvOrNull } from "@/lib/supabase/env";

export const createSupabaseBrowserClient = () => {
  const { url, anonKey } = getSupabasePublicEnv();
  return createClient(url, anonKey);
};

export const createSupabaseBrowserClientOrNull = () => {
  const env = getSupabasePublicEnvOrNull();
  if (!env) return null;
  return createClient(env.url, env.anonKey);
};
