# FitnTry — AI Virtual Try-On

> Don't imagine the outfit. See yourself in it.

A polished frontend for the **YouCam API Skin AI & Apparel VTO Hackathon**,
built around AI-powered virtual clothing try-on. React + TypeScript + Vite +
Tailwind, with a full consumer product flow rather than a bare
upload → call API → show image demo.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`). The app runs
entirely offline out of the box using a built-in mock try-on service, so
there's nothing else to configure to try it.

## Demo flow (~1–2 minutes)

Landing page → **Try It Now** → pick a sample model → choose a garment →
customize (optional) → **Generate Try-On** → processing animation → result
with before/after slider → **Save Look** → **Complete Your Look**.

Sample model photos and a 12-piece garment catalog are included, so a judge
can run the full flow immediately without uploading anything.

## Connecting the real backend

The frontend never talks to YouCam directly and never holds a YouCam API
key — that stays on your backend. The entire contract the UI depends on is
two functions in `src/services/tryOnApi.ts`:

```
POST /api/try-on
  body: { userImage, garmentImage, garmentCategory }
  →     { jobId, status }

GET  /api/try-on/:jobId
  →     { status: "processing" | "completed" | "failed", resultImage?, error? }
```

To switch from the mock to your real backend:

1. Copy `.env.example` to `.env`.
2. Set `VITE_USE_MOCK_API=false`.
3. Optionally set `VITE_API_BASE_URL` if your backend isn't served from the
   same origin under `/api`.

No component code needs to change — `src/services/index.ts` is the single
switch point, and every page/component imports from there, never from the
mock or real client directly.

## Project structure

```
src/
  components/
    layout/     Navbar, Footer, page Layout
    landing/    Hero, How It Works, Featured Looks, Why VTO, Complete Look, Final CTA
    tryon/      Step indicator, upload, garment grid, controls, processing modal
    results/    Before/after slider, recommendation card
    discover/   Discover card + lightbox preview
    saved/      Saved look card
    ui/         Button, Badge, Toast, Alert, EmptyState — shared primitives
  pages/        Home, TryOn, Result, Discover, Saved, About, NotFound
  services/     tryOnApi (real), mockTryOnApi (isolated mock), index (switch + polling)
  hooks/        useTryOnStore — global workflow state via React context
  data/         Sample garments, models, recommendations
  types/        Shared TypeScript types
```

## Notes

- **Images**: placeholder photography comes from Lorem Picsum with
  deterministic seeds (no API key, no attribution requirements). Swap the
  `image` field in `src/data/garments.ts` for real product photography —
  nothing else needs to change.
- **State**: plain React state/context, no external state library — the
  workflow is a single linear flow and didn't need one.
- **Errors**: every failure path (bad file type, oversized file, missing
  photo/garment, network failure, generation failure) shows a plain-language
  message and a retry action; no raw HTTP errors reach the UI.
- **Accessibility**: semantic landmarks, visible focus rings, keyboard
  operable slider and step navigation, alt text throughout, and
  `prefers-reduced-motion` is respected.
