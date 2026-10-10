import type { Metadata } from "next";
import Image from "next/image";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getActiveOwners } from "@/lib/owners";

export const metadata: Metadata = {
  title: "About | Elibless Managers",
  description: "Learn about Elibless Managers and our approach to real estate guidance in Nigeria.",
  openGraph: {
    title: "About | Elibless Managers",
    description: "A thoughtful property advisory partner for buyers, renters, owners, and investors.",
    type: "website",
  },
};

const values = [
  "Local expertise and trusted guidance",
  "Clear, transparent deal processes",
  "Tailored property recommendations",
  "Client-first support from search to close",
];

export default async function AboutPage() {
  const owners = await getActiveOwners();

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-[var(--brand-navy-dark)] text-white">
          <div className="mx-auto grid max-w-7xl gap-9 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:px-8">
            <div>
              <p className="brand-section-kicker text-[var(--brand-gold-light)]">A little about us</p>
              <h1 className="mt-4 max-w-2xl text-5xl leading-[1.02] text-white sm:text-6xl">
                Property is personal. So is the way we work.
              </h1>
            </div>
            <div className="max-w-2xl border-l border-[var(--brand-gold)]/70 pl-5 sm:pl-7">
              <p className="text-lg leading-8 text-white/80">
                Elibless Managers is a Nigerian real estate company supporting buyers, renters, landlords, investors, and developers with practical advice and a more considered property experience.
              </p>
              <p className="mt-4 text-sm leading-7 text-white/65">
                We believe a good result comes from clear communication, careful attention, and knowing what matters to the people we serve.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <div className="grid gap-9 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div>
              <p className="brand-section-kicker">How we show up</p>
              <h2 className="mt-3 max-w-sm text-3xl font-semibold sm:text-4xl">The details matter. The relationship matters more.</h2>
            </div>
            <div className="grid gap-x-8 sm:grid-cols-2">
              {values.map((value, index) => (
                <div key={value} className="flex gap-4 border-t border-[var(--brand-border)] py-5">
                  <span className="pt-1 text-xs font-semibold tracking-[0.14em] text-[var(--brand-gold)]">0{index + 1}</span>
                  <p className="max-w-xs text-base font-medium leading-7 text-[var(--brand-navy)]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {owners.length ? (
          <section className="border-y border-[var(--brand-border)] bg-white">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
              <div className="mb-9 max-w-2xl">
                <p className="brand-section-kicker">Meet our team</p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">The people you’ll work with</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-muted)]">
                  Get to know the people guiding your next property decision.
                </p>
              </div>

              <div className="space-y-7">
                {owners.map((owner, index) => {
                  const initials = owner.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() ?? "")
                    .join("");

                  return (
                    <article key={owner.id} className={`grid overflow-hidden border border-[var(--brand-border)] ${index % 2 ? "md:grid-cols-[1fr_0.85fr]" : "md:grid-cols-[0.85fr_1fr]"}`}>
                      <div className={`relative min-h-[300px] bg-[#e7e4dc] md:min-h-[400px] ${index % 2 ? "md:order-2" : ""}`}>
                        {owner.photo_url ? (
                          <Image src={owner.photo_url} alt={owner.name} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
                        ) : (
                          <div aria-label="Profile photo not available" className="flex h-full min-h-[300px] items-center justify-center bg-[linear-gradient(145deg,#eeeae1,#d7d5ce)] text-4xl font-semibold tracking-[0.12em] text-[var(--brand-navy)] md:min-h-[400px]">
                            <span className="border border-[var(--brand-navy)]/25 px-5 py-4">{initials}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
                        <p className="brand-section-kicker">Elibless Managers</p>
                        {owner.title ? <p className="mt-4 text-sm font-semibold text-[var(--brand-gold)]">{owner.title}</p> : null}
                        <h3 className="mt-2 text-3xl font-semibold sm:text-4xl">{owner.name}</h3>
                        {owner.bio ? <p className="mt-5 whitespace-pre-line text-base leading-8 text-[var(--brand-muted)]">{owner.bio}</p> : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 border-t border-[var(--brand-border)] pt-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="brand-section-kicker">Let’s make the next step clear</p>
              <h2 className="mt-2 text-2xl font-semibold">Tell us what you’re looking for.</h2>
            </div>
            <a href="/contact" className="inline-flex min-h-11 items-center justify-center bg-[var(--brand-navy)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">
              Get in touch <span className="ml-3" aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
