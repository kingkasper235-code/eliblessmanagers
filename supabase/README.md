# Supabase setup for Elibless Managers

## 1. Create a Supabase project

Create a new Supabase project in the Supabase dashboard and then run the SQL from `schema.sql` in the SQL editor.

## 2. Storage bucket

Create a storage bucket named `property-images` with public access enabled.
The schema allows authorized admins to upload property images under `properties/` and featured owner portraits under `owners/`.

Recommended folder structure:

```text
property-images/
  properties/
    1/
      main.jpg
      gallery-1.jpg
```

## 3. Environment variables

Create a `.env.local` file from the example file and fill in the values from your project settings:

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-key
```

Do not expose the service-role key in frontend code. Use the public/publishable key only.

## 4. RLS and admin access

To allow admin access, create entries in the `admin_profiles` table for the authenticated users that should manage properties.

Example:

```sql
insert into public.admin_profiles (id, full_name)
values ('<auth-user-uuid>', 'Admin User');
```

## 5. Data insertion example

```sql
insert into public.properties (
  title,
  slug,
  description,
  price,
  currency,
  property_type,
  listing_type,
  location,
  address,
  city,
  state,
  bedrooms,
  bathrooms,
  toilets,
  property_size,
  year_built,
  status,
  featured,
  published
)
values (
  'Luxury 5-Bedroom Duplex in Lekki',
  'luxury-5-bedroom-duplex-lekki',
  'Premium home with ocean view and modern finishes.',
  45000000,
  'NGN',
  'Duplex',
  'sale',
  'Lekki Phase 1, Lagos',
  'No 10 Admiralty Way, Lekki Phase 1',
  'Lagos',
  'Lagos',
  5,
  4,
  4,
  3200,
  2022,
  'available',
  true,
  true
);
```

Then insert gallery rows and amenities using the related tables.

## 6. Featured owner profiles

The schema creates the `owners` table with two unique slots (`slot_number` 1 and 2). Each profile can be edited in **Admin → Settings**; a profile is public only when it has a name and its **Show publicly** option is enabled. Empty or inactive slots do not appear on the website.

For an existing installation, run `migrations/20261009_owner_profiles.sql` after the base schema. It adds the owner table, admin/public row-level security policies, and admin-only uploads to the existing `property-images` bucket. Do not add sample owner names or photos; fill the two profiles with approved company information.
