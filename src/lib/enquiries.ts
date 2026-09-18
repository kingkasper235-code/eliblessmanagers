'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type EnquiryStatus = "New" | "Contacted" | "Closed";

export async function getEnquiries() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [] as Array<{
      id: number;
      property_id: number | null;
      property_title: string | null;
      name: string;
      email: string;
      phone: string;
      message: string;
      status: EnquiryStatus;
      created_at: string;
    }>;
  }

  const { data, error } = await supabase
    .from("enquiries")
    .select("id, property_id, name, email, phone, message, status, created_at, properties(title)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load enquiries", error);
    return [] as Array<{
      id: number;
      property_id: number | null;
      property_title: string | null;
      name: string;
      email: string;
      phone: string;
      message: string;
      status: EnquiryStatus;
      created_at: string;
    }>;
  }

  return (data ?? []).map((item) => {
    const propertyRecord = Array.isArray(item.properties) ? item.properties[0] ?? null : item.properties ?? null;

    return {
      id: Number(item.id),
      property_id: item.property_id ? Number(item.property_id) : null,
      property_title: propertyRecord?.title ? String(propertyRecord.title) : null,
      name: String(item.name ?? ""),
      email: String(item.email ?? ""),
      phone: String(item.phone ?? ""),
      message: String(item.message ?? ""),
      status: (String(item.status ?? "New") as EnquiryStatus) || "New",
      created_at: String(item.created_at ?? new Date().toISOString()),
    };
  });
}

export async function submitEnquiryAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const propertyId = Number(formData.get("propertyId") ?? 0) || null;
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const propertySlug = String(formData.get("propertySlug") ?? "").trim();
  const interest = String(formData.get("interest") ?? "Property enquiry").trim();

  if (!name || !email || !phone || !message) {
    throw new Error("Please complete all enquiry fields.");
  }

  const { error } = await supabase.from("enquiries").insert({
    property_id: propertyId,
    name,
    email,
    phone,
    message: `${interest}\n\n${message}`,
    status: "New",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/enquiries");

  if (propertySlug) {
    redirect(`/property/${propertySlug}?success=${encodeURIComponent("Thank you! Your enquiry has been sent to the Elibless team.")}`);
  }

  redirect(`/contact?success=${encodeURIComponent("Thank you! Your enquiry has been sent to the Elibless team.")}`);
}

export async function updateEnquiryStatusAction(formData: FormData) {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const enquiryId = Number(formData.get("enquiryId") ?? 0);
  const status = String(formData.get("status") ?? "New") as EnquiryStatus;

  if (!enquiryId) {
    throw new Error("Enquiry ID is required.");
  }

  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", enquiryId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/enquiries");
  redirect("/admin/enquiries");
}
