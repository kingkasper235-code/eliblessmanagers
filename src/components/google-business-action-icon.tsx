import type { ReactNode } from "react";

export function GoogleBusinessActionIcon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#80d5d1] text-[var(--brand-navy-dark)]"
    >
      {children}
    </span>
  );
}
