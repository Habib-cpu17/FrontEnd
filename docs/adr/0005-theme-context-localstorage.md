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
