import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { getPropertiesByListingType } from "@/lib/properties";

export const metadata: Metadata = {
  title: "For Sale | Elibless Managers",
  description: "Discover homes and investment properties for sale in Nigeria.",
  openGraph: {
    title: "For Sale | Elibless Managers",
    description: "Browse available homes and investment opportunities for purchase.",
    type: "website",
  },
};

export default async function ForSalePage() {
  const saleProperties = await getPropertiesByListingType("sale");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">For sale</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Properties available for purchase</h1>
        </div>

        {saleProperties.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {saleProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No published properties for sale are available yet.
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
