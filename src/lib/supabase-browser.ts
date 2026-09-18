import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase";

function getOrCreateBrowserClient() {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  if (!globalThis.__eliblessSupabaseBrowserClient) {
    globalThis.__eliblessSupabaseBrowserClient = createBrowserClient(config.url, config.key);
  }

  return globalThis.__eliblessSupabaseBrowserClient;
}

export function createBrowserSupabaseClient() {
  return getOrCreateBrowserClient();
}

export const supabaseBrowser = getOrCreateBrowserClient();

declare global {
  var __eliblessSupabaseBrowserClient: ReturnType<typeof createBrowserClient> | undefined;
}
