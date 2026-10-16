'use server';

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { PROPERTY_VIDEO_BUCKET, getYouTubeEmbedUrl } from "@/lib/property-videos";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function normalizeCommaSeparated(value?: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidPropertyVideoId(videoId: number) {
  return Number.isSafeInteger(videoId) && videoId > 0;
}

export async function loginAction(
  _previousState: { error: string },
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured. Add your project URL and publishable key." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    return { error: "Invalid credentials. Please try again." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Unable to verify your admin session. Please try again." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id, role")
    .eq("id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return {
      error: "This account is not authorized for the admin panel.",
    };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/admin/login");
}

export async function savePropertyAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const propertyId = formData.get("propertyId")?.toString();
  const title = formData.get("title")?.toString() ?? "";
  const requestedSlug = formData.get("slug")?.toString() ?? "";
  const description = formData.get("description")?.toString() ?? "";
  const price = Number(formData.get("price") ?? 0);
  const currency = formData.get("currency")?.toString() ?? "NGN";
  const propertyType = formData.get("propertyType")?.toString() ?? "Apartment";
  const listingType = formData.get("listingType")?.toString() ?? "sale";
  const location = formData.get("location")?.toString() ?? "";
  const address = formData.get("address")?.toString() ?? "";
  const city = formData.get("city")?.toString() ?? "";
  const state = formData.get("state")?.toString() ?? "";
  const bedrooms = Number(formData.get("bedrooms") ?? 0);
  const bathrooms = Number(formData.get("bathrooms") ?? 0);
  const toilets = Number(formData.get("toilets") ?? 0);
  const propertySize = Number(formData.get("propertySize") ?? 0);
  const yearBuilt = Number(formData.get("yearBuilt") ?? 0) || null;
  const status = formData.get("status")?.toString() ?? "available";
  const featured = formData.get("featured") === "on" || formData.get("featured") === "true";
  const published = formData.get("published") === "on" || formData.get("published") === "true" || formData.get("published") === "published";
  const rawImages = formData.get("images")?.toString() ?? "[]";
  const amenities = normalizeCommaSeparated(formData.get("amenities")?.toString());

  if (!title.trim()) {
    throw new Error("Property title is required.");
  }

  if (propertyId && (!Number.isSafeInteger(Number(propertyId)) || Number(propertyId) <= 0)) {
    throw new Error("A valid property ID is required.");
  }

  if (!location.trim()) {
    throw new Error("Property area or location is required.");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("A valid price is required.");
  }

  let uniqueSlug = requestedSlug && requestedSlug.trim() ? slugify(requestedSlug) : slugify(title);

  if (!uniqueSlug) {
    throw new Error("A valid slug could not be generated from the title.");
  }

  const { data: existingSlug } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", uniqueSlug)
    .maybeSingle();

  if (existingSlug && (!propertyId || Number(existingSlug.id) !== Number(propertyId))) {
    let counter = 2;
    while (true) {
      const nextCandidate = `${uniqueSlug}-${counter}`;
      const { data: nextMatch } = await supabase
        .from("properties")
        .select("id")
        .eq("slug", nextCandidate)
        .maybeSingle();

      if (!nextMatch) {
        uniqueSlug = nextCandidate;
        break;
      }

      counter += 1;
    }
  }

  const imagePayload = JSON.parse(rawImages || "[]");
  const preparedImages = Array.isArray(imagePayload)
    ? imagePayload
        .filter((item) => item && typeof item.url === "string" && item.url.trim())
        .map((item, index) => ({
          image_url: item.url,
          display_order: Number(item.display_order ?? index),
          is_primary: Boolean(item.is_primary),
        }))
    : [];

  const propertyPayload = {
    title: title.trim(),
    slug: uniqueSlug,
    description: description.trim(),
    price,
    currency,
    property_type: propertyType,
    listing_type: listingType,
    location: location.trim(),
    address: address.trim(),
    city: city.trim(),
    state: state.trim(),
    bedrooms,
    bathrooms,
    toilets,
    property_size: propertySize,
    year_built: yearBuilt,
    status,
    featured,
    published,
    updated_at: new Date().toISOString(),
  };

  let propertyIdNumber: number;

  if (propertyId) {
    const { error } = await supabase
      .from("properties")
      .update(propertyPayload)
      .eq("id", Number(propertyId));

    if (error) {
      throw new Error(error.message);
    }

    propertyIdNumber = Number(propertyId);
  } else {
    const { data, error } = await supabase
      .from("properties")
      .insert({ ...propertyPayload, created_at: new Date().toISOString() })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to create property.");
    }

    propertyIdNumber = Number(data.id);
  }

  await supabase.from("property_images").delete().eq("property_id", propertyIdNumber);

  if (preparedImages.length) {
    const normalizedImages = preparedImages
      .map((item, index) => ({
        property_id: propertyIdNumber,
        image_url: item.image_url,
        display_order: Number(item.display_order ?? index),
        is_primary: Boolean(item.is_primary) || index === 0,
      }))
      .sort((a, b) => Number(a.display_order) - Number(b.display_order));

    const primarySet = normalizedImages.some((item) => item.is_primary);
    const imagesToInsert = primarySet
      ? normalizedImages
      : normalizedImages.map((item, index) => ({
          ...item,
          is_primary: index === 0,
        }));

    const { error: imageError } = await supabase.from("property_images").insert(imagesToInsert);

    if (imageError) {
      throw new Error(imageError.message);
    }
  }

  await supabase.from("property_amenities").delete().eq("property_id", propertyIdNumber);

  if (amenities.length) {
    const insertRows = amenities.map((amenity) => ({
      property_id: propertyIdNumber,
      amenity,
    }));

    const { error: amenityError } = await supabase.from("property_amenities").insert(insertRows);

    if (amenityError) {
      throw new Error(amenityError.message);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  revalidatePath(`/property/${uniqueSlug}`);

  return {
    propertyId: propertyIdNumber,
    slug: uniqueSlug,
  };
}

type PropertyVideoRow = {
  id: number;
  property_id: number;
  storage_path: string | null;
  source_type: "upload" | "youtube";
  video_url: string | null;
  title: string;
  display_order: number;
  upload_status: "pending" | "ready" | "failed";
  replaces_video_id: number | null;
  created_at: string;
};

export async function createPropertyVideoUploadAction({
  propertyId,
  title,
  displayOrder,
  replacesVideoId,
}: {
  propertyId: number;
  title: string;
  displayOrder: number;
  replacesVideoId?: number;
}) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) {
    throw new Error("Save the property before uploading a video.");
  }

  if (!Number.isSafeInteger(displayOrder) || displayOrder < 0) {
    throw new Error("A valid video order is required.");
  }

  if (replacesVideoId !== undefined) {
    if (!isValidPropertyVideoId(replacesVideoId)) {
      throw new Error("A valid video must be selected for replacement.");
    }

    const { data: replacedVideo, error: replacedVideoError } = await supabase
      .from("property_videos")
      .select("property_id, upload_status, source_type")
      .eq("id", replacesVideoId)
      .maybeSingle();

    if (replacedVideoError || !replacedVideo || replacedVideo.property_id !== propertyId) {
      throw new Error("The video selected for replacement could not be found.");
    }

    if (replacedVideo.source_type !== "upload" || replacedVideo.upload_status !== "ready") {
      throw new Error("Only a successfully uploaded video can be replaced.");
    }
  }

  const storagePath = `properties/${propertyId}/${randomUUID()}.mp4`;
  const { data, error } = await supabase
    .from("property_videos")
    .insert({
      property_id: propertyId,
      storage_path: storagePath,
      source_type: "upload",
      video_url: null,
      title: title.trim().slice(0, 160),
      display_order: displayOrder,
      upload_status: "pending",
      replaces_video_id: replacesVideoId ?? null,
    })
    .select(
      "id, property_id, storage_path, source_type, video_url, title, display_order, upload_status, replaces_video_id, created_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to reserve a video upload.");
  }

  revalidatePath("/admin/properties");

  return {
    id: data.id,
    storagePath: data.storage_path,
  };
}

