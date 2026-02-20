import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicEnv, getSupabasePublicEnvOrNull } from "@/lib/supabase/env";

export const createSupabaseServerClient = async () => {
  const { url, anonKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // no-op in server component contexts where set is not allowed
          }
        });
      }
    }
  });
};

export const createSupabaseServerClientOrNull = async () => {
  const env = getSupabasePublicEnvOrNull();
  if (!env) return null;
  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // no-op in server component contexts where set is not allowed
          }
        });
      }
    }
  });
};
