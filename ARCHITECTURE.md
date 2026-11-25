# KTC Admin Web Portal Architecture & Engineering Specifications

## 1. System Overview & Technology Stack
The Krishi Trade Center (KTC / Mandi Exchange) Admin Web Portal is an enterprise single-page application (SPA) engineered for physical agricultural mandi hub and platform management. It serves operational and executive roles: Store Operators, Hub Managers, Regional Operations Admins, and Super Admins.

The portal provides end-to-end operational visibility and control across physical hub goods receipt notes (GRN), multi-tier commodity pricing engines, crop master data, warehouse batch tracking, outbound commercial fulfillment, physical cash float handovers, and farmer payout settlements.

### Technology Stack Specifications
- **Framework & Runtime:** React 19 utilizing standard functional components, hooks, concurrent rendering, and strict mode.
- **Build Tool & Bundler:** Vite configured with native ES Modules (`"type": "module"`), fast Hot Module Replacement (HMR), and optimized tree-shaking production builds.
- **Styling Architecture:** Tailwind CSS configured with centralized KTC brand design tokens in `tailwind.config.js`:
  - **`ktc-green` (`#0E4B2E`, hover `#0A3A23`, dark `#082a19`, light `#ECFDF5`):** Primary authoritative brand token utilized for sidebar navigation, primary action buttons, focus rings, active states, and executive badges.
  - **`ktc-gold` (`#FACC15`, hover `#eab308`, active `#ca8a04`):** Secondary accent token utilized for active navigation pills, high-priority highlights, and attention badges.
  - **`ktc-canvas` (`#F6F8F7`):** Neutral foundational background token utilized across viewport layouts and page canvases.
- **Network & HTTP Layer:** Axios encapsulated within a polymorphic `BaseHttpClient` contract, featuring request interceptors for bearer token injection, request IDs (`X-Request-Id`), and `Accept-Language` headers, structured `ApiError` normalization (`ApiError.fromAxiosError`), and a concurrency-safe 401 token refresh queue.
- **Server-State Management:** TanStack Query (v5) providing declarative caching, background revalidation, centralized query key factories, 60-second default `staleTime`, and explicit retry suppression on client errors (`4xx`).
- **URL & Client-State Management:**
  - **URL-Synced Navigation & Filter State:** `useUrlQueryState` (`src/shared/hooks/useUrlQueryState.js`) built on `react-router-dom`'s `useSearchParams` for all pagination, tab selections, sorting, and essential filters.
  - **Zustand Client Stores:** `authStore` (`ktc-auth-session` persisted session, tokens, normalized roles, `activeRole`, `staffAssignments`, and `activeHubId`) and `uiStore` (`sidebarCollapsed`, `language`, and transient `toasts` queue).

---

## 2. Project Directory Layout & Architectural Boundaries

The codebase enforces clean architecture and separation of concerns via a four-tier directory hierarchy:

