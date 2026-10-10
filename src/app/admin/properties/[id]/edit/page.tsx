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
        <div className="mb-6 flex flex-col gap-3 rounded-[24px] border border-[rgba(185,149,85,0.35)] bg-[rgba(185,149,85,0.08)] p-4 text-sm text-[var(--brand-navy)] sm:flex-row sm:items-center sm:justify-between">
          <span>{successMessage}</span>
          <Link href={`/property/${property.slug}`} className="font-semibold text-[var(--brand-gold)] hover:text-[var(--brand-navy)]">
            View property
          </Link>
        </div>
      ) : null}

      <PropertyForm mode="edit" defaultValues={property} />
    </AdminShell>
  );
}
