import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "@/components/admin/login-form";
import { redirectIfAdminLoggedIn } from "@/lib/admin";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  await redirectIfAdminLoggedIn();

  const error = (await searchParams)?.error ?? "";
  const isUnauthorized = error === "Unauthorized";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(200,155,60,0.14),transparent_35%),var(--brand-offwhite)] px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-[var(--brand-border)] bg-white p-6 shadow-[0_20px_70px_rgba(0,26,70,0.08)] sm:p-8">
        <div className="mb-8 flex items-center justify-center">
          <Image
            src="/Elibless logo.png"
            alt="Elibless Managers logo"
            width={220}
            height={64}
            className="h-auto w-[200px]"
          />
        </div>

        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Admin Access</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--brand-navy)]">Secure login</h1>
        </div>

        {isUnauthorized ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Unauthorized. This account is not registered as an admin in Supabase.
          </div>
        ) : null}

        <LoginForm />

        <div className="mt-6 text-center text-sm text-[var(--brand-muted)]">
          <Link href="/" className="font-semibold text-[var(--brand-navy)] transition hover:text-[var(--brand-gold)]">
            Return to website
          </Link>
        </div>
      </div>
    </main>
  );
}
