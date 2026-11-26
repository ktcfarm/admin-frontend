# Feature: KTC Shops / Hubs, Franchise Onboarding & Compliance Document Vault

## 1. Operational Responsibility & Architecture
Manages physical KTC mandi procurement hubs, PostGIS coordinates, hub safe cash accounts, operational timings, staff assignments (`HUB_MANAGER` and `STORE_OPERATOR`), franchisee & banking profiles, and R2 compliance document vaults within `src/features/hubs/`.

| Layer | File | Responsibility |
|---|---|---|
| **API** | `api/hubs.api.js` | Consumes `/api/v1/admin/hubs/*` exclusively via `httpClient` and delegates R2 uploads to `storageUploadService` |
| **Constants** | `constants/hubs.constants.js` | Compulsory/optional `HubDocumentType` specs, R2 bucket mapping (`PRIVATE` / `PUBLIC`), and status badge mappings |
| **Hooks** | `hooks/useHubs.js` | URL-synced query state (`useUrlQueryState`), TanStack Query hooks (`queryKeys.hubs`), Tier 3 `enabled` gates, and mutations |
| **Components** | `components/HubFormDrawer.jsx` | 3-tab wide right `SlideOver` (`size="xl"`) onboarding workflow: Shop & Location, Franchisee & Banking, Compliance & Documents |
| **Components** | `components/HubDetailSlideOver.jsx` | Hub inspection drawer displaying identity, `onboardingStatus`, gated Franchisee & Banking summary, Compliance Vault (`Preview` / `Approve` / `Reject`), `HUB_SAFE` balances, and staff roster |
| **Components** | `components/AssignStaffModal.jsx` | Debounced candidate lookup (`STAFF:ASSIGN`) and role assignment (`HUB_MANAGER` / `STORE_OPERATOR`) |
| **Page** | `pages/HubsPage.jsx` | Main route entrypoint composing `PageHeader`, `StatCard`, `SearchBar`, `Select`, `Input`, `DataTable`, and drawers/modals |

---

## 2. Top-Nav Context Switchers Integration
- **Active Role Switcher (`AdminShell.jsx` + `POST /api/v1/admin/auth/switch-role`):**
  - Renders a `Select` dropdown when the user holds >1 available staff role; renders static role text when only 1 role is available.
  - `SUPER_ADMIN` holders can switch `activeRole` across all 4 staff roles (`SUPER_ADMIN`, `ADMIN`, `HUB_MANAGER`, `STORE_OPERATOR`) without extra `UserRole` or `HubStaffAssignment` rows.
  - `usePermission` evaluates strictly against `activeRole`.
- **Active KTC Hub Switcher (`AdminShell.jsx` + `authStore.activeHubId`):**
  - Renders a `Select` dropdown when >1 hub option is available; renders static hub text when only 1 hub is available.
  - `ADMIN` / `SUPER_ADMIN` roles receive an `"All Hubs"` option (`activeHubId = null`) plus all active hubs. `SUPER_ADMIN` holders testing `HUB_MANAGER` / `STORE_OPERATOR` views continue to see all active hubs in the switcher.
  - Regular `HUB_MANAGER` / `STORE_OPERATOR` users are scoped to their assigned hubs and auto-selected onto their first assigned hub.

---

## 3. URL Query Param Contract
Managed via `useUrlQueryState` in `hooks/useHubs.js`:

| Param Key | Type | Default | Resets `page` to `1`? | Purpose |
|---|---|---|---|---|
| `page` | `number` | `1` | No | Active table page |
| `limit` | `number` | `10` | Yes | Page size (`[10, 25, 50]`) |
| `search` | `string` | `''` | Yes | Search by hub name, code, city, district, or state |
| `isActive` | `string` | `'all'` | Yes | Operational status filter (`'all'` \| `'true'` \| `'false'`) |
| `onboardingStatus` | `string` | `'all'` | Yes | Onboarding filter (`'all'` \| `'DRAFT'` \| `'PENDING_VERIFICATION'` \| `'VERIFIED'` \| `'SUSPENDED'`) |
| `state` | `string` | `''` | Yes | State substring filter |
| `sortBy` | `string` | `'name'` | Yes | Sort column (`'name'` \| `'code'` \| `'cityOrTown'` \| `'createdAt'`) |
| `sortOrder` | `string` | `'asc'` | Yes | Sort direction (`'asc'` \| `'desc'`) |
| `hubId` | `string` | `''` | No | Active hub UUID open in `HubDetailSlideOver` |

---

## 4. 3-Tier RBAC Boundary Matrix

