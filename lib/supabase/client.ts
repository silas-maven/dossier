import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv, getSupabasePublicEnvOrNull } from "@/lib/supabase/env";

export const createSupabaseBrowserClient = () => {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
};

export const createSupabaseBrowserClientOrNull = () => {
  const env = getSupabasePublicEnvOrNull();
  if (!env) return null;
  return createBrowserClient(env.url, env.anonKey);
};