export async function beginPropertyVideoUploadAction(videoId: number) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  if (!isValidPropertyVideoId(videoId)) {
    throw new Error("A valid video ID is required.");
  }

  const { data: video, error: lookupError } = await supabase
    .from("property_videos")
    .select("id, storage_path, source_type, upload_status")
    .eq("id", videoId)
    .maybeSingle();

  if (lookupError || !video || video.source_type !== "upload" || !video.storage_path) {
    throw new Error(lookupError?.message ?? "The video upload record could not be found.");
  }

  if (video.upload_status === "ready") {
    throw new Error("This video is already uploaded.");
  }

  const { error } = await supabase
    .from("property_videos")
    .update({ upload_status: "pending" })
    .eq("id", videoId);

  if (error) {
    throw new Error(error.message);
  }

  return { id: video.id, storagePath: video.storage_path };
}

export async function failPropertyVideoUploadAction(videoId: number) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  if (!isValidPropertyVideoId(videoId)) {
    throw new Error("A valid video ID is required.");
  }

  const { error } = await supabase
    .from("property_videos")
    .update({ upload_status: "failed" })
    .eq("id", videoId)
    .eq("source_type", "upload")
    .neq("upload_status", "ready");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/properties");
}

export async function completePropertyVideoUploadAction(videoId: number) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  if (!isValidPropertyVideoId(videoId)) {
    throw new Error("A valid video ID is required.");
  }

  const { data: pendingVideo, error: lookupError } = await supabase
    .from("property_videos")
    .select(
      "id, property_id, storage_path, source_type, video_url, title, display_order, upload_status, replaces_video_id, created_at",
    )
    .eq("id", videoId)
    .maybeSingle();

  if (
    lookupError ||
    !pendingVideo ||
    pendingVideo.source_type !== "upload" ||
    !pendingVideo.storage_path
  ) {
    throw new Error(lookupError?.message ?? "The video upload record could not be found.");
  }

  const { error: storageError } = await supabase.storage
    .from(PROPERTY_VIDEO_BUCKET)
    .createSignedUrl(pendingVideo.storage_path, 60);

  if (storageError) {
    throw new Error(`The uploaded video could not be verified: ${storageError.message}`);
  }

  const { data, error } = await supabase
    .from("property_videos")
    .update({ upload_status: "ready" })
    .eq("id", videoId)
    .select(
      "id, property_id, storage_path, source_type, video_url, title, display_order, upload_status, replaces_video_id, created_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "The uploaded video could not be saved.");
  }

  let cleanupError: string | null = null;
  const replacedVideoId = data.replaces_video_id;
  let hiddenPreviousVideoId: number | null = null;

  if (replacedVideoId) {
    const { data: oldVideo, error: oldVideoError } = await supabase
      .from("property_videos")
      .select("id, storage_path, source_type, upload_status")
      .eq("id", replacedVideoId)
      .eq("property_id", data.property_id)
      .maybeSingle();

    if (oldVideoError) {
      cleanupError = `The new video is ready, but the previous video could not be checked: ${oldVideoError.message}`;
    } else if (oldVideo) {
      if (oldVideo.source_type === "upload" && oldVideo.storage_path) {
        const { data: hiddenVideo, error: hideError } = await supabase
          .from("property_videos")
          .update({ upload_status: "pending" })
          .eq("id", replacedVideoId)
          .eq("property_id", data.property_id)
          .eq("upload_status", "ready")
          .select("id")
          .maybeSingle();

        if (hideError || !hiddenVideo) {
          cleanupError = `The new video is ready, but the previous video could not be safely prepared for replacement: ${hideError?.message ?? "The video is no longer ready."}`;
        } else {
          hiddenPreviousVideoId = replacedVideoId;
          const { error: removeError } = await supabase.storage
            .from(PROPERTY_VIDEO_BUCKET)
            .remove([oldVideo.storage_path]);

          if (removeError) {
            cleanupError = `The new video is ready, but the previous video could not be removed: ${removeError.message}`;
          }
        }
      }

      if (!cleanupError) {
        const { error: deleteError } = await supabase
          .from("property_videos")
          .delete()
          .eq("id", replacedVideoId)
          .eq("property_id", data.property_id);

        if (deleteError) {
          cleanupError = `The new video is ready, but the previous video's record could not be removed: ${deleteError.message}`;
        }
      }
    }
  }

  revalidatePath("/admin/properties");
  revalidatePath("/property/[slug]", "page");

  return {
    video: {
      ...(data as PropertyVideoRow),
      replaces_video_id: cleanupError ? replacedVideoId : null,
    },
    replacedVideoId: cleanupError ? null : replacedVideoId,
    hiddenPreviousVideoId,
    cleanupError,
  };
}

