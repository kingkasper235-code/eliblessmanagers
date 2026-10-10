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
            <div key={enquiry.id} className="border border-[var(--brand-border)] bg-white p-5">
              <div className="flex flex-col gap-3 border-b border-[var(--brand-border)] pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-[var(--brand-navy)]">{enquiry.name}</p>
                  <p className="text-sm text-[var(--brand-muted)]">{enquiry.email} · {enquiry.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    enquiry.status === "New"
                      ? "bg-[rgba(185,149,85,0.16)] text-[var(--brand-gold)]"
                      : enquiry.status === "Contacted"
                        ? "bg-[var(--brand-neutral)] text-[var(--brand-navy)]"
                        : "bg-[var(--brand-neutral)] text-[var(--brand-muted)]"
                  }`}>
                    {enquiry.status}
                  </span>
                  <span className="text-xs text-[var(--brand-muted)]">{new Date(enquiry.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-muted)]">Property</p>
                  <p className="mt-1 text-sm font-medium text-[var(--brand-navy)]">{enquiry.property_title ?? "General enquiry"}</p>
                  <p className="mt-4 text-sm leading-7 text-[var(--brand-muted)]">{enquiry.message}</p>
                </div>

                <form action={updateEnquiryStatusAction} className="flex flex-col gap-2 md:min-w-[220px]">
                  <input type="hidden" name="enquiryId" value={String(enquiry.id)} />
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-muted)]">Status</label>
                  <select name="status" defaultValue={enquiry.status} className="form-control">
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <button type="submit" className="min-h-11 bg-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">
                    Update status
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-[var(--brand-border)] bg-white p-6">
          <p className="text-[var(--brand-muted)]">No enquiries have been received yet.</p>
        </div>
      )}
    </AdminShell>
  );
}
