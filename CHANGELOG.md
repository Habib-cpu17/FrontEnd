# Changelog

All notable changes to the SetupBuilder frontend.

## [Week 4] - 2025-09-14 to 2025-09-17

### Added
- Scaffolded with Vite + React 19
- Tailwind CSS v3 configured (PostCSS setup)
- React Router v7 with all routes
- AuthContext - register, login, logout
- ProtectedRoute guard
- Login + Register pages
- Dashboard page (verifies auth flow end-to-end)
- Axios interceptor attaches Firebase ID token to every request

## [Week 5] - 2025-09-20 to 2025-09-24

### Added
- Landing page with hero banner (Predator-inspired)
- Featured categories carousel with auto-scroll
- Community builds section (pulls from /api/builds/public)
- Curated builds strip
- Reveal component - scroll-triggered fade-in
- Counter component - animated numbers

### Changed
- Footer + navbar styling to match the landing page

## [Week 6] - 2025-09-27 to 2025-10-01

### Added
- ComponentsPage - grid of components with category tabs and search
- Component cards with images, category badge, price, "Add to build" button
- BuilderPage - inline picker drawer for choosing components
- BuildDetailPage - hero, component list, total, comments section
- MyBuildsPage and PublicBuildsPage
- ToastContext - global toast notifications
- Animated Add button with green success state

### Decisions
- Inline picker drawer instead of a full-page picker - reduces navigation
- Draft builds stored in sessionStorage to survive page transitions

## [Week 7] - 2025-10-04 to 2025-10-08

### Added
- Admin page with three tabs: Components, Curated, Users
- Component CRUD modal in the admin Components tab
- Curated builds manager with drag-free rank input
- User role management tab
- AI price estimator button on Build Detail page

## [Week 8] - 2025-10-11 to 2025-10-15

### Added
- ProfilePage - banner, avatar, bio, stats, achievements tabs
- EditProfileModal - image upload for avatar + banner
- AchievementsTab - grid of unlocked/locked achievements
- User links everywhere (comment authors, build owners -> /users/:id)
- BackButton component used on detail pages
- useMe hook with module-scoped cache

### Changed
- Comment avatars now render the user's uploaded image if available

## [Week 9] - 2025-10-18 to 2025-10-22

### Added
- ChatWidget - floating AI assistant with session persistence
- chatService - session create/list, message send/list

### Changed
- Full redesign to dark/light theme system with ThemeContext
- Angular search bar (diagonal cut on the right, pink parallelogram button)
- Square corners across all cards and buttons
- Unified .btn-primary, .btn-secondary, .btn-yellow classes

## [Week 10] - 2025-10-25 to 2025-10-29

### Changed
- VITE_API_BASE_URL now points to the deployed Render backend
- Added public/_redirects for SPA routing on Render
- Firebase Auth authorized domains updated with frontend-ponc.onrender.com

### Fixed
- Duplicate React instance causing "invalid hook call" - resolved by
  reinstalling node_modules from scratch

## [Unreleased]

### Planned
- Arabic translation + RTL layout
- Followers + feed
- Comparison view (2-3 builds side-by-side)
- Price drop alerts UI
- Image handling via Cloudflare R2 (replacing broken uploads on Render)
