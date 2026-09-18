import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Services | Elibless Managers",
  description: "Property sales, rentals, management, marketing, and investment support from Elibless Managers.",
  openGraph: {
    title: "Services | Elibless Managers",
    description: "Full-spectrum real estate support for property buyers, renters, and investors.",
    type: "website",
  },
};

const services = [
  "Property Sales",
  "Property Rentals",
  "Property Management",
  "Property Marketing",
  "Property Consultancy",
  "Real Estate Investment Support",
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Our services</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Full-spectrum real estate support</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <div key={service} className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-700">
                {index + 1}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{service}</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Practical, expert-led support designed to help clients navigate purchase, rental, marketing, and investment decisions with clarity.
              </p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