export async function createYouTubePropertyVideoAction({
  propertyId,
  videoUrl,
  title,
  displayOrder,
}: {
  propertyId: number;
  videoUrl: string;
  title: string;
  displayOrder: number;
}) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) {
    throw new Error("Save the property before adding a video link.");
  }

  const safeEmbedUrl = getYouTubeEmbedUrl(videoUrl.trim());
  if (!safeEmbedUrl) {
    throw new Error("Enter a valid YouTube video URL.");
  }

  if (!Number.isSafeInteger(displayOrder) || displayOrder < 0) {
    throw new Error("A valid video order is required.");
  }

  const { data, error } = await supabase
    .from("property_videos")
    .insert({
      property_id: propertyId,
      source_type: "youtube",
      storage_path: null,
      video_url: safeEmbedUrl,
      title: title.trim().slice(0, 160),
      display_order: displayOrder,
      upload_status: "ready",
    })
    .select(
      "id, property_id, storage_path, source_type, video_url, title, display_order, upload_status, replaces_video_id, created_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to save the YouTube video.");
  }

  revalidatePath("/admin/properties");
  revalidatePath("/property/[slug]", "page");

  return data as PropertyVideoRow;
}

export async function updatePropertyVideoAction({
  videoId,
  title,
  displayOrder,
}: {
  videoId: number;
  title: string;
  displayOrder: number;
}) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  if (!isValidPropertyVideoId(videoId)) {
    throw new Error("A valid video ID is required.");
  }

  if (!Number.isSafeInteger(displayOrder) || displayOrder < 0) {
    throw new Error("A valid video order is required.");
  }

  const { error } = await supabase
    .from("property_videos")
    .update({ title: title.trim().slice(0, 160), display_order: displayOrder })
    .eq("id", videoId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deletePropertyVideoAction(videoId: number) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  if (!isValidPropertyVideoId(videoId)) {
    throw new Error("A valid video ID is required.");
  }

  const { data: video, error: lookupError } = await supabase
    .from("property_videos")
    .select("id, property_id, storage_path, source_type")
    .eq("id", videoId)
    .maybeSingle();

  if (lookupError || !video) {
    throw new Error(lookupError?.message ?? "The video could not be found.");
  }

  if (video.source_type === "upload" && video.storage_path) {
    const { error: hideError } = await supabase
      .from("property_videos")
      .update({ upload_status: "pending" })
      .eq("id", videoId);

    if (hideError) {
      throw new Error(`The video could not be safely prepared for deletion: ${hideError.message}`);
    }

    const { error: removeError } = await supabase.storage
      .from(PROPERTY_VIDEO_BUCKET)
      .remove([video.storage_path]);

    if (removeError) {
      revalidatePath("/admin/properties");
      revalidatePath("/property/[slug]", "page");
      return {
        deleted: false as const,
        uploadStatus: "pending" as const,
        error: `The video file could not be removed. The video is now hidden from the public listing: ${removeError.message}`,
      };
    }
  }

  const { error } = await supabase
    .from("property_videos")
    .delete()
    .eq("id", videoId);

  if (error) {
    revalidatePath("/admin/properties");
    revalidatePath("/property/[slug]", "page");
    return {
      deleted: false as const,
      uploadStatus: video.source_type === "upload" ? "pending" as const : "ready" as const,
      error: video.source_type === "upload"
        ? `The video file was removed, but its record could not be deleted. The record is now hidden from the public listing: ${error.message}`
        : `The video could not be deleted: ${error.message}`,
    };
  }

  revalidatePath("/admin/properties");
  revalidatePath("/property/[slug]", "page");
  return { deleted: true as const };
}

