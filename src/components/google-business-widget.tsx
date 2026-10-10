import { GoogleBusinessShare } from "@/components/google-business-share";
import { GoogleBusinessActionIcon } from "@/components/google-business-action-icon";
import {
  getGoogleBusinessProfile,
  getSafeGoogleUrl,
  type GoogleBusinessPhoto,
  type GoogleBusinessProfile,
} from "@/lib/google-business";
import {
  DEFAULT_GOOGLE_BUSINESS_LISTING_URL,
  getGoogleBusinessSettings,
} from "@/lib/google-business-settings";
import type { ReactNode } from "react";

export function GoogleBusinessWidgetLoading() {
  return (
    <section
      aria-labelledby="google-business-loading-heading"
      aria-busy="true"
      className="mt-10 overflow-hidden rounded-2xl border border-[#80d5d1]/55 bg-[var(--brand-navy-dark)] shadow-[0_0_24px_rgba(128,213,209,0.08)]"
    >
      <div className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#80d5d1]">Find us</p>
        <h2 id="google-business-loading-heading" className="mt-2 text-3xl text-white">Visit Our Office</h2>
        <p className="mt-2 text-sm leading-6 text-white/70">
          Find us on Google and see our location, reviews, hours and more.
        </p>
      </div>
      <div role="status" className="grid gap-5 p-5 sm:p-8 lg:grid-cols-2">
        <p className="text-sm text-white/70">Loading Google profile details…</p>
        <div className="min-h-64 animate-pulse border border-white/10 bg-white/[0.04] sm:min-h-80" />
      </div>
    </section>
  );
}

