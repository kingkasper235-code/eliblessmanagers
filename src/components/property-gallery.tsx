"use client";

import Image from "next/image";
import { useState } from "react";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const gallery = images.filter(Boolean);

  return (
    <>
      <div className="overflow-hidden border border-[var(--brand-border)] bg-white p-2 shadow-sm sm:p-3">
        {gallery.length ? (
          <button
            type="button"
            onClick={() => {
              setSelectedIndex(0);
              setIsOpen(true);
            }}
            aria-label={`Open ${title} photo gallery`}
            className="block w-full overflow-hidden"
          >
            <Image
              src={gallery[0]}
              alt={title}
              width={1200}
              height={800}
              priority
              className="h-[320px] w-full object-cover transition hover:scale-[1.01] sm:h-[420px] md:h-[520px]"
            />
          </button>
        ) : (
          <div className="flex h-[320px] items-center justify-center bg-[linear-gradient(145deg,#efede6,#dcdad2)] text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-muted)] sm:h-[420px] md:h-[520px]">
            Property photography not available
          </div>
        )}
      </div>

      {gallery.length > 1 ? (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {gallery.slice(0, 3).map((image, index) => (
          <button
            key={`${title}-${index}`}
            type="button"
            onClick={() => {
              setSelectedIndex(index);
              setIsOpen(true);
            }}
            className="overflow-hidden border border-[var(--brand-border)] bg-white p-1.5 text-left shadow-sm transition hover:border-[var(--brand-gold)]"
          >
            <Image
              src={image}
              alt={`${title} view ${index + 1}`}
              width={700}
              height={500}
              className="h-32 w-full rounded-[14px] object-cover"
            />
          </button>
          ))}
        </div>
      ) : null}

      {isOpen && gallery.length ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Close
            </button>
            <div className="overflow-hidden border border-white/20 bg-[var(--brand-navy-dark)] p-2 shadow-2xl">
              <Image
                src={gallery[selectedIndex]}
                alt={`${title} large view`}
                width={1600}
                height={1100}
                className="max-h-[80vh] w-full object-contain"
              />
            </div>
            {gallery.length > 1 ? (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {gallery.map((image, index) => (
                  <button
                    key={`thumb-${index}`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`shrink-0 overflow-hidden border ${index === selectedIndex ? "border-[var(--brand-gold)]" : "border-slate-700"}`}
                  >
                    <Image src={image} alt={`${title} thumbnail ${index + 1}`} width={200} height={120} className="h-16 w-24 object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
