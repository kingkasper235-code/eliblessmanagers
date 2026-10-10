import { createServerSupabaseClient } from "@/lib/supabase-server";

export type OwnerRecord = {
  id: number;
  slot_number: number;
  name: string;
  title: string;
  bio: string;
  photo_url: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

function normalizeOwner(record: Partial<OwnerRecord> | null | undefined): OwnerRecord | null {
  if (!record) {
    return null;
  }

  return {
    id: Number(record.id ?? 0),
    slot_number: Number(record.slot_number ?? 0),
    name: String(record.name ?? "").trim(),
    title: String(record.title ?? "").trim(),
    bio: String(record.bio ?? "").trim(),
    photo_url: String(record.photo_url ?? "").trim(),
    is_active: Boolean(record.is_active),
    created_at: record.created_at ?? null,
    updated_at: record.updated_at ?? null,
  };
}

export async function getOwners(): Promise<OwnerRecord[]> {
  return (await getOwnersResult()).owners;
}

export async function getOwnersResult(): Promise<{ owners: OwnerRecord[]; error: string | null }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      owners: [],
      error: "Supabase is not configured. Add the project URL and publishable key to manage owner profiles.",
    };
  }

  const { data, error } = await supabase
    .from("owners")
    .select("*")
    .order("slot_number", { ascending: true });

  if (error) {
    console.error("Failed to load owners", error);
    return { owners: [], error: error.message };
  }

  return {
    owners: (data ?? [])
      .map((entry) => normalizeOwner(entry))
      .filter((entry): entry is OwnerRecord => Boolean(entry)),
    error: null,
  };
}

export async function getActiveOwners(): Promise<OwnerRecord[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("owners")
    .select("*")
    .eq("is_active", true)
    .order("slot_number", { ascending: true })
    .limit(2);

  if (error) {
    console.error("Failed to load active owners", error);
    return [];
  }

  return (data ?? [])
    .map((entry) => normalizeOwner(entry))
    .filter((entry): entry is OwnerRecord => Boolean(entry));
}
