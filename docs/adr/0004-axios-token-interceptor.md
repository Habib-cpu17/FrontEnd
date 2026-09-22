# ADR 0004 - Axios with Token Interceptor

- Status: Accepted
- Date: 2025-09-16
- Deciders: Frontend team

## Context

The backend requires a Authorization: Bearer <firebase-id-token> header on
every protected request. Adding the header manually to every call is error-prone
and forgettable - especially as the token needs refreshing.

## Decision

Use a single Axios instance (src/lib/api.js) with a request interceptor
that attaches the token automatically.

## Consequences

Positive:
- Every protected call works without thinking about tokens
- One place to change auth behavior
- The interceptor can also handle token refresh (Firebase does it automatically)
- Response interceptor normalizes error messages for cleaner UI

Negative:
- Every request goes through an await for the token - a few ms of overhead
- Debugging requires remembering the interceptor runs

## Implementation

    api.interceptors.request.use(async (config) => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    api.interceptors.response.use(
      (res) => res,
      (err) => Promise.reject(new Error(err.response?.data?.message || err.message))
    );

## Alternatives Considered

- fetch with a wrapper function - same idea, but requires rewriting every
  service file
- react-query - heavy for a project of this size; Axios is enough
