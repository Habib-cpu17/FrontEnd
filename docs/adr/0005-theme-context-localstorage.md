# ADR 0005 - Theme State in Context + localStorage

- Status: Accepted
- Date: 2025-10-20
- Deciders: Frontend team

## Context

The app supports dark and light themes with a toggle in the navbar. The
selected theme must:

- Apply instantly across the whole app
- Persist across page reloads
- Work on every page (not just where the toggle is)

## Decision

Store theme state in a React Context (ThemeContext), persist to
localStorage, and toggle a dark class on <html>.

## Consequences

Positive:
- Single source of truth - any component can call useTheme()
- Persists across reloads without server round-trips
- Uses Tailwind's darkMode: 'class' strategy - no flicker after initial render
- On first visit, respects the user's OS preference via
  window.matchMedia('(prefers-color-scheme: dark)')

Negative:
- Brief flash of light theme on reload if the JS hasn't executed yet (mitigated
  by applying the class in a blocking script in index.html)
- Requires every themed element to use CSS variables or dark: variants

## Implementation

    const [theme, setTheme] = useState(() =>
      localStorage.getItem("theme") ?? "light"
    );

    useEffect(() => {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }, [theme]);

## Alternatives Considered

- next-themes - designed for Next.js
- CSS-only media queries - no user override; always follows OS
- Server-stored preference - overkill; no per-account theming needed

## Amendment (2026-09-26)

This ADR's recorded mitigation for the light-theme flash **was never actually
implemented**. The "blocking script in index.html" it refers to did not exist in
`index.html`, so every dark-mode user saw a light flash on hard reload. The
script is now present and this ADR's claim is accurate.

Two further corrections, both from the same audit pass:

- The `Implementation` snippet above is out of date. `ThemeContext` now reads
  `localStorage` and `matchMedia` inside a `try/catch` — the unguarded
  `localStorage.getItem` would throw and blank the app wherever storage is
  unavailable (blocked cookies, some private-mode setups). The first-visit
  fallback is the OS preference, not a hardcoded `"light"`.
- `ThemeContext` now also rewrites every `<meta name="theme-color">` `content`
  on change. Those tags are scoped with `media="(prefers-color-scheme: ...)"`,
  so they follow the OS and go stale the instant a user overrides the theme
  with the toggle.

The `Consequences` note about surfaces snapping during a theme switch is a
separate, still-open problem, addressed in ADR 0008.
