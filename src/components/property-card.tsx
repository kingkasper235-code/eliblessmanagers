import Image from "next/image";
import Link from "next/link";

import type { Property } from "@/lib/properties";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-[var(--brand-border)] bg-white shadow-[0_18px_45px_rgba(0,26,70,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,26,70,0.12)]">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={property.image}
          alt={property.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-navy)]">
            {property.listing_type === "sale" ? "For Sale" : "For Rent"}
          </span>
          {property.featured ? (
            <span className="rounded-full bg-[var(--brand-gold)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-navy-dark)]">
              Featured
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand-gold)]">
              {property.type}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--brand-navy)]">{property.title}</h3>
          </div>
          <span className="rounded-full bg-[rgba(200,155,60,0.12)] px-3 py-1 text-xs font-semibold text-[var(--brand-navy)]">
            {property.status}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-[var(--brand-muted)]">
          <span>📍</span>
          <span>{property.location}</span>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--brand-border)] pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--brand-muted)]">From</p>
            <p className="mt-1 text-2xl font-bold text-[var(--brand-navy)]">{property.price}</p>
          </div>
          <Link
            href={`/property/${property.slug}`}
            className="inline-flex items-center rounded-full bg-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]"
          >
            View Property
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-[var(--brand-border)] pt-4 text-sm text-[var(--brand-navy-dark)]">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--brand-muted)]">Beds</p>
            <p className="mt-1 font-semibold">{property.bedrooms}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--brand-muted)]">Baths</p>
            <p className="mt-1 font-semibold">{property.bathrooms}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--brand-muted)]">Size</p>
            <p className="mt-1 font-semibold">{property.size}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
