import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { label: "Properties", href: "/properties" },
  { label: "For Sale", href: "/for-sale" },
  { label: "For Rent", href: "/for-rent" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/eliblessmanagers/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.25-3.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/eliblessproperty/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V7.2c0-.9.3-1.6 1.7-1.6H17V2.6c-.3 0-1.4-.2-2.7-.2-2.7 0-4.6 1.6-4.6 4.7v2.7H7v3.2h2.7v8h3.8Z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-[var(--brand-navy)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5">
            <div className="flex items-center justify-start">
              <Image
                src="/Elibless logo.png"
                alt="Elibless Managers logo"
                width={220}
                height={58}
                className="h-auto w-[180px]"
              />
            </div>
            <p className="max-w-sm text-sm leading-7 text-slate-300">
              Helping buyers, renters, landlords, and investors secure smart property opportunities across Nigeria with clarity, trust, and excellence.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={item.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[var(--brand-gold-light)] transition hover:border-[var(--brand-gold)] hover:bg-white/10"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold-light)]">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-[var(--brand-gold-light)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold-light)]">Contact</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li><a href="tel:+2348067136381" className="hover:text-[var(--brand-gold-light)]">08067136381</a></li>
              <li><a href="tel:+2347010466117" className="hover:text-[var(--brand-gold-light)]">07010466117</a></li>
              <li><a href="mailto:Elibless123@gmail.com" className="hover:text-[var(--brand-gold-light)]">Elibless123@gmail.com</a></li>
              <li><a href="https://www.instagram.com/eliblessmanagers/" target="_blank" rel="noreferrer noopener" className="hover:text-[var(--brand-gold-light)]">@eliblessmanagers</a></li>
              <li><a href="https://www.facebook.com/eliblessproperty/" target="_blank" rel="noreferrer noopener" className="hover:text-[var(--brand-gold-light)]">Elibless Property</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold-light)]">Business Hours</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li>Mon - Fri: 8:00 AM - 6:00 PM</li>
              <li>Saturday: 9:00 AM - 4:00 PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Elibless Managers. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[var(--brand-gold-light)]">Privacy</span>
            <span className="hover:text-[var(--brand-gold-light)]">Terms</span>
            <span className="hover:text-[var(--brand-gold-light)]">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
