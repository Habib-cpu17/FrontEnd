# ADR 0009 - Mobile Navigation Drawer

- Status: Accepted
- Date: 2026-09-26
- Deciders: Frontend team

## Context

Every primary navigation link lived inside a `hidden md:block` row. Below the
768px `md` breakpoint there was **no route to any of them** — on a 375px phone
a user could see the logo, the language toggle, the theme toggle and "Get
Started", and nothing else. Components, Builder, My Builds, Community, Profile
and Admin were all unreachable. There was no hamburger, drawer, overflow menu or
bottom bar anywhere in the codebase.

Two details made this more than a single missing button:

1. `LandingPage` renders its **own** `<header>` instead of reusing `Navbar`, so
   any fix had to land in two places that had already drifted apart.
2. The `md:hidden` toggle has to coexist with an existing design constraint:
   `index.css` forces `button { border-radius: 0 !important }`, so a rounded
   Material-style sheet would have fought the established angular language.

## Decision

Build one reusable, dependency-free component — `src/components/MobileMenu.jsx`
— exporting both the trigger and the panel, and wire it into both headers.

- **Trigger** (`MobileMenuButton`): `md:hidden`, sits in the header's right
  cluster. Swaps hamburger/X via a keyed remount so the `icon-swap` animation
  re-runs on every toggle.
- **Panel** (`MobileMenu`): `position: fixed` directly below the header
  (`top-16`, which is exact because the desktop link row is `md:block` and the
  header is therefore 64px tall on mobile). A `fixed` overlay is used rather
  than an in-flow dropdown so opening the menu does not reflow the page.
- Full keyboard/AT contract: `aria-expanded` + `aria-controls` on the trigger,
  `role="dialog"` + `aria-modal` + `aria-label` on the panel, Escape to close,
  Tab trapped inside the panel, focus moved in on open and restored to the
  trigger on close, body scroll locked while open, click-outside to dismiss.
- Active route indicated by a 3px `var(--pink)` bar plus a background change —
  colour alone is not sufficient. Uses logical properties (`before:start-0`) so
  the bar mirrors correctly under RTL.
- Navbar also moved its "Sign in" / "Log out" action into the panel, since both
  were `hidden sm:*` and therefore also unreachable on the smallest phones.

Route-change handling uses React's documented adjust-state-during-render
pattern rather than a `useEffect`, which would leave the panel open for one
frame on the new route (and trips `react-hooks/set-state-in-effect`).

## Consequences

Positive:

- All primary routes are reachable at every viewport
- One implementation, not two — the Navbar/LandingPage header drift cannot recur
  for the nav itself
- Matches the existing hand-rolled Context and hand-drawn SVG conventions; no
  new dependency
- Entrance animation is pure CSS, consistent with the rest of the motion system

Negative:

- `top-16` couples the panel to the header's height. Changing `h-16` on the
  header silently misaligns the panel — there is no shared token for this yet
- The panel is rendered inline rather than through a portal. It works because
  no ancestor between the header and `<body>` creates a containing block, but
  adding `transform`/`filter`/`backdrop-filter` to a page-level wrapper would
  break `position: fixed` and trap the panel
- Entrance animation only; no exit animation (the panel unmounts immediately
  on close). Acceptable for a fast dropdown, not for a full-screen sheet
- The panel's own scroll lock means a very short landscape viewport on a phone
  could feel cramped; `max-h-[calc(100dvh-4rem)]` plus `overscroll-contain`
  keeps it scrollable

## Implementation

```jsx
// src/components/Navbar.jsx
const [menuOpen, setMenuOpen] = useState(false);
const [lastPath, setLastPath] = useState(location.pathname);

// Close on navigation, without the extra frame an effect would leave.
if (lastPath !== location.pathname) {
  setLastPath(location.pathname);
  setMenuOpen(false);
}

const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);
const closeMenu = useCallback(() => setMenuOpen(false), []);

<MobileMenuButton open={menuOpen} onToggle={toggleMenu} controls="mobile-menu" />
<MobileMenu open={menuOpen} onClose={closeMenu} links={links}>{/* auth actions */}</MobileMenu>
```

New i18n keys, both languages: `nav.menu`, `nav.openMenu`, `nav.closeMenu`.

New motion tokens in `index.css`: `overlay-in`, `menu-in`, `icon-swap`.

## Alternatives Considered

- Make the existing nav row horizontally scrollable — rejected: six links in a
  scroll strip is a poor mobile pattern and hides the overflow affordance
- A separate `/menu` route — rejected: adds a navigation hop for something the
  platform convention expects to be in-place, and deep-links poorly
- `react-drawer` / Headless UI `Dialog` / Radix — rejected: ~10-15KB for
  behaviour that is ~60 lines here, and the project has consistently
  hand-rolled UI so far (see ADR 0001, 0007)
- A bottom tab bar — attractive for a 4-item subset, but it cannot hold Admin
  or Profile without becoming a "more" menu, and it would fight the existing
  sticky header
