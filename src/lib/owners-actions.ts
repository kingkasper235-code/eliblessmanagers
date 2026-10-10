"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const ownerSlots = [1, 2] as const;

export async function saveOwnerAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  for (const slot of ownerSlots) {
    const name = String(formData.get(`slot-${slot}-name`) ?? "").trim();
    const title = String(formData.get(`slot-${slot}-title`) ?? "").trim();
    const bio = String(formData.get(`slot-${slot}-bio`) ?? "").trim();
    const photoUrl = String(formData.get(`slot-${slot}-photo-url`) ?? "").trim();
    const isActive = formData.get(`slot-${slot}-active`) === "on";

    if (name.length > 100 || title.length > 120 || bio.length > 1600) {
      throw new Error(`Owner ${slot} profile exceeds the allowed field length.`);
    }
    if (isActive && !name) {
      throw new Error(`Add a name to Owner ${slot} before making the profile public.`);
    }

    const ownerPayload = {
      slot_number: slot,
      name,
      title,
      bio,
      photo_url: photoUrl,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("owners")
      .upsert(ownerPayload, { onConflict: "slot_number" });

    if (error) {
      throw new Error(`Owner ${slot} could not be saved: ${error.message}`);
    }
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/settings");
  redirect(`/admin/settings?success=${encodeURIComponent("Owner profiles updated.")}`);
}