```
admin/
├── .agent/
│   └── skills/                           # Scope-locked agent guardrails
│       ├── ktc-web-impact-analyzer/
│       ├── ktc-web-foundation/
│       ├── ktc-web-ui-kit/
│       ├── ktc-web-feature-builder/
│       └── ktc-web-docs-maintainer/
├── public/                               # Static public assets (favicons, SVGs)
├── src/
│   ├── core/                             # Foundational, cross-cutting infrastructure
│   │   ├── config/                       # Environment configuration & navigation definitions
│   │   │   ├── env.js                    # Frozen environment variables
│   │   │   └── nav.config.js             # Declarative navigation tree with RBAC actions
│   │   ├── constants/                    # Single-source routes, roles, and EN/HI copy
│   │   │   ├── routes.constants.js       # Canonical application route paths
│   │   │   ├── roles.constants.js        # Role enum keys, metadata & dropdown options
│   │   │   ├── copy.constants.js         # EN/HI dictionary and useCopy() hook
│   │   │   └── index.js                  # Barrel export for core constants
│   │   ├── http/                         # Abstract HTTP client contract & Axios implementation
│   │   │   ├── http-client.interface.js  # Abstract BaseHttpClient definition
│   │   │   ├── api-error.js              # Structured ApiError normalization
│   │   │   ├── axios-http.client.js      # Concrete Axios client with 401 refresh queue
│   │   │   └── http.factory.js           # Singleton instance exporter (DIP)
│   │   ├── query/                        # TanStack Query infrastructure
│   │   │   ├── query-client.js           # Configured QueryClient instance
│   │   │   └── query-keys.js             # Centralized query key factory
│   │   ├── auth/                         # Authentication state & routing guards
│   │   │   ├── auth.store.js             # Zustand persisted session store
│   │   │   └── ProtectedRoute.jsx        # Route guard verifying auth & permissions
│   │   ├── ui/                           # UI state management
│   │   │   └── ui.store.js               # Zustand store for sidebar, language & toasts
│   │   ├── rbac/                         # Role-Based Access Control
│   │   │   ├── actions.js                # Canonical backend action constants
│   │   │   ├── usePermission.js          # Permission verification hook
│   │   │   └── Can.jsx                   # Declarative JSX permission gate
│   │   └── storage/                      # Storage and asset management
│   │       └── storage-upload.service.js # Direct-to-R2 presigned upload service
│   ├── shared/                           # Domain-agnostic reusable primitives
│   │   ├── components/                   # Stateless UI Kit primitives
│   │   │   ├── Alert.jsx                 # Contextual alert banner
│   │   │   ├── Button.jsx                # Polymorphic button with loading states
│   │   │   ├── DataTable.jsx             # Sortable data table with skeleton & pagination
│   │   │   ├── EmptyState.jsx            # Placeholder graphics and recovery CTAs
│   │   │   ├── ErrorBoundary.jsx         # Runtime React error boundary
│   │   │   ├── Input.jsx                 # Controlled input with prefix/suffix/PIN toggle
│   │   │   ├── Modal.jsx                 # Accessible dialog overlay
│   │   │   ├── OtpPinInput.jsx           # Multi-box numeric OTP & masked PIN input
│   │   │   ├── PageHeader.jsx            # Standardized feature page heading & actions
│   │   │   ├── PaginationBar.jsx         # Page navigation & page size selector
│   │   │   ├── QrCode.jsx                # Reusable SVG/PNG QR code card
│   │   │   ├── SearchBar.jsx             # Debounced search input with shortcut hint
│   │   │   ├── Select.jsx                # Custom accessible dropdown (no native <select>)
│   │   │   ├── SlideOver.jsx             # Right-side drawer panel
│   │   │   ├── StatCard.jsx              # Metric summary KPI widget
│   │   │   ├── StatusBadge.jsx           # Semantic status pill
│   │   │   ├── ToastContainer.jsx        # Global floating toast notification stack
│   │   │   ├── Toggle.jsx                # Accessible switch control
│   │   │   └── index.js                  # Central barrel export for UI Kit
│   │   ├── hooks/                        # Domain-agnostic reusable hooks
│   │   │   ├── useUrlQueryState.js       # URL-synced pagination, tabs & filter hook
│   │   │   └── index.js                  # Central barrel export for shared hooks
│   │   └── utils/                        # Pure helper utilities
│   │       ├── cn.js                     # ClassName merging and conditional joiner
│   │       └── formatters.js             # INR currency, weight, and date formatters
│   ├── layouts/                          # Application frame layouts
│   │   └── AdminShell.jsx                # Viewport-locked layout: Sidebar, Header, Canvas
│   ├── features/                         # Vertical business domain slices
│   │   ├── auth/                         # Authentication, PIN login, OTP reset
│   │   ├── dashboard/                    # Command Center & operational metrics
│   │   ├── ui-kit/                       # Temporary developer UI Kit showcase
│   │   ├── hubs/                         # Physical hub management & staff allocation
│   │   ├── catalog/                      # Crop master, varieties & unit conversions
│   │   ├── pricing/                      # Daily mandi rates & pricing engine
│   │   ├── grn/                          # Inbound procurement & Goods Receipt Notes
│   │   ├── inventory/                    # Batch management, holding bins & stock
│   │   ├── orders/                       # Commercial buyer orders & dispatch routing
│   │   ├── finance/                      # Cash safe, operator float ledgers & settlements
│   │   └── kyc/                          # Farmer verification & staff audits
│   ├── App.jsx                           # Root application router setup
│   ├── main.jsx                          # Application bootstrap & provider hydration
│   └── index.css                         # Global styles & Tailwind base directives
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 3. Non-Negotiable Engineering Laws

### Law 1: Single-Source Reusability ("Modify Once, Reflect Everywhere")
Global visual identity, copy, and primitives originate from single authoritative sources:
- **Design Tokens Only:** All brand colors and surfaces must reference Tailwind KTC tokens (`ktc-green`, `ktc-gold`, `ktc-canvas`). Raw hex codes (`#0E4B2E`, `#FACC15`, `#F6F8F7`) inside `src/features/**` are strictly forbidden.
- **UI Kit Primitives Only:** All interactive controls and structural containers (`Button`, `Input`, `Select`, `Toggle`, `DataTable`, `PaginationBar`, `Modal`, `SlideOver`, `QrCode`, `OtpPinInput`, `StatusBadge`, `Alert`, `PageHeader`, `StatCard`, `SearchBar`, `EmptyState`) must be imported from `src/shared/components/`. Raw native HTML `<button>`, `<input>`, `<select>`, or `<table>` elements are forbidden in `src/features/**`.
- **Centralized Constants & Copy:** All route paths, role metadata, and user-facing strings (supporting `EN` and `HI`) must be imported from `src/core/constants/`. Hardcoded route strings, role dropdown options, or inline copy literals inside feature pages or layouts are prohibited.