| Tier | Scope | Target Element / Query | Required Action Constant |
|---|---|---|---|
| **Tier 1** | Page / Nav | `nav.config.js` item & `/hubs` route (`ProtectedRoute`) | `HUB:READ` |
| **Tier 2** | Feature / Action | Create Hub CTA & drawer (`HubsPage`, `HubFormDrawer`) | `HUB:CREATE` |
| **Tier 2** | Feature / Action | Edit Hub button (`HubsPage`, `HubDetailSlideOver`) | `HUB:UPDATE` or `HUB:UPDATE_OPERATIONAL` |
| **Tier 2** | Feature / Action | Hub `isActive` toggle (`HubFormDrawer`) | `HUB:DEACTIVATE` |
| **Tier 2** | Feature / Action | Franchisee & Banking tab, Document Vault uploads, Approve/Reject actions, Onboarding Status update | `HUB:UPDATE` |
| **Tier 2** | Feature / Action | Assign Staff button (`HubDetailSlideOver`) & Remove Staff button | `STAFF:ASSIGN` / `STAFF:REMOVE` |
| **Tier 3** | Sub-Field & Query Gate | Core identity, address, coordinates, `isActive`, and Tabs 2 & 3 hidden/locked when lacking `HUB:UPDATE` | `HUB:UPDATE` vs `HUB:UPDATE_OPERATIONAL` |
| **Tier 3** | Sub-Field & Query Gate | Franchisee & Banking summary card inside `HubDetailSlideOver` (hides PAN/bank details from non-Admins) | `HUB:UPDATE` |
| **Tier 3** | Sub-Field & Query Gate | Staff roster UI + `useHubStaff(hubId)` query (`enabled: Boolean(hubId) && canViewStaff`) | `STAFF:VIEW` |
| **Tier 3** | Sub-Field & Query Gate | Candidate search query (`enabled: isOpen && canAssignStaff && search.length >= 2`) | `STAFF:ASSIGN` |
| **Tier 3** | Sub-Field & Query Gate | `HUB_SAFE` cash account balances card inside `HubDetailSlideOver` | `CASH_LEDGER:VIEW` |

---

## 5. REST API Endpoints & Query Keys

| Method | Endpoint | Purpose | Query Key |
|---|---|---|---|
| `GET` | `/api/v1/admin/hubs` | Paginated, hub-scoped list of hubs | `queryKeys.hubs.list(filters)` |
| `GET` | `/api/v1/admin/hubs/:id` | Single hub detail + cash accounts + `franchiseProfile` + `documents` | `queryKeys.hubs.detail(hubId)` |
| `POST` | `/api/v1/admin/hubs` | Create hub + PostGIS point + `HUB_SAFE` | Invalidates `queryKeys.hubs.all` |
| `PATCH` | `/api/v1/admin/hubs/:id` | Update hub (full for Admins, operational for Hub Managers) | Invalidates `queryKeys.hubs.all` & `detail(hubId)` |
| `PUT` | `/api/v1/admin/hubs/:id/franchise` | Upsert `HubFranchiseProfile` (entity, owner, PAN/GSTIN/FSSAI, bank, commercial terms) | Invalidates `queryKeys.hubs.all` & `detail(hubId)` |
| `POST` | `/api/v1/admin/hubs/:id/documents` | Register uploaded R2 compliance document (`PRIVATE` / `PUBLIC`) | Invalidates `queryKeys.hubs.all` & `detail(hubId)` |
| `PATCH` | `/api/v1/admin/hubs/:id/documents/:docId/verify` | Approve or reject (with reason) compliance document | Invalidates `queryKeys.hubs.all` & `detail(hubId)` |
| `GET` | `/api/v1/admin/hubs/:id/documents/:docId/url` | Generate short-lived R2 presigned `GET` URL or public URL | On-demand mutation |
| `PATCH` | `/api/v1/admin/hubs/:id/onboarding-status` | Transition `onboardingStatus` (`VERIFIED` requires all compulsory docs unless `SUPER_ADMIN` `force: true`) | Invalidates `queryKeys.hubs.all` & `detail(hubId)` |
| `GET` | `/api/v1/admin/hubs/:id/staff` | List active staff assignments for hub | `queryKeys.hubs.staff(hubId)` |
| `GET` | `/api/v1/admin/hubs/staff-candidates` | Search active users to assign as hub staff | `queryKeys.hubs.staffCandidates(search)` |
| `POST` | `/api/v1/admin/hubs/:id/staff` | Assign user to hub (`HUB_MANAGER` / `STORE_OPERATOR`) | Invalidates `queryKeys.hubs.all`, `staff(hubId)`, `detail(hubId)` |
| `DELETE` | `/api/v1/admin/hubs/:id/staff/:staffId` | Deactivate staff assignment (& operator cash account) | Invalidates `queryKeys.hubs.all`, `staff(hubId)`, `detail(hubId)` |
