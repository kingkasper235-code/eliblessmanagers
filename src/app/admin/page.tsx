import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDashboardStats } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getAdminDashboardStats();

  const cards = [
    { label: "Total properties", value: stats.total },
    { label: "Published properties", value: stats.published },
    { label: "Draft properties", value: stats.draft },
    { label: "For Sale", value: stats.forSale },
    { label: "For Rent", value: stats.forRent },
    { label: "Featured properties", value: stats.featured },
    { label: "New enquiries", value: stats.newEnquiries },
  ];

  return (
    <AdminShell title="Dashboard" subtitle="Operational overview for your property portfolio" current="Dashboard">
      {stats.error ? (
        <div className="mb-6 border border-[rgba(200,155,60,0.35)] bg-[rgba(200,155,60,0.08)] p-4 text-sm text-[var(--brand-navy)]">
          {stats.error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="border border-[var(--brand-border)] bg-white p-5">
            <p className="text-sm font-medium text-[var(--brand-muted)]">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--brand-navy)]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border border-[var(--brand-border)] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--brand-navy)]">Recently added properties</h2>
        </div>

        {stats.recent.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-medium">Title</th>
                  <th className="py-3 pr-4 font-medium">Location</th>
                  <th className="py-3 pr-4 font-medium">Type</th>
                  <th className="py-3 pr-4 font-medium">Published</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((property) => (
                  <tr key={property.id} className="border-b border-slate-100 align-top">
                    <td className="py-3 pr-4 font-semibold text-[var(--brand-navy)]">{property.title}</td>
                    <td className="py-3 pr-4 text-[var(--brand-muted)]">{property.location ?? "—"}</td>
                    <td className="py-3 pr-4 text-[var(--brand-muted)]">{property.property_type ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${property.published ? "bg-[rgba(185,149,85,0.16)] text-[var(--brand-gold)]" : "bg-slate-100 text-slate-600"}`}>
                        {property.published ? "Published" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-[var(--brand-border)] bg-[var(--brand-offwhite)] p-6 text-center text-sm text-[var(--brand-muted)]">
            No properties have been added yet.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