export async function GoogleBusinessWidget() {
  const { settings } = await getGoogleBusinessSettings();
  if (!settings.widget_enabled) return null;

  const placeId =
    settings.live_data_enabled && process.env.GOOGLE_PLACES_API_KEY?.trim()
      ? settings.place_id
      : null;
  const { profile, photos, requestFailed } = await getGoogleBusinessProfile(placeId);
  const embedKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY?.trim();
  const mapUrl = settings.live_data_enabled && placeId && embedKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(embedKey)}&q=${encodeURIComponent(`place_id:${placeId}`)}`
    : null;
  const displayName = profile?.displayName?.text;
  const websiteUrl = getSafeGoogleUrl(profile?.websiteUri);
  const phoneNumber = profile?.nationalPhoneNumber;
  const phoneDigits = phoneNumber?.replace(/\D/g, "");
  const phoneHref = phoneNumber && phoneDigits
    ? `tel:${phoneNumber.startsWith("+") ? "+" : ""}${phoneDigits}`
    : null;
  const category = profile?.primaryTypeDisplayName?.text;
  const listingUrl =
    getSafeGoogleUrl(profile?.googleMapsUri) ??
    settings.listing_url ??
    DEFAULT_GOOGLE_BUSINESS_LISTING_URL;
  const reviews = (profile?.reviews ?? []).filter(
    (review) => review.text?.text && review.authorAttribution?.displayName,
  ).slice(0, 2);

  return (
    <section
      aria-labelledby="google-business-heading"
      className="mt-10 overflow-hidden rounded-2xl border border-[#80d5d1]/55 bg-[var(--brand-navy-dark)] shadow-[0_0_28px_rgba(128,213,209,0.12)]"
    >
      <div className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#80d5d1]">Find us</p>
        <h2 id="google-business-heading" className="mt-2 text-3xl text-white">Visit Our Office</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
          Find us on Google and see our location, reviews, hours and more.
        </p>
      </div>

      <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col border-b border-white/10 p-5 sm:p-8 lg:border-r lg:border-b-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
              Google Business Profile
            </p>
            <h3 className="mt-3 break-words text-2xl leading-tight text-white">
              {displayName || "Google Business Profile"}
            </h3>
            {category ? <p className="mt-2 text-sm text-[#80d5d1]">{category}</p> : null}
            {profile ? <ProfileDetails profile={profile} /> : (
              <p className="mt-4 border-l-2 border-[#80d5d1]/70 pl-3 text-sm leading-6 text-white/70">
                {requestFailed
                  ? "Live Google profile details couldn’t be loaded just now. The listing link is still available."
                  : "Live profile details are turned off or not configured. The Google Maps listing link is still available."}
              </p>
            )}
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <ActionLink href={listingUrl} label="Directions" icon={<DirectionsIcon />} />
            {phoneNumber && phoneHref ? (
              <ActionLink href={phoneHref} label="Call" icon={<PhoneIcon />} />
            ) : null}
            {websiteUrl ? (
              <ActionLink href={websiteUrl} label="Website" icon={<WebsiteIcon />} external />
            ) : null}
            <GoogleBusinessShare listingUrl={listingUrl} />
          </div>
          <a
            href={listingUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full border border-[#80d5d1] bg-[#80d5d1] px-5 text-sm font-bold text-[var(--brand-navy-dark)] transition hover:border-white hover:bg-white focus-visible:outline-[#80d5d1] focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            View on Google Maps <ArrowIcon />
          </a>
        </div>

        <div className="p-4 sm:p-6">
          <div className="relative min-h-64 overflow-hidden border border-white/10 bg-[#102638] sm:min-h-80">
            {mapUrl ? (
              <iframe
                title="Google Maps location preview"
                src={mapUrl}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <MapUnavailable />
            )}
          </div>
          {reviews.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {reviews.map((review, index) => (
                <ReviewCard
                  key={`${review.authorAttribution?.displayName}-${index}`}
                  review={review}
                  listingUrl={listingUrl}
                />
              ))}
            </div>
          ) : null}
          {photos.length > 0 ? (
            <div className="mt-5" aria-label="Google Maps photos">
              <h3 className="mb-3 text-lg text-white">Photos</h3>
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
                {photos.map((photo, index) => (
                  <GooglePhoto
                    key={`${photo.uri}-${index}`}
                    photo={photo}
                    alt={`Photo ${index + 1} of ${displayName || "the business"} on Google Maps`}
                  />
                ))}
              </div>
            </div>
          ) : null}
          <p className="mt-4 text-xs leading-5 text-white/50">
            {profile ? "Profile details provided by Google Maps." : "Google Maps listing"}
          </p>
        </div>
      </div>
    </section>
  );
}

function ProfileDetails({ profile }: { profile: GoogleBusinessProfile }) {
  const hours = profile.regularOpeningHours?.weekdayDescriptions;
  const hasRating = typeof profile.rating === "number";

  return (
    <div className="mt-4 space-y-3 text-sm text-white/75">
      {hasRating ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-white">{profile.rating!.toFixed(1)} / 5</span>
          <span aria-label="Google rating" className="tracking-wide text-[#80d5d1]">★</span>
          {typeof profile.userRatingCount === "number" ? (
            <span>{profile.userRatingCount.toLocaleString()} reviews</span>
          ) : null}
        </p>
      ) : null}
      {typeof profile.currentOpeningHours?.openNow === "boolean" ? (
        <p>{profile.currentOpeningHours.openNow ? "Open now" : "Closed now"}</p>
      ) : null}
      {profile.formattedAddress ? (
        <p className="flex gap-2 leading-6"><PinIcon /> <span>{profile.formattedAddress}</span></p>
      ) : null}
      {profile.nationalPhoneNumber ? (
        <p className="flex gap-2 leading-6"><PhoneIcon /> <span>{profile.nationalPhoneNumber}</span></p>
      ) : null}
      {hours?.length ? (
        <details className="group border-t border-white/10 pt-3">
          <summary className="min-h-10 cursor-pointer font-semibold text-white underline decoration-white/30 underline-offset-4">
            Opening hours
          </summary>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-white/65">
            {hours.map((day) => <li key={day}>{day}</li>)}
          </ul>
        </details>
      ) : null}
      {!hasRating && !profile.formattedAddress && !profile.nationalPhoneNumber && !hours?.length ? (
        <p className="leading-6 text-white/65">No additional profile details were returned.</p>
      ) : null}
    </div>
  );
}

function ReviewCard({
  review,
  listingUrl,
}: {
  review: NonNullable<GoogleBusinessProfile["reviews"]>[number];
  listingUrl: string;
}) {
  const authorUri = getSafeGoogleUrl(review.authorAttribution?.uri);
  const reviewUrl = getSafeGoogleUrl(review.googleMapsUri) || listingUrl;
  const author = review.authorAttribution?.displayName;
  if (!author || !review.text?.text) return null;

  return (
    <article className="border border-white/10 bg-white/[0.035] p-4">
      {typeof review.rating === "number" ? (
        <p className="text-sm tracking-wide text-[#80d5d1]" aria-label={`Rated ${review.rating} out of 5`}>
          {"★".repeat(Math.max(0, Math.min(5, Math.round(review.rating))))}
        </p>
      ) : null}
      <p className="mt-2 text-sm leading-6 text-white/80">{review.text.text}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        {authorUri ? (
          <a href={authorUri} target="_blank" rel="noreferrer noopener" className="font-semibold text-white underline underline-offset-2">
            {author}
          </a>
        ) : <span className="font-semibold text-white">{author}</span>}
        <a href={reviewUrl} target="_blank" rel="noreferrer noopener" className="text-[#80d5d1] underline underline-offset-2">
          Google Maps
        </a>
      </div>
    </article>
  );
}

function GooglePhoto({ photo, alt }: { photo: GoogleBusinessPhoto; alt: string }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
      {/* Use the returned Google photo URL directly; do not route it through Next image optimization. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.uri}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="aspect-[4/3] w-full object-cover"
      />
      <figcaption className="px-3 py-2 text-xs leading-5 text-white/70">
        {photo.authorAttributions.length > 0 ? (
          <span>
            Photo by{" "}
            {photo.authorAttributions.map((author, index) => {
              const authorUrl = getSafeGoogleUrl(author.uri);
              const attribution = authorUrl ? (
                <a
                  key={`${author.displayName}-${index}`}
                  href={authorUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline decoration-white/40 underline-offset-2 hover:text-white"
                >
                  {author.displayName}
                </a>
              ) : (
                <span key={`${author.displayName}-${index}`}>{author.displayName}</span>
              );
              return <span key={`attribution-${author.displayName}-${index}`}>{index > 0 ? ", " : ""}{attribution}</span>;
            })}
            {" · "}Google Maps
          </span>
        ) : (
          <span>Google Maps photo</span>
        )}
      </figcaption>
    </figure>
  );
}

function ActionLink({
  href,
  label,
  icon,
  primary = false,
  external = false,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  primary?: boolean;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 border px-3 py-2 text-sm font-semibold transition focus-visible:outline-[#80d5d1] ${
        primary
          ? "border-[#80d5d1] bg-[#80d5d1] text-[var(--brand-navy-dark)] hover:bg-white hover:border-white"
          : "border-white/20 text-white hover:border-[#80d5d1] hover:bg-white/5"
      }`}
    >
      <GoogleBusinessActionIcon>{icon}</GoogleBusinessActionIcon>
      {label}
    </a>
  );
}

