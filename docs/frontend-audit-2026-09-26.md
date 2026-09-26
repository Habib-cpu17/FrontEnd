# Frontend Audit — 2026-09-26

First pass of a design + animation review of the SetupBuilder frontend. This
document records what was investigated, what was changed, what was found **not**
to be a problem, and what is still open.

- **Stack:** Vite 8 + React 19 + Tailwind v3.4 + react-router 7. No animation
  library, no UI kit, no icon library — all motion is CSS, all icons are
  hand-drawn SVG.
- **Scope:** the 6 correctness bugs below. Design/animation improvements were
  explicitly deferred until the bug pass landed.
- **Related ADRs:** 0005 (amended), 0008, 0009, 0010.

## Verification

| Check | Result |
|---|---|
| `npm run build` | passes — `index.html` 2.21 kB, CSS 35.17 kB (gzip 7.85), JS 548.92 kB (gzip 158.55) |
| `npm run lint` | 26 problems (24 errors, 2 warnings) — **identical to the pre-change baseline** (verified by stashing) |
| New lint problems introduced | 0 |

`@property` registrations, the `before:` accent-bar rule, and the UTF-8 em-dashes
in `index.html` were each confirmed present in the built `dist/` output rather
than assumed.

---

## Fixed

### 1. Brand gradients were hardcoded to dark-mode hex — 14 sites

`linear-gradient(135deg, #ff1e79, #8b2ff7)` appeared in `ChatWidget` (×4),
`Navbar`, `ProfilePage` (×2), `BuildDetailPage`, `ComponentsPage`,
`EditProfileModal` (×2), `LandingPage` (×4) and `.search-btn`. Those are the
`.dark` token values, so light mode rendered the dark gradient in all of them.

Replaced with `var(--pink)`/`var(--purple)`; added `--purple-deep` and
`--orange`. Dark mode is unchanged pixel-for-pixel. → **ADR 0010**

### 2. Dark-mode flash on reload (FOUC)

`docs/adr/0005` claimed the flash was "mitigated by applying the class in a
blocking script in index.html". **That script did not exist.** Every dark-mode
user saw a light flash on every hard reload.

Added the blocking script, plus `meta description`, Open Graph tags, a real
`<title>` (was `frontend`), `theme-color` for both schemes, and
`preconnect` to `images.unsplash.com` (the app's primary image host, and
previously un-preconnected).

Also hardened `ThemeContext`: `localStorage.getItem` was unguarded and would
throw — blanking the app — wherever storage is unavailable. → **ADR 0005**

### 3. Theme switch was a broken half-cross-fade

Only `<body>` transitioned. Cards, buttons, inputs and avatar chips set their
own `background`/`border-color` from the same variables and snapped instantly.

Registered all 15 colour tokens via `@property` and moved the transition to
`:root`, so the tokens interpolate and every consumer eases together. Added
`color-scheme` so native scrollbars, caret and form internals match.
→ **ADR 0008**

### 4. Images had zero optimization

No `loading`, `decoding`, `width`/`height` or `srcSet` on any of the 12 `<img>`
tags; the LCP hero had no `fetchPriority`.

Added `decoding="async"` throughout, `fetchPriority="high"` on the hero,
`loading="lazy"` on below-fold images, and `width`/`height` on the fixed-size
avatars. Extracted `unsplash()` / `unsplashSrcSet()` helpers so the carousel
tiles, build cards and CTA image serve 400/700/1200w responsively — previously
every tile fetched a hardcoded `?w=700` regardless of display size.
`CATEGORY_TILES` now stores an Unsplash photo `id` instead of a baked URL.

### 5. Inconsistent container gutters

`Layout` used `px-4 sm:px-6`; the navbar and all 7 landing sections used a flat
`px-6`. Below 640px the logo visibly overhung the content beneath it. All 10
`max-w-7xl` containers now share `px-4 sm:px-6`.

### 6. No mobile navigation at all

