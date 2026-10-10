import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Services | Elibless Managers",
  description: "Property sales, rentals, management, marketing, and investment support from Elibless Managers.",
  openGraph: {
    title: "Services | Elibless Managers",
    description: "Real estate support for buyers, renters, owners, and investors.",
    type: "website",
  },
};

const services = [
  {
    number: "01",
    title: "Property sales",
    description: "Thoughtful guidance for buyers and sellers, from understanding the brief to moving through the transaction.",
  },
  {
    number: "02",
    title: "Property rentals",
    description: "A considered search for renters, with practical coordination for landlords and property owners.",
  },
  {
    number: "03",
    title: "Property management",
    description: "Day-to-day support designed to help owners protect their asset and care for their tenants.",
  },
  {
    number: "04",
    title: "Property marketing",
    description: "Presenting property clearly to the right audience, with guidance on positioning and enquiries.",
  },
  {
    number: "05",
    title: "Property consultancy",
    description: "A sounding board for property decisions, grounded in the goals and context you bring to the conversation.",
  },
  {
    number: "06",
    title: "Investment support",
    description: "Practical support as you assess potential property opportunities and the questions worth asking.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-[var(--brand-navy-dark)] text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <p className="brand-section-kicker text-[var(--brand-gold-light)]">Our services</p>
            <div className="mt-5 grid gap-7 lg:grid-cols-[1fr_0.65fr] lg:items-end">
              <h1 className="max-w-3xl text-5xl leading-[1.02] text-white sm:text-6xl">
                The right guidance at every turn.
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                Whether you’re buying, letting, or looking after an investment, our support starts with understanding what you need.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid border-t border-[var(--brand-border)] sm:grid-cols-2 sm:border-l">
            {services.map((service) => (
              <article key={service.number} className="min-h-52 border-b border-[var(--brand-border)] py-6 sm:border-r sm:px-7 sm:py-8 lg:min-h-60">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-[0.16em] text-[var(--brand-gold)]">{service.number}</p>
                  <span aria-hidden="true" className="text-xl text-[var(--brand-gold)]">↗</span>
                </div>
                <h2 className="mt-7 text-2xl font-semibold text-[var(--brand-navy)]">{service.title}</h2>
                <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--brand-muted)]">{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--brand-border)] bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="max-w-2xl">
              <p className="brand-section-kicker">Start with a conversation</p>
              <h2 className="mt-2 text-3xl font-semibold">Let’s work out what support looks like for you.</h2>
            </div>
            <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center justify-center bg-[var(--brand-navy)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]">
              Contact our team <span className="ml-3" aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
