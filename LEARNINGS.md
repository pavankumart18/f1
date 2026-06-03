# 📚 LEARNINGS — Building "The Pit Wall"

A field guide to everything this project teaches — the **technical craft**, the
**thinking/architecture**, and the **product instincts**. Written so you (or the
next dev) can internalise *why* things are the way they are, not just *what* they are.

> Live: https://f1-rose.vercel.app · Stack: Next.js 16 (App Router) · React 19 · Tailwind v4 · Vercel

---

## 1. The big picture — what we actually built

An **editorial Formula 1 dashboard**: a digital broadsheet that fuses print-design
calm with live data and cinematic motion. Live timing, standings, the full
calendar, circuit histories, a complete 1950→2026 stats archive, per-driver
dossiers (milestones + auto-detected setbacks), rivalry comparisons, a personalised
favourite-driver experience, shareable social cards, and a lights-out + driver-parade
intro set to music.

**The one-line takeaway:** *taste + honest data + restraint with motion beats a
feature dump.* The app feels premium because the design has a point of view, the
numbers are real, and the animations serve the content.

---

## 2. Technical learnings

### 2.1 Next.js App Router: the server/client boundary is the whole game
- **Default to Server Components.** All data fetching, the archive aggregation, OG
  images, and most pages are server-rendered. Only things that need browser state
  are `"use client"`: theme toggle, music, countdown, carousel, favourite, intro,
  highlighter.
- **A client component can't import a server-only module transitively.** `lib/f1/archive.ts`
  uses `node:fs`; anything importing it must stay server-side. We kept `api.ts`/`archive.ts`
  out of every `"use client"` file. *If a client file imports an fs module, the build breaks.*
- **Pass data down as props** from server → client (e.g., the grid/standings into the
  carousel, favourite card, intro). The client never re-fetches what the server already has.
- **`params`/`searchParams` are async** in Next 15/16 — always `await params`.

### 2.2 Caching is a three-layer cake
1. **ISR / `export const revalidate`** — pages regenerate on a timer (10m for the
   dashboard, 1h for analysis, 1d for the archive). F1 data barely changes between
   sessions, so cache hard.
2. **`fetch(..., { next: { revalidate } })`** — per-request HTTP caching, tuned per
   endpoint (standings 30m, next-race 10m, archive 6h+).
3. **Module-level memo** (`let cache = …` in `archive.ts`) — the heavy archive crunch
   runs **once per server process**. *Gotcha:* in dev this means you must restart the
   server to see a freshly-rebuilt archive. In prod it's perfect (data is static).
- **Vercel `outputFileTracingIncludes`** ships the local `data/**` archive with the
  serverless functions so `/records` and `/analysis` work after deploy.

### 2.3 Working with public, rate-limited APIs
- **Jolpica-F1** (Ergast successor) caps bulk pulls (~500/hr). The history dump
  (`scripts/fetch-archive.mjs`) is therefore **polite, backed-off, and resumable**:
  it sleeps between calls, honours `Retry-After`/exponential backoff on 429, and
  **skips files it already has** so you can just re-run it to fill gaps.
- **Fetch at the season level with pagination**, not race-by-race — ~400 requests
  for the entire 1950→2026 archive instead of thousands.
- **OpenF1** (live timing) returns huge time-series. Lesson: **don't fetch 4MB you
  don't need** — we window `intervals` to the last few minutes and cache 8s. Also:
  payloads >2MB silently fail Next's fetch cache, which is a real footgun.
- **Always degrade gracefully**: every external call is wrapped so one failure
  renders an empty state, never a 500.

### 2.4 Tailwind v4 + CSS variables = effortless theming
- Two skins (**Broadsheet** / **Carbon**) are pure CSS-variable swaps under a
  `.dark` class (`@custom-variant dark`).
- **Livery theming is the same trick at component scope:** set `--accent` inline on a
  page wrapper (`style={{ "--accent": teamColor }}`) and the *entire* page recolours,
  because every component uses `var(--accent)` / `text-accent`. One line, huge effect.

### 2.5 Hydration mismatches are about *determinism*
- The odometer bug: `Date.now()` ran during SSR **and** hydration, producing
  different digit positions → mismatch. **Fix:** render a stable value (`0`) on the
  server and first client render, then fill in real data inside `useEffect`. Bonus:
  it gives a satisfying "roll-up" on load. *Rule: never render time/random/locale
  output during the first paint.*

### 2.6 `next/og` (Satori) is strict
- Satori renders a **subset of CSS via flexbox only**. Every `<div>` with **more than
  one child must declare `display: flex`** or it throws. Single-text-child divs are
  fine. We learned this the hard way debugging the driver card.
- It fetches remote `<img>` at render time — great for pulling Wikipedia photos into
  social cards. File-convention `opengraph-image.tsx` auto-wires the meta tags.

### 2.7 Images: sourcing, legality, and clarity
- **No F1 API exposes car photos / engine / parts data.** Be honest about it. We use:
  - **Wikipedia REST** for driver photos (CC-licensed) — request a **640px** thumb,
    not the default 330px, for retina clarity.
  - **OpenF1 headshots** (`media.formula1.com`) — the default `1col` transform is tiny
    (11KB); bump to `3col-retina`/`4col` for crisp results (`headshotRes()` helper).
  - **`f1-circuits` GeoJSON** for real track outlines (drawn as SVG paths).
