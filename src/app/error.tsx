"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Something went wrong</p>
      <h1 className="mt-4 text-4xl font-black text-slate-900">We couldn’t load this page.</h1>
      <p className="mt-4 text-lg text-slate-600">
        Please refresh or try again. If the issue continues, contact the Elibless team.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Try again
      </button>
    </main>
  );
}
