import { AdminShell } from "@/components/admin/admin-shell";
import { PropertyForm } from "@/components/admin/property-form";
import { requireAdmin } from "@/lib/admin";

export default async function NewPropertyPage() {
  await requireAdmin();

  return (
    <AdminShell title="Add property" subtitle="Create a new property listing" current="Add Property">
      <PropertyForm mode="create" />
    </AdminShell>
  );
}
