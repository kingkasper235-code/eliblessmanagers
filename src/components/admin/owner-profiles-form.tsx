"use client";

import Image from "next/image";
import { useState } from "react";

import { saveOwnerAction } from "@/lib/owners-actions";
import type { OwnerRecord } from "@/lib/owners";
import { supabaseBrowser } from "@/lib/supabase-browser";

type OwnerProfile = Pick<OwnerRecord, "slot_number" | "name" | "title" | "bio" | "photo_url" | "is_active">;

const emptyProfile = (slot_number: number): OwnerProfile => ({
  slot_number,
  name: "",
  title: "",
  bio: "",
  photo_url: "",
  is_active: false,
});

export function OwnerProfilesForm({ owners }: { owners: OwnerRecord[] }) {
  const [profiles, setProfiles] = useState<OwnerProfile[]>([1, 2].map((slot) => {
    const owner = owners.find((item) => item.slot_number === slot);
    return owner
      ? {
          slot_number: slot,
          name: owner.name,
          title: owner.title,
          bio: owner.bio,
          photo_url: owner.photo_url,
          is_active: owner.is_active,
        }
      : emptyProfile(slot);
  }));
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const updateProfile = (slot: number, updates: Partial<OwnerProfile>) => {
    setProfiles((current) =>
      current.map((profile) =>
        profile.slot_number === slot ? { ...profile, ...updates } : profile,
      ),
    );
  };

  const uploadPhoto = async (slot: number, file?: File) => {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Choose an image smaller than 5 MB.");
      return;
    }

    const supabase = supabaseBrowser;
    if (!supabase) {
      setUploadError("Supabase is not configured. Add the public project URL and publishable key to enable uploads.");
      return;
    }

    setUploadingSlot(slot);
    setUploadError(null);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Sign in as an authorized admin before uploading a photo.");
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
      if (adminError || !isAdmin) {
        throw new Error("Your account is not authorized to upload owner photos.");
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
      const path = `owners/${slot}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const { data, error } = await supabase.storage
        .from("property-images")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

      if (error || !data) {
        throw new Error(error?.message ?? "The photo could not be uploaded.");
      }

      const photoUrl = supabase.storage.from("property-images").getPublicUrl(data.path).data.publicUrl;
      updateProfile(slot, { photo_url: photoUrl });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "The photo could not be uploaded.");
    } finally {
      setUploadingSlot(null);
    }
  };

  return (
    <form action={saveOwnerAction} className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-2">
        {profiles.map((profile) => (
          <section
            key={profile.slot_number}
            aria-labelledby={`owner-slot-${profile.slot_number}`}
            className="overflow-hidden border border-[var(--brand-border)] bg-white"
          >
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-5 py-4">
              <div>
                <p className="brand-section-kicker">Featured profile</p>
                <h3 id={`owner-slot-${profile.slot_number}`} className="mt-1 text-xl font-semibold">
                  Owner {profile.slot_number}
                </h3>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--brand-navy-dark)]">
                <input
                  type="checkbox"
                  name={`slot-${profile.slot_number}-active`}
                  checked={profile.is_active}
                  onChange={(event) => updateProfile(profile.slot_number, { is_active: event.target.checked })}
                  className="h-4 w-4 accent-[var(--brand-gold)]"
                />
                Show publicly
              </label>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-[150px_minmax(0,1fr)]">
              <div>
                <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden border border-dashed border-[var(--brand-border)] bg-[var(--brand-offwhite)]">
                  {profile.photo_url ? (
                    <Image
                      src={profile.photo_url}
                      alt={`${profile.name || `Owner ${profile.slot_number}`} profile`}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="px-3 text-center text-xs font-semibold leading-5 text-[var(--brand-muted)]">
                      Upload owner photo
                    </span>
                  )}
                </div>
                <label className="mt-2 block cursor-pointer text-center text-xs font-semibold text-[var(--brand-navy)] underline decoration-[var(--brand-gold)] underline-offset-4">
                  {uploadingSlot === profile.slot_number ? "Uploading…" : profile.photo_url ? "Replace photo" : "Upload owner photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingSlot !== null}
                    className="sr-only"
                    onChange={(event) => {
                      void uploadPhoto(profile.slot_number, event.currentTarget.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                <input type="hidden" name={`slot-${profile.slot_number}-photo-url`} value={profile.photo_url} />
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor={`owner-${profile.slot_number}-name`} className="form-label">Name</label>
                  <input
                    id={`owner-${profile.slot_number}-name`}
                    name={`slot-${profile.slot_number}-name`}
                    value={profile.name}
                    onChange={(event) => updateProfile(profile.slot_number, { name: event.target.value })}
                    maxLength={100}
                    className="form-control"
                    placeholder="Owner name"
                  />
                </div>
                <div>
                  <label htmlFor={`owner-${profile.slot_number}-title`} className="form-label">Title</label>
                  <input
                    id={`owner-${profile.slot_number}-title`}
                    name={`slot-${profile.slot_number}-title`}
                    value={profile.title}
                    onChange={(event) => updateProfile(profile.slot_number, { title: event.target.value })}
                    maxLength={120}
                    className="form-control"
                    placeholder="Professional title"
                  />
                </div>
                <div>
                  <label htmlFor={`owner-${profile.slot_number}-bio`} className="form-label">Profile</label>
                  <textarea
                    id={`owner-${profile.slot_number}-bio`}
                    name={`slot-${profile.slot_number}-bio`}
                    value={profile.bio}
                    onChange={(event) => updateProfile(profile.slot_number, { bio: event.target.value })}
                    maxLength={1600}
                    rows={5}
                    className="form-control resize-y"
                    placeholder="Add a short introduction. Leave blank until details are ready."
                  />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {uploadError ? (
        <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {uploadError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[var(--brand-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[var(--brand-muted)]">
          Profiles only appear on the site when they have a name and are marked public.
        </p>
        <button
          type="submit"
          disabled={uploadingSlot !== null}
          className="inline-flex min-h-11 items-center justify-center bg-[var(--brand-navy)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save owner profiles
        </button>
      </div>
    </form>
  );
}
