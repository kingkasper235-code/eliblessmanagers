"use client";

import { GoogleBusinessActionIcon } from "@/components/google-business-action-icon";
import { useState } from "react";

export function GoogleBusinessShare({ listingUrl }: { listingUrl: string }) {
  const [message, setMessage] = useState("");

  async function shareListing() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Elibless Managers on Google Maps",
          url: listingUrl,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setMessage("Sharing isn’t available right now.");
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(listingUrl);
      setMessage("Google Maps listing link copied.");
    } catch {
      setMessage("Use the Google Maps link to share this listing.");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={shareListing}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-white/20 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-[#80d5d1] hover:bg-white/5 focus-visible:outline-[#80d5d1] focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto"
      >
        <GoogleBusinessActionIcon><ShareIcon /></GoogleBusinessActionIcon>
        Share
      </button>
      <span className="sr-only" aria-live="polite">{message}</span>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7">
      <path d="M10 13V3m0 0L6.5 6.5M10 3l3.5 3.5M4 10v6h12v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
