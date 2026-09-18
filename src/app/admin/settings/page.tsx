import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <AdminShell title="Settings" subtitle="Admin preferences and profile settings" current="Settings">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">This section is ready for future management settings and brand configuration.</p>
      </div>
    </AdminShell>
  );
}
