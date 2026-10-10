"use client";

import { useActionState, useState } from "react";

import { saveGoogleBusinessSettingsAction } from "@/lib/google-business-settings-actions";
import type { GoogleBusinessSettingsActionState } from "@/lib/google-business-settings-actions";
import type { GoogleBusinessSettings } from "@/lib/google-business-settings";

const initialActionState: GoogleBusinessSettingsActionState = {
  kind: "idle",
  message: "",
};

function formatCheckedAt(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function GoogleBusinessSettingsForm({
  settings,
  hasPlacesApiKey,
  loadError,
}: {
  settings: GoogleBusinessSettings;
  hasPlacesApiKey: boolean;
  loadError: string | null;
}) {
  const [actionState, formAction, isPending] = useActionState(
    saveGoogleBusinessSettingsAction,
    initialActionState,
  );
  const [placeId, setPlaceId] = useState(settings.place_id ?? "");
  const [dismissedMessage, setDismissedMessage] = useState("");
  const isLiveControlReady = Boolean(placeId.trim()) && hasPlacesApiKey;
  const [liveEnabled, setLiveEnabled] = useState(
    settings.live_data_enabled && isLiveControlReady,
  );
  const showActionResult =
    Boolean(actionState.message) &&
    !isPending &&
    actionState.message !== dismissedMessage;
  const checkedAt = formatCheckedAt(settings.checked_at);
  const dismissActionResult = () => {
    setDismissedMessage(actionState.message);
    if (actionState.savedLiveDataEnabled !== undefined) {
      setLiveEnabled(actionState.savedLiveDataEnabled);
    }
  };

  return (
    <form
      action={formAction}
      onSubmit={() => setDismissedMessage("")}
      className="space-y-6"
    >
      {loadError ? (
        <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
          {loadError}
        </p>
      ) : null}

      {showActionResult ? (
        <p
          role={actionState.kind === "error" ? "alert" : "status"}
          className={
            actionState.kind === "error"
              ? "border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
              : "border border-[rgba(200,155,60,0.35)] bg-[rgba(200,155,60,0.08)] px-4 py-3 text-sm leading-6 text-[var(--brand-navy)]"
          }
        >
          {actionState.message}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="space-y-5">
          <div>
            <label htmlFor="google-listing-url" className="form-label">Google Maps listing URL</label>
            <input
              id="google-listing-url"
              name="listing_url"
              type="url"
              required
              maxLength={2048}
              defaultValue={settings.listing_url}
              onChange={dismissActionResult}
              className="form-control"
              autoComplete="url"
              aria-describedby="google-listing-help"
            />
            <p id="google-listing-help" className="mt-2 text-xs leading-5 text-[var(--brand-muted)]">
              Use an HTTPS Google Maps link, including a maps.app.goo.gl short link. This remains the public fallback when live data is off.
            </p>
          </div>

          <div>
            <label htmlFor="google-place-id" className="form-label">Google Place ID <span className="font-normal text-[var(--brand-muted)]">(optional)</span></label>
            <input
              id="google-place-id"
              name="place_id"
              type="text"
              maxLength={255}
              value={placeId}
              onChange={(event) => {
                setPlaceId(event.target.value);
                dismissActionResult();
              }}
              className="form-control"
              placeholder="ChIJ…"
              autoComplete="off"
              spellCheck={false}
              aria-describedby="google-place-id-help"
            />
            <p id="google-place-id-help" className="mt-2 text-xs leading-5 text-[var(--brand-muted)]">
              Enter the verified ID for the same business as the listing link. It is public metadata, not an API credential.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <section aria-labelledby="google-fallback-heading" className="border border-[#b8ddda] border-l-4 border-l-[#0e625d] bg-[#f2f8f7] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0e625d]">01 · Listing fallback</p>
                <h3 id="google-fallback-heading" className="mt-1 text-base font-semibold text-[var(--brand-navy-dark)]">Your saved Maps link</h3>
              </div>
              <span className="border border-[#b8ddda] bg-white px-2 py-1 text-[11px] font-semibold text-[#0e625d]">
                {settings.widget_enabled ? "Shown on Contact" : "Widget hidden"}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--brand-muted)]">
              This is the reliable listing destination whenever live profile data is unavailable or turned off.
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 border-t border-[#cfe5e2] pt-3 text-sm text-[var(--brand-navy-dark)]">
              <input
                type="checkbox"
                name="widget_enabled"
                defaultChecked={settings.widget_enabled}
                onChange={dismissActionResult}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand-gold)]"
              />
              <span>
                <span className="block font-semibold">Show widget on Contact</span>
                <span className="mt-1 block leading-5 text-[var(--brand-muted)]">Hiding the widget also hides the fallback listing.</span>
              </span>
            </label>
          </section>

          <section aria-labelledby="google-live-heading" className="border border-[var(--brand-border)] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-muted)]">02 · Optional enhancement</p>
                <h3 id="google-live-heading" className="mt-1 text-base font-semibold text-[var(--brand-navy-dark)]">Live Google profile</h3>
              </div>
              <span className={`border px-2 py-1 text-[11px] font-semibold ${
                settings.connection_status === "connected"
                  ? "border-[#b8ddda] bg-[#f2f8f7] text-[#0e625d]"
                  : settings.connection_status === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-[var(--brand-border)] bg-[var(--brand-offwhite)] text-[var(--brand-muted)]"
              }`}>
                {settings.connection_status === "connected"
                  ? "Verified"
                  : settings.connection_status === "error"
                    ? "Needs attention"
                    : "Not configured"}
              </span>
            </div>

            <label className={`mt-4 flex items-start gap-3 border-t border-[var(--brand-border)] pt-4 text-sm ${isLiveControlReady ? "cursor-pointer text-[var(--brand-navy-dark)]" : "cursor-not-allowed text-[var(--brand-muted)]"}`}>
              <input
                type="checkbox"
                name="live_data_enabled"
                value="on"
                disabled={!isLiveControlReady}
                checked={
                  showActionResult && actionState.savedLiveDataEnabled !== undefined
                    ? actionState.savedLiveDataEnabled
                    : liveEnabled && isLiveControlReady
                }
                onChange={(event) => {
                  setLiveEnabled(event.target.checked);
                  setDismissedMessage(actionState.message);
                }}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#0e625d] disabled:opacity-50"
              />
              <span>
                <span className="block font-semibold">Enable verified live data</span>
                <span className="mt-1 block leading-5">
                  {hasPlacesApiKey
                    ? "A successful Place Details test is required before live details can be enabled."
                    : "Configure GOOGLE_PLACES_API_KEY on the server and add a Place ID to enable this option."}
                </span>
              </span>
            </label>

            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-[var(--brand-border)] pt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--brand-muted)]">Last API test</p>
              <p className="text-xs font-semibold text-[var(--brand-navy-dark)]">
                {settings.connection_status === "connected"
                  ? "Connected"
                  : settings.connection_status === "error"
                    ? "Error"
                    : "Not configured"}
                {checkedAt ? <span className="font-normal text-[var(--brand-muted)]"> · {checkedAt}</span> : null}
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--brand-muted)]">
              Shows the result and time of the last API test; it is not a live health indicator.
            </p>
          </section>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-[var(--brand-border)] pt-5">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center bg-[var(--brand-navy)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-gold)] disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save Google Business settings"}
        </button>
        {isPending ? <span role="status" className="text-sm text-[var(--brand-muted)]">Saving settings…</span> : null}
      </div>
    </form>
  );
}
