import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "About | Elibless Managers",
  description: "Learn about Elibless Managers and our approach to premium real estate advisory in Nigeria.",
  openGraph: {
    title: "About | Elibless Managers",
    description: "A trusted property advisory partner for buyers, renters, and investors.",
    type: "website",
  },
};

const values = [
  "Local expertise and trusted guidance",
  "Clear, transparent deal processes",
  "Tailored property recommendations",
  "Client-first support from search to close",
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">About us</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Helping people find their next address with confidence.</h1>
          </div>
          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-lg leading-8 text-slate-600">
              Elibless Managers is a premium Nigerian real estate company focused on delivering exceptional property experiences for buyers, renters, landlords, investors, and developers.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {values.map((value) => (
            <div key={value} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-700">✓</div>
              <p className="text-lg font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
