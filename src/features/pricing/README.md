# Feature: Centralized Pricing & Margin Engine

## 1. Operational Responsibility & Architecture
Manages daily mandi procurement buy rates, consumer sell rates, live decimal margin computation, bulk quantity tier pricing, and Global Benchmark vs. Hub-Specific Override governance within `src/features/pricing/`.

| Layer | File | Responsibility |
|---|---|---|
| **API** | `api/pricing.api.js` | Consumes `/api/v1/admin/pricing/*` plus catalog/hub lookup options exclusively via `httpClient` |
| **Constants** | `constants/pricing.constants.js` | Dynamic variety grade/unit extractors, live margin calculator, and status badge variants |
| **Hooks** | `hooks/usePricing.js` | URL-synced query state (`useUrlQueryState`), `queryKeys.pricing`, Tier 3 `enabled` gates, and mutations |
| **Components** | `components/RateFormDrawer.jsx` | Single rate create/edit `SlideOver` (`size="xl"`) with dynamic variety grade/unit dropdowns and live margin preview |
| **Components** | `components/BulkRatesDrawer.jsx` | Batch daily rate entry drawer (up to 25 rows per batch) |
| **Components** | `components/BulkTiersEditor.jsx` | Tiered quantity pricing rows (`minQty`, `unitPrice`, `label`) with live discount % badges |
| **Components** | `components/RateDetailSlideOver.jsx` | Rate inspection drawer with margin card, bulk tiers, APMC benchmark range, and publish/archive actions |
| **Page** | `pages/PricingPage.jsx` | Main `/pricing` route entrypoint composing KPI cards, URL-synced filters, and `DataTable` |

---

## 2. URL Query Param Contract
Managed via `useUrlQueryState` in `hooks/usePricing.js` alongside global `activeHubId` from `authStore`:

| Param Key | Type | Default | Resets `page` to `1`? | Purpose |
|---|---|---|---|---|
| `page` | `number` | `1` | No | Active table page |
| `limit` | `number` | `10` | Yes | Page size (`[10, 25, 50]`) |
| `search` | `string` | `''` | Yes | Search by variety, crop, grade code, or hub |
| `scope` | `string` | `'all'` | Yes | Scope filter (`'all'` \| `'global'` \| `'hub'`) when `activeHubId` is empty |
| `categoryId` | `string` | `''` | Yes | Filter by crop category |
| `cropId` | `string` | `''` | Yes | Filter by master crop |
| `varietyId` | `string` | `''` | Yes | Filter by crop variety |
| `status` | `string` | `'all'` | Yes | Lifecycle status (`'all'` \| `'DRAFT'` \| `'PUBLISHED'` \| `'ARCHIVED'`) |
| `effectiveDate` | `string` | `''` | Yes | Filter by `YYYY-MM-DD` effective date |
| `sortBy` | `string` | `'rateDate'` | Yes | Sort column (`'rateDate'` \| `'farmerBuyRate'` \| `'consumerSellRate'` \| `'marginPercent'`) |
| `sortOrder` | `string` | `'desc'` | Yes | Sort direction (`'asc'` \| `'desc'`) |
| `rateId` | `string` | `''` | No | Active rate UUID open in `RateDetailSlideOver` |

---

## 3. 3-Tier RBAC Boundary Matrix

| Tier | Scope | Target Element / Query | Required Action |
|---|---|---|---|
| **Tier 1** | Page / Nav | `nav.config.js` item & `/pricing` route (`ProtectedRoute`) | `MANDI_RATE:VIEW` |
| **Tier 2** | Feature / Action | Create, Edit, Publish, Archive, and Bulk Upsert on **Global Benchmark** rows (`hubId === null`) | `MANDI_RATE:SET_GLOBAL` |
| **Tier 2** | Feature / Action | Create, Edit, Publish, Archive, and Bulk Upsert on **Hub Override** rows (`hubId !== null`) | `MANDI_RATE:SET_HUB` (or `SET_GLOBAL`) |
| **Tier 3** | Sub-Field & Query Gate | `"Global Network"` scope option locked and Global Benchmark rows strictly read-only for `HUB_MANAGER`; `STORE_OPERATOR` has zero write controls | `MANDI_RATE:SET_GLOBAL` vs `MANDI_RATE:SET_HUB` |
| **Tier 3** | Sub-Field & Query Gate | Editor catalog & hub lookup queries gated with `enabled: isOpen && (canSetGlobal \|\| canSetHub)` | `MANDI_RATE:SET_GLOBAL` / `SET_HUB` |

---

## 4. REST API Endpoints & Query Keys

| Method | Endpoint | Purpose | Query Key |
|---|---|---|---|
| `GET` | `/api/v1/admin/pricing/rates` | Paginated, hub-scoped list of rates | `queryKeys.pricing.rates(filters)` |
| `GET` | `/api/v1/admin/pricing/rates/:id` | Single rate detail + variety/crop/hub breakdown | `queryKeys.pricing.detail(rateId)` |
| `GET` | `/api/v1/admin/pricing/resolve` | Preview active rate resolution (hub override -> global benchmark) | `queryKeys.pricing.resolve(params)` |
| `POST` | `/api/v1/admin/pricing/rates` | Create rate (optional immediate `PUBLISHED`) | Invalidates `queryKeys.pricing.all` |
| `POST` | `/api/v1/admin/pricing/rates/bulk-upsert` | Batch upsert daily rates (max 50 items) | Invalidates `queryKeys.pricing.all` |
| `PATCH` | `/api/v1/admin/pricing/rates/:id` | Update rates, tiers, or metadata | Invalidates `queryKeys.pricing.all` & `detail(id)` |
| `PATCH` | `/api/v1/admin/pricing/rates/:id/status` | Transition `DRAFT` \| `PUBLISHED` \| `ARCHIVED` | Invalidates `queryKeys.pricing.all` & `detail(id)` |
