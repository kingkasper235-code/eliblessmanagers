import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { OwnerShowcase } from "@/components/owner-showcase";
import { PropertyCard } from "@/components/property-card";
import { getActiveOwners } from "@/lib/owners";
import { getFeaturedProperties, getLatestProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Elibless Managers | Property, considered",
  description:
    "Find homes, rental spaces, and real estate guidance across Nigeria with Elibless Managers.",
  openGraph: {
    title: "Elibless Managers | Property, considered",
    description: "Thoughtful property guidance for buyers, renters, owners, and investors.",
    type: "website",
    url: "https://eliblessmanagers.com",
  },
};

const services = [
  {
    number: "01",
    title: "Buy with perspective",
    description: "Find the right home or investment with guidance through search, due diligence, and purchase.",
    href: "/for-sale",
  },
  {
    number: "02",
    title: "Rent with confidence",
    description: "Explore available homes and spaces, with practical support from first enquiry to move-in.",
    href: "/for-rent",
  },
  {
    number: "03",
    title: "Manage your property",
    description: "Thoughtful representation for owners and landlords who want their property handled well.",
    href: "/services",
  },
];

async function HomeHeroProperty() {
  const [featuredProperties, latestProperties] = await Promise.all([
    getFeaturedProperties(1),
    getLatestProperties(1),
  ]);
  const heroProperty = featuredProperties[0] ?? latestProperties[0] ?? null;

  return (
    <>
      {heroProperty?.image ? (
        <Image
          src={heroProperty.image}
          alt={heroProperty.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover"
        />
      ) : null}
      {heroProperty ? (
        <div className="absolute inset-x-4 bottom-4 border border-white/25 bg-[var(--brand-navy-dark)]/95 p-5 text-white sm:inset-x-auto sm:bottom-8 sm:right-8 sm:w-[min(390px,calc(100%-4rem))] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="brand-section-kicker text-[var(--brand-gold-light)]">
              {heroProperty.listing_type === "sale" ? "Selected for sale" : "Selected for rent"}
            </p>
            <span className="text-sm font-semibold">{heroProperty.price}</span>
          </div>
          <p className="mt-3 text-lg font-semibold text-white">{heroProperty.title}</p>
          <p className="mt-1 text-sm text-white/65">{heroProperty.location}</p>
          <Link
            href={`/property/${heroProperty.slug}`}
            className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-gold-light)] underline decoration-white/30 underline-offset-4 hover:decoration-[var(--brand-gold-light)]"
          >
            View property
          </Link>
        </div>
      ) : null}
    </>
  );
}

async function FeaturedPropertiesSection() {
  const featuredProperties = await getFeaturedProperties(3);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-[var(--brand-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="brand-section-kicker">A considered collection</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Featured properties</h2>
        </div>
        <Link href="/properties" className="text-sm font-semibold text-[var(--brand-navy)] transition hover:text-[var(--brand-gold)]">
          View all properties <span aria-hidden="true">↗</span>
        </Link>
      </div>
      {featuredProperties.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredProperties.map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>
      ) : (
        <div className="border border-dashed border-[var(--brand-border)] bg-white px-6 py-10 text-center">
          <p className="text-lg font-semibold text-[var(--brand-navy)]">No featured homes just yet</p>
          <p className="mt-2 text-sm text-[var(--brand-muted)]">Browse all current listings or check back soon.</p>
          <Link href="/properties" className="mt-5 inline-block text-sm font-semibold text-[var(--brand-gold)] underline underline-offset-4">
            Browse properties
          </Link>
        </div>
      )}
    </section>
  );
}

async function LatestPropertiesSection() {
  const latestProperties = await getLatestProperties(3);
  if (!latestProperties.length) {
    return null;
  }

  return (
    <section className="border-y border-[var(--brand-border)] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="brand-section-kicker">Just listed</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">New opportunities</h2>
          </div>
          <div className="flex gap-5 text-sm font-semibold">
            <Link href="/for-sale" className="text-[var(--brand-navy)] hover:text-[var(--brand-gold)]">For sale ↗</Link>
            <Link href="/for-rent" className="text-[var(--brand-navy)] hover:text-[var(--brand-gold)]">For rent ↗</Link>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {latestProperties.map((property) => <PropertyCard key={`latest-${property.id}`} property={property} />)}
        </div>
      </div>
    </section>
  );
}

async function OwnerProfilesSection() {
  const owners = await getActiveOwners();
  return <OwnerShowcase owners={owners} />;
}

