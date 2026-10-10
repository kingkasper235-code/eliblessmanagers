import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase";

function getOrCreateBrowserClient() {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  if (!globalThis.__eliblessSupabaseBrowserClient) {
    const client = createBrowserClient(config.url, config.key);
    globalThis.__eliblessSupabaseBrowserClient = client;
    if (typeof window !== "undefined") {
      client.auth.onAuthStateChange((event, session) => {
        globalThis.__eliblessSupabaseRecoverySession =
          event === "PASSWORD_RECOVERY" && Boolean(session?.user);
      });
    }
  }

  return globalThis.__eliblessSupabaseBrowserClient;
}

export function createBrowserSupabaseClient() {
  return getOrCreateBrowserClient();
}

export async function hasActivePasswordRecoverySession() {
  const supabase = getOrCreateBrowserClient();
  if (!supabase || !globalThis.__eliblessSupabaseRecoverySession) {
    return false;
  }

  const { data, error } = await supabase.auth.getSession();
  return !error && Boolean(data.session?.user);
}

export const supabaseBrowser = getOrCreateBrowserClient();

declare global {
  var __eliblessSupabaseBrowserClient: ReturnType<typeof createBrowserClient> | undefined;
  var __eliblessSupabaseRecoverySession: boolean | undefined;
}
