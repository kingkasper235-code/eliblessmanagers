"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";

import { savePropertyAction } from "@/lib/admin-actions";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type GalleryImage = {
  id: string;
  url: string;
  display_order: number;
  is_primary: boolean;
};

function buildPropertyStoragePath(propertyId: string | number, fileName: string) {
  const safePropertyId = String(propertyId ?? "").trim();

  if (!safePropertyId || safePropertyId === "undefined" || safePropertyId === "null") {
    throw new Error("Save the property first before uploading images so the file can be stored under properties/{propertyId}/.");
  }

  const baseName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `properties/${safePropertyId}/${uniqueSuffix}-${baseName}`;
}

function normalizeGalleryImages(defaultValues?: Record<string, unknown>) {
  const gallery = Array.isArray((defaultValues as { property_images?: Array<Record<string, unknown>> } | undefined)?.property_images)
    ? ((defaultValues as { property_images?: Array<Record<string, unknown>> }).property_images ?? [])
    : [];

  return gallery
    .map((image, index) => ({
      id: `${String(image.image_url ?? "img")}-${index}`,
      url: String(image.image_url ?? ""),
      display_order: Number(image.display_order ?? index),
      is_primary: Boolean(image.is_primary),
    }))
    .filter((image) => image.url);
}

export function PropertyForm({
  defaultValues,
  mode,
}: {
  defaultValues?: Record<string, unknown>;
  mode: "create" | "edit";
}) {
  const values = defaultValues ?? {};
  const [images, setImages] = useState<GalleryImage[]>(() => normalizeGalleryImages(values));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const primaryImage = images.find((image) => image.is_primary) ?? images[0] ?? null;
  const imagePayload = JSON.stringify(
    images.map(({ url, display_order, is_primary }) => ({
      url,
      display_order,
      is_primary,
    })),
  );

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setUploadError("Supabase is not configured. Add your public URL and publishable key to enable image uploads.");
      return;
    }

    const propertyId = typeof values.id === "string" || typeof values.id === "number" ? values.id : undefined;

    if (!propertyId) {
      setUploadError("Save the property first before uploading images so the file is stored under properties/{propertyId}/.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error("You must be signed in as an authenticated admin before uploading images.");
      }

      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const bucketName = "property-images";
          const storagePath = buildPropertyStoragePath(propertyId, file.name);

          console.error("[Property image upload debug]", {
            userId: session.user.id,
            bucketName,
            storagePath,
            fileName: file.name,
          });

          const { data, error } = await supabase.storage.from(bucketName).upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

          if (error || !data) {
            console.error("[Property image upload failed]", {
              userId: session.user.id,
              bucketName,
              storagePath,
              errorMessage: error?.message ?? "Unable to upload image.",
            });
            throw new Error(error?.message ?? "Unable to upload image.");
          }

          const publicUrl = supabase.storage.from(bucketName).getPublicUrl(data.path).data.publicUrl;

          return {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            url: publicUrl,
            display_order: images.length + Math.random(),
            is_primary: images.length === 0,
          } satisfies GalleryImage;
        }),
      );

      setImages((current) => {
        const merged = [...current, ...uploadedImages];
        return merged.map((image, index) => ({
          ...image,
          display_order: index,
          is_primary: index === 0,
        }));
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed.";
      setUploadError(message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((current) => {
      const next = current.filter((_, index) => index !== indexToRemove);

      if (!next.length) {
        return [];
      }

      return next.map((image, index) => ({
        ...image,
        display_order: index,
        is_primary: index === 0,
      }));
    });
  };

  return (
    <form action={savePropertyAction} className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      {mode === "edit" && values.id ? (
        <input type="hidden" name="propertyId" value={String(values.id)} />
      ) : null}
      <input type="hidden" name="images" value={imagePayload} />
      <input type="hidden" name="imageUrl" value={primaryImage?.url ?? String(values.image_url ?? values.image ?? "")} />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Property title</label>
          <input
            name="title"
            defaultValue={String(values.title ?? "")}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
          <input
            name="slug"
            defaultValue={String(values.slug ?? "")}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
          <input
            name="price"
            type="number"
            defaultValue={Number(values.price ?? 0)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Currency</label>
          <select
            name="currency"
            defaultValue={String(values.currency ?? "NGN")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          >
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Property type</label>
          <select
            name="propertyType"
            defaultValue={String(values.property_type ?? "Apartment")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          >
            <option>Apartment</option>
            <option>Duplex</option>
            <option>Villa</option>
            <option>Townhouse</option>
            <option>Office</option>
            <option>Land</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Listing type</label>
          <select
            name="listingType"
            defaultValue={String(values.listing_type ?? "sale")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          >
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
          <input
            name="location"
            defaultValue={String(values.location ?? "")}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
          <input
            name="address"
            defaultValue={String(values.address ?? "")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
          <input
            name="city"
            defaultValue={String(values.city ?? "")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">State</label>
          <input
            name="state"
            defaultValue={String(values.state ?? "")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Bedrooms</label>
          <input
            name="bedrooms"
            type="number"
            defaultValue={Number(values.bedrooms ?? 0)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Bathrooms</label>
          <input
            name="bathrooms"
            type="number"
            defaultValue={Number(values.bathrooms ?? 0)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Toilets</label>
          <input
            name="toilets"
            type="number"
            defaultValue={Number(values.toilets ?? 0)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Property size (sq ft)</label>
          <input
            name="propertySize"
            type="number"
            defaultValue={Number(values.property_size ?? 0)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Year built</label>
          <input
            name="yearBuilt"
            type="number"
            defaultValue={Number(values.year_built ?? 0)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            defaultValue={String(values.status ?? "available")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          >
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="leased">Leased</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            defaultValue={String(values.description ?? "")}
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Amenities (comma separated)</label>
          <input
            name="amenities"
            defaultValue={String(
              Array.isArray(values.property_amenities)
                ? values.property_amenities
                    .map((item: { amenity?: string; name?: string }) => item.amenity ?? item.name)
                    .filter(Boolean)
                    .join(", ")
                : "",
            )}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-slate-700">Property gallery</label>
            <label className="inline-flex cursor-pointer items-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
              {uploading ? "Uploading..." : "Upload images"}
            </label>
          </div>

          {uploadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</div>
          ) : null}

          {images.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((image, index) => (
                <div key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="relative h-32 overflow-hidden">
                    <Image src={image.url} alt={`Property ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    {image.is_primary ? (
                      <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Primary
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => setImages((current) => current.map((item, itemIndex) => ({ ...item, is_primary: itemIndex === index }))) }
                      className="text-xs font-medium text-slate-700 underline-offset-2 hover:underline"
                    >
                      {image.is_primary ? "Primary" : "Set primary"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              No images uploaded yet. Add at least one image to make the listing look complete.
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input name="featured" type="checkbox" defaultChecked={Boolean(values.featured)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
            Featured
          </label>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input name="published" type="checkbox" defaultChecked={Boolean(values.published)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
            Published
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">
          Cancel
        </button>
        <button type="submit" disabled={uploading} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
          {mode === "create" ? "Add property" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
