import { AdminShell } from "@/components/admin/admin-shell";
import { GoogleBusinessSettingsForm } from "@/components/admin/google-business-settings-form";
import { OwnerProfilesForm } from "@/components/admin/owner-profiles-form";
import { requireAdmin } from "@/lib/admin";
import {
  getGoogleBusinessSettings,
  hasGooglePlacesApiKey,
} from "@/lib/google-business-settings";
import { getOwnersResult } from "@/lib/owners";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>;
}) {
  await requireAdmin();
  const [{ owners, error }, googleSettings, params] = await Promise.all([
    getOwnersResult(),
    getGoogleBusinessSettings(),
    searchParams ?? Promise.resolve({ success: undefined }),
  ]);

  return (
    <AdminShell title="Settings" subtitle="Manage the public Google Business widget and team profiles shown on your website" current="Settings">
      {params.success ? (
        <p role="status" className="mb-6 border border-[rgba(200,155,60,0.35)] bg-[rgba(200,155,60,0.08)] px-4 py-3 text-sm text-[var(--brand-navy)]">
          {params.success}
        </p>
      ) : null}

      {error ? (
        <div role="alert" className="mb-6 border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-800">
          <p className="font-semibold">Owner profiles are not available yet.</p>
          <p className="mt-1">
            {error.includes("owners")
              ? "Apply the owners table and storage policies from supabase/schema.sql or the documented migration, then reload this page."
              : error}
          </p>
        </div>
      ) : null}

      <section className="mb-8 border border-[var(--brand-border)] bg-[var(--brand-offwhite)] p-5 sm:p-7">
        <div className="mb-6 max-w-2xl">
          <p className="brand-section-kicker">Public website</p>
          <h2 className="mt-2 text-2xl font-semibold">Google Business widget</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">
            Choose the listing and visibility for Contact. The public widget works with the fallback link alone; live profile details are enabled only after Google verifies the Place ID.
          </p>
        </div>
        <GoogleBusinessSettingsForm
          settings={googleSettings.settings}
          hasPlacesApiKey={hasGooglePlacesApiKey()}
          loadError={googleSettings.error}
        />
      </section>

      <section className="border border-[var(--brand-border)] bg-[var(--brand-offwhite)] p-5 sm:p-7">
        <div className="mb-6 max-w-2xl">
          <p className="brand-section-kicker">Public website</p>
          <h2 className="mt-2 text-2xl font-semibold">Featured owner profiles</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">
            Keep up to two profiles. Each can be edited independently; inactive or unnamed profiles stay off the public site.
          </p>
        </div>
        {!error ? <OwnerProfilesForm owners={owners} /> : null}
      </section>
    </AdminShell>
  );
}
