import type { Metadata } from "next";
import { Suspense } from "react";

import { Footer } from "@/components/footer";
import {
  GoogleBusinessWidget,
  GoogleBusinessWidgetLoading,
} from "@/components/google-business-widget";
import { Navbar } from "@/components/navbar";
import { submitEnquiryAction } from "@/lib/enquiries";

export const metadata: Metadata = {
  title: "Contact | Elibless Managers",
  description: "Contact Elibless Managers for property advice, enquiries, and viewing appointments.",
  openGraph: {
    title: "Contact | Elibless Managers",
    description: "Speak with our property team about buying, renting, and investing in Nigeria.",
    type: "website",
  },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>;
}) {
  const successMessage = (await searchParams)?.success;

  return (
    <>
      <Navbar />
      <main>
        <header className="bg-[var(--brand-navy-dark)] text-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
            <p className="brand-section-kicker text-[var(--brand-gold-light)]">Contact</p>
            <h1 className="mt-3 max-w-3xl text-5xl leading-[1.03] text-white sm:text-6xl">
              Tell us what you’re looking for.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              A question, a viewing, a new property brief — we’re here to help you take the next step.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {successMessage ? (
            <p role="status" className="mb-7 border border-[rgba(185,149,85,0.35)] bg-[rgba(185,149,85,0.08)] px-4 py-3 text-sm font-medium text-[var(--brand-navy)]">
              {successMessage}
            </p>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
            <aside className="bg-[var(--brand-navy)] p-6 text-white sm:p-8">
              <p className="brand-section-kicker text-[var(--brand-gold-light)]">Reach the team</p>
              <h2 className="mt-3 text-2xl text-white">A real person, a clear answer.</h2>
              <div className="mt-7 space-y-5 border-t border-white/15 pt-6 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">Call</p>
                  <p className="mt-2 flex flex-col gap-1">
                    <a href="tel:+2348067136381" className="w-fit font-semibold text-white hover:text-[var(--brand-gold-light)]">08067136381</a>
                    <a href="tel:+2347010466117" className="w-fit font-semibold text-white hover:text-[var(--brand-gold-light)]">07010466117</a>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">Email</p>
                  <a href="mailto:Elibless123@gmail.com" className="mt-2 inline-block font-semibold text-white hover:text-[var(--brand-gold-light)]">Elibless123@gmail.com</a>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">WhatsApp</p>
                  <a href="https://wa.me/2348067136381" target="_blank" rel="noreferrer noopener" className="mt-2 inline-block font-semibold text-white hover:text-[var(--brand-gold-light)]">Message our team ↗</a>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">Visit</p>
                  <p className="mt-2 leading-6 text-white/85">12 Lekki Road, Lagos, Nigeria</p>
                </div>
                <div className="border-t border-white/15 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">Business hours</p>
                  <p className="mt-2 leading-6 text-white/85">Mon – Fri, 8:00 AM – 6:00 PM<br />Saturday, 9:00 AM – 4:00 PM</p>
                </div>
              </div>
            </aside>

            <section className="border border-[var(--brand-border)] bg-white p-5 sm:p-8">
              <div className="mb-6">
                <p className="brand-section-kicker">Send an enquiry</p>
                <h2 className="mt-2 text-2xl font-semibold">How can we help?</h2>
              </div>
              <form action={submitEnquiryAction} className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="form-label">Full name</label>
                  <input id="contact-name" name="name" required autoComplete="name" maxLength={120} className="form-control" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="contact-email" className="form-label">Email address</label>
                  <input id="contact-email" name="email" type="email" required autoComplete="email" maxLength={254} className="form-control" placeholder="you@example.com" />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="form-label">Phone number</label>
                  <input id="contact-phone" name="phone" required autoComplete="tel" maxLength={40} className="form-control" placeholder="Your phone number" />
                </div>
                <div>
                  <label htmlFor="contact-interest" className="form-label">What are you interested in?</label>
                  <select id="contact-interest" name="interest" className="form-control">
                    <option>Buying</option>
                    <option>Renting</option>
                    <option>Investment</option>
                    <option>Property management</option>
                    <option>Consultation</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contact-message" className="form-label">Message</label>
                  <textarea id="contact-message" name="message" rows={5} required maxLength={3000} className="form-control resize-y" placeholder="Tell us a little about what you need." />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center bg-[var(--brand-navy)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)] sm:w-auto">
                    Send enquiry <span className="ml-3" aria-hidden="true">↗</span>
                  </button>
                </div>
              </form>
            </section>
          </div>

          <Suspense fallback={<GoogleBusinessWidgetLoading />}>
            <GoogleBusinessWidget />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
