import Image from "next/image";
import Link from "next/link";

import type { OwnerRecord } from "@/lib/owners";

export function OwnerShowcase({ owners }: { owners: OwnerRecord[] }) {
  if (!owners.length) {
    return null;
  }

  return (
    <section className="bg-[var(--brand-offwhite)]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 border-b border-[var(--brand-border)] pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="brand-section-kicker">Meet the people behind the work</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-[var(--brand-navy)] md:text-4xl">
              A more personal way to move through property.
            </h2>
          </div>

          <Link
            href="/about"
            className="inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--brand-navy)] transition hover:text-[var(--brand-gold)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-gold)]"
          >
            Meet our team <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="grid gap-7 md:grid-cols-2">
        {owners.map((owner) => {
          const initials = owner.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("") || "EM";

          return (
            <article key={owner.id} className="grid overflow-hidden border border-[var(--brand-border)] bg-white sm:grid-cols-[0.8fr_1.2fr]">
              <div className="relative aspect-[4/5] min-h-56 overflow-hidden bg-[#e7e4dc] sm:aspect-auto sm:min-h-[340px]">
                {owner.photo_url ? (
                  <Image src={owner.photo_url} alt={owner.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[linear-gradient(145deg,#eeeae1,#d7d5ce)] text-4xl font-semibold tracking-[0.12em] text-[var(--brand-navy)]" aria-label="Profile photo not available">
                    <span className="border border-[var(--brand-navy)]/25 px-5 py-4">{initials}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-8">
                {owner.title ? <p className="brand-section-kicker">{owner.title}</p> : null}
                <h3 className="mt-2 text-2xl font-semibold text-[var(--brand-navy)] sm:text-3xl">{owner.name}</h3>
                {owner.bio ? <p className="mt-4 text-sm leading-7 text-[var(--brand-muted)] sm:text-base">{owner.bio}</p> : null}
              </div>
            </article>
          );
        })}
        </div>
      </div>
    </section>
  );
}
