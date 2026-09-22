# Environment Variables

## Frontend - Production (Render Static Site)

| Key | Required | Description |
| :--- | :--- | :--- |
| VITE_API_BASE_URL | Yes | Backend base URL, e.g. https://setupbuilder-backend.onrender.com (no trailing slash) |
| VITE_FIREBASE_API_KEY | Yes | Firebase Web API key (AIzaSy...) |
| VITE_FIREBASE_AUTH_DOMAIN | Yes | <project>.firebaseapp.com |
| VITE_FIREBASE_PROJECT_ID | Yes | Firebase project ID |
| VITE_FIREBASE_STORAGE_BUCKET | Yes | <project>.appspot.com |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Yes | Numeric sender ID |
| VITE_FIREBASE_APP_ID | Yes | Web app ID (1:...:web:...) |

## Frontend - Local (.env.local)

Not committed. Create in FrontEnd/ at the same level as package.json.

    VITE_API_BASE_URL=http://localhost:8080
    VITE_FIREBASE_API_KEY=AIzaSy...
    VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your-project
    VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
    VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef

## Where to Get Each Value

Firebase Console -> your project -> Project Settings -> General -> Your apps
-> Web app -> SDK setup and configuration -> Config.

## Gotchas

- Vite is strict about the prefix. Every variable must start with VITE_,
  otherwise it's not exposed to the client bundle.
- No quotes, no spaces. VITE_FIREBASE_API_KEY="AIza..." will include the
  quotes in the value. Use VITE_FIREBASE_API_KEY=AIza....
- Rebuild required. Changing any VITE_* variable requires a full rebuild
  - HMR cannot pick up env-var changes.
- File encoding matters. Windows Notepad may add a UTF-8 BOM (EF BB BF)
  at the start of the file, which breaks the first variable. Save as UTF-8
  without BOM, or write the file with PowerShell:

    [IO.File]::WriteAllText("$PWD\.env.local", $content, [Text.UTF8Encoding]::new($false))

## Rotating the Firebase Web Config

If the Web API key leaks:

1. Firebase Console -> Project Settings -> Your apps -> Web app -> gear icon
2. Regenerate the config
3. Update VITE_FIREBASE_API_KEY in .env.local and on Render
4. Redeploy the static site

Note: the Firebase Web API key is not a secret in the traditional sense -
it's embedded in every client bundle. But rotating it is still good hygiene
after a leak.
