import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase";

export function createBrowserSupabaseClient() {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  return createClient(config.url, config.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabaseBrowser = createBrowserSupabaseClient();
