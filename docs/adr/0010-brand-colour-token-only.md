# ADR 0010 - Brand Colour Is Token-Only, Never a Literal

- Status: Accepted
- Date: 2026-09-26
- Deciders: Frontend team

## Context

Fourteen call sites hardcoded the brand gradient as a raw hex string:

```jsx
style={{ background: "linear-gradient(135deg, #ff1e79, #8b2ff7)" }}
```

`#ff1e79` and `#8b2ff7` are the **`.dark`** values of `--pink` and `--purple`.
Light mode declares `--pink: #e91e79` and `--purple: #7a2ff7`. So light mode
was rendering the dark-mode gradient in every one of those fourteen places —
avatars, chat bubbles, the community build card, the profile banner and avatar,
the admin components-tab placeholder, and the navbar avatar chip. Only
`.btn-primary` and `.gradient-brand` in `index.css` did it correctly.

Three root causes, in order of importance:

1. The CSS custom properties were never mapped into `tailwind.config.js`. There
   was therefore no ergonomic token path in a `className`, so every themed
   element resorts to arbitrary-value syntax like
   `bg-[color:var(--purple)]/5` and `text-[color:var(--pink)]`.
2. Inline `style={{}}` objects are the one place arbitrary values do not feel
   awkward — there is no utility-class alternative for a computed gradient, so
   the literal sat there unchallenged.
3. Dark mode was tuned last and the literals were copied from the dark
   screenshots, then never re-checked against light.

## Decision

Brand colour in components is composed **only** from custom properties. No
literal brand hex in any `.jsx` file. `linear-gradient(...)` in a `style`
attribute must read `var(--pink)` / `var(--purple)` / `var(--purple-deep)` /
`var(--orange)`.

Two tokens were added because literals had been standing in for them:
`--purple-deep` (`#5b21b6`, the third stop of the hero and profile-banner
gradients) and `--orange` (`#ff8f00`, the second stop of the amber panel).
`--cyan` and `--yellow` already existed and now serve the purple→cyan and
amber panels that previously hardcoded them.

Light and dark values were chosen so **dark mode renders exactly as it did
before** (`#ff1e79`/`#8b2ff7` are preserved verbatim); only light mode changes,
to the values its tokens already declared.

## Consequences

Positive:

- Light mode finally gets the palette it was designed around
- One source of truth; adding a theme is a token edit
- Fourteen duplicated literals collapse into the token block

Negative:

- **Known leak, deliberately not fixed here:** `ToastContext.jsx` still uses
  literal success/danger gradients (`#10b981→#059669`, `#ef4444→#dc2626`).
  These are theme-invariant, so they are not a theming bug, but they violate
  this ADR. They need `--success-deep` / `--danger` / `--danger-deep`, which
  felt like scope creep for a bug-fix pass. Tracked in the audit backlog.
- The root cause (vars not in the Tailwind theme) is **not** fixed by this ADR,
  so `bg-[color:var(--purple)]/5` noise persists. Mapping the variables into
  `theme.extend.colors` would fix it, but it changes generated class names
  across the whole app and belongs in its own change with visual review.
- Gradients are now unthemeable *individually* — a panel that genuinely needs
  to differ between themes has to reintroduce a literal, which this ADR
  forbids. `--purple-deep` is deliberately the same in both themes today, and
  that is a choice, not an oversight.

## Implementation

```css
:root {
  --pink: #e91e79;
  --purple: #7a2ff7;
  --purple-deep: #5b21b6;
  --orange: #ff8f00;
}
.dark {
  --pink: #ff1e79;
  --purple: #8b2ff7;
  --purple-deep: #5b21b6;  /* unchanged: preserves current dark rendering */
  --orange: #ff8f00;
}
```

```jsx
// before
style={{ background: "linear-gradient(135deg, #ff1e79, #8b2ff7)" }}
// after
style={{ background: "linear-gradient(135deg, var(--pink), var(--purple))" }}
```

`.search-btn` in `index.css` previously hardcoded `#ff1e79→#e91e79` (a
light-pink-to-base-pink gradient that was really an accident of the two
palettes). It now reads `var(--pink)` mixed 78% with `var(--purple)`, which
expresses the same intent and themes correctly.

## Alternatives Considered

- Map the variables into `tailwind.config.js` `theme.extend.colors` so
  `bg-pink/5` works as a real utility — the right long-term fix, but it
  regenerates class names app-wide. Tracked separately
- Store the whole gradient as a token (`--gradient-brand`) — fewer call sites,
  but it cannot express the four distinct multi-stop gradients in use, and it
  hides the colour stops from anyone reading the JSX
- A lint rule banning hex literals in JSX — attractive, not added because the
  codebase still has legitimate fixed-colour usage (white text on saturated
  panels, the dark text stroke on the yellow hero highlight). A blanket ban
  would need an allowlist either way
