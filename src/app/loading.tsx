export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-3 shadow-sm">
        <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-600" />
        <span className="text-sm font-medium text-slate-600">Loading Elibless listings...</span>
      </div>
    </main>
  );
}
