# FitnTry try-on backend

FastAPI backend for the FitnTry virtual try-on app. Implements the
try-on generation contract the frontend calls (see
`src/services/tryOnApi.ts` in `vesta/`), and serves the built frontend
itself.

```
POST /api/try-on
  body: { userImage, garmentImage, garmentCategory }
  ->    { jobId, status }

GET  /api/try-on/:jobId
  ->    { jobId, status: "processing"|"completed"|"failed", resultImage?, error? }
```

`userImage` and custom-uploaded `garmentImage` values arrive as base64
data URLs (the frontend reads files with `FileReader.readAsDataURL`);
catalog garments arrive as plain image URLs. `app/images.py` handles
both transparently.

Nearby stores and shop accounts are **not** part of this backend
anymore — they're handled entirely through Supabase directly from the
frontend (a `shops` table, public-read/owner-write). See
`vesta/SUPABASE_SETUP.md`. An earlier version of this backend called a
live geolocation API (Overpass) for that; it's been removed in favor of
a real, persistent shop directory instead.

## 1. YouCam endpoint — verified, not guessed

`app/youcam_client.py` targets `yce-api-01.makeupar.com`, feature slug
`cloth`, confirmed against Perfect Corp's own docs and mock-tested
against their documented request/response shapes (upload body needs
`content_type` + `file_name` + `file_size`; task-create body is flat,
no wrapper; result lands at `data.results.url`). If YouCam still errors
for you, it's a real account/key issue at that point, not a guessed
endpoint — send me the new traceback.

## 2. Run it

```bash
python3 -m venv .venv
source .venv/bin/activate        # .venv\Scripts\activate on Windows
pip install -r requirements.txt

cp .env.example .env             # fill in YOUCAM_API_KEY, Supabase values
uvicorn app.main:app --reload --port 4000
```

This serves the frontend too — visit `http://localhost:4000` directly.
It looks for a built `vesta/dist/` and falls back to a "build missing"
page if it isn't there yet. `vesta/dist/` is already included in this
zip, pre-built — you don't need npm to run this.

## 3. Static files vs SPA routing

`app/main.py`'s catch-all route checks whether the requested path is a
real file in `vesta/dist/` (like `/silk-blouse.jpg`) and serves it
directly; only paths that *aren't* real files (like `/saved`, a client-
side React Router route) fall back to `index.html`. An earlier version
of this route always returned `index.html` for everything, which meant
every product image 404'd silently in production (they render fine in
`npm run dev` since Vite's dev server serves the whole project
directory, which is why this wasn't obvious until the real build was
tested). Fixed and boot-tested — verified an actual image returns
`image/jpeg`, a client route returns the SPA shell, and a path-traversal
attempt (`/../app/main.py`) is blocked rather than leaking source.

## 4. Saved looks and shops persist to Supabase

Both now require the migration in `vesta/supabase/schema.sql` — see
`vesta/SUPABASE_SETUP.md` step 4 for the one-time SQL to run in the
Supabase SQL editor. Without it, saving a look fails with "Could not
find the table" — that error means the table genuinely doesn't exist
yet, not an app bug.

## 5. How try-on generation works

- `POST /api/try-on` creates a job, kicks off generation in the
  background (`asyncio.create_task`), and returns immediately with
  `status: "processing"` — the frontend's `ProcessingModal` polls, it
  doesn't block on the POST.
- The background task: resolves both images to bytes → uploads each to
  YouCam → starts the Clothes VTO task → polls YouCam until done →
  writes `completed`/`resultImage` or `failed`/`error` into the job
  store.
- `GET /api/try-on/:jobId` just reads that job store. 404 if the jobId
  is unknown (e.g. server restarted — jobs are in-memory; see
  `app/jobs.py` for notes on persisting them if you need that).

## 6. Deploying alongside the frontend

If frontend and backend end up on different origins in production, set
`FRONTEND_ORIGINS` here (comma-separated) to your deployed frontend
URL(s) so CORS allows it, and set `VITE_API_BASE_URL` on the frontend to
this backend's public URL.
