import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { OwnerShowcase } from "@/components/owner-showcase";
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

        <OwnerShowcase
          owners={owners}
          kicker="Meet our team"
          heading="The people you’ll work with"
          description="Get to know the people guiding your next property decision."
          showAboutLink={false}
        />

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
