import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { getEnquiries, updateEnquiryStatusAction } from "@/lib/enquiries";

export default async function AdminEnquiriesPage() {
  await requireAdmin();
  const enquiries = await getEnquiries();

  return (
    <AdminShell title="Enquiries" subtitle="Recent property enquiries and messages" current="Enquiries">
      {enquiries.length ? (
        <div className="space-y-4">
          {enquiries.map((enquiry) => (
            <div key={enquiry.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">{enquiry.name}</p>
                  <p className="text-sm text-slate-500">{enquiry.email} · {enquiry.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    enquiry.status === "New"
                      ? "bg-emerald-100 text-emerald-700"
                      : enquiry.status === "Contacted"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-200 text-slate-700"
                  }`}>
                    {enquiry.status}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(enquiry.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Property</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{enquiry.property_title ?? "General enquiry"}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{enquiry.message}</p>
                </div>

                <form action={updateEnquiryStatusAction} className="flex flex-col gap-2 md:min-w-[220px]">
                  <input type="hidden" name="enquiryId" value={String(enquiry.id)} />
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</label>
                  <select name="status" defaultValue={enquiry.status} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500">
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    Update status
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600">No enquiries have been received yet.</p>
        </div>
      )}
    </AdminShell>
  );
}
