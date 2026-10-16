import Image from "next/image";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { DeletePropertyButton } from "@/components/admin/delete-property-button";
import { requireAdmin } from "@/lib/admin";
import { getAdminPropertiesList } from "@/lib/admin-data";

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const params = (await searchParams) ?? {};

  const page = Number(params.page ?? 1) || 1;
  const search = String(params.search ?? "");
  const listingType = String(params.listingType ?? "all");
  const published = String(params.published ?? "all");
  const featured = String(params.featured ?? "all");
  const sort = String(params.sort ?? "newest");

  const result = await getAdminPropertiesList({
    search,
    listingType,
    published,
    featured,
    sort,
    page,
    pageSize: 10,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <AdminShell title="Properties" subtitle="Manage your property inventory" current="Properties">
      <div className="border border-[var(--brand-border)] bg-white p-5">
        <form method="get" className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
            <input
              defaultValue={search}
              name="search"
              placeholder="Search properties"
              className="form-control min-w-0"
            />
            <select name="listingType" defaultValue={listingType} className="form-control min-w-0">
              <option value="all">All listing types</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
            <select name="published" defaultValue={published} className="form-control min-w-0">
              <option value="all">All published</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select name="featured" defaultValue={featured} className="form-control min-w-0">
              <option value="all">All featured</option>
              <option value="featured">Featured</option>
              <option value="regular">Regular</option>
            </select>
            <select name="sort" defaultValue={sort} className="form-control min-w-0">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="min-h-11 bg-[var(--brand-navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">
              Apply filters
            </button>
            <Link href="/admin/properties/new" className="inline-flex min-h-11 items-center justify-center bg-[var(--brand-navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">
              + Add property
            </Link>
          </div>
        </form>

        {result.error ? (
          <div className="mb-5 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{result.error}</div>
        ) : null}

        {result.items.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--brand-border)] text-[var(--brand-muted)]">
                    <th className="py-3 pr-4 font-medium">Image</th>
                    <th className="py-3 pr-4 font-medium">Property</th>
                    <th className="py-3 pr-4 font-medium">Location</th>
                    <th className="py-3 pr-4 font-medium">Price</th>
                    <th className="py-3 pr-4 font-medium">Type</th>
                    <th className="py-3 pr-4 font-medium">Listing</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Published</th>
                    <th className="py-3 pr-4 font-medium">Featured</th>
                    <th className="py-3 pr-4 font-medium">Videos</th>
                    <th className="py-3 pr-4 font-medium">Created</th>
                    <th className="py-3 pr-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((property) => (
                    <tr key={property.id} className="border-b border-[var(--brand-border)] align-middle">
                      <td className="py-3 pr-4">
                        <div className="relative h-14 w-20 overflow-hidden border border-[var(--brand-border)] bg-[var(--brand-offwhite)]">
                          {property.image_url ? (
                            <Image
                              src={property.image_url}
                              alt={property.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-[9px] font-semibold uppercase tracking-wide text-[var(--brand-muted)]">No photo</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-[var(--brand-navy)]">{property.title}</td>
                      <td className="py-3 pr-4 text-[var(--brand-muted)]">{property.location ?? "—"}</td>
                      <td className="py-3 pr-4 text-[var(--brand-navy)]">{property.price ? `${property.currency ?? "NGN"} ${property.price}` : "—"}</td>
                      <td className="py-3 pr-4 text-[var(--brand-muted)]">{property.property_type ?? "—"}</td>
                      <td className="py-3 pr-4 text-[var(--brand-muted)]">{property.listing_type ?? "—"}</td>
                      <td className="py-3 pr-4 text-[var(--brand-muted)]">{property.status ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 text-[11px] font-semibold ${property.published ? "bg-[rgba(185,149,85,0.16)] text-[var(--brand-gold)]" : "bg-[var(--brand-neutral)] text-[var(--brand-muted)]"}`}>
                          {property.published ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 text-[11px] font-semibold ${property.featured ? "bg-[rgba(185,149,85,0.16)] text-[var(--brand-gold)]" : "bg-[var(--brand-neutral)] text-[var(--brand-muted)]"}`}>
                          {property.featured ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-[var(--brand-muted)]">
                        {property.video_count ? `${property.video_count} ${property.video_count === 1 ? "video" : "videos"}` : "—"}
                      </td>
                      <td className="py-3 pr-4 text-[var(--brand-muted)]">{property.created_at ? new Date(property.created_at).toLocaleDateString() : "—"}</td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-2">
                          <Link href={`/admin/properties/${property.id}/edit`} className="bg-[var(--brand-navy)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">
                            Edit
                          </Link>
                          <DeletePropertyButton propertyId={property.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--brand-muted)]">
                Showing {Math.min((page - 1) * result.pageSize + 1, result.total)}-{Math.min(page * result.pageSize, result.total)} of {result.total}
              </p>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Link
                    href={{ pathname: "/admin/properties", query: { ...params, page: String(page - 1) } }}
                    className="border border-[var(--brand-border)] px-3 py-2 text-sm font-medium text-[var(--brand-navy)] hover:border-[var(--brand-gold)]"
                  >
                    Previous
                  </Link>
                ) : null}
                {page < totalPages ? (
                  <Link
                    href={{ pathname: "/admin/properties", query: { ...params, page: String(page + 1) } }}
                    className="border border-[var(--brand-border)] px-3 py-2 text-sm font-medium text-[var(--brand-navy)] hover:border-[var(--brand-gold)]"
                  >
                    Next
                  </Link>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="border border-dashed border-[var(--brand-border)] bg-[var(--brand-offwhite)] p-10 text-center text-sm text-[var(--brand-muted)]">
            No properties match your current filters.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
