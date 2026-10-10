create table if not exists public.google_business_settings (
  id integer primary key default 1 check (id = 1),
  listing_url text not null default 'https://maps.app.goo.gl/4aRcQcEtzcHtt8878',
  place_id text,
  widget_enabled boolean not null default true,
  live_data_enabled boolean not null default false,
  connection_status text not null default 'not_configured'
    check (connection_status in ('not_configured', 'connected', 'error')),
  checked_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint google_business_place_id_format check (
    place_id is null or (
      length(place_id) between 1 and 255
      and place_id ~ '^[A-Za-z0-9_-]+$'
    )
  )
);

insert into public.google_business_settings (id)
values (1)
on conflict (id) do nothing;

create or replace function public.google_business_settings_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists google_business_settings_set_updated_at
on public.google_business_settings;
create trigger google_business_settings_set_updated_at
before update on public.google_business_settings
for each row
execute function public.google_business_settings_set_updated_at();

alter table public.google_business_settings enable row level security;

drop policy if exists "Public can read Google Business settings"
on public.google_business_settings;
create policy "Public can read Google Business settings"
on public.google_business_settings
for select
using (true);

drop policy if exists "Admins can insert Google Business settings"
on public.google_business_settings;
create policy "Admins can insert Google Business settings"
on public.google_business_settings
for insert
with check (public.is_admin());

drop policy if exists "Admins can update Google Business settings"
on public.google_business_settings;
create policy "Admins can update Google Business settings"
on public.google_business_settings
for update
using (public.is_admin())
with check (public.is_admin());

revoke all on table public.google_business_settings from anon, authenticated;
grant select on table public.google_business_settings to anon, authenticated;
grant insert, update on table public.google_business_settings to authenticated;
