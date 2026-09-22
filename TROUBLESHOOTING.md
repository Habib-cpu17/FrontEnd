# Troubleshooting

Every error hit during frontend development and how it was fixed.

## Startup / Build Errors

### White screen with Firebase: Error (auth/invalid-api-key)

Cause: .env.local missing, misnamed, or with wrong contents.
Fix:
1. Confirm the file exists at FrontEnd/.env.local (not .env.local.txt)
2. Confirm every variable starts with VITE_
3. Confirm values are unquoted and have no spaces around =
4. Restart Vite (Ctrl+C -> npm run dev) - env vars load only at startup
5. Hard refresh the browser (Ctrl+Shift+R)

### import.meta.env.VITE_FIREBASE_API_KEY returns undefined

Cause: Vite isn't reading .env.local.
Fix:
- File must be at FrontEnd/.env.local (same folder as package.json)
- Restart the dev server - Vite doesn't hot-reload env vars
- Check for a UTF-8 BOM at the start of the file (see below)

### BOM corruption in .env.local

Windows Notepad adds EF BB BF at the start of UTF-8 files, which breaks the
first variable name. To detect:

    Format-Hex .env.local | Select-Object -First 2

If the first bytes are EF BB BF, rewrite the file:

    $content = @"
    VITE_API_BASE_URL=http://localhost:8080
    VITE_FIREBASE_API_KEY=...
    "@
    [IO.File]::WriteAllText("$PWD\.env.local", $content, [Text.UTF8Encoding]::new($false))

### auth/configuration-not-found on login/signup

Cause: Email/Password sign-in provider isn't enabled in Firebase.
Fix: Firebase Console -> Authentication -> Sign-in method -> Enable
Email/Password.

### auth/unauthorized-domain in production

Cause: the deployed frontend domain isn't whitelisted in Firebase.
Fix: Firebase Console -> Authentication -> Settings -> Authorized domains ->
Add frontend-ponc.onrender.com (no https://).

## Runtime Errors

### Blank page after successful build on Render

Cause: SPA routing - Render returns "Not found" for client-side routes on
hard refresh.
Fix: Ensure FrontEnd/public/_redirects exists with:

    /*    /index.html   200

Then redeploy.

### API calls fail with CORS error

Cause: the backend doesn't allow the frontend origin.
Fix: Add the frontend URL to the backend's CORS_ALLOWED_ORIGINS env var,
then redeploy the backend.

### API calls timeout (30s+)

Cause: Render free tier backend is cold-starting after 15 minutes of
inactivity.
Fix: Wait 30-60 seconds and retry. Optionally set up UptimeRobot to ping
/actuator/health every 5 minutes.

### Calls hit http://localhost:8080 on the deployed site

Cause: the VITE_API_BASE_URL change wasn't baked into the JS bundle.
Fix: Render -> Static Site -> Manual Deploy -> Deploy latest commit.

### Dark mode toggle doesn't persist

Cause: localStorage is blocked (private browsing, third-party cookies
disabled).
Fix: Not much we can do - the toggle still works within the session, just
doesn't survive a reload.

### Images broken on profile pages

Cause: uploads were stored on the backend's local disk, which is wiped on
redeploy on Render.
Fix: This is a known limitation. Migration to Cloudflare R2 is planned.

## Development Environment

### npm install fails

    Remove-Item -Recurse -Force node_modules
    Remove-Item package-lock.json
    npm cache clean --force
    npm install

### Vite dev server won't start

    Remove-Item -Recurse -Force node_modules\.vite
    npm run dev

### "invalid hook call" after a dependency change

Cause: duplicate React instances from a partially-applied install.
Fix:

    Remove-Item -Recurse -Force node_modules
    Remove-Item package-lock.json
    npm install
    npm run dev