function PropertySectionFallback({ featured = false }: { featured?: boolean }) {
  return (
    <section aria-hidden="true" className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${featured ? "py-12 sm:py-16" : "py-14"}`}>
      <div className="h-7 w-48 animate-pulse bg-[var(--brand-neutral)]" />
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="overflow-hidden border border-[var(--brand-border)] bg-white">
            <div className="aspect-[4/3] animate-pulse bg-[var(--brand-neutral)]" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-2/3 animate-pulse bg-[var(--brand-neutral)]" />
              <div className="h-4 w-1/2 animate-pulse bg-[var(--brand-neutral)]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OwnerSectionFallback() {
  return (
    <section aria-hidden="true" className="bg-[var(--brand-offwhite)]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="h-7 w-72 animate-pulse bg-[var(--brand-neutral)]" />
        <div className="mt-8 grid gap-7 md:grid-cols-2">
          {[1, 2].map((item) => <div key={item} className="aspect-[4/3] animate-pulse bg-[var(--brand-neutral)]" />)}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="overflow-hidden bg-[var(--brand-navy-dark)] text-white">
          <div className="mx-auto grid max-w-[1600px] items-stretch lg:min-h-[650px] lg:grid-cols-[0.92fr_1.08fr]">
            <div className="flex flex-col justify-center px-5 py-16 sm:px-8 sm:py-20 lg:px-14 xl:px-20">
              <p className="brand-section-kicker text-[var(--brand-gold-light)]">Property, considered</p>
              <h1 className="mt-5 max-w-[680px] text-5xl leading-[0.98] text-white sm:text-6xl lg:text-7xl">
                Find a place that feels like the right move.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                A home, a fresh start, a considered investment. We bring local knowledge and steady guidance to the search.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/properties"
                  className="inline-flex min-h-12 items-center justify-center bg-[var(--brand-gold)] px-5 text-sm font-semibold text-[var(--brand-navy-dark)] transition hover:bg-[var(--brand-gold-light)] focus-visible:outline-white"
                >
                  Explore properties <span className="ml-3" aria-hidden="true">↗</span>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center border border-white/30 px-5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/5"
                >
                  Talk with our team
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/15 pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">
                <span>Buy and sell</span>
                <span>Rent and let</span>
                <span>Property advisory</span>
              </div>
            </div>

            <div className="relative min-h-[330px] bg-[#d8d5cc] sm:min-h-[430px] lg:min-h-[650px]">
              <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(145deg,#e8e5dd,#c9c8c1)] px-6 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-navy)]">
                Property photography will appear with available listings
              </div>
              <Suspense fallback={null}>
                <HomeHeroProperty />
              </Suspense>
            </div>
          </div>
        </section>

        <section aria-labelledby="property-search-title" className="relative z-10 mx-auto -mt-1 max-w-7xl px-4 py-7 sm:px-6 lg:-mt-8 lg:px-8">
          <form
            action="/properties"
            method="get"
            className="grid gap-4 border border-[var(--brand-border)] bg-white p-5 shadow-[0_15px_40px_rgba(9,25,35,0.08)] sm:grid-cols-2 sm:p-6 lg:grid-cols-[1fr_1.2fr_1.2fr_auto] lg:items-end"
          >
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="brand-section-kicker">Start your search</p>
              <h2 id="property-search-title" className="mt-1 text-xl font-semibold">A good place to begin</h2>
            </div>
            <div>
              <label htmlFor="search-intent" className="form-label">I’m looking to</label>
              <select id="search-intent" name="listingType" defaultValue="all" className="form-control">
                <option value="all">Buy or rent</option>
                <option value="sale">Buy</option>
                <option value="rent">Rent</option>
              </select>
            </div>
            <div>
              <label htmlFor="search-location" className="form-label">Location</label>
              <input id="search-location" name="location" className="form-control" placeholder="City or neighbourhood" />
            </div>
            <button
              type="submit"
              className="min-h-11 bg-[var(--brand-navy)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]"
            >
              Find a property
            </button>
          </form>
        </section>

        <Suspense fallback={<PropertySectionFallback featured />}>
          <FeaturedPropertiesSection />
        </Suspense>

        <Suspense fallback={<PropertySectionFallback />}>
          <LatestPropertiesSection />
        </Suspense>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="brand-section-kicker">What we do</p>
              <h2 className="mt-3 max-w-md text-4xl font-semibold leading-tight sm:text-5xl">
                Good property decisions start with good people.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[var(--brand-muted)]">
                From first viewing to final paperwork, we make each step clear, considered, and personal.
              </p>
              <Link href="/services" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-navy)] underline decoration-[var(--brand-gold)] underline-offset-4 hover:text-[var(--brand-gold)]">
                Discover our services <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="border-t border-[var(--brand-border)]">
              {services.map((service) => (
                <Link key={service.number} href={service.href} className="group grid gap-3 border-b border-[var(--brand-border)] py-5 sm:grid-cols-[52px_1fr_auto] sm:items-center sm:gap-5">
                  <span className="text-xs font-semibold tracking-[0.14em] text-[var(--brand-gold)]">{service.number}</span>
                  <span>
                    <span className="block text-xl font-semibold text-[var(--brand-navy)] transition group-hover:text-[var(--brand-gold)]">{service.title}</span>
                    <span className="mt-1 block max-w-xl text-sm leading-6 text-[var(--brand-muted)]">{service.description}</span>
                  </span>
                  <span aria-hidden="true" className="hidden text-xl text-[var(--brand-gold)] sm:block">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Suspense fallback={<OwnerSectionFallback />}>
          <OwnerProfilesSection />
        </Suspense>

        <section className="bg-[var(--brand-navy)] text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div className="max-w-2xl">
              <p className="brand-section-kicker text-[var(--brand-gold-light)]">A clear next step</p>
              <h2 className="mt-3 text-4xl text-white sm:text-5xl">Let’s talk about where you’re headed.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                Tell us what matters to you. We’ll help you find a practical way forward.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex min-h-12 items-center bg-[var(--brand-gold)] px-5 text-sm font-semibold text-[var(--brand-navy-dark)] transition hover:bg-[var(--brand-gold-light)]">
                Contact our team <span className="ml-3" aria-hidden="true">↗</span>
              </Link>
              <a href="https://wa.me/2348067136381" target="_blank" rel="noreferrer noopener" className="inline-flex min-h-12 items-center border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
