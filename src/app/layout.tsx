import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Elibless Managers | Premium Real Estate in Nigeria",
  description:
    "Elibless Managers connects buyers, renters, landlords, and investors with premium properties across Nigeria.",
  icons: {
    icon: "/Elibless fav.png",
    shortcut: "/Elibless fav.png",
    apple: "/Elibless fav.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--brand-offwhite)] text-[var(--brand-navy-dark)]">{children}</body>
    </html>
  );
}
