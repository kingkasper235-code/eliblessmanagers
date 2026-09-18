'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
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
  redirect(`/admin/properties/${propertyIdNumber}/edit?success=${encodeURIComponent(propertyId ? "Property updated successfully." : "Property created successfully.")}`);
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

  const { error } = await supabase.from("properties").delete().eq("id", propertyId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  redirect("/admin/properties");
}
