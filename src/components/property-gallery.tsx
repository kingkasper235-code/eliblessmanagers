"use client";

import Image from "next/image";
import { useState } from "react";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const gallery = images.length ? images : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"];

  return (
    <>
      <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={() => {
            setSelectedIndex(0);
            setIsOpen(true);
          }}
          className="block w-full overflow-hidden rounded-[24px]"
        >
          <Image
            src={gallery[0]}
            alt={title}
            width={1200}
            height={800}
            className="h-[420px] w-full rounded-[22px] object-cover transition hover:scale-[1.01] md:h-[520px]"
          />
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {gallery.map((image, index) => (
          <button
            key={`${title}-${index}`}
            type="button"
            onClick={() => {
              setSelectedIndex(index);
              setIsOpen(true);
            }}
            className="overflow-hidden rounded-[20px] border border-slate-200 bg-white p-2 text-left shadow-sm transition hover:border-emerald-500"
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

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Close
            </button>
            <div className="overflow-hidden rounded-[30px] border border-slate-800 bg-slate-900 p-2 shadow-2xl">
              <Image
                src={gallery[selectedIndex]}
                alt={`${title} large view`}
                width={1600}
                height={1100}
                className="max-h-[80vh] w-full rounded-[24px] object-contain"
              />
            </div>
            {gallery.length > 1 ? (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {gallery.map((image, index) => (
                  <button
                    key={`thumb-${index}`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`shrink-0 overflow-hidden rounded-xl border ${index === selectedIndex ? "border-emerald-400" : "border-slate-700"}`}
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
