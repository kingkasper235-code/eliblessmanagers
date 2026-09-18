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
  ];

  return (
    <AdminShell title="Dashboard" subtitle="Operational overview for your property portfolio" current="Dashboard">
      {stats.error ? (
        <div className="mb-6 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {stats.error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Recently added properties</h2>
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
                    <td className="py-3 pr-4 font-semibold text-slate-900">{property.title}</td>
                    <td className="py-3 pr-4 text-slate-600">{property.location ?? "—"}</td>
                    <td className="py-3 pr-4 text-slate-600">{property.property_type ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${property.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {property.published ? "Published" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No properties have been added yet.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
