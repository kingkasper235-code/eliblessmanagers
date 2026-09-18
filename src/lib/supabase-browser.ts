import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase";

function getOrCreateBrowserClient() {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  if (!globalThis.__eliblessSupabaseBrowserClient) {
    globalThis.__eliblessSupabaseBrowserClient = createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return globalThis.__eliblessSupabaseBrowserClient;
}

export function createBrowserSupabaseClient() {
  return getOrCreateBrowserClient();
}

export const supabaseBrowser = getOrCreateBrowserClient();

declare global {
  var __eliblessSupabaseBrowserClient: ReturnType<typeof createClient> | undefined;
}
