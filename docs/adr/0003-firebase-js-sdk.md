# ADR 0003 - Firebase JS SDK for Authentication

- Status: Accepted
- Date: 2025-09-15
- Deciders: Frontend + backend teams

## Context

The backend verifies Firebase ID tokens. The frontend needs to:

1. Register users with email/password
2. Log users in
3. Keep them logged in across reloads
4. Fetch a fresh ID token for every API request

## Decision

Use the official Firebase JS SDK (firebase npm package) directly in the
React app - no abstraction layer.

## Consequences

Positive:
- One SDK handles everything: registration, login, session persistence, token
  refresh, password reset
- onAuthStateChanged gives a reactive auth state that plugs cleanly into a
  React context
- user.getIdToken() always returns a valid token, refreshing automatically
  when near expiry
- Same SDK handles both web and (later) React Native via the compat entrypoint

Negative:
- Adds ~120 KB to the bundle (tree-shaken)
- Vendor lock-in to Firebase on the frontend as well as the backend

## Implementation Notes

- lib/firebase.js initializes the app and exports auth
- context/AuthContext.jsx subscribes to onAuthStateChanged and exposes
  register, login, logout
- lib/api.js interceptor calls auth.currentUser.getIdToken() on every
  request and attaches it as a Bearer token

## Alternatives Considered

- Custom JWT flow - the backend would need sign-up, sign-in, refresh, and
  reset endpoints; high security surface for a course project
- Supabase Auth - viable, but the backend was already integrated with
  Firebase Admin SDK
