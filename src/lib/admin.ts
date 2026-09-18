import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function getAuthenticatedAdmin() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!profile) {
    return null;
  }

  return { user, profile };
}

export async function requireAdmin() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function redirectIfAdminLoggedIn() {
  const admin = await getAuthenticatedAdmin();

  if (admin) {
    redirect("/admin");
  }
}
