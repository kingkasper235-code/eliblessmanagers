import Image from "next/image";
import Link from "next/link";

import { LogoutButton } from "@/components/admin/logout-button";

const navigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/properties/new", label: "Add Property" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({
  title,
  subtitle,
  current,
  children,
}: {
  title: string;
  subtitle?: string;
  current: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--brand-offwhite)] text-[var(--brand-navy-dark)]">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <aside className="hidden w-60 shrink-0 self-start bg-[var(--brand-navy-dark)] p-5 text-white xl:sticky xl:top-6 xl:block">
          <Link href="/" aria-label="Elibless Managers website" className="mb-8 block border-b border-white/15 pb-6">
            <Image
              src="/Elibless logo.png"
              alt="Elibless Managers"
              width={190}
              height={52}
              className="h-auto w-[150px]"
            />
          </Link>

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold-light)]">Workspace</p>
          <nav aria-label="Admin navigation" className="space-y-1">
            {navigation.map((item) => {
              const active = current === item.label;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center px-3 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--brand-gold)] text-[var(--brand-navy-dark)]"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-white/15 pt-5">
            <LogoutButton variant="dark" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-[var(--brand-border)] bg-white px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/" aria-label="Open Elibless Managers website" className="shrink-0 xl:hidden">
                  <Image src="/Elibless fav.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
                </Link>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Elibless · Workspace</p>
                  <h1 className="mt-1 truncate text-2xl font-semibold text-[var(--brand-navy)] sm:text-3xl">{title}</h1>
                  {subtitle ? <p className="mt-1 max-w-2xl text-sm leading-5 text-[var(--brand-muted)]">{subtitle}</p> : null}
                </div>
              </div>
              <div className="xl:hidden">
                <LogoutButton variant="light" />
              </div>
            </div>

            <nav aria-label="Admin navigation" className="mt-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
              {navigation.map((item) => {
                const active = current === item.label;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-10 shrink-0 items-center px-3 text-xs font-semibold transition ${
                      active
                        ? "bg-[var(--brand-navy)] text-white"
                        : "border border-[var(--brand-border)] bg-white text-[var(--brand-navy)] hover:border-[var(--brand-gold)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className="min-w-0 py-5 sm:py-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
