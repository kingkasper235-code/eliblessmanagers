import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { PropertyGallery } from "@/components/property-gallery";
import { submitEnquiryAction } from "@/lib/enquiries";
import { getProperties, getPropertyBySlug, getSimilarProperties } from "@/lib/properties";

export async function generateStaticParams() {
  const properties = await getProperties();
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Property not found | Elibless Managers",
    };
  }

  return {
    title: `${property.title} | Elibless Managers`,
    description: `${property.description.slice(0, 160)}...`,
    openGraph: {
      title: property.title,
      description: property.description,
      type: "article",
      images: property.gallery.slice(0, 3),
    },
    alternates: {
      canonical: `/property/${property.slug}`,
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SingleFamilyResidence",
        name: property.title,
        description: property.description,
        address: {
          "@type": "PostalAddress",
          streetAddress: property.address,
          addressLocality: property.city,
          addressRegion: property.state,
          addressCountry: "NG",
        },
        numberOfRooms: property.bedrooms,
        numberOfBedrooms: property.bedrooms,
        numberOfBathroomsTotal: property.bathrooms,
        floorSize: {
          "@type": "QuantitativeValue",
          value: property.property_size,
          unitCode: "FTK",
        },
        offers: {
          "@type": "Offer",
          price: property.priceValue,
          priceCurrency: property.currency,
          availability: "https://schema.org/InStock",
        },
      }),
    },
  };
}

export default async function PropertyDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ success?: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  const successMessage = (await searchParams)?.success ?? "";

  if (!property) {
    return notFound();
  }

  const similarProperties = await getSimilarProperties(slug, 3);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link href="/" className="transition hover:text-emerald-700">Home</Link>
          <span>›</span>
          <Link href="/properties" className="transition hover:text-emerald-700">Properties</Link>
          <span>›</span>
          <span className="text-slate-800">{property.title}</span>
        </div>

        {successMessage ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {successMessage}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <PropertyGallery images={property.gallery} title={property.title} />
          </div>

          <aside className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {property.status}
              </span>
              {property.featured ? (
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900">
                  Featured
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900">{property.title}</h1>
            <p className="mt-3 text-lg font-semibold text-emerald-700">{property.price}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Location</p>
                <p className="mt-2 font-medium text-slate-900">{property.location}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Type</p>
                <p className="mt-2 font-medium text-slate-900">{property.type}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Bedrooms</p>
                <p className="mt-2 font-medium text-slate-900">{property.bedrooms}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Bathrooms</p>
                <p className="mt-2 font-medium text-slate-900">{property.bathrooms}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Toilets</p>
                <p className="mt-2 font-medium text-slate-900">{property.toilets}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Size</p>
                <p className="mt-2 font-medium text-slate-900">{property.size}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <a href="tel:+2348067136381" className="rounded-full bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700">Call 08067136381</a>
              <a href="https://wa.me/2348067136381" target="_blank" rel="noreferrer noopener" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-emerald-700 hover:text-emerald-700">WhatsApp 08067136381</a>
              <a href="https://wa.me/2347010466117" target="_blank" rel="noreferrer noopener" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-emerald-700 hover:text-emerald-700">WhatsApp 07010466117</a>
              <Link href="/contact" className="rounded-full bg-emerald-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700">Contact agent</Link>
            </div>
          </aside>
        </div>

        <section className="mt-12 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black text-slate-900">Property description</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">{property.description}</p>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Amenities & features</h3>
              <ul className="mt-4 space-y-3 text-slate-600">
                {property.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <h3 className="text-xl font-bold text-slate-900">Quick details</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2"><span>Listing status</span><span className="font-semibold text-slate-900">{property.status}</span></div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2"><span>City</span><span className="font-semibold text-slate-900">{property.city}</span></div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2"><span>Property size</span><span className="font-semibold text-slate-900">{property.size}</span></div>
                <div className="flex items-center justify-between"><span>Type</span><span className="font-semibold text-slate-900">{property.type}</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black text-slate-900">Property enquiry</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a href="mailto:Elibless123@gmail.com" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-medium text-slate-700 hover:border-emerald-700 hover:text-emerald-700">Email us</a>
            <a href="https://wa.me/2348067136381" target="_blank" rel="noreferrer noopener" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-medium text-slate-700 hover:border-emerald-700 hover:text-emerald-700">WhatsApp 08067136381</a>
            <a href="https://wa.me/2347010466117" target="_blank" rel="noreferrer noopener" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-medium text-slate-700 hover:border-emerald-700 hover:text-emerald-700">WhatsApp 07010466117</a>
          </div>
          <form action={submitEnquiryAction} className="mt-6 grid gap-5 md:grid-cols-2">
            <input type="hidden" name="propertyId" value={String(property.id)} />
            <input type="hidden" name="propertySlug" value={String(property.slug)} />
            <input type="hidden" name="interest" value={`Enquiry for ${property.title}`} />
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <input name="name" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Your name" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input name="email" type="email" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
              <input name="phone" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Phone number" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Property interest</label>
              <input value={property.title} readOnly className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
              <textarea name="message" rows={5} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Tell us what you would like to know about this property" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">Send enquiry</button>
            </div>
          </form>
        </section>

        {similarProperties.length > 0 ? (
          <section className="mt-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Similar properties</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">More options to consider</h2>
              </div>
              <Link href="/properties" className="text-sm font-semibold text-slate-700 transition hover:text-emerald-700">
                View all →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {similarProperties.map((similarProperty) => (
                <PropertyCard key={similarProperty.id} property={similarProperty} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
