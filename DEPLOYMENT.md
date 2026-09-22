# Deployment - Frontend on Render

## Prerequisites

- The backend is already deployed (see its DEPLOYMENT.md)
- A Firebase Web App is registered in the Firebase Console
- You have the Firebase config values at hand

## 1. Create the Static Site

1. Render Dashboard -> New + -> Static Site
2. Connect the FrontEnd GitHub repo
3. Configure:
   - Build Command: npm install && npm run build
   - Publish Directory: dist
   - Root Directory: (leave blank - this IS the frontend repo root)
4. Click Create Static Site

## 2. Add Environment Variables

Render -> Static Site -> Environment tab. Add all 7:

| Key | Value |
| :--- | :--- |
| VITE_API_BASE_URL | https://setupbuilder-backend.onrender.com (no trailing slash) |
| VITE_FIREBASE_API_KEY | from Firebase Console |
| VITE_FIREBASE_AUTH_DOMAIN | from Firebase Console |
| VITE_FIREBASE_PROJECT_ID | from Firebase Console |
| VITE_FIREBASE_STORAGE_BUCKET | from Firebase Console |
| VITE_FIREBASE_MESSAGING_SENDER_ID | from Firebase Console |
| VITE_FIREBASE_APP_ID | from Firebase Console |

## 3. Force a Rebuild

Critical: Vite bakes env vars into the JS bundle at build time. Adding env
vars is not enough - the site must be rebuilt.

Render -> Static Site -> Deploys tab -> Manual Deploy -> Deploy latest commit.

## 4. Verify

Open the deployed URL. Check DevTools -> Network - API calls should target
https://setupbuilder-backend.onrender.com/api/...

## 5. Register the Frontend URL in Firebase

Firebase Auth blocks sign-ups from unknown origins.

1. Firebase Console -> Authentication -> Settings -> Authorized domains
2. Add domain -> frontend-ponc.onrender.com (no https://)
3. Save

## 6. Allow the Frontend Origin in Backend CORS

Add the deployed frontend URL to the backend's CORS_ALLOWED_ORIGINS env var,
then redeploy the backend.

## SPA Routing

public/_redirects contains:

    /*    /index.html   200

This tells Render to serve index.html for any client-side route, so
/login, /builder, /admin all work on a hard refresh.

## Notes

- No cold starts for static sites on Render - the CDN serves files instantly.
- Cache invalidation is automatic: each deploy gets a fresh build hash.
- Custom domain can be attached from the Static Site -> Settings tab.