All six primary links were in a `hidden md:block` row — Components, Builder,
My Builds, Community, Profile and Admin were unreachable below 768px. Added
`MobileMenu` (trigger + fixed panel), wired into `Navbar` **and** the
separately-duplicated header in `LandingPage`. Escape, Tab trap, focus
restore, scroll lock, `aria-expanded`/`aria-controls`/`aria-modal`, RTL-safe
active indicator, plus "Sign in"/"Log out" which were also `hidden sm:*`.
→ **ADR 0009**

---

## Investigated and dismissed

Two items from the original review turned out **not** to be bugs. Recorded so
they are not re-raised.

### `.bg-stripes` / `.bg-halftone` / `.bg-bars` do not break in dark mode

Initially reported as "hardcode `rgba(255,255,255,...)` so they vanish on
`.dark`". False. All 8 usages are overlays on **saturated coloured panels** —
the pink/purple hero gradient, the purple→cyan panel, the amber panel, the
profile banner, the CTA gradient. White texture on a saturated background is
correct in both themes, because those panel backgrounds are themselves fixed
gradients. No change made; changing them would have made light mode worse.

### Images were not a CLS source

Initially reported as "no `width`/`height` on any image → every one is a CLS
source". Also false. Every `<img>` sits inside either a fixed-height container
(`h-[280px]`, `h-48 sm:h-64`, `w-7 h-7`) or an `aspect-*` box, or is
absolutely positioned and out of flow. Missing `width`/`height` attributes were
therefore cosmetic at best, so the effort went into `srcSet`/`loading` instead,
which are real wins.

---

## Known issues left in place

- **Toast gradients still use literal hex** (`#10b981→#059669`,
  `#ef4444→#dc2626`). Theme-invariant so not a theming bug, but they violate
  ADR 0010. Needs `--success-deep` / `--danger` / `--danger-deep`.
- **26 pre-existing lint problems**, mostly one rule:
  `react-hooks/set-state-in-effect` across 20+ files, nearly all the legitimate
  `setLoading(true)`-then-fetch pattern. A real refactor to derive loading
  state, not a bug fix.
- **`tailwind.config.js` carries a dead palette** — `cream` / `sage` / `olive`
  (a warm-beige/sage direction) have **zero** usages in the codebase.
- **Dead code:** `src/App.css` (184 lines of Vite template, never imported),
  `src/assets/*` (3 unused starter files), `public/icons.svg`, the
  `progress-fill` keyframe and `.animate-floaty-slow` (both unreferenced), and
  a dead `target` variable at `LandingPage.jsx` that needed an
  `eslint-disable` + `void` to compile.
- **A bug introduced and caught during this pass:** `before:bg-pink` compiled
  to nothing, because `.bg-pink` is a hand-written class in `index.css` rather
  than a Tailwind utility, so the `before:` variant had no rule to resolve
  against. The active-route accent bar would have rendered transparent. Switched
  to `before:bg-[color:var(--pink)]` and verified the rule in the built CSS.

---

## Open backlog

Ordered by impact. Tier 1 is the accessibility and correctness work; Tier 2 is
polish; Tier 3 is cleanup.

### Tier 1

1. **Global `prefers-reduced-motion`.** Only 2 of ~12 animations honour it
   (`Reveal`, `Counter`), and both sample `matchMedia` once on mount without
   subscribing to `change`. Unguarded: the infinite `requestAnimationFrame`
   carousel in `LandingPage` — a **live WCAG 2.2.2 violation**, since it pauses
   only on `onMouseEnter`, so keyboard users cannot stop it — plus `floaty`
   (infinite), `hero-in`'s `filter: blur(6px)`, 7 `animate-spin`, 10
   `animate-pulse`. Needs one `@media` block plus a `matchMedia` listener in the
   carousel.
