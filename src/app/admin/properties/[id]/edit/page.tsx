import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { PropertyForm } from "@/components/admin/property-form";
import { requireAdmin } from "@/lib/admin";
import { getAdminPropertyById } from "@/lib/admin-data";

export default async function EditPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ success?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const property = await getAdminPropertyById(Number(id));
  const successMessage = (await searchParams)?.success ?? "";

  if (!property) {
    return notFound();
  }

  return (
    <AdminShell title="Edit property" subtitle="Update this property listing" current="Properties">
      {successMessage ? (
        <div className="mb-6 flex flex-col gap-3 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{successMessage}</span>
          <Link href={`/property/${property.slug}`} className="font-semibold text-emerald-700 hover:text-emerald-800">
            View property
          </Link>
        </div>
      ) : null}

      <PropertyForm mode="edit" defaultValues={property} />
    </AdminShell>
  );
}
