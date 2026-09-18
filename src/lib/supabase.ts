import { createClient } from "@supabase/supabase-js";

export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return {
    url: supabaseUrl,
    key: supabasePublishableKey,
  };
}

export function createSupabaseClient() {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
    },
  });
}

export const supabase = createSupabaseClient();
export const hasSupabaseConfig = Boolean(getSupabaseConfig());