2. **Real page transitions.** `Layout.jsx` uses `key={pathname}` to re-trigger
   `hero-in`. It works, but there is no exit animation (content vanishes) and
   the full `<main>` remounts on every navigation, discarding child state. The
   View Transitions API is the natural fit here — zero dependencies, native, and
   the code is not large enough to justify a library.
3. **Skeleton → content cross-fade.** 7 loading sites hard-swap. Skeleton
   heights also differ from the real cards, so there is a layout jump on top of
   the pop-in. The spinner JSX is copy-pasted 7× and has no shared component.
4. **Modals have no animation and no focus management.** `EditProfileModal` and
   `admin/ComponentsTab` are `div` overlays with no focus trap, no Escape, no
   `aria-modal`, no focus restore and no body scroll lock.

### Tier 2

- **Design tokens:** no radius / shadow / space / z-index / type-scale tokens.
  And the CSS variables are not mapped into `theme.extend.colors`, forcing
  `bg-[color:var(--purple)]/5` arbitrary syntax throughout.
- **`transition-all`** on ~10 sites (including `.card`) animates every property,
  including `box-shadow`. Replace with explicit property lists.
- **Micro-interactions:** no `:active` press feedback; no `focus-visible`
  styling on buttons/links (UA default only); nav active state is colour-only
  with no `aria-current`; no sliding active indicator.
- **Hover-only affordances** — `.card:hover` lift, `group-hover:scale-105`,
  carousel pause — are not wrapped in `@media (hover: hover)`, so they stick on
  touch devices.
- **Chat typing dots** use `animate-pulse` (a brightness fade) with
  `animationDelay`; this reads as flicker rather than a wave. Wants a real
  bounce keyframe.
- **Hero** applies one `hero-in` to the whole section; staggered children would
  read better. `filter: blur()` is compositor-hostile and a known migraine
  trigger.
- **Toast** has an entrance but no exit, and no `aria-live` — every success and
  error is silent to screen readers.
- **Perf:** `Navbar` calls `setScrolled` on every scroll frame (unthrottled);
  `Counter` calls `setVal` every frame for 1.4s; no `will-change`/`contain` on
  the carousel or chat panel.
- **Code splitting:** all 11 pages are statically imported, so the landing page
  ships admin + builder + profile. `React.lazy` would cut the 548 kB bundle.
- **A11y:** zero uses of `role=`, `aria-live`, `aria-expanded`, `aria-current`,
  `aria-modal`, `aria-hidden`, `aria-controls`. No `<nav>` landmarks, no skip
  link, `LandingPage` has no `<main>` (it bypasses `Layout`).

### Tier 3

- Delete `src/App.css`, `src/assets/*`, `public/icons.svg`, and the dead
  `progress-fill` / `.animate-floaty-slow` rules.
- Remove the dead `target` variable in `LandingPage` and the three leftover
  `// NEW:` code-review comments in `Reveal.jsx`.
- Make `Reveal`'s `IntersectionObserver` shared rather than one instance per
  component (~30 per page).
- Refactor the duplicated `LandingPage` header onto `Navbar` (now that the nav
  itself is shared, the remaining drift is brand text, the CTA cluster and the
  scroll behaviour).
- Consider extracting a shared `<Spinner>` / `<Skeleton>`.

---

## Open decisions

Two questions that gate the Tier 2 polish work. Both are aesthetic, not
correctness, so they were left unanswered rather than guessed.

1. **Motion direction.** The app currently applies one 0.8s rise-and-fade on
   scroll, everywhere. Do we want to *deepen* it (staggered groups,
   shared-element transitions, spring physics — which would justify a library
   like `motion`) or *tighten* it (faster, subtler, premium-tool feel)? These
   are opposite directions and lead to very different implementations.
2. **Visual direction.** The angular neo-brutalist language
   (`button { border-radius: 0 !important }`, the clip-path search bar, the
   halftone textures) is distinctive and clearly intentional. Lean in and sharpen
   it, or soften it? The dead `cream`/`sage`/`olive` palette in
   `tailwind.config.js` suggests the visual direction has already shifted once.
