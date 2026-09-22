# ADR 0006 - SPA Rewrite via _redirects on Render

- Status: Accepted
- Date: 2025-10-27
- Deciders: Frontend team

## Context

React Router handles routing on the client. When a user:

- Opens https://frontend-ponc.onrender.com/builder
- Or refreshes the page from that route

The browser requests /builder from the server. Render's static hosting looks
for a file named builder on disk, doesn't find one, and returns a 404 "Not
found" page instead of letting React Router render the correct view.

The same applies to /login, /profile, /admin, and every other client-side
route.

## Decision

Add a public/_redirects file to the frontend:

    /*    /index.html   200

- /* matches every path
- /index.html is the SPA shell
- 200 is a rewrite (not a redirect - URL stays unchanged)

## Consequences

Positive:
- Every route works on hard refresh, from any device
- Direct link sharing works (e.g., sharing /builds/42 with a friend)
- No backend changes required

Negative:
- /api/... routes are also rewritten if accidentally hit from the frontend
  origin - but the frontend never calls those paths (it uses VITE_API_BASE_URL)

## Alternatives Considered

- Hash-based routing (#/builder) - ugly URLs, breaks deep linking habits
- Rendering <NotFound> on all unknown routes - user still sees a broken
  path if they refresh
- Static file for every route - impossible for dynamic routes like
  /builds/:id
