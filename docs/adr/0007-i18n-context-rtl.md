# ADR 0007 - i18n in a React Context with RTL Support

- Status: Accepted
- Date: 2026-09-23
- Deciders: Frontend team

## Context

SetupBuilder targets the Saudi market but the UI was English-only. We need
Arabic (RTL) support with a one-click language toggle. The chosen approach
must:

- Switch all text instantly app-wide
- Flip the layout direction (RTL/LTR) automatically
- Persist the choice across reloads
- Fall back to English for anything untranslated

## Decision

Build a lightweight custom i18n layer instead of pulling in a library:

- `src/lib/i18n.js` - flat key -> string dictionaries merged from the
  `src/locales/*.js` namespace files (en + ar), plus a `translate()`,
  `formatNumber()` (western digits) and `formatDate()` helper
- `src/context/LanguageContext.jsx` - holds `lang`, exposes a reactive
  `t()`, `n()`, `d()`; flips `document.documentElement.lang` / `dir`
  and persists to localStorage key `lang`
- `src/components/LanguageToggle.jsx` - navbar button next to ThemeToggle
- Tajawal Google Font for Arabic + `html[lang="ar"]` font rules in
  index.css
- Logical Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`,
  `end-*`, `text-start`/`text-end`) in place of physical ones where the
  layout must mirror under RTL

## Consequences

Positive:
- Zero new dependencies; matches the existing homegrown Context pattern
  (ThemeContext, ToastContext)
- `t()` falls back to English then to the raw key - safe partial migration
- One namespace file per feature keeps translation work parallelizable
- Browser language is auto-detected on first visit (ar starts in Arabic)

Negative:
- No pluralization/interpolation engine - handled manually with sentinel
  `{param}` substitution and `_one`/`_other` key pairs
- Arabic typography for short/uppercase-styled labels (`uppercase`,
  `tracking-widest`) does not render letter-spacing; acceptable cosmetic
  difference
- AI chat / Gemini replies remain English until the backend is taught to
  respond in the requested language (out of scope for this ADR)

## Implementation

    // src/lib/i18n.js
    const en = Object.assign({}, ...namespaces.map((ns) => ns.en));
    const ar = Object.assign({}, ...namespaces.map((ns) => ns.ar));

    export function translate(lang, key, params) {
      const str = (lang === "ar" ? ar : en)[key] ?? en[key] ?? key;
      return params
        ? str.split(/(\{[^}]+\})/).map((p) =>
            params[p.slice(1, -1)] ?? p).join("")
        : str;
    }

    // src/context/LanguageContext.jsx
    useEffect(() => {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      localStorage.setItem("lang", lang);
    }, [lang]);

## Alternatives Considered

- react-i18next - more powerful but heavier; no current need for
  plural rules/interpolated components
- Server-side / backend-driven localization - no: translations are baked
  into the static build
- Keeping one monolithic dictionary - rejected in favor of per-feature
  namespace files to avoid merge conflicts during parallel work