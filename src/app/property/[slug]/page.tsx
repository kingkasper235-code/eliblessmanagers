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
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-[var(--brand-muted)]">
          <Link href="/" className="transition hover:text-[var(--brand-gold)]">Home</Link>
          <span>›</span>
          <Link href="/properties" className="transition hover:text-[var(--brand-gold)]">Properties</Link>
          <span>›</span>
          <span className="text-[var(--brand-navy)]">{property.title}</span>
        </div>

        {successMessage ? (
          <div role="status" className="mb-6 border border-[rgba(185,149,85,0.35)] bg-[rgba(185,149,85,0.08)] p-4 text-sm text-[var(--brand-navy)]">
            {successMessage}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <PropertyGallery images={property.gallery} title={property.title} />
          </div>

          <aside className="border border-[var(--brand-border)] bg-white p-5 shadow-[0_20px_50px_rgba(9,25,35,0.06)] sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <span className="bg-[rgba(185,149,85,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold)]">
                {property.status}
              </span>
              {property.featured ? (
                <span className="bg-[var(--brand-gold-light)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-navy-dark)]">
                  Featured
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--brand-navy)]">{property.title}</h1>
            <p className="mt-3 text-lg font-semibold text-[var(--brand-gold)]">{property.price}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="bg-[var(--brand-offwhite)] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--brand-muted)]">Location</p>
                <p className="mt-2 font-medium text-[var(--brand-navy)]">{property.location}</p>
              </div>
              <div className="bg-[var(--brand-offwhite)] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--brand-muted)]">Type</p>
                <p className="mt-2 font-medium text-[var(--brand-navy)]">{property.type}</p>
              </div>
              <div className="bg-[var(--brand-offwhite)] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--brand-muted)]">Bedrooms</p>
                <p className="mt-2 font-medium text-[var(--brand-navy)]">{property.bedrooms}</p>
              </div>
              <div className="bg-[var(--brand-offwhite)] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--brand-muted)]">Bathrooms</p>
                <p className="mt-2 font-medium text-[var(--brand-navy)]">{property.bathrooms}</p>
              </div>
              <div className="bg-[var(--brand-offwhite)] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--brand-muted)]">Toilets</p>
                <p className="mt-2 font-medium text-[var(--brand-navy)]">{property.toilets}</p>
              </div>
              <div className="bg-[var(--brand-offwhite)] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--brand-muted)]">Size</p>
                <p className="mt-2 font-medium text-[var(--brand-navy)]">{property.size}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <a href="tel:+2348067136381" className="min-h-11 bg-[var(--brand-navy)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">Call 08067136381</a>
              <a href="https://wa.me/2348067136381" target="_blank" rel="noreferrer noopener" className="min-h-11 border border-[var(--brand-border)] bg-white px-5 py-3 text-center text-sm font-semibold text-[var(--brand-navy)] transition hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]">WhatsApp 08067136381</a>
              <a href="https://wa.me/2347010466117" target="_blank" rel="noreferrer noopener" className="min-h-11 border border-[var(--brand-border)] bg-white px-5 py-3 text-center text-sm font-semibold text-[var(--brand-navy)] transition hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]">WhatsApp 07010466117</a>
              <Link href="/contact" className="min-h-11 bg-[var(--brand-navy)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">Contact agent</Link>
            </div>
          </aside>
        </div>

        {property.videos.length ? (
          <section className="mt-12 border border-[var(--brand-border)] bg-white p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[var(--brand-navy)]">Property Video Tour</h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {property.videos.map((video) => (
                <article key={video.id} className="min-w-0">
                  <div className="aspect-video overflow-hidden bg-[var(--brand-navy)]">
                    {video.source_type === "youtube" && video.video_url ? (
                      <iframe
                        src={video.video_url}
                        title={video.title || "Property video tour"}
                        loading="lazy"
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    ) : (
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        poster={property.image || undefined}
                        className="h-full w-full"
                      >
                        <source src={`/api/property-videos/${video.id}`} type="video/mp4" />
                        Your browser does not support HTML5 video.
                      </video>
                    )}
                  </div>
                  {video.title ? (
                    <h3 className="mt-3 text-base font-semibold text-[var(--brand-navy)]">{video.title}</h3>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-12 border border-[var(--brand-border)] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[var(--brand-navy)]">Property description</h2>
          {property.description ? (
            <p className="mt-4 text-base leading-8 text-[var(--brand-muted)]">{property.description}</p>
          ) : (
            <p className="mt-4 text-base leading-8 text-[var(--brand-muted)]">
              Contact our team to learn more about this property.
            </p>
          )}

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold text-[var(--brand-navy)]">Amenities & features</h3>
              {property.features.length ? (
                <ul className="mt-4 space-y-3 text-[var(--brand-muted)]">
                  {property.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center bg-[rgba(185,149,85,0.16)] text-xs font-bold text-[var(--brand-gold)]">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[var(--brand-muted)]">No additional features have been added to this listing.</p>
              )}
            </div>
            <div className="bg-[var(--brand-offwhite)] p-5">
              <h3 className="text-xl font-semibold text-[var(--brand-navy)]">Quick details</h3>
              <div className="mt-4 space-y-3 text-sm text-[var(--brand-muted)]">
                <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-2"><span>Listing status</span><span className="font-semibold text-[var(--brand-navy)]">{property.status}</span></div>
                <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-2"><span>City</span><span className="font-semibold text-[var(--brand-navy)]">{property.city}</span></div>
                <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-2"><span>Property size</span><span className="font-semibold text-[var(--brand-navy)]">{property.size}</span></div>
                <div className="flex items-center justify-between"><span>Type</span><span className="font-semibold text-[var(--brand-navy)]">{property.type}</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 border border-[var(--brand-border)] bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[var(--brand-navy)]">Property enquiry</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a href="mailto:Elibless123@gmail.com" className="border border-[var(--brand-border)] bg-[var(--brand-offwhite)] px-4 py-2 font-medium text-[var(--brand-navy)] transition hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]">Email us</a>
            <a href="https://wa.me/2348067136381" target="_blank" rel="noreferrer noopener" className="border border-[var(--brand-border)] bg-[var(--brand-offwhite)] px-4 py-2 font-medium text-[var(--brand-navy)] transition hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]">WhatsApp 08067136381</a>
            <a href="https://wa.me/2347010466117" target="_blank" rel="noreferrer noopener" className="border border-[var(--brand-border)] bg-[var(--brand-offwhite)] px-4 py-2 font-medium text-[var(--brand-navy)] transition hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]">WhatsApp 07010466117</a>
          </div>
          <form action={submitEnquiryAction} className="mt-6 grid gap-5 md:grid-cols-2">
            <input type="hidden" name="propertyId" value={String(property.id)} />
            <input type="hidden" name="propertySlug" value={String(property.slug)} />
            <input type="hidden" name="interest" value={`Enquiry for ${property.title}`} />
            <div>
              <label htmlFor="property-enquiry-name" className="form-label">Full name</label>
              <input id="property-enquiry-name" name="name" required autoComplete="name" maxLength={120} className="form-control" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="property-enquiry-email" className="form-label">Email</label>
              <input id="property-enquiry-email" name="email" type="email" required autoComplete="email" maxLength={254} className="form-control" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="property-enquiry-phone" className="form-label">Phone</label>
              <input id="property-enquiry-phone" name="phone" required autoComplete="tel" maxLength={40} className="form-control" placeholder="Phone number" />
            </div>
            <div>
              <label htmlFor="property-enquiry-interest" className="form-label">Property interest</label>
              <input id="property-enquiry-interest" value={property.title} readOnly className="form-control bg-[var(--brand-neutral)]" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="property-enquiry-message" className="form-label">Message</label>
              <textarea id="property-enquiry-message" name="message" rows={5} required maxLength={3000} className="form-control resize-y" placeholder="Tell us what you would like to know about this property" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="inline-flex min-h-12 items-center bg-[var(--brand-navy)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">Send enquiry</button>
            </div>
          </form>
        </section>

        {similarProperties.length > 0 ? (
          <section className="mt-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Similar properties</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">More options to consider</h2>
              </div>
              <Link href="/properties" className="text-sm font-semibold text-slate-700 transition hover:text-[var(--brand-gold)]">
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
