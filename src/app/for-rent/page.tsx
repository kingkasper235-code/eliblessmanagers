import type { Metadata } from "next";
import Link from "next/link";

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
      <main>
        <header className="bg-[var(--brand-navy-dark)] text-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="brand-section-kicker text-[var(--brand-gold-light)]">For rent</p>
            <h1 className="mt-3 max-w-3xl text-4xl leading-tight text-white sm:text-5xl">A home for the way you live.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Explore available homes and commercial spaces for rent.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-7 flex flex-col gap-3 border-b border-[var(--brand-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-sm text-[var(--brand-muted)]">
              {rentalProperties.length} {rentalProperties.length === 1 ? "property" : "properties"} available
            </p>
            <Link href="/properties?listingType=rent" className="text-sm font-semibold text-[var(--brand-navy)] hover:text-[var(--brand-gold)]">
              Refine your search <span aria-hidden="true">↗</span>
            </Link>
          </div>

          {rentalProperties.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {rentalProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[var(--brand-border)] bg-white px-6 py-12 text-center">
              <h2 className="text-xl font-semibold">No rental properties right now</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--brand-muted)]">
                New listings will appear here when they are available. Tell us what you’re looking for and our team can help.
              </p>
              <Link href="/contact" className="mt-5 inline-flex min-h-11 items-center bg-[var(--brand-navy)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">
                Share your brief
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
