"use client";

import { useTransition } from "react";

import { logoutAction } from "@/lib/admin-actions";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logoutAction())}
      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
    >
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