### Law 2: 3-Tier RBAC & Permission Boundaries
Authorization is enforced continuously across three distinct tiers using canonical backend actions from `src/core/rbac/actions.js`:
- **Tier 1 (Page & Navigation Boundary):** Sidebar visibility in `src/core/config/nav.config.js` and route access in `src/App.jsx` are guarded via `usePermission` and `<ProtectedRoute requiredAction={...}>`.
- **Tier 2 (Feature & Action Boundary):** Privileged interactive controls (creation buttons, edit triggers, status toggles, approval modals, and drawers) inside feature views must be wrapped in `<Can action={...}>` or conditionally evaluated via `usePermission(action)`.
- **Tier 3 (Dependent Sub-Field & Query Boundary):** When a role holds permission to view a parent resource (e.g., `HUB:READ`) but lacks permission for a dependent sub-resource or sub-field (e.g., `STAFF:VIEW` or hub ledger/margin fields), the UI must omit or lock that sub-field using `<Can>` or `usePermission`, and any dependent TanStack Query **must** be gated with `enabled: Boolean(parentId) && hasSubPermission`. Unconditional background queries that trigger avoidable `403 Forbidden` responses are strictly forbidden. Granular sub-field actions are added incrementally to `src/core/rbac/actions.js` as each feature is designed.

### Law 3: SOLID Architecture in Frontend Modules
Every module enforces strict separation of concerns across four distinct layers:
1. **`*.api.js` (Network Layer — DIP & LSP):** Exclusively constructs endpoint calls using the singleton `httpClient` exported from `src/core/http/http.factory.js` (`BaseHttpClient` abstraction) and unwraps server envelopes (`res?.data ?? res`). Direct `axios` or `fetch` imports are prohibited.
2. **`hooks/` (State & Orchestration — SRP & ISP):** Encapsulates TanStack Query queries/mutations (referencing `queryKeys` from `src/core/query/query-keys.js`) and URL state synchronization (`useUrlQueryState`). Hooks contain zero JSX.
3. **`pages/` & `components/` (Feature Composition — OCP & SRP):** Composes stateless primitives from `src/shared/components/` with domain hooks and `<Can>` gates to fulfill user workflows.
4. **`src/shared/components/` (Stateless UI Kit — OCP & ISP):** Purely controlled/presentational primitives with zero API imports, zero store coupling (except `ToastContainer` reading `uiStore.toasts`), and zero domain terminology.

### Law 4: URL-Synced State & Refresh Persistence
Application state must survive page refreshes and support shareable, bookmarkable operational views:
- **URL Query State (`useUrlQueryState`):** All essential filters, `page` (default `1`), `limit` (default `10`, standard sizes `[10, 25, 50]`), `sort`, `search`, and active `tab` **must** live in the URL via `useUrlQueryState` (`src/shared/hooks/useUrlQueryState.js`)—never in local `useState`.
  - Numeric and boolean defaults are automatically coerced on read.
  - Empty, `null`, `undefined`, or default-matching values are stripped from the URL to keep paths clean.
  - Non-pagination filter mutations automatically reset `page` to `1` and use `{ replace: true }` to avoid polluting browser history.
- **Persistent Client Preferences:** Session identity (`user`, `roles`, `activeRole`, `staffAssignments`, `activeHubId`, `accessToken`, `refreshToken`) and UI workspace preferences (`activeHubId`, `sidebarCollapsed`, `language`) persist across browser sessions via Zustand `persist`.

### Law 5: Immutability Rule & Documentation Governance
- **Foundational & UI Kit Immutability:** Files within `src/core/**` and `src/shared/**` are strictly immutable during routine feature development. Only tasks explicitly routed through `ktc-web-foundation` or `ktc-web-ui-kit` may alter those boundaries.
- **Feature Isolation:** Every domain feature resides exclusively within `src/features/<feature>/`. Cross-feature imports are prohibited.
- **Pure JavaScript & Comment-Free Standard:** All executable files (`.js`, `.jsx`) must use modern ES Modules without TypeScript and remain 100% comment-free.
- **`ARCHITECTURE.md` Stability:** This document serves as the immutable architectural source of truth and must not be edited during routine feature work. Only structural platform upgrades or roadmap status updates executed under `ktc-web-docs-maintainer` may modify this file.

---

