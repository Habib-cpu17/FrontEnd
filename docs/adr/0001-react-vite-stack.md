# ADR 0001 - React 19 + Vite over CRA and Next.js

- Status: Accepted
- Date: 2025-09-14
- Deciders: Frontend team

## Context

We needed to choose a React-based stack for a single-page application that
consumes an existing REST API. The main candidates:

- Create React App (CRA) - the old default
- Next.js - full-stack React framework with SSR/SSG
- Vite + React - modern build tool, SPA-first

## Decision

Use Vite + React 19. Keep the app as a pure SPA - no SSR.

## Consequences

Positive:
- Sub-second HMR - every save refreshes the browser instantly
- Minimal config - one vite.config.mjs file, no hidden abstractions
- Fast cold start (~300ms) and fast production builds
- Small, focused bundle thanks to Vite's rollup-based tree-shaking
- Works well with plain REST APIs - no framework-specific data layer

Negative:
- No built-in SSR - irrelevant here because the backend is a separate API
- No file-based routing - we use React Router explicitly

## Alternatives Considered

- CRA - deprecated and unmaintained since 2022
- Next.js - SSR/SSG features would be unused. Adds complexity (server
  components, edge functions) that doesn't fit a client-only SPA on Render.
