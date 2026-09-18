import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">404 error</p>
      <h1 className="mt-4 text-4xl font-black text-slate-900">Page not found</h1>
      <p className="mt-4 max-w-xl text-lg text-slate-600">
        The property or page you were looking for may have moved or no longer exists.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
          Back home
        </Link>
        <Link href="/properties" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-emerald-700 hover:text-emerald-700">
          Browse properties
        </Link>
      </div>
    </main>
  );
}
