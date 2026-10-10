"use client";

import { useTransition } from "react";

import { logoutAction } from "@/lib/admin-actions";

export function LogoutButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logoutAction())}
      className={`w-full border px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold)] ${
        variant === "dark"
          ? "border-white/20 text-white/80 hover:border-rose-300 hover:bg-rose-400/10 hover:text-white"
          : "border-[var(--brand-border)] bg-white text-[var(--brand-navy)] hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
      }`}
    >
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
