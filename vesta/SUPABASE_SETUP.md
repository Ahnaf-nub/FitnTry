# Supabase setup

The username/password auth in this app (`src/lib/supabaseClient.ts`,
`src/hooks/useAuth.tsx`, Login/Signup pages, `ProtectedRoute`) is already
built and wired into `App.tsx`. This is just the Supabase-side
configuration to make it work.

## 1. Create a project
1. https://supabase.com → New project.
2. Once it's up: **Project Settings → API** → copy the **Project URL** and
   the **anon/public key**.

## 2. Turn off email confirmation
The app signs users up with usernames only, no real email address — it
derives a fake internal address (`ahnaf` → `ahnaf@FitnTry.local`) since
Supabase Auth is email-based under the hood. Those addresses can't
receive a confirmation email, so:

**Authentication → Providers → Email → turn OFF "Confirm email"**

Skip this step and every signup will silently sit in an unconfirmed
state and login will fail right after signup.

## 3. Fill in the frontend .env
```bash
cp .env.example .env
```
Set:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

That's the whole setup for auth — no custom tables needed for it.
Usernames live in `auth.users.user_metadata.username`, and the fake-email
trick gives you username uniqueness for free since Supabase already
enforces unique emails.

## 4. Create the database tables

Two features need real tables: saved looks (persisted per-user, with
Row Level Security so no one can see another user's saved looks), and
the shop directory shown on the Saved page (public read, owner-only
write — this is also what makes "shop owner" signups work).

**Dashboard → SQL Editor → New query** → paste the entire contents of
`supabase/schema.sql` → **Run**.

That single script creates both `public.saved_looks` and `public.shops`
with their RLS policies, plus a handful of seeded Dhaka stores so the
directory isn't empty before any shop account signs up. It's safe to
re-run if anything errors partway through.

If you're seeing "Could not find the table 'public.saved_looks' in the
schema cache" when trying to save a look, this step hasn't been run yet
— that error means the table genuinely doesn't exist, not a bug in the
app code.

## 5. Point the frontend at your real try-on backend
Same `.env`:
```
VITE_USE_MOCK_API=false
```
Leave `VITE_API_BASE_URL` unset — the dev server proxies `/api` to
`http://localhost:4000` (see `vite.config.ts`), which is where the
FastAPI backend in `vesta-backend/` runs. If you deploy the frontend
separately from the backend, set `VITE_API_BASE_URL` to the backend's
public URL instead.

## 6. Shop accounts

Signing up with "I own a store" selected stores `role: "shop"` in that
user's account metadata. A shop account gets a "My Store" link in the
nav leading to `/my-store`, where they set their store name, address,
and (optionally) coordinates — either typed in manually or via a
"use my current location" button. That row becomes visible in every
shopper's "Clothing stores near you" list on the Saved page immediately,
no approval step.
