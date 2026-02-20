const optionalPublicEnv = (value: string | undefined) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const getSupabasePublicEnvOrNull = () => {
  const url = optionalPublicEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = optionalPublicEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !anonKey) return null;
  return { url, anonKey };
};

export const hasSupabasePublicEnv = () => Boolean(getSupabasePublicEnvOrNull());

export const getSupabasePublicEnv = () => {
  const env = getSupabasePublicEnvOrNull();
  if (!env) {
    throw new Error(
      "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return env;
};
