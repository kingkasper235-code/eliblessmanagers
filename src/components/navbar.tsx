"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PHONE_CONTACTS } from "@/lib/contact";

const leftNavigation = [
  { name: "Home", href: "/" },
  { name: "Properties", href: "/properties" },
  { name: "For Sale", href: "/for-sale" },
];

const rightNavigation = [
  { name: "For Rent", href: "/for-rent" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const allNavigation = [...leftNavigation, ...rightNavigation];

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M12.04 2a9.87 9.87 0 0 0-8.48 14.93L2 22l5.22-1.37A9.94 9.94 0 1 0 12.04 2Zm0 18.06a8.07 8.07 0 0 1-4.12-1.13l-.3-.18-3.1.81.83-3.02-.2-.31a8.06 8.06 0 1 1 6.9 3.83Zm4.42-6.04c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.53.12-.16.24-.61.79-.74.95-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.28-.73-1.75-.19-.46-.39-.4-.53-.41h-.45c-.16 0-.41.06-.63.3-.22.24-.83.81-.83 1.97s.85 2.28.97 2.44c.12.16 1.67 2.55 4.04 3.58.56.24 1 .39 1.34.5.56.18 1.08.16 1.49.1.45-.07 1.44-.59 1.65-1.16.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--brand-border)] bg-white">
      <nav aria-label="Main navigation" className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="hidden min-h-[78px] grid-cols-[1fr_auto_1fr] items-center gap-5 xl:grid">
          <div className="flex items-center gap-5">
            {leftNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.name}
              </Link>
            ))}
          </div>

          <Link href="/" aria-label="Elibless Managers home" className="relative z-10 mx-4 block w-[174px]">
            <Image
              src="/Elibless logo.png"
              alt="Elibless Managers"
              width={220}
              height={62}
              priority
              className="h-auto w-full"
            />
          </Link>

          <div className="flex items-center justify-end gap-5">
            {rightNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.name}
              </Link>
            ))}
            <a
              href={PHONE_CONTACTS[0].whatsapp}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Contact Elibless Managers on WhatsApp"
              className="inline-flex min-h-10 items-center gap-2 bg-[var(--brand-navy)] px-3.5 text-xs font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold)]"
            >
              <WhatsAppMark />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="relative grid min-h-[64px] grid-cols-[1fr_auto_1fr] items-center xl:hidden">
          <button
            type="button"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-controls="mobile-navigation"
            aria-expanded={isOpen}
            className="inline-flex h-10 w-10 items-center justify-center justify-self-start border border-[var(--brand-border)] text-[var(--brand-navy)] transition hover:border-[var(--brand-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold)]"
            onClick={() => setIsOpen((value) => !value)}
          >
            <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
            {isOpen ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>

          <Link
            href="/"
            aria-label="Elibless Managers home"
            className="col-start-2 row-start-1 w-[clamp(118px,38vw,148px)]"
            onClick={() => setIsOpen(false)}
          >
            <Image
              src="/Elibless logo.png"
              alt="Elibless Managers"
              width={220}
              height={62}
              priority
              className="h-auto w-full"
            />
          </Link>

          <a
            href={PHONE_CONTACTS[0].whatsapp}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Contact Elibless Managers on WhatsApp"
            className="inline-flex h-10 w-10 items-center justify-center justify-self-end bg-[var(--brand-navy)] text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold)]"
          >
            <WhatsAppMark />
          </a>
        </div>
      </nav>

      {isOpen ? (
        <div id="mobile-navigation" className="border-t border-[var(--brand-border)] bg-white px-4 py-4 shadow-lg xl:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            {allNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-h-11 px-3 py-3 text-sm font-medium text-[var(--brand-navy-dark)] transition hover:bg-[var(--brand-offwhite)] hover:text-[var(--brand-gold)] focus-visible:outline-2 focus-visible:outline-[var(--brand-gold)]"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
