import "server-only";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

const requireServerEnv = (value: string | undefined, key: string) => {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const getSupabaseServiceEnv = () => {
  const { url } = getSupabasePublicEnv();
  const serviceRoleKey = requireServerEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY"
  );
  return { url, serviceRoleKey };
};
