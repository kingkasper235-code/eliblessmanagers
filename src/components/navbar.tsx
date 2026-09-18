"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Properties", href: "/properties" },
  { name: "For Sale", href: "/for-sale" },
  { name: "For Rent", href: "/for-rent" },
  { name: "Services", href: "/services" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/eliblessmanagers/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.25-3.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/eliblessproperty/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V7.2c0-.9.3-1.6 1.7-1.6H17V2.6c-.3 0-1.4-.2-2.7-.2-2.7 0-4.6 1.6-4.6 4.7v2.7H7v3.2h2.7v8h3.8Z" />
      </svg>
    ),
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--brand-border)] bg-[var(--brand-white)]/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="Elibless Managers homepage">
          <Image
            src="/Elibless logo.png"
            alt="Elibless Managers logo"
            width={220}
            height={62}
            priority
            className="h-auto w-[150px] sm:w-[180px] lg:w-[220px]"
          />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-[var(--brand-navy)] transition hover:text-[var(--brand-gold)]"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="tel:+2348067136381"
            className="rounded-full border border-[var(--brand-gold)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-navy)] transition hover:bg-[var(--brand-gold-light)] hover:text-[var(--brand-navy-dark)]"
          >
            Call Now
          </a>
          <a
            href="https://wa.me/2348067136381"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full bg-[var(--brand-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]"
          >
            WhatsApp
          </a>
          <Link
            href="/properties"
            className="rounded-full border border-[var(--brand-border)] bg-[var(--brand-offwhite)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-navy)] transition hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]"
          >
            List a Property
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-offwhite)] text-[var(--brand-navy)] lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </nav>

      {isOpen ? (
        <div className="border-t border-[var(--brand-border)] bg-[var(--brand-white)] px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-base font-medium text-[var(--brand-navy)] transition hover:bg-[var(--brand-neutral)] hover:text-[var(--brand-gold)]"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-2 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-neutral)] p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">Follow us</p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`Follow Elibless Managers on ${item.label}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-navy)] px-3 py-2 text-sm font-semibold text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[var(--brand-gold-light)]">
                      {item.icon}
                    </span>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <a
              href="https://wa.me/2348067136381"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 rounded-full bg-[var(--brand-navy)] px-4 py-3 text-center text-sm font-semibold text-white"
              onClick={() => setIsOpen(false)}
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
