import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/admin/reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password | Elibless Managers",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(200,155,60,0.14),transparent_35%),var(--brand-offwhite)] px-4 py-10">
      <div className="w-full max-w-md border border-[var(--brand-border)] bg-white p-6 shadow-[0_16px_40px_rgba(9,25,35,0.08)] sm:p-8">
        <div className="mb-8 flex items-center justify-center">
          <Image
            src="/Elibless logo.png"
            alt="Elibless Managers logo"
            width={220}
            height={64}
            className="h-auto w-[200px]"
            priority
          />
        </div>
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Admin Access</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--brand-navy)]">Choose a new password</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--brand-muted)]">
            Your recovery link must be valid before you can change the password.
          </p>
        </div>
        <ResetPasswordForm />
        <p className="mt-6 text-center text-sm text-[var(--brand-muted)]">
          <Link href="/admin/login" className="font-semibold text-[var(--brand-navy)] transition hover:text-[var(--brand-gold)]">
            Return to admin login
          </Link>
        </p>
      </div>
    </main>
  );
}
