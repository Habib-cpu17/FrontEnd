# ADR 0002 - Tailwind CSS v3 (not v4)

- Status: Accepted
- Date: 2025-09-15
- Deciders: Frontend team

## Context

Tailwind CSS v4 was released mid-2025 and is a significant rewrite:

- ESM-only
- Requires @tailwindcss/postcss (the old tailwindcss package no longer
  ships a PostCSS plugin)
- Uses @import "tailwindcss" instead of the three @tailwind directives
- Content path autodetection replaces the explicit content config

The team tried v4 first and hit persistent resolution errors on Windows with
Vite (Package path . is exported from package tailwindcss, but no valid target
file was found). This blocked development for hours across multiple sessions.

## Decision

Use Tailwind CSS v3.4.17 with the classic PostCSS setup.

## Consequences

Positive:
- Stable, widely documented setup
- Works out of the box with Vite + PostCSS
- tailwind.config.js gives explicit content paths
- All utilities used in the design system are available in v3
- No ESM/bundler resolution surprises on Windows

Negative:
- Missing v4-only features (faster engine, new @theme API)
- Will need migration eventually

## Alternatives Considered

- Keep fighting v4 - no
- Ditch Tailwind, use vanilla CSS or styled-components - huge redesign cost;
  Tailwind classes were already embedded across ~30 components
