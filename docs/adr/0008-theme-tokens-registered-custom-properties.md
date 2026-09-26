# ADR 0008 - Theme Tokens as Registered `@property` Custom Properties

- Status: Accepted
- Date: 2026-09-26
- Deciders: Frontend team

## Context

Toggling the theme was visibly broken. `index.css` had:

```css
body {
  background: var(--bg);
  color: var(--text);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

Only `<body>` eased. Every other themed element sets `background`,
`background-color` or `border-color` from the same variables **on itself** —
`.card`, `.btn-secondary`, `.search-input-wrap`, `.add-btn`, avatar chips, and
every form input. Those elements had no transition at all, so on a theme switch
the page background faded over 300ms while the cards, buttons and inputs snapped
instantly. The result was a half-finished cross-fade that read as a glitch.

The root cause is that an unregistered CSS custom property is a token
substitution, not an animatable value. `--bg` changing from `#f7f4fb` to
`#0d0520` is a discrete flip for every element that references it.

## Decision

Register all 15 colour tokens with `@property` so the browser can interpolate
them, and declare the transition once on `:root`. Because the tokens inherit,
interpolating them on the root element cross-fades every consumer in the tree
simultaneously — one declaration instead of a transition on every component.

Also set `color-scheme` on `:root`/`.dark` so native UI (scrollbars, text
caret, selection, form control internals) matches the theme.

Two tokens were added to close gaps that literal gradients had been covering:
`--purple-deep` (third gradient stop) and `--orange` (amber panel's second
stop). See ADR 0010.

## Consequences

Positive:

- Theme switching is a single coherent cross-fade; no per-component work
- `color-scheme` fixes native scrollbars, caret and form internals, which
  previously stayed light in dark mode
- One transition declaration; adding a token is a two-line change
  (`@property` + the `:root` transition list)
- Dark mode is now pixel-identical to before — the token values are unchanged,
  only the interpolation is new

Negative:

- The `:root` transition list must be kept in sync with the `@property` block
  by hand; a token added to one and not the other fails open (snaps) rather
  than erroring
- `@property` requires Chrome 85+, Safari 16.4+, Firefox 128+. On older engines
  the registration is ignored and the theme still switches correctly, just
  without the cross-fade — an acceptable silent degradation
- 15 `@property` rules add ~1KB to the critical CSS path
- Animating inherited custom properties repaints the subtree each frame. This
  is bounded to 300ms and user-initiated, so it is not a scroll-path cost, but
  it is more work than transitioning two properties on `body`

## Implementation

```css
@property --bg { syntax: "<color>"; inherits: true; initial-value: #f7f4fb; }
/* ...one per colour token... */

:root {
  color-scheme: light;
  --bg: #f7f4fb;
  /* ...token values... */
  transition: --bg 0.3s ease, --bg-2 0.3s ease, /* ...one per token... */;
}

.dark {
  color-scheme: dark;
  /* ...dark token values, no transition needed... */
}
```

Note that `.dark` deliberately does **not** repeat the `transition` property —
it is the same element (`:root` is `<html>`), so the declaration carries over.

## Alternatives Considered

- `.theme-anim *, .theme-anim *::before { transition: background-color ... }` —
  a temporary class toggled for 300ms around the switch. Rejected: matches every
  element in the tree including ones with no themed properties, and
  `!important` is needed to beat component-level transitions
- Move the transition onto `.card`/`.btn-*`/inputs individually — rejected as
  whack-a-mole; the next component added would silently skip it
- View Transitions API snapshot of the whole page — rejected here because the
  snapshot is a discrete cross-fade of pixels, not a live interpolation; it
  cannot express "every surface eases together". It remains the right tool for
  **route** transitions (see the open backlog in the 2026-09-26 audit)
- No transition at all — rejected, the snap is jarring
