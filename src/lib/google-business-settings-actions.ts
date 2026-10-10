"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import {
  DEFAULT_GOOGLE_BUSINESS_LISTING_URL,
  isAllowedGoogleMapsUrl,
  isValidGooglePlaceId,
  verifyGoogleBusinessPlaceId,
  type GoogleBusinessConnectionStatus,
} from "@/lib/google-business-settings";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type GoogleBusinessSettingsActionState = {
  kind: "idle" | "success" | "error";
  message: string;
  savedLiveDataEnabled?: boolean;
};

export async function saveGoogleBusinessSettingsAction(
  _previousState: GoogleBusinessSettingsActionState,
  formData: FormData,
): Promise<GoogleBusinessSettingsActionState> {
  await requireAdmin();

  const listingUrl =
    String(formData.get("listing_url") ?? "").trim() ||
    DEFAULT_GOOGLE_BUSINESS_LISTING_URL;
  const placeIdValue = String(formData.get("place_id") ?? "").trim();
  const placeId = placeIdValue || null;
  const widgetEnabled = formData.get("widget_enabled") === "on";
  const liveRequested = formData.get("live_data_enabled") === "on";

  if (listingUrl.length > 2048 || !isAllowedGoogleMapsUrl(listingUrl)) {
    return {
      kind: "error",
      message: "Enter a valid HTTPS Google Maps listing link.",
    };
  }
  if (placeId && !isValidGooglePlaceId(placeId)) {
    return {
      kind: "error",
      message: "Place ID must be 1–255 letters, numbers, underscores or hyphens.",
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      kind: "error",
      message: "Supabase is not configured. Add the public project URL and publishable key.",
    };
  }

  const { data: existingData, error: readError } = await supabase
    .from("google_business_settings")
    .select("place_id, connection_status, checked_at")
    .eq("id", 1)
    .maybeSingle();

  if (readError) {
    console.error("[google-business-settings] Existing settings read failed", {
      code: readError.code,
    });
    return {
      kind: "error",
      message: "Settings could not be loaded. Apply the documented Supabase migration and try again.",
    };
  }

  const existing = existingData as {
    place_id?: string | null;
    connection_status?: GoogleBusinessConnectionStatus;
    checked_at?: string | null;
  } | null;
  let liveDataEnabled = false;
  let connectionStatus: GoogleBusinessConnectionStatus = "not_configured";
  let checkedAt: string | null = null;
  let feedback: GoogleBusinessSettingsActionState = {
    kind: "success",
    message: "Google Business settings saved.",
  };

  if (liveRequested) {
    if (!placeId || !process.env.GOOGLE_PLACES_API_KEY?.trim()) {
      feedback = {
        kind: "error",
        message: "Fallback settings were saved, but live data is off. Add a Place ID and configure GOOGLE_PLACES_API_KEY on the server before connecting.",
      };
    } else {
      const verification = await verifyGoogleBusinessPlaceId(placeId);
      connectionStatus = verification.status;
      checkedAt = verification.checkedAt;
      if (verification.status === "connected") {
        liveDataEnabled = true;
        feedback.message = "Google Business settings saved and the Place ID was verified.";
      } else if (verification.status === "error") {
        feedback = {
          kind: "error",
          message: "Fallback settings were saved, but live data is off because Google Places could not verify this Place ID. Check the ID, API key, API access and billing, then try again.",
        };
      } else {
        feedback = {
          kind: "error",
          message: "Fallback settings were saved, but live data is off because the Places API key is not configured.",
        };
      }
    }
  } else if (
    placeId &&
    placeId === existing?.place_id &&
    (existing.connection_status === "connected" ||
      existing.connection_status === "error")
  ) {
    connectionStatus = existing.connection_status;
    checkedAt = existing.checked_at ?? null;
  }

  if (!placeId || !process.env.GOOGLE_PLACES_API_KEY?.trim()) {
    connectionStatus = "not_configured";
    checkedAt = null;
  } else if (placeId !== existing?.place_id && !liveRequested) {
    connectionStatus = "not_configured";
    checkedAt = null;
  }

  const { error: saveError } = await supabase
    .from("google_business_settings")
    .upsert(
      {
        id: 1,
        listing_url: listingUrl,
        place_id: placeId,
        widget_enabled: widgetEnabled,
        live_data_enabled: liveDataEnabled,
        connection_status: connectionStatus,
        checked_at: checkedAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  if (saveError) {
    console.error("[google-business-settings] Save failed", {
      code: saveError.code,
    });
    return {
      kind: "error",
      message: "Google Business settings could not be saved. Confirm the settings migration is applied and try again.",
    };
  }

  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  return { ...feedback, savedLiveDataEnabled: liveDataEnabled };
}