function MapUnavailable() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_85%_5%,rgba(128,213,209,0.15),transparent_55%),linear-gradient(135deg,#102638,#0b1d29)] px-5 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.13]">
        <div className="absolute left-[14%] top-[-22%] h-[150%] w-5 rotate-[24deg] border-x border-[#80d5d1]" />
        <div className="absolute left-[63%] top-[-15%] h-[140%] w-7 -rotate-[38deg] border-x border-[#80d5d1]" />
        <div className="absolute left-[-12%] top-[35%] h-6 w-[125%] rotate-[-8deg] border-y border-[#80d5d1]" />
        <div className="absolute left-[-10%] top-[73%] h-5 w-[125%] rotate-[9deg] border-y border-[#80d5d1]" />
      </div>
      <span className="relative grid h-12 w-12 place-items-center rounded-full border border-[#80d5d1]/60 bg-[#80d5d1]/10 text-[#80d5d1]">
        <PinIcon />
      </span>
      <p className="relative mt-4 text-base font-semibold text-white">Map preview unavailable</p>
      <p className="relative mt-1 max-w-sm text-sm leading-6 text-white/65">
        A verified Place ID and a referrer-restricted Maps Embed key are needed to show the live map.
      </p>
      <p className="relative mt-4 text-xs font-semibold text-[#80d5d1]">
        Use the “View on Google Maps” link above to open the listing.
      </p>
    </div>
  );
}

function DirectionsIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7"><path d="M10 2.5 17.5 10 10 17.5 2.5 10 10 2.5Z" strokeLinejoin="round" /><path d="M7 10h6m-2-2 2 2-2 2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PhoneIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-none stroke-current" strokeWidth="1.7"><path d="m6 3 2 3-1.4 1.5a11 11 0 0 0 5.9 5.9L14 12l3 2-1 3c-.2.5-.8.8-1.3.7A15.2 15.2 0 0 1 2.3 5.3c-.1-.5.2-1.1.7-1.3L6 3Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function WebsiteIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7"><circle cx="10" cy="10" r="7.3" /><path d="M2.9 10h14.2M10 2.7a11 11 0 0 1 0 14.6 11 11 0 0 1 0-14.6Z" /></svg>;
}

function PinIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-none stroke-current" strokeWidth="1.7"><path d="M16 8.3c0 4.3-6 9-6 9s-6-4.7-6-9a6 6 0 1 1 12 0Z" strokeLinejoin="round" /><circle cx="10" cy="8" r="2" /></svg>;
}

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.7"><path d="M3.5 12.5 12.5 3.5m0 0H5m7.5-1.5v7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
