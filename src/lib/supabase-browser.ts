import { createBrowserClient } from "@supabase/ssr";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase";

type BrowserAuthListener = (
  event: AuthChangeEvent,
  session: Session | null,
) => void;

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
        if (event === "PASSWORD_RECOVERY") {
          globalThis.__eliblessSupabaseRecoveryUserId =
            session?.user?.id;
        } else if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          globalThis.__eliblessSupabaseRecoveryUserId = undefined;
        }
        globalThis.__eliblessSupabaseAuthListeners?.forEach((listener) =>
          listener(event, session),
        );
      });
    }
  }

  return globalThis.__eliblessSupabaseBrowserClient;
}

export function createBrowserSupabaseClient() {
  return getOrCreateBrowserClient();
}

export function subscribeToBrowserAuthChanges(listener: BrowserAuthListener) {
  const listeners =
    globalThis.__eliblessSupabaseAuthListeners ??
    (globalThis.__eliblessSupabaseAuthListeners = new Set());
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      globalThis.__eliblessSupabaseAuthListeners = undefined;
    }
  };
}

export type PasswordRecoverySessionStatus =
  | "valid"
  | "invalid"
  | "unavailable";

export async function checkPasswordRecoverySession(): Promise<PasswordRecoverySessionStatus> {
  const supabase = getOrCreateBrowserClient();
  if (!supabase || typeof window === "undefined") {
    return "unavailable";
  }

  try {
    const { error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return "unavailable";
    }

    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));

    const recoveryUserId = globalThis.__eliblessSupabaseRecoveryUserId;
    if (!recoveryUserId) {
      return "invalid";
    }

    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return !error.status || error.status >= 500
        ? "unavailable"
        : "invalid";
    }

    return data.user?.id === recoveryUserId &&
      globalThis.__eliblessSupabaseRecoveryUserId === recoveryUserId
      ? "valid"
      : "invalid";
  } catch (caughtError) {
    console.error("[admin-password-reset] Recovery session validation failed", {
      reason: caughtError instanceof Error ? caughtError.name : "unknown",
    });
    return "unavailable";
  }
}

export const supabaseBrowser = getOrCreateBrowserClient();

declare global {
  var __eliblessSupabaseBrowserClient: ReturnType<typeof createBrowserClient> | undefined;
  var __eliblessSupabaseRecoveryUserId: string | undefined;
  var __eliblessSupabaseAuthListeners: Set<BrowserAuthListener> | undefined;
}
