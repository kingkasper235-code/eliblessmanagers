import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { searchProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Properties | Elibless Managers",
  description: "Browse premium homes, apartments, offices, and investment properties in Nigeria.",
  openGraph: {
    title: "Properties | Elibless Managers",
    description: "Explore premium real estate listings across Nigeria.",
    type: "website",
  },
};

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
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Property listings</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Explore premium homes in Nigeria</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/for-sale" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-emerald-700 hover:text-emerald-700">For Sale</Link>
            <Link href="/for-rent" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-emerald-700 hover:text-emerald-700">For Rent</Link>
          </div>
        </div>

        <form method="get" className="mb-10 grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl bg-slate-50 p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Buy / Rent</label>
            <select name="listingType" defaultValue={filters.listingType} className="mt-2 w-full border-none bg-transparent text-base text-slate-800 outline-none">
              <option value="all">All</option>
              <option value="sale">Buy</option>
              <option value="rent">Rent</option>
            </select>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Location</label>
            <input name="location" defaultValue={filters.location} placeholder="Lagos, Abuja" className="mt-2 w-full border-none bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400" />
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Property type</label>
            <select name="propertyType" defaultValue={filters.propertyType} className="mt-2 w-full border-none bg-transparent text-base text-slate-800 outline-none">
              <option value="all">Any type</option>
              <option value="Apartment">Apartment</option>
              <option value="Duplex">Duplex</option>
              <option value="Villa">Villa</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Office">Office</option>
              <option value="Land">Land</option>
            </select>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Min price</label>
            <input name="minPrice" type="number" min="0" step="1000000" defaultValue={filters.minPrice ?? ""} placeholder="5000000" className="mt-2 w-full border-none bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400" />
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Max price</label>
            <input name="maxPrice" type="number" min="0" step="1000000" defaultValue={filters.maxPrice ?? ""} placeholder="50000000" className="mt-2 w-full border-none bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sort</label>
              <select name="sort" defaultValue={filters.sort} className="mt-2 w-full border-none bg-transparent text-base text-slate-800 outline-none">
                <option value="newest">Newest</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bedrooms</label>
            <select name="bedrooms" defaultValue={filters.bedrooms ?? ""} className="mt-2 w-full border-none bg-transparent text-base text-slate-800 outline-none">
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bathrooms</label>
            <select name="bathrooms" defaultValue={filters.bathrooms ?? ""} className="mt-2 w-full border-none bg-transparent text-base text-slate-800 outline-none">
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Property status</label>
            <select name="status" defaultValue={filters.status} className="mt-2 w-full border-none bg-transparent text-base text-slate-800 outline-none">
              <option value="all">Any status</option>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="leased">Leased</option>
            </select>
          </div>

          <div className="flex items-end gap-3 md:col-span-2 xl:col-span-2">
            <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Apply filters</button>
            <Link href="/properties" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:border-emerald-700 hover:text-emerald-700">
              Clear filters
            </Link>
          </div>
        </form>

        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-base font-semibold text-slate-700">
            {properties.length} {properties.length === 1 ? "result" : "results"}
            {hasActiveFilters ? " matching your filters" : " available"}
          </p>
        </div>

        {properties.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No properties match your current filters. Adjust the search criteria or clear the filters to see more options.
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
