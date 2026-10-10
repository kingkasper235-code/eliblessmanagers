import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { searchProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Properties | Elibless Managers",
  description: "Browse available homes, apartments, offices, and investment properties in Nigeria.",
  openGraph: {
    title: "Properties | Elibless Managers",
    description: "Explore real estate listings across Nigeria.",
    type: "website",
  },
};

const filterClass = "form-control mt-2";
const filterLabelClass = "block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-muted)]";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await searchParams) ?? {};
  const filters = {
    listingType: String(params.listingType ?? "all"),
    location: String(params.location ?? ""),
    propertyType: String(params.propertyType ?? "all"),
    minPrice: params.minPrice ? Number(params.minPrice) : null,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : null,
    bedrooms: params.bedrooms ? Number(params.bedrooms) : null,
    bathrooms: params.bathrooms ? Number(params.bathrooms) : null,
    status: String(params.status ?? "all"),
    sort: (String(params.sort ?? "newest") as "newest" | "price-low" | "price-high") || "newest",
  };

  const properties = await searchProperties(filters);
  const hasActiveFilters = Object.values(filters).some((value) => value !== null && value !== "all" && value !== "" && value !== "newest");

  return (
    <>
      <Navbar />
      <main>
        <header className="bg-[var(--brand-navy-dark)] text-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="brand-section-kicker text-[var(--brand-gold-light)]">Property portfolio</p>
            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="max-w-3xl text-4xl leading-tight text-white sm:text-5xl">A place for what comes next.</h1>
              <div className="flex flex-wrap gap-4 text-sm font-semibold text-white">
                <Link href="/for-sale" className="underline decoration-[var(--brand-gold)] underline-offset-4 hover:text-[var(--brand-gold-light)]">For sale</Link>
                <Link href="/for-rent" className="underline decoration-[var(--brand-gold)] underline-offset-4 hover:text-[var(--brand-gold-light)]">For rent</Link>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          <form method="get" className="mb-8 grid gap-4 border border-[var(--brand-border)] bg-white p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 xl:grid-cols-4">
            <div>
              <label htmlFor="filter-listing" className={filterLabelClass}>Buy or rent</label>
              <select id="filter-listing" name="listingType" defaultValue={filters.listingType} className={filterClass}>
                <option value="all">All properties</option>
                <option value="sale">For sale</option>
                <option value="rent">For rent</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-location" className={filterLabelClass}>Location</label>
              <input id="filter-location" name="location" defaultValue={filters.location} placeholder="City or neighbourhood" className={filterClass} />
            </div>
            <div>
              <label htmlFor="filter-type" className={filterLabelClass}>Property type</label>
              <select id="filter-type" name="propertyType" defaultValue={filters.propertyType} className={filterClass}>
                <option value="all">Any type</option>
                <option value="Apartment">Apartment</option>
                <option value="Duplex">Duplex</option>
                <option value="Villa">Villa</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Office">Office</option>
                <option value="Land">Land</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="filter-price-min" className={filterLabelClass}>Min. price</label>
                <input id="filter-price-min" name="minPrice" type="number" min="0" step="1000000" defaultValue={filters.minPrice ?? ""} placeholder="₦ minimum" className={filterClass} />
              </div>
              <div>
                <label htmlFor="filter-price-max" className={filterLabelClass}>Max. price</label>
                <input id="filter-price-max" name="maxPrice" type="number" min="0" step="1000000" defaultValue={filters.maxPrice ?? ""} placeholder="₦ maximum" className={filterClass} />
              </div>
            </div>
            <div>
              <label htmlFor="filter-bedrooms" className={filterLabelClass}>Bedrooms</label>
              <select id="filter-bedrooms" name="bedrooms" defaultValue={filters.bedrooms ?? ""} className={filterClass}>
                <option value="">Any</option>
                {[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count}+</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filter-bathrooms" className={filterLabelClass}>Bathrooms</label>
              <select id="filter-bathrooms" name="bathrooms" defaultValue={filters.bathrooms ?? ""} className={filterClass}>
                <option value="">Any</option>
                {[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count}+</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filter-sort" className={filterLabelClass}>Sort by</label>
              <select id="filter-sort" name="sort" defaultValue={filters.sort} className={filterClass}>
                <option value="newest">Newest</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </div>
            <div className="flex items-end gap-3">
              <button type="submit" className="min-h-11 flex-1 bg-[var(--brand-navy)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">
                Apply filters
              </button>
              <Link href="/properties" className="inline-flex min-h-11 items-center justify-center border border-[var(--brand-border)] px-4 text-sm font-semibold text-[var(--brand-navy)] transition hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]">
                Clear
              </Link>
            </div>
          </form>

          <div className="mb-5 flex items-end justify-between border-b border-[var(--brand-border)] pb-4">
            <p className="text-sm font-semibold text-[var(--brand-navy)]">
              {properties.length} {properties.length === 1 ? "result" : "results"}
              {hasActiveFilters ? " matching your search" : " available"}
            </p>
          </div>

          {properties.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
            </div>
          ) : (
            <div className="border border-dashed border-[var(--brand-border)] bg-white px-6 py-12 text-center">
              <h2 className="text-xl font-semibold">No properties found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--brand-muted)]">
                {hasActiveFilters
                  ? "Try adjusting your filters, or share your brief with our team."
                  : "Available listings will appear here. Contact our team if you would like help with your search."}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {hasActiveFilters ? (
                  <Link href="/properties" className="inline-flex min-h-11 items-center border border-[var(--brand-border)] px-5 text-sm font-semibold text-[var(--brand-navy)]">
                    Clear search
                  </Link>
                ) : null}
                <Link href="/contact" className="inline-flex min-h-11 items-center bg-[var(--brand-navy)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">
                  Contact us
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
