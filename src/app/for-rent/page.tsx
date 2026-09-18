import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { getPropertiesByListingType } from "@/lib/properties";

export const metadata: Metadata = {
  title: "For Rent | Elibless Managers",
  description: "Find apartments, homes, and commercial spaces available for rent in Nigeria.",
  openGraph: {
    title: "For Rent | Elibless Managers",
    description: "Browse available homes and rental properties in Nigeria.",
    type: "website",
  },
};

export default async function ForRentPage() {
  const rentalProperties = await getPropertiesByListingType("rent");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">For rent</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Homes and spaces for lease</h1>
        </div>

        {rentalProperties.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rentalProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No published rental properties are available yet.
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