- **`next/image` needs `remotePatterns`** allow-listed per host; use `quality` + correct
  `sizes` for sharpness; it optimises/caches remote images automatically.
- **Guarantee a visible result:** preload intro images, render an acronym/colour block
  *behind* each photo, and `onError`-hide broken images so something always shows.

### 2.8 Hand-rolled SVG > chart libraries (here)
- Line/bar/multi-line charts are ~40 lines of SVG each. No dependency, perfectly
  on-brand, server-renderable, responsive via `viewBox`. Reach for a library only
  when you need interactivity you can't cheaply hand-roll.

### 2.9 Motion: a timeline state machine + restraint
- The cinematic intro is a `phase` state machine (`gate→lights→race→parade→title`)
  driven by `setTimeout`/`setInterval` in effects, with CSS `@keyframes` doing the
  heavy lifting. Audio autoplay is unlocked by the user's "Start" click (browsers
  block sound without a gesture).
- **Always honour `prefers-reduced-motion`** — every animation has an off-switch.

### 2.10 Personalisation without a backend
- Favourite driver lives in `localStorage`. A tiny custom event (`pitwall-fav-change`)
  syncs components; a `FavouriteHighlighter` tags rows with `data-driver` and styles
  the match **app-wide** without threading props everywhere. Cheap, powerful pattern.

---

## 3. Thinking & architecture learnings

- **Derive narrative from raw data.** The dossier's "setbacks & comebacks" (win
  droughts, reliability lows, championship leaps) are *computed* from results — no
  editorial writing, yet it reads like a story. Aggregation is a feature.
- **Honesty is a design constraint.** When the data doesn't exist (engine internals)
  or you can't legally host it (songs), say so and find the legitimate adjacent thing
  (stylised livery cars; YouTube embeds; CC photos). Users trust an app that doesn't fake it.
- **Separate "what changes" from "what doesn't."** Static history → dump once, cache
  forever. Live session → poll. Designing around data volatility drives the whole caching strategy.
- **Ship in thin vertical slices.** Every round: build → typecheck → run → deploy →
  verify on prod. Small, reversible steps; the app was always in a working state.
- **A point of view scales.** "Editorial broadsheet" made hundreds of micro-decisions
  (type, colour, spacing, motion) easy and consistent.

---

## 4. Product / UX learnings (the F1-fan lens)

- **Fans fall for the *intro*** — driver-by-driver reveals, liveries, the start lights.
  Emotion first, then data. That's why the cinematic landing matters more than any chart.
- **Make it personal.** "Your driver" on the dashboard + highlighted everywhere turns
  a data site into *my* data site.
- **Wow ≠ clutter.** Restrained motion on a calm canvas reads as premium; the same
  motion on a busy page reads as noise.
- **Mobile is where fans actually are** (often mid-session) — the next frontier is a
  truly live, mobile-first race mode.

---

## 5. Bugs we hit (and the lesson in each)

| Bug | Root cause | Lesson |
|---|---|---|
| Driver titles showed **0** | Jolpica now requires `season` on the per-driver standings endpoint → silent 400 | Don't trust a single endpoint; verify with real responses; have an archive fallback |
| Odometer **hydration mismatch** | `Date.now()` during SSR | First paint must be deterministic |
| OG image **500** | Satori div with >1 child lacked `display:flex` | Know your renderer's constraints |
| OpenF1 **429 / 4MB** | Over-fetching time-series | Window + cache; payloads >2MB break fetch cache |
| `/records` stale in dev | Module-level cache persists per process | Restart dev after a data rebuild |
| Blurry faces | OpenF1 `1col` / Wikipedia 330px defaults | Always request a resolution that beats display × DPR |

---

## 6. Stack & file map

- **Framework:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, deployed on Vercel.
- **Data:** Jolpica-F1 (history/standings), OpenF1 (live timing + headshots), Wikipedia
  (photos), f1-circuits GeoJSON (track maps).
- **Key files:**
  - `lib/f1/api.ts` — live Jolpica client (typed, cached)
  - `lib/f1/archive.ts` — fs-backed archive: records, dossiers, circuits, progression
  - `lib/f1/openf1.ts` — live timing + driver grid/headshots
  - `lib/f1/{teams,flags,songs,circuits,wiki}.ts` — domain helpers
  - `scripts/fetch-archive.mjs` — resumable history dump → `data/`
  - `components/*` — design system, charts (hand-rolled SVG), car SVG, intro, music, etc.
  - `app/*` — routes (dashboard, live, standings, records, analysis, circuits, archive, compare, driver/constructor/race, OG images)

---

## 7. If you keep going

1. **Live race mode** — during a session, the favourite card + `/live` go real-time
   (position pulses, gaps animate, tyre wear). *The killer feature.*
2. **Lap-time & stint charts** (OpenF1 / FastF1).
3. **Race-weekend narrative card** — auto-written summary on the homepage.
4. **Predictions game** — pick the podium, score after.
5. **Mobile-first polish** — sticky bottom-tab nav, swipe, pull-to-refresh.

*The throughline for all of it: real data, honest about limits, premium by restraint.*
