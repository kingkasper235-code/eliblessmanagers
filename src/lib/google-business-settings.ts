import "server-only";

import { createSupabaseClient } from "@/lib/supabase";

export const DEFAULT_GOOGLE_BUSINESS_LISTING_URL =
  "https://maps.app.goo.gl/4aRcQcEtzcHtt8878";

const GOOGLE_MAPS_HOSTS = new Set([
  "google.com",
  "www.google.com",
  "maps.google.com",
]);

export type GoogleBusinessConnectionStatus =
  | "not_configured"
  | "connected"
  | "error";

export type GoogleBusinessSettings = {
  id: 1;
  listing_url: string;
  place_id: string | null;
  widget_enabled: boolean;
  live_data_enabled: boolean;
  connection_status: GoogleBusinessConnectionStatus;
  checked_at: string | null;
  updated_at: string | null;
};

const DEFAULT_SETTINGS: GoogleBusinessSettings = {
  id: 1,
  listing_url: DEFAULT_GOOGLE_BUSINESS_LISTING_URL,
  place_id: null,
  widget_enabled: true,
  live_data_enabled: false,
  connection_status: "not_configured",
  checked_at: null,
  updated_at: null,
};

export function isValidGooglePlaceId(value: string): boolean {
  return value.length <= 255 && /^[A-Za-z0-9_-]+$/.test(value);
}

export function isAllowedGoogleMapsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port
    ) {
      return false;
    }

    const hostname = url.hostname.toLowerCase();
    if (hostname === "maps.app.goo.gl") {
      return true;
    }
    if (hostname === "goo.gl") {
      return url.pathname === "/maps" || url.pathname.startsWith("/maps/");
    }

    return GOOGLE_MAPS_HOSTS.has(hostname) &&
      /^\/maps(?:\/|$)/i.test(url.pathname);
  } catch {
    return false;
  }
}

export function hasGooglePlacesApiKey(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim());
}

export async function getGoogleBusinessSettings(): Promise<{
  settings: GoogleBusinessSettings;
  error: string | null;
}> {
  const supabase = createSupabaseClient();
  if (!supabase) {
    return {
      settings: DEFAULT_SETTINGS,
      error: "Supabase is not configured. Add the public project URL and publishable key.",
    };
  }

  const { data, error } = await supabase
    .from("google_business_settings")
    .select(
      "id, listing_url, place_id, widget_enabled, live_data_enabled, connection_status, checked_at, updated_at",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[google-business-settings] Read failed", {
      code: error.code,
    });
    return {
      settings: DEFAULT_SETTINGS,
      error: "Google Business settings could not be loaded. Apply the documented Supabase migration, then reload.",
    };
  }

  if (!data) {
    return { settings: DEFAULT_SETTINGS, error: null };
  }

  const row = data as Partial<GoogleBusinessSettings>;
  const listingUrl =
    typeof row.listing_url === "string" &&
    isAllowedGoogleMapsUrl(row.listing_url)
      ? row.listing_url
      : DEFAULT_SETTINGS.listing_url;
  const placeId =
    typeof row.place_id === "string" &&
    isValidGooglePlaceId(row.place_id)
      ? row.place_id
      : null;
  const status = row.connection_status;

  return {
    settings: {
      id: 1,
      listing_url: listingUrl,
      place_id: placeId,
      widget_enabled: row.widget_enabled === false ? false : true,
      live_data_enabled: row.live_data_enabled === true && Boolean(placeId),
      connection_status:
        status === "connected" || status === "error"
          ? status
          : "not_configured",
      checked_at:
        typeof row.checked_at === "string" ? row.checked_at : null,
      updated_at:
        typeof row.updated_at === "string" ? row.updated_at : null,
    },
    error: null,
  };
}

export async function verifyGoogleBusinessPlaceId(placeId: string): Promise<{
  status: GoogleBusinessConnectionStatus;
  checkedAt: string | null;
}> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!placeId || !apiKey) {
    return { status: "not_configured", checkedAt: null };
  }

  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) {
      console.error("[google-business-settings] Verification failed", {
        status: response.status,
      });
      return { status: "error", checkedAt };
    }

    const result = (await response.json()) as { id?: unknown };
    return {
      status: result.id === placeId ? "connected" : "error",
      checkedAt,
    };
  } catch (error) {
    console.error("[google-business-settings] Verification failed", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return { status: "error", checkedAt };
  }
}
