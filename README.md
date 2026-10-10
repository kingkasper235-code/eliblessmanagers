# Elibless Managers

A premium real estate website for Nigerian buyers, renters, landlords, and investors.

## Stack
- Next.js
- TypeScript
- Tailwind CSS
- Supabase-ready architecture

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the site.

## Production build

```bash
npm install
npm run build
npm run start
```

## GitHub deployment readiness

This project is structured for a GitHub repository and keeps all private configuration out of version control.

1. Create a repository on GitHub.
2. Push the project branch.
3. Add your Supabase environment variables in the deployment platform or local `.env.local` file.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repository-url>
git push -u origin main
```

Important: GitHub Pages is best suited for the public frontend only. The admin panel requires a server-capable runtime for authenticated Supabase sessions and protected admin routes. For production admin work, deploy with a Node-compatible platform such as Vercel or a private server.

## Supabase setup

Copy `.env.example` to `.env.local` and add your real project credentials:

```bash
cp .env.example .env.local
```

Then fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Do not commit `.env.local`, `.env.production`, or any file containing a Supabase service-role key. The app intentionally uses only the public Supabase URL and publishable key in the browser. All writes are protected by Supabase RLS and admin pages require authenticated admin access.

### Featured owner profiles

Run the updated `supabase/schema.sql` for a new installation, or apply `supabase/migrations/20261009_owner_profiles.sql` after the existing schema. This creates two owner profile slots and permits admin-only portrait uploads to the existing `property-images` bucket. Manage the profiles from **Admin → Settings**; empty or inactive profiles stay hidden on the public site. See `supabase/README.md` for the storage and RLS details.

### Google Business profile on Contact

The Contact page uses the configurable Google Maps listing URL, defaulting to `https://maps.app.goo.gl/4aRcQcEtzcHtt8878`. For an existing Supabase installation, apply `supabase/migrations/20261010_google_business_settings.sql`; new installations can run the updated `supabase/schema.sql`. Manage the listing URL, optional Place ID, widget visibility and verified live-data setting in **Admin → Settings**. The table contains no API credentials and is readable by the public only for rendering this widget; writes are restricted by RLS to admins.

For live Place Details, configure this server-only variable in the deployment environment or local `.env.local`:

```text
GOOGLE_PLACES_API_KEY=your-server-side-places-api-key
```

Enable Places API (New), verify the Place ID from the correct Google Business listing, and restrict the key to Places API (New) plus the server environments that need it. The admin only enables live profile data after a no-store server request confirms the submitted Place ID. The profile request uses this explicit field mask: `displayName`, `primaryTypeDisplayName`, `rating`, `userRatingCount`, `formattedAddress`, `nationalPhoneNumber`, `websiteUri`, `regularOpeningHours.weekdayDescriptions`, `currentOpeningHours.openNow`, `googleMapsUri`, `reviews.rating`, `reviews.text`, `reviews.authorAttribution`, `reviews.googleMapsUri`, `photos.name`, and `photos.authorAttributions`. Do not prefix the Places key with `NEXT_PUBLIC_`. Returned reviews and photos include their available author and Google Maps attribution.

When Places returns photo resources, the server requests at most three using [Places Photos (New)](https://developers.google.com/maps/documentation/places/web-service/place-photos) with `skipHttpRedirect=true`, a bounded image width, the same server-only key, and `cache: "no-store"`. Only HTTPS photo URLs on `googleusercontent.com` hosts and the photo's returned author attributions are passed into the rendered widget. Images use the Google-returned URL directly, without Next Image Optimization or app-side persistence. The gallery is omitted when there are no returned photos or photo-media requests fail; no substitute/stock imagery is used. Place Details and each photo-media request may incur Google Maps Platform billing and are subject to API quotas; enable and monitor Places API (New) billing and quotas in the associated Google Cloud project.

The embedded map additionally requires a separate, public Maps Embed API key:

```text
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY=your-referrer-restricted-embed-key
```

Enable Maps Embed API and restrict this key by HTTP referrer to the exact site origins that need it (including local development origins only if required). This key is public by design; never use the server-side Places key in the map URL. The Place ID is configured in Admin → Settings; the Places and Embed keys are environment configuration, not admin settings. No secret credentials are committed to the repository.
