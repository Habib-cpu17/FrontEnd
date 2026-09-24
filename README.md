# SetupBuilder - Frontend

React + Vite web client for SetupBuilder - a PC build planner for the
Saudi market. Consumes the Spring Boot backend REST API.

## Stack

| Layer | Technology |
| :--- | :--- |
| Framework | React 19.1.0 |
| Build tool | Vite 6 |
| Router | React Router v7 |
| Styling | Tailwind CSS v3.4.17 (PostCSS) |
| HTTP | Axios (with Firebase token interceptor) |
| Auth | Firebase JS SDK (email/password) |
| Fonts | Space Grotesk + Inter (Google Fonts) |
| Deployment | Render Static Site |

## Local Development

### Prerequisites

- Node.js 20+
- The backend running on http://localhost:8080

### 1. Install dependencies

    npm install

### 2. Create .env.local

This file is gitignored - it holds the Firebase Web config.

    VITE_API_BASE_URL=http://localhost:8080
    VITE_FIREBASE_API_KEY=AIzaSy...your-key
    VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your-project
    VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
    VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef

Get these values from Firebase Console -> Project Settings -> Your apps -> Web.

### 3. Run

    npm run dev

Open http://localhost:5173.

## Build

    npm run build

Produces a static site in dist/.

## Deploy to Render

Create a Static Site on Render:

- Build Command: npm install && npm run build
- Publish Directory: dist
- Environment: add every VITE_* variable from ENVIRONMENT.md

The public/_redirects file handles SPA routing automatically.

## Project Structure

See ARCHITECTURE.md.

## Troubleshooting

See TROUBLESHOOTING.md.

## Notes

- Vite env vars are baked at build time. After changing any VITE_* variable
  on Render, trigger a Manual Deploy - a simple page reload isn't enough.
- .env.local is not committed. Recreate it on every new machine.
- Theme (dark/light) persists in localStorage.
- Language: toggle EN/AR with the globe button in the navbar. The choice
  persists in localStorage ("lang"); Arabic switches the page to RTL and
  uses the Tajawal font. First visit auto-detects an Arabic browser.

## License

Private project. Not for redistribution.
