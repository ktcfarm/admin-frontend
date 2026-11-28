# Feature: Command Center Live Summary

## 1. Operational Responsibility & Architecture
Provides a live, role-scoped operational overview across KTC Hub onboarding, Crop Catalogue coverage, Daily Mandi Pricing, actionable compliance/pricing alerts, and recent `AuditLog` activity within `src/features/dashboard/`.

| Layer | File | Responsibility |
|---|---|---|
| **API** | `api/dashboard.api.js` | Consumes `GET /api/v1/admin/dashboard/summary` via `httpClient` |
| **Hooks** | `hooks/useDashboard.js` | React Query `useDashboardSummary` keyed by `queryKeys.dashboard.summary({ activeRole, hubId })` |
| **Components** | `components/AlertsPanel.jsx` | Pending verification hubs, active varieties missing published rates, and compliance documents expiring within 30 days |
| **Components** | `components/RecentActivityCard.jsx` | Latest 5 `AuditLog` entries scoped to the active network or hub |
| **Page** | `pages/CommandCenterPage.jsx` | Live KPI `StatCard`s, `<Can>`-gated quick actions, alerts/activity grid, and collapsible session/RBAC diagnostics |

---

## 2. 3-Tier RBAC Boundary Matrix

| Tier | Scope | Target Element / Behavior | Required Action / Role |
|---|---|---|---|
| **Tier 1** | Page / Endpoint | `GET /api/v1/admin/dashboard/summary` | `STORE_OPERATOR`, `HUB_MANAGER`, `ADMIN`, `SUPER_ADMIN` |
| **Tier 2** | Quick Actions | `+ Onboard KTC`, `+ Add Variety`, `+ Publish Daily Rates` | `HUB:CREATE`, `CROP:CREATE`, `MANDI_RATE:SET_HUB` |
| **Tier 3** | API Data Guard | `pricing.draftRates` and `pricing.avgMarginPercent` nullified server-side; `recentActivity` and alerts restricted to `scopedHubIds` | `STORE_OPERATOR` / `HUB_MANAGER` scoping in `dashboard.service.js` |

---

## 3. REST Endpoint & Query Key Contract

| Method | Endpoint | Query Params | Query Key |
|---|---|---|---|
| `GET` | `/api/v1/admin/dashboard/summary` | `hubId?: UUID \| 'ALL'` | `queryKeys.dashboard.summary({ activeRole, hubId })` |

---

## 4. Verification Notes
- Automatically refetches when `activeRole` or `activeHubId` changes in `authStore`, or via the header `Refresh Data` button (`refetch()`).
- Uses exact Prisma enums (`DocumentVerificationStatus`: `PENDING`, `APPROVED`, `REJECTED`; `HubDocumentType`; `HubOnboardingStatus`: `PENDING_VERIFICATION`, `VERIFIED`).
- Strictly adheres to KTC Tailwind design tokens, bilingual `copy.constants.js` (`EN` & `HI`), shared UI Kit primitives, and comment-free modern JavaScript.
