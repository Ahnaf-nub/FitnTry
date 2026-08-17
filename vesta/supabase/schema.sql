-- Run this ENTIRE file in Supabase: Dashboard -> SQL Editor -> New query
-- -> paste all of this -> Run. Safe to re-run if something errors partway
-- through (every statement is idempotent).

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ============================================================
-- saved_looks — one row per look a shopper saves from a try-on
-- ============================================================

create table if not exists public.saved_looks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- The generated try-on result and the original photo it was made from.
  result_image text not null,
  before_image text not null,

  -- Stored as JSON rather than a foreign key to a garments table, since
  -- garments can also be one-off custom uploads that don't live in any
  -- catalog (see Garment type in src/types/tryOn.ts).
  garment jsonb not null,

  style text,
  favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists saved_looks_user_id_idx on public.saved_looks (user_id);
create index if not exists saved_looks_created_at_idx on public.saved_looks (created_at desc);

alter table public.saved_looks enable row level security;

drop policy if exists "select own saved looks" on public.saved_looks;
create policy "select own saved looks"
  on public.saved_looks for select
  using (auth.uid() = user_id);

drop policy if exists "insert own saved looks" on public.saved_looks;
create policy "insert own saved looks"
  on public.saved_looks for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own saved looks" on public.saved_looks;
create policy "update own saved looks"
  on public.saved_looks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete own saved looks" on public.saved_looks;
create policy "delete own saved looks"
  on public.saved_looks for delete
  using (auth.uid() = user_id);

-- ============================================================
-- shops — the "clothing stores near you" directory shown on
-- the Saved page. One row per shop account, plus a few seeded
-- rows so the list isn't empty before any shop signs up.
-- ============================================================

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

alter table public.shops enable row level security;

-- The directory is public — anyone (including signed-out visitors)
-- can view it. Only a shop's own account can create/edit/delete its row.
drop policy if exists "anyone can view shops" on public.shops;
create policy "anyone can view shops"
  on public.shops for select
  using (true);

drop policy if exists "shop can insert own row" on public.shops;
create policy "shop can insert own row"
  on public.shops for insert
  with check (auth.uid() = user_id);

drop policy if exists "shop can update own row" on public.shops;
create policy "shop can update own row"
  on public.shops for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "shop can delete own row" on public.shops;
create policy "shop can delete own row"
  on public.shops for delete
  using (auth.uid() = user_id);

-- Seed a few real Dhaka clothing stores so the directory isn't empty
-- before any shop account signs up. Only runs if the table is currently
-- empty, so re-running this script won't duplicate them.
insert into public.shops (name, address, latitude, longitude)
select * from (
  values
    ('Aarong', 'House 2, Road 108, Gulshan 2, Dhaka', 23.7925, 90.4078),
    ('Yellow', 'Jamuna Future Park, Kuril, Dhaka', 23.8145, 90.4256),
    ('Westecs', 'Bashundhara City, Panthapath, Dhaka', 23.7508, 90.3928),
    ('Cat''s Eye', 'Gulshan Avenue, Dhaka', 23.7808, 90.4176),
    ('Ecstasy', 'Dhanmondi 27, Dhaka', 23.7565, 90.3754)
) as seed(name, address, latitude, longitude)
where not exists (select 1 from public.shops);

-- ============================================================
-- shop_products — items a shop has added to their store listing,
-- shown on their "My Store" page. Public read (so the catalog is
-- visible), owner-only write (checked via the parent shops row,
-- since there's no direct user_id column on this table).
-- ============================================================

create table if not exists public.shop_products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  category text,
  price numeric,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists shop_products_shop_id_idx on public.shop_products (shop_id);

alter table public.shop_products enable row level security;

drop policy if exists "anyone can view shop products" on public.shop_products;
create policy "anyone can view shop products"
  on public.shop_products for select
  using (true);

drop policy if exists "shop can insert own products" on public.shop_products;
create policy "shop can insert own products"
  on public.shop_products for insert
  with check (
    exists (select 1 from public.shops s where s.id = shop_id and s.user_id = auth.uid())
  );

drop policy if exists "shop can delete own products" on public.shop_products;
create policy "shop can delete own products"
  on public.shop_products for delete
  using (
    exists (select 1 from public.shops s where s.id = shop_id and s.user_id = auth.uid())
  );
