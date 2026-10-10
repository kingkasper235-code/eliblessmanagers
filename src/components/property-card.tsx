import Image from "next/image";
import Link from "next/link";

import type { Property } from "@/lib/properties";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group overflow-hidden border border-[var(--brand-border)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(9,25,35,0.12)]">
      <div className="relative h-64 overflow-hidden bg-[var(--brand-neutral)]">
        {property.image ? (
          <Image
            src={property.image}
            alt={property.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(145deg,#efede6,#dcdad2)] text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-muted)]">
            Property photo unavailable
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <span className="bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-navy)]">
            {property.listing_type === "sale" ? "For Sale" : "For Rent"}
          </span>
          {property.featured ? (
            <span className="bg-[var(--brand-gold)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-navy-dark)]">
              Featured
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand-gold)]">
              {property.type}
            </p>
            <h3 className="mt-2 line-clamp-2 text-xl font-semibold text-[var(--brand-navy)]">{property.title}</h3>
          </div>
          <span className="shrink-0 bg-[rgba(185,149,85,0.14)] px-3 py-1 text-xs font-semibold text-[var(--brand-navy)]">
            {property.status}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-[var(--brand-muted)]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-none stroke-[var(--brand-gold)]" strokeWidth="1.7">
            <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
            <circle cx="12" cy="10" r="2.3" />
          </svg>
          <span>{property.location}</span>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--brand-border)] pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--brand-muted)]">From</p>
            <p className="mt-1 text-lg font-semibold text-[var(--brand-navy)] sm:text-xl">{property.price}</p>
          </div>
          <Link
            href={`/property/${property.slug}`}
            className="inline-flex min-h-10 items-center bg-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold)]"
          >
            View home <span className="ml-2" aria-hidden="true">↗</span>
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
