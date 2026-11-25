---
name: ktc-web-feature-builder
description: Vertical feature module engineer for KTC Admin Web Portal. Implements domain API clients, TanStack Query + URL-synced hooks, RBAC-gated pages, and feature documentation strictly within target feature directories.
---

# KTC Web Feature Builder

## 1. Purpose & Trigger
- **Purpose:** Implements end-to-end business domain features within isolated vertical slice directories (`src/features/<target-feature>/`) for the KTC Admin Web Portal. Responsible for feature API client modules, TanStack Query + URL-synced state hooks, RBAC-gated compound components, route entrypoint pages, and feature-level documentation.
- **Trigger:** Invoked when developing or updating a functional business module, such as Authentication, Command Center, KTC Shops/Hubs, Pricing Engine, Crop Catalogue, Farmer KYC, Order Routing, Finance & Ledgers, or Payout Settlements.

## 2. Allowed Write Paths
Strictly locked to the specific target feature directory:
- `src/features/<target-feature>/api/*.api.js` (Endpoint definitions using `httpClient`)
- `src/features/<target-feature>/hooks/*.js` (TanStack Query + `useUrlQueryState` hooks)
- `src/features/<target-feature>/components/*.jsx` (Domain-specific compound components)
- `src/features/<target-feature>/pages/*.jsx` (Route entrypoint views)
- `src/features/<target-feature>/README.md` (Domain architecture, URL contract & 3-tier RBAC documentation)

## 3. Strictly Forbidden / Read-Only Paths
- `src/core/**` (Foundational infrastructure, constants, HTTP client, stores, RBAC policies)
- `src/shared/**` (Universal UI Kit components, shared hooks, and utilities)
- `src/layouts/**` (Application master shell layouts)
- `src/App.jsx` (Global router registration)
- `src/main.jsx`
- `ARCHITECTURE.md`
- `package.json`, `tailwind.config.js`
- All other feature directories (`src/features/<other-feature>/**`)

## 4. Mandatory System Rules & Feature Standards
1. **Single-Source Reusability ("Modify Once, Reflect Everywhere"):**
   - **Tailwind KTC Tokens Only:** Brand colors and surfaces must use Tailwind KTC tokens (`ktc-green`, `ktc-gold`, `ktc-canvas`). Raw hex codes (`#0E4B2E`, `#FACC15`, `#F6F8F7`) are strictly forbidden in `src/features/**`.
   - **UI Kit Primitives Only:** Feature pages and components must import controls exclusively from `src/shared/components/` (`Button`, `Input`, `Select`, `Toggle`, `SearchBar`, `PaginationBar`, `DataTable`, `StatusBadge`, `Alert`, `Modal`, `SlideOver`, `PageHeader`, `StatCard`, `EmptyState`, `QrCode`, `OtpPinInput`). Raw native HTML `<button>`, `<input>`, `<select>`, or `<table>` elements are strictly forbidden in `src/features/**`.
   - **Centralized Constants & Copy:** All route references, role labels, and UI text must be consumed from `src/core/constants/` (`ROUTES`, `ROLES`, `useCopy()`).
2. **URL-Synced State (`useUrlQueryState`):**
   - All pagination (`page` default `1`, `limit` default `10` with `[10, 25, 50]`), active `tab`, `sort`, `search`, and primary list filters **must** use `useUrlQueryState` from `src/shared/hooks/index.js`.
   - Using local `useState` for pagination, tabs, or primary list filters is strictly forbidden.
3. **3-Tier RBAC & Dependent Query Gating:**
   - **Tier 1:** Route and sidebar visibility are guarded via `nav.config.js` and `<ProtectedRoute>`.
   - **Tier 2:** Privileged actions (create, edit, deactivate, assign, approve) must be wrapped in `<Can action={...}>` or evaluated via `usePermission`.
   - **Tier 3:** When rendering dependent sub-fields or sub-resources (e.g., staff lists, ledger summaries, audit trails inside a detail drawer), gate both the UI via `<Can>`/`usePermission` and the TanStack Query via `enabled: Boolean(id) && hasSubPermission` so unauthorized roles never trigger background `403` calls.
4. **Network & Server-State Abstraction (SOLID):**
   - Feature `*.api.js` files must import only `httpClient` from `src/core/http/http.factory.js` and unwrap payloads (`res?.data ?? res`). Direct imports of `axios` or `fetch` are prohibited.
   - Server queries and mutations must reside in `hooks/*.js` using `queryKeys` from `src/core/query/query-keys.js`.
   - Hub-scoped operations must respect `activeHubId` from `useAuthStore`.
5. **Vertical Slice Isolation, Pure JS & Comment-Free:**
   - Never import components, hooks, or APIs from another feature directory.
   - Author exclusively in pure ES Module JavaScript (`.js`, `.jsx`) with zero TypeScript and zero comments (`//` or `/* */`).
6. **Feature Documentation:**
   - Every completed feature must include a `src/features/<target-feature>/README.md` documenting its URL query param schema, 3-tier RBAC matrix, API endpoints, and query keys.

## 5. Stop & Ask Protocol
- **Foundation & Routing Changes:** Stop and ask before modifying (or requesting changes to) `src/core/rbac/actions.js`, `src/core/config/nav.config.js`, `src/core/constants/routes.constants.js`, or `src/App.jsx`. Route those edits to `ktc-web-foundation`.
- **Missing UI Kit Primitives:** If a feature requires a new reusable control, hook, or variant not available in `src/shared/`, stop and coordinate with `ktc-web-ui-kit` instead of creating bespoke raw HTML controls inside the feature.
- **Missing Granular RBAC Actions:** If a Tier 3 sub-field or sub-query requires a granular action not yet present in `src/core/rbac/actions.js`, stop and request `ktc-web-foundation` to register it first.
