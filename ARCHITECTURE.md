# Architecture

## High-Level View

    +-----------------------------------------+
    |  Browser (React 19 SPA)                 |
    |  +-----------+  +-----------+           |
    |  | Contexts  |  | Pages     |           |
    |  | Auth      |  | Components|           |
    |  | Theme     |  | Builder   |           |
    |  | Toast     |  | Profile   |           |
    |  +-----+-----+  +-----+-----+           |
    |        |              |                 |
    |        |       +------v-------+         |
    |        |       | Services     |  axios  |
    |        |       | (API wrappers)+--------> Spring Boot
    |        |       +--------------+         |
    |        |                                |
    |        v Firebase JS SDK                |
    |  +------------------+                   |
    |  | Firebase Auth    |                   |
    |  +------------------+                   |
    +-----------------------------------------+

## Layers

### Pages (src/pages/)
Route-level components. Each page maps to a URL via App.jsx.

| Page | Route |
| :--- | :--- |
| LandingPage | / |
| LoginPage | /login |
| RegisterPage | /register |
| DashboardPage | /dashboard |
| ComponentsPage | /components |
| BuilderPage | /builder, /builder/:id |
| BuildDetailPage | /builds/:id |
| MyBuildsPage | /my-builds |
| PublicBuildsPage | /public-builds |
| ProfilePage | /profile, /users/:id |
| AdminPage | /admin |

### Components (src/components/)
Reusable UI:

- Navbar, Layout - shell
- ProtectedRoute, AdminRoute - route guards
- SearchBar, ThemeToggle, BackButton - small UI primitives
- Reveal, Counter - animations
- EditProfileModal - profile edit dialog
- chat/ChatWidget - floating AI assistant
- admin/* - three admin tab components

### Contexts (src/context/)
Global state providers wrapped in main.jsx:

- AuthContext - Firebase user + register/login/logout functions
- ThemeContext - dark/light mode with localStorage persistence
- ToastContext - global toast notification system

### Services (src/services/)
Thin wrappers around api.js (axios). One file per domain:

- buildService.js, componentService.js, commentService.js
- userService.js, uploadService.js
- chatService.js, adminService.js

### Lib (src/lib/)
- firebase.js - initializes Firebase app + exports auth
- api.js - Axios instance with a request interceptor that attaches the
  Firebase ID token to every outgoing request
- achievements.jsx - achievement definitions + icons

### Hooks (src/hooks/)
- useMe.js - module-scoped cached fetch of /api/me, shared across components

## Data Flow Example - Loading a Build

    1. User opens /builds/42
    2. BuildDetailPage mounts
    3. useEffect calls getBuild(42) from buildService
    4. buildService -> api.get('/api/builds/42')
    5. Axios interceptor fetches fresh Firebase ID token
    6. Request hits Spring Boot with Authorization: Bearer <token>
    7. Backend FirebaseAuthenticationFilter verifies token, sets SecurityContext
    8. BuildController returns BuildResponse DTO
    9. Page renders hero + component list + AI estimate button + comments

## Key Design Decisions

All decisions live in docs/adr/:

| ADR | Decision |
| :--- | :--- |
| 0001 | React 19 + Vite over CRA / Next.js |
| 0002 | Tailwind CSS v3 (not v4) |
| 0003 | Firebase JS SDK for auth |
| 0004 | Axios with a token interceptor |
| 0005 | Theme in Context + localStorage |
| 0006 | _redirects for SPA on Render |
