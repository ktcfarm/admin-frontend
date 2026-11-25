---
name: ktc-web-impact-analyzer
description: Pre-flight architectural change planner and blast-radius analyzer for the KTC Admin Web Portal. Evaluates incoming feature requests, audits cross-module dependencies, defines 3-Tier RBAC matrices and URL query schemas, and dispatches tasks to scope-locked specialist skills. Strictly read-only.
---

# KTC Web Impact Analyzer & Pre-Flight Planner

## 1. Purpose & Trigger
- **Purpose:** Acts as the mandatory pre-flight architectural inspection engine before any code, configuration, or documentation changes are executed within the KTC Admin Web Portal (`admin/`). The analyzer inspects component hierarchies, HTTP contracts, state stores, RBAC policies, URL parameter contracts, and file dependency trees to calculate the exact blast radius, enforce the 5 engineering laws in `ARCHITECTURE.md`, assign tasks to scope-locked skills, and sequence execution phases.
- **Trigger:** Invoked automatically prior to commencing any frontend feature implementation, core infrastructure update, UI primitive or hook addition, routing reconfiguration, or documentation maintenance.

## 2. Allowed Write Paths
- **None (`Strictly Read-Only`).**
- This skill has zero write permissions across the entire administrative portal codebase. Its deliverables are strictly planning, impact classification, RBAC/URL schema specification, and routing directives delivered to the orchestrating coordinator.

## 3. Strictly Forbidden / Read-Only Paths
- All files and directories within the portal repository are read-only to this skill:
  - `src/core/**`
  - `src/shared/**`
  - `src/layouts/**`
  - `src/features/**`
  - `src/App.jsx`
  - `src/main.jsx`
  - `ARCHITECTURE.md`
  - `package.json`
  - `tailwind.config.js`
  - `vite.config.js`

## 4. Mandatory System Rules & Auditing Checklist
When conducting pre-flight evaluations, the analyzer must verify adherence to all 5 architectural laws:
1. **Single-Source Reusability ("Modify Once, Reflect Everywhere"):**
   - Verify all brand colors and surfaces use Tailwind KTC tokens (`ktc-green`, `ktc-gold`, `ktc-canvas`); flag any proposed raw hex codes in feature files.
   - Verify all interactive UI elements consume `src/shared/components/` primitives (`Button`, `Input`, `Select`, `Toggle`, `DataTable`, `PaginationBar`, `Modal`, `SlideOver`, `QrCode`, `OtpPinInput`, etc.) rather than raw HTML `<button>`, `<input>`, `<select>`, or `<table>`.
   - Verify all route paths, role metadata, and user-facing copy consume `src/core/constants/`.
2. **3-Tier RBAC & Permission Boundaries:**
   - Verify **Tier 1** (page/nav via `nav.config.js` + `ProtectedRoute`), **Tier 2** (feature/action via `<Can>` / `usePermission`), and **Tier 3** (dependent sub-field visibility + `enabled: hasSubPermission` gating on dependent TanStack Queries to prevent `403` bursts).
   - Identify any missing granular sub-field actions that must be added to `src/core/rbac/actions.js` by `ktc-web-foundation`.
3. **SOLID & Scope Boundaries:**
   - Verify feature implementations remain strictly confined to `src/features/<target-feature>/**` with zero cross-feature imports.
   - Verify `*.api.js` files consume only `httpClient` from `src/core/http/http.factory.js` and hooks reside in `hooks/`.
   - Route core/token/routing edits to `ktc-web-foundation`, primitive/hook edits to `ktc-web-ui-kit`, and Markdown edits to `ktc-web-docs-maintainer`.
4. **URL-Synced State & Refresh Persistence:**
   - Verify pagination (`page`, `limit`), active `tab`, `sort`, `search`, and primary filters are modeled via `useUrlQueryState` (`src/shared/hooks/useUrlQueryState.js`) rather than ephemeral `useState`.
5. **Source Code Standards:**
   - Confirm pure ES Module JavaScript (`.js`, `.jsx`) with zero TypeScript and zero inline or block comments.

## 5. Mandatory Pre-Flight Output Format
Every impact evaluation must produce a structured pre-flight report containing:
1. **Target Architecture & Scope:** Identification of the business domain, target directory, and affected surfaces.
2. **Blast Radius Classification:**
   - **Low:** Isolated feature additions within `src/features/<feature>/**` without shared state or routing impacts.
   - **Medium:** Addition of reusable primitives/hooks in `src/shared/**`, copy/route constants in `src/core/constants/**`, or navigation additions in `src/core/config/nav.config.js`.
   - **High:** Core networking (`src/core/http/`), session state (`src/core/auth/`), RBAC engine (`src/core/rbac/`), or application shell (`src/layouts/AdminShell.jsx`).
3. **3-Tier Permission Boundary Matrix (Mandatory before any feature build):**

   | Tier | Scope | Target Element / Query | Required Action Constant | New `actions.js` Entry Needed? |
   |---|---|---|---|---|
   | **Tier 1** | Page / Nav | Route & sidebar item | e.g., `HUB:READ` | Yes / No |
   | **Tier 2** | Feature / Action | Create, edit, status toggle, drawer | e.g., `HUB:CREATE` | Yes / No |
   | **Tier 3** | Sub-Field & Query Gate | Dependent section + `enabled: hasPerm` query | e.g., `STAFF:VIEW` | Yes / No |

4. **URL Query Param Schema (Mandatory before any feature build):**
   - Table or list specifying every URL parameter managed by `useUrlQueryState`: key name, type (`number` | `string` | `boolean`), default value, and whether modifying it resets `page` to `1`.
5. **Skill Routing & Phasing:** Dependency-ordered execution sequence across `ktc-web-foundation`, `ktc-web-ui-kit`, `ktc-web-feature-builder`, and `ktc-web-docs-maintainer`.

## 6. Stop & Ask Protocol
- If a proposed change violates the immutability rule of `src/core/**` or `src/shared/**` during routine feature work without explicit foundation/UI-kit routing, halt and reject the plan.
- If a feature requires new granular sub-field actions in `src/core/rbac/actions.js` or new shared primitives in `src/shared/`, flag them explicitly and wait for approval before dispatching implementation workers.
- If a feature requests editing `ARCHITECTURE.md` during routine feature work, introducing TypeScript, using raw HTML form/table controls, or adding code comments, halt immediately and enforce platform invariants.
