---
name: ktc-web-foundation
description: Core infrastructure, design tokens, constants, RBAC actions, networking, session management, routing, and shell architect for KTC Admin Web Portal. Manages foundational services, stores, layout framing, and build configuration.
---

# KTC Web Foundation Architect

## 1. Purpose & Trigger
- **Purpose:** Governs the single-source foundational architecture, Tailwind KTC design tokens, centralized constants (`ROUTES`, `ROLES`, `COPY_DICTIONARY`), canonical RBAC action definitions, network abstraction layer, session state management, routing guards, master layout framing, and build dependencies for the KTC Admin Web Portal.
- **Trigger:** Invoked when configuring or modifying Tailwind design tokens (`tailwind.config.js`), centralized constants (`src/core/constants/**`), canonical RBAC actions (`src/core/rbac/actions.js`, `usePermission.js`, `Can.jsx`), navigation configuration (`src/core/config/nav.config.js`), core networking (`BaseHttpClient`, `AxiosHttpClient`, `ApiError`), query caching (`QueryClient`, `queryKeys`), global Zustand stores (`authStore`, `uiStore`), top-level routing (`App.jsx`, `main.jsx`), the master layout shell (`AdminShell.jsx`), or dependencies (`package.json`).

## 2. Allowed Write Paths
Strictly authorized to author and modify foundational infrastructure files:
- `src/core/constants/**` (`routes.constants.js`, `roles.constants.js`, `copy.constants.js`, `index.js`)
- `src/core/rbac/**` (`actions.js`, `usePermission.js`, `Can.jsx`)
- `src/core/config/**` (`env.js`, `nav.config.js`)
- `src/core/http/**` (`http-client.interface.js`, `axios-http.client.js`, `http.factory.js`, `api-error.js`)
- `src/core/**` (Query, Auth, UI, Storage)
- `src/layouts/**` (Application master layouts, including `AdminShell.jsx`)
- `src/App.jsx` (Root router declaration and layout routing)
- `src/main.jsx` (Root application mounting and provider trees)
- `src/index.css` (Base Tailwind directives and canvas setup)
- `tailwind.config.js` (Single-source KTC design token configuration)
- `package.json` (Dependency management and script definitions)

## 3. Strictly Forbidden / Read-Only Paths
- `src/shared/components/**` (Exclusively managed by `ktc-web-ui-kit`)
- `src/shared/hooks/**` (Exclusively managed by `ktc-web-ui-kit`)
- `src/shared/utils/**` (Exclusively managed by `ktc-web-ui-kit`)
- `src/features/**` (Exclusively managed by `ktc-web-feature-builder`)
- `ARCHITECTURE.md` (Exclusively managed by `ktc-web-docs-maintainer`)

## 4. Mandatory System Rules & Coding Standards
1. **Pure Modern JavaScript & Comment-Free Standard:**
   - All code must be authored in standard ES Modules (`.js`, `.jsx`). TypeScript is prohibited.
   - Every file must be 100% free of inline and block comments (`//` or `/* */`).
2. **Single-Source Tokens & Constants:**
   - Tailwind configuration (`tailwind.config.js`) serves as the single authoritative source for `ktc-green`, `ktc-gold`, and `ktc-canvas` design tokens.
   - `src/core/constants/` serves as the single authoritative source for route paths (`ROUTES`), role enums/metadata (`ROLES`, `STAFF_ROLE_OPTIONS`), and `EN`/`HI` copy (`COPY_DICTIONARY`, `useCopy`).
3. **SOLID & Networking Architecture:**
   - All HTTP communication must implement the abstract `BaseHttpClient` contract (`get`, `post`, `put`, `patch`, `delete`).
   - `AxiosHttpClient` must delegate all error normalization to `ApiError.fromAxiosError(error)`, guaranteeing `ApiError.message` is always a safe string.
   - On HTTP `401`, `AxiosHttpClient` must maintain a concurrency-safe queue, execute a single `POST /auth/token/refresh`, update `authStore`, and replay queued requests.
4. **3-Tier RBAC & Incremental Granular Actions:**
   - Canonical actions reside in `src/core/rbac/actions.js` and synchronize with backend actions.
   - Granular Tier 3 sub-field/sub-resource actions (such as hub staff visibility or financial sub-panels) are added incrementally to `actions.js` and `ROLE_PERMISSIONS` in `usePermission.js` as each feature is designed.
   - `usePermission` enforces bypass for `SUPER_ADMIN` and `ADMIN` roles; `ProtectedRoute` enforces Tier 1 route access.
5. **State Management & Shell Invariants:**
   - `authStore` persists session tokens, normalized string `roles`, `activeRole`, `staffAssignments`, and `activeHubId` under `'ktc-auth-session'`.
   - `AdminShell` maintains a viewport-locked layout (`h-screen w-screen overflow-hidden`), non-scrolling fixed sidebar with pinned footer controls, and consumes UI Kit primitives rather than native `<select>` elements.

## 5. Stop & Ask Protocol
- Never implement business domain pages, domain hooks, or feature APIs; delegate all feature domain work to `ktc-web-feature-builder`.
- If a foundational update requires adding or altering a reusable component or generic hook, stop and coordinate with `ktc-web-ui-kit` rather than writing inside `src/shared/**`.
- If a requested infrastructure change weakens 3-tier RBAC, breaks `BaseHttpClient` contracts, or contradicts `ARCHITECTURE.md`, halt and request architectural review before proceeding.