export async function deletePropertyAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const propertyId = Number(formData.get("propertyId") ?? 0);

  if (!propertyId) {
    throw new Error("Property ID is required.");
  }

  const { data: videos, error: videoLookupError } = await supabase
    .from("property_videos")
    .select("id, storage_path, upload_status")
    .eq("property_id", propertyId)
    .eq("source_type", "upload");

  if (videoLookupError) {
    throw new Error(`Unable to check property videos before deleting this property: ${videoLookupError.message}`);
  }

  const uploadedVideos = videos ?? [];
  for (const video of uploadedVideos) {
    if (video.upload_status === "ready") {
      const { error: hideError } = await supabase
        .from("property_videos")
        .update({ upload_status: "pending" })
        .eq("id", video.id);

      if (hideError) {
        throw new Error(`Unable to safely prepare this property's videos for deletion: ${hideError.message}`);
      }
    }
  }

  for (const video of uploadedVideos) {
    if (!video.storage_path) {
      continue;
    }

    const { error: removeError } = await supabase.storage
      .from(PROPERTY_VIDEO_BUCKET)
      .remove([video.storage_path]);

    if (removeError) {
      throw new Error(`Unable to remove this property's videos. The property was not deleted: ${removeError.message}`);
    }
  }

  const { error } = await supabase.from("properties").delete().eq("id", propertyId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  redirect("/admin/properties");
}
