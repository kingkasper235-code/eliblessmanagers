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
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-[28px] border border-[var(--brand-border)] bg-[var(--brand-navy)] p-5 text-white lg:block">
          <div className="mb-8 flex items-center justify-center">
            <Image
              src="/Elibless logo.png"
              alt="Elibless Managers logo"
              width={190}
              height={52}
              className="h-auto w-[150px]"
            />
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const active = current === item.label;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--brand-gold)] text-[var(--brand-navy-dark)]"
                      : "text-slate-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-white/10 pt-5">
            <LogoutButton />
          </div>
        </aside>

        <div className="flex-1">
          <header className="mb-6 rounded-[28px] border border-[var(--brand-border)] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Admin Panel</p>
                <h1 className="mt-2 text-3xl font-black text-[var(--brand-navy)]">{title}</h1>
                {subtitle ? <p className="mt-2 text-sm text-[var(--brand-muted)]">{subtitle}</p> : null}
              </div>

              <div className="flex items-center gap-3 lg:hidden">
                <Image
                  src="/Elibless fav.png"
                  alt="Elibless favicon"
                  width={34}
                  height={34}
                  className="h-9 w-9 rounded-lg object-cover"
                />
                <div className="text-sm text-[var(--brand-muted)]">
                  <p className="font-semibold text-[var(--brand-navy)]">Elibless Managers</p>
                  <p>Operations</p>
                </div>
              </div>
            </div>

            <nav className="mt-5 flex flex-wrap gap-2 lg:hidden">
              {navigation.map((item) => {
                const active = current === item.label;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                      active ? "bg-[var(--brand-gold)] text-[var(--brand-navy-dark)]" : "bg-[var(--brand-neutral)] text-[var(--brand-navy)] hover:bg-[var(--brand-border)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
