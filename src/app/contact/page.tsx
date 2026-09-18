import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { submitEnquiryAction } from "@/lib/enquiries";

export const metadata: Metadata = {
  title: "Contact | Elibless Managers",
  description: "Get in touch with Elibless Managers for real estate enquiries, property advice, and viewing appointments.",
  openGraph: {
    title: "Contact | Elibless Managers",
    description: "Speak with our property team about buying, renting, and investing in Nigeria.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Contact us</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Let’s help you find the right property.</h1>
            <div className="mt-8 space-y-4 text-base text-slate-700">
              <p><a href="tel:+2348067136381" className="font-semibold text-slate-900 hover:text-emerald-700">Phone: 08067136381</a></p>
              <p><a href="tel:+2347010466117" className="font-semibold text-slate-900 hover:text-emerald-700">Phone: 07010466117</a></p>
              <p><a href="https://wa.me/2348067136381" target="_blank" rel="noreferrer noopener" className="font-semibold text-emerald-700 hover:text-emerald-800">WhatsApp: 08067136381</a></p>
              <p><a href="mailto:Elibless123@gmail.com" className="font-semibold text-slate-900 hover:text-emerald-700">Email: Elibless123@gmail.com</a></p>
              <p>
                Instagram: <a href="https://www.instagram.com/eliblessmanagers/" target="_blank" rel="noreferrer noopener" className="font-semibold text-emerald-700 hover:text-emerald-800">@eliblessmanagers</a>
              </p>
              <p>
                Facebook: <a href="https://www.facebook.com/eliblessproperty/" target="_blank" rel="noreferrer noopener" className="font-semibold text-emerald-700 hover:text-emerald-800">Elibless Property</a>
              </p>
              <p>Office: 12 Lekki Road, Lagos, Nigeria</p>
              <p>Business hours: Mon - Fri, 8:00 AM - 6:00 PM</p>
            </div>

            <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Social media</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">Follow Elibless</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.instagram.com/eliblessmanagers/"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Open Elibless Managers Instagram"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-emerald-700"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.25-3.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/eliblessproperty/"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Open Elibless Property on Facebook"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2] text-white transition hover:opacity-90"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V7.2c0-.9.3-1.6 1.7-1.6H17V2.6c-.3 0-1.4-.2-2.7-.2-2.7 0-4.6 1.6-4.6 4.7v2.7H7v3.2h2.7v8h3.8Z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <form action={submitEnquiryAction} className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
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
                <select name="interest" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500">
                  <option>Buying</option>
                  <option>Renting</option>
                  <option>Investment</option>
                  <option>Consultation</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
              <textarea name="message" rows={5} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Tell us about your property needs" />
            </div>

            <button type="submit" className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">Send enquiry</button>
          </form>
        </div>

        <div className="mt-12 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Map</div>
          <div className="flex h-72 items-center justify-center rounded-[24px] bg-slate-100 text-lg font-semibold text-slate-500">
            Lagos office map preview
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
