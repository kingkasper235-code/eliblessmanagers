import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PropertyCard } from "@/components/property-card";
import { getFeaturedProperties, getLatestProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Elibless Managers | Premium Real Estate in Nigeria",
  description:
    "Elibless Managers connects buyers, renters, landlords, and investors with premium properties across Nigeria.",
  openGraph: {
    title: "Elibless Managers | Premium Real Estate in Nigeria",
    description:
      "Discover premium properties for sale and rent in Lagos, Abuja, and across Nigeria.",
    type: "website",
    url: "https://eliblessmanagers.com",
  },
};

const stats = [
  { value: "1,200+", label: "Homes sold" },
  { value: "98%", label: "Client satisfaction" },
  { value: "24/7", label: "Expert support" },
  { value: "₦18.5B", label: "Transactions closed" },
];

const serviceHighlights = [
  {
    title: "Property Sales",
    description: "Strategic sales guidance for buyers, developers, and investors seeking premium opportunities in Nigeria.",
  },
  {
    title: "Property Rentals",
    description: "Find quality rental homes and commercial spaces with streamlined tenant and landlord support.",
  },
  {
    title: "Property Management",
    description: "Professional oversight to protect asset value, simplify operations, and maintain occupancy.",
  },
  {
    title: "Investment Support",
    description: "Actionable market insight to help clients identify high-growth opportunities aligned to their strategy.",
  },
];

const trustPoints = [
  "Verified market insight",
  "Trusted local expertise",
  "Transparent deal guidance",
  "End-to-end support",
];

export default async function HomePage() {
  const [featuredProperties, latestProperties] = await Promise.all([
    getFeaturedProperties(3),
    getLatestProperties(3),
  ]);

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 text-slate-900">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.22),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#ecfdf5_30%,#f8fafc_100%)]" />
          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                  Trusted property advisors
                </div>
                <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Find a home that moves your future forward.
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                  Elibless Managers helps buyers, renters, landlords, and investors discover exceptional properties across Nigeria with honest guidance and premium local expertise.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/properties"
                    className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Browse listings
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-700 hover:text-emerald-700"
                  >
                    Speak with an agent
                  </Link>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                      <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                      <div className="mt-2 text-sm text-slate-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-12 top-10 h-24 w-24 rounded-full bg-emerald-300/60 blur-3xl" />
                <div className="absolute -bottom-10 right-0 h-24 w-24 rounded-full bg-sky-300/60 blur-3xl" />
                <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
                  <div className="overflow-hidden rounded-[26px]">
                    <Image
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                      alt="Modern home exterior"
                      width={900}
                      height={1200}
                      className="h-[620px] w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-x-12 bottom-8 rounded-2xl border border-white/40 bg-slate-950/80 p-4 text-white backdrop-blur-md shadow-xl">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Featured home</p>
                        <p className="mt-2 text-2xl font-bold">₦42M</p>
                      </div>
                      <div className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-950">
                        For Sale
                      </div>
                    </div>
                    <p className="mt-3 text-base text-slate-200">Luxury 3-Bedroom Duplex in Lekki Phase 1</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.06)] sm:p-7 lg:p-8">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Property search</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">Explore opportunities</h2>
              </div>
              <div className="inline-flex rounded-full bg-slate-100 p-1">
                <button type="button" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Buy</button>
                <button type="button" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600">Rent</button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Location</label>
                <input
                  className="mt-3 w-full border-none bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
                  defaultValue="Lagos, Abuja, Ibadan"
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Property type</label>
                <select className="mt-3 w-full border-none bg-transparent text-base text-slate-800 outline-none">
                  <option>Any type</option>
                  <option>Apartment</option>
                  <option>Duplex</option>
                  <option>Villa</option>
                  <option>Townhouse</option>
                  <option>Office</option>
                  <option>Land</option>
                </select>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Price range</label>
                <select className="mt-3 w-full border-none bg-transparent text-base text-slate-800 outline-none">
                  <option>Any budget</option>
                  <option>₦5M - ₦10M</option>
                  <option>₦10M - ₦25M</option>
                  <option>₦25M - ₦60M</option>
                  <option>₦60M+</option>
                </select>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bedrooms</label>
                <select className="mt-3 w-full border-none bg-transparent text-base text-slate-800 outline-none">
                  <option>Any</option>
                  <option>1+</option>
                  <option>2+</option>
                  <option>3+</option>
                  <option>4+</option>
                </select>
              </div>
              <div className="flex items-end">
                <Link
                  href="/properties"
                  className="flex h-[74px] w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 text-base font-semibold text-white transition hover:bg-emerald-700"
                >
                  Search
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Featured homes</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Handpicked properties</h2>
            </div>
            <Link href="/properties" className="text-sm font-semibold text-slate-700 transition hover:text-emerald-700">
              View all listings →
            </Link>
          </div>
          {featuredProperties.length ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              Featured properties will appear here once Supabase data is connected.
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Latest properties</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Fresh opportunities</h2>
            </div>
            <Link href="/for-sale" className="text-sm font-semibold text-slate-700 transition hover:text-emerald-700">
              Explore for sale →
            </Link>
          </div>

          {latestProperties.length ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {latestProperties.map((property) => (
                <PropertyCard key={`latest-${property.id}`} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              New listings will appear here once Supabase data is connected.
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[32px] bg-slate-900 p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Why choose us</p>
              <h2 className="mt-4 text-3xl font-black">A smarter way to buy, sell, and invest.</h2>
              <p className="mt-5 text-base leading-7 text-slate-300">
                We combine local market intelligence, responsive service, and a disciplined approach to help every client move confidently in the property market.
              </p>
              <div className="mt-8 space-y-4">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-slate-950">✓</span>
                    <span className="font-medium text-slate-100">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {serviceHighlights.map((service) => (
                <div key={service.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl text-emerald-700">
                    {service.title.slice(0, 1)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 px-6 py-10 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-10 lg:px-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">Your property journey starts here</p>
                <h2 className="mt-4 text-3xl font-black sm:text-4xl">Let’s match you with the right property.</h2>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/properties" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-100">
                  Explore listings
                </Link>
                <Link href="/contact" className="rounded-full border border-white/30 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Talk to our team
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