## 4. Security, Session Lifecycle & Canonical RBAC Actions

### 1. Automatic Token Refresh on 401 Unauthorized
`AxiosHttpClient` maintains a concurrency-safe token renewal pipeline:
1. Request interceptor attaches `Authorization: Bearer <accessToken>`, `X-Request-Id` (`crypto.randomUUID()`), and `Accept-Language` (`uiStore.language`).
2. Response interceptor normalizes all rejections via `ApiError.fromAxiosError(error)`, extracting `{ statusCode, message, code, details }` safely as strings.
3. On HTTP `401`, concurrent requests are queued while a single `POST /auth/token/refresh` executes. On success, tokens update in `authStore` and queued requests replay; on failure, `clearSession()` executes.

### 2. Canonical Backend Action Matrix (`src/core/rbac/actions.js`)
- **Hubs:** `HUB:CREATE`, `HUB:READ`, `HUB:UPDATE`, `HUB:UPDATE_OPERATIONAL`, `HUB:DEACTIVATE`, `HUB:MANAGE_STAFF`
- **Staff:** `STAFF:ASSIGN`, `STAFF:REMOVE`, `STAFF:VIEW`
- **Crops:** `CROP:CREATE`, `CROP:UPDATE`, `CROP:DELETE`, `CROP:VIEW`
- **Mandi Rates:** `MANDI_RATE:SET_GLOBAL`, `MANDI_RATE:SET_HUB`, `MANDI_RATE:VIEW`
- **GRN:** `GRN:ISSUE`, `GRN:VIEW`, `GRN:APPROVE`
- **Orders:** `ORDER:CREATE`, `ORDER:VIEW`, `ORDER:DISPATCH`, `ORDER:DELIVER`, `ORDER:CANCEL`
- **Payouts:** `PAYOUT:CREATE`, `PAYOUT:OVERRIDE`, `PAYOUT:APPROVE`, `PAYOUT:EXECUTE`, `PAYOUT:VIEW`
- **Cash Ledger:** `CASH_LEDGER:TRANSFER`, `CASH_LEDGER:HANDOVER`, `CASH_LEDGER:DEPOSIT`, `CASH_LEDGER:VIEW`
- **Charges:** `CHARGE:MANAGE`, `CHARGE:VIEW`
- **Disputes:** `DISPUTE:CREATE`, `DISPUTE:VIEW`, `DISPUTE:RESOLVE`
- **Storage:** `STORAGE:UPLOAD`, `STORAGE:VIEW_PRIVATE`

---

## 5. Portal Functional Module Roadmap & Status

| Module | Operational Scope | Required Actions | Status |
|---|---|---|---|
| **Foundation & Shell** | Base HTTP client, 401 refresh, Zustand stores, viewport-locked AdminShell, 3-Tier RBAC, URL state hook | N/A | Completed |
| **Reusable UI Kit** | Stateless design primitives (`Select`, `DataTable`, `Modal`, `SlideOver`, `QrCode`, `OtpPinInput`, etc.) | N/A | Completed |
| **Auth & Security** | PIN login, Email OTP authentication, PIN reset flow, session hydration | Public / Auth | Completed |
| **Command Center** | Executive KPI dashboard, operational alerts, RBAC diagnostic | Public / Admin | Completed |
| **KTC Hubs & Staff** | Hub geolocation, storage capacity, operational status, operator staff assignment | `HUB:READ`, `HUB:CREATE`, `STAFF:VIEW` | Pending |
| **Pricing Engine** | Daily mandi benchmark rates, minimum support price (MSP), hub price overrides | `MANDI_RATE:VIEW`, `MANDI_RATE:SET_GLOBAL`, `MANDI_RATE:SET_HUB` | Pending |
| **Crop Catalogue** | Crop master hierarchy, grade specifications, unit conversion matrix | `CROP:VIEW`, `CROP:CREATE` | Pending |
| **Farmer KYC & Directory** | Farmer registration audit, land record verification, bank accounts | `STAFF:VIEW` | Pending |
| **Order Routing** | Commercial buyer orders, truck loading allocation, fulfillment dispatch | `ORDER:VIEW`, `ORDER:DISPATCH` | Pending |
| **Finance & Ledgers** | Hub safe reconciliation, operator cash float handovers, OTP verification | `CASH_LEDGER:VIEW`, `CASH_LEDGER:TRANSFER` | Pending |
| **Payout Settlements** | Goods Receipt Note (GRN) liquidations, FIFO settlements, manual overrides | `PAYOUT:VIEW`, `PAYOUT:CREATE` | Pending |
| **Disputes & Audits** | Quality grading disputes, weight deduction audits, system access logs | `DISPUTE:VIEW`, `DISPUTE:RESOLVE` | Pending |
