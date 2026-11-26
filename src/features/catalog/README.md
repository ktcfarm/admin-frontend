# Feature: Crop Catalogue, Bilingual Varieties, Quality Grades & Unit Conversions

## 1. Operational Responsibility & Architecture
Manages KTC's commodity hierarchy (`Categories`, `Master Crops`, `Crop Varieties`), perishability classifications (`PERISHABLE` vs `NON_PERISHABLE`), public R2 catalog images (`CROP_PHOTO`), dynamic per-crop/per-variety trade-to-base unit conversions, and custom quality grade specifications within `src/features/catalog/`.

| Layer | File | Responsibility |
|---|---|---|
| **API** | `api/catalog.api.js` | Consumes `/api/v1/admin/catalog/*` via `httpClient` and uploads public R2 images via `storageUploadService` + `/storage/access-url` |
| **Constants** | `constants/catalog.constants.js` | Base units, trade units, perishability badge variants, quick-add grade presets (`GRADE_A`, `GRADE_B`, `FAQ`), and unit serialization helpers |
| **Hooks** | `hooks/useCatalog.js` | URL-synced state (`useUrlQueryState`), TanStack Query hooks (`queryKeys.crops`), Tier 3 `enabled` gates, and mutations |
| **Components** | `components/UnitConversionsEditor.jsx` | Interactive Add/Remove trade unit row editor with quick presets and inherited crop conversion display |
| **Components** | `components/GradeSpecsEditor.jsx` | Interactive dynamic quality grade builder supporting presets (`Grade A`, `Grade B`, `FAQ`) and arbitrary custom grade codes |
| **Components** | `components/CategoryFormDrawer.jsx` | Create/Edit drawer for bilingual categories and public R2 photo upload |
| **Components** | `components/CropFormDrawer.jsx` | Create/Edit drawer for master crops with `PerishabilityType`, `shelfLifeDays`, locked `baseUnit`, moisture threshold, and unit conversions |
| **Components** | `components/VarietyFormDrawer.jsx` | Create/Edit drawer for varieties with unit conversion overrides, dynamic quality grade specs, and public R2 image |
| **Components** | `components/CatalogDetailSlideOver.jsx` | Inspection drawer showing bilingual metadata, effective conversion matrix (`Base` / `Crop Default` / `Variety Override`), grade specs, and downstream usage |
| **Page** | `pages/CatalogPage.jsx` | 3-tab operational workspace (`Varieties`, `Master Crops`, `Categories`) with URL-synced filters and `DataTable` |

---

## 2. URL Query Param Contract
Managed via `useUrlQueryState` in `hooks/useCatalog.js`:

| Param Key | Type | Default | Resets `page` to `1`? | Purpose |
|---|---|---|---|---|
| `tab` | `string` | `'varieties'` | Yes | Active catalog tab (`'varieties'` \| `'crops'` \| `'categories'`) |
| `page` | `number` | `1` | No | Active table page |
| `limit` | `number` | `10` | Yes | Page size (`[10, 25, 50]`) |
| `search` | `string` | `''` | Yes | Search EN/HI name, botanical name, or slug |
| `categoryId` | `string` | `''` | Yes | Filter Crops or Varieties by Category UUID |
| `cropId` | `string` | `''` | Yes | Filter Varieties by parent Crop UUID |
| `baseUnit` | `string` | `'all'` | Yes | Filter by canonical base unit (`'all'` \| `'KG'` \| `'PIECE'`) |
| `perishability` | `string` | `'all'` | Yes | Filter by perishability (`'all'` \| `'PERISHABLE'` \| `'NON_PERISHABLE'`) |
| `grade` | `string` | `''` | Yes | Filter Varieties defining a grade code (e.g. `FAQ`) |
| `isActive` | `string` | `'all'` | Yes | Status filter (`'all'` \| `'true'` \| `'false'`) |
| `sortBy` | `string` | `'name'` | Yes | Sort column (`'name'` \| `'displayOrder'` \| `'baseUnit'` \| `'perishabilityType'` \| `'createdAt'`) |
| `sortOrder` | `string` | `'asc'` | Yes | Sort direction (`'asc'` \| `'desc'`) |
| `detailId` | `string` | `''` | No | Active item UUID open in `CatalogDetailSlideOver` |

---

## 3. 3-Tier RBAC Boundary Matrix

| Tier | Scope | Target Element / Query | `SUPER_ADMIN` / `ADMIN` | `HUB_MANAGER` / `STORE_OPERATOR` | Required Action |
|---|---|---|---|---|---|
| **Tier 1** | Page / Nav | `nav.config.js` item & `/catalog` route (`ProtectedRoute`) | Accessible | Accessible | `CROP:VIEW` |
| **Tier 2** | Feature / Action | `+ Add Variety / Crop / Category` CTA & create drawers | Enabled | Hidden (`<Can>`) | `CROP:CREATE` |
| **Tier 2** | Feature / Action | `Edit` buttons, form drawers, R2 image uploaders, status toggles | Enabled | Hidden (`<Can>`) | `CROP:UPDATE` |
| **Tier 2** | Feature / Action | `Delete` buttons & confirmation modal | Enabled | Hidden (`<Can>`) | `CROP:DELETE` |
| **Tier 3** | Sub-Field & Query Gate | Parent category/crop option queries inside create/edit drawers (`enabled: isOpen && canMutate`) | Fetched when open | Suppressed | `CROP:CREATE` / `CROP:UPDATE` |
| **Tier 3** | Sub-Field & Query Gate | Detail SlideOver query (`enabled: Boolean(detailId) && canView`) | Read/Write | Read-Only | `CROP:VIEW` |
