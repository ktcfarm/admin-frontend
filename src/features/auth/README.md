# KTC Admin Authentication Module Architecture

## Overview

The KTC Admin Authentication Module provides enterprise-grade identity, session, and role management for the Kisan Trade Centre (KTC) Admin Web Portal. Built on modern React 19, Zustand, and TanStack Query, the module supports multi-channel authentication (6-digit security PIN and Email/SMS OTP), transparent token rotation, and multi-hub role switching.

---

## Authentication Endpoints

The module integrates with backend endpoints via the normalized HTTP client (`AxiosHttpClient`):

| Endpoint | Method | Payload / Params | Description |
|---|---|---|---|
| `/auth/login/pin` | `POST` | `{ identifier, pin, targetRole }` | Authenticates staff using registered phone/email and 6-digit PIN |
| `/auth/otp/send` | `POST` | `{ identifier, channel, purpose }` | Dispatches OTP via EMAIL or SMS for login or credential reset |
| `/auth/login/otp` | `POST` | `{ identifier, otp, targetRole }` | Authenticates staff using one-time verification passcode |
| `/auth/pin/reset` | `POST` | `{ identifier, otp, newPin }` | Verifies OTP and commits a new 6-digit PIN |
| `/auth/me` | `GET` | — | Retrieves authenticated user profile, roles, and hub assignments |
| `/auth/token/refresh` | `POST` | `{ refreshToken }` | Refreshes expired short-lived access tokens |
| `/auth/logout` | `POST` | — | Invalidates session server-side and clears local state |

---

## Token Lifecycle and Session Persistence

```
  Client (Request) ──────────────────────> Axios HttpClient
                                                │
                                    Bearer token attached
                                                │
                                                ▼
  Client <──────────────── 401 Unauthorized ──── Backend API
     │
     ├─> Queue concurrent requests
     ├─> POST /auth/token/refresh (with current refreshToken)
     │      │
     │      ├─> Success: Update authStore with new tokens
     │      │            Replay all queued requests
     │      │
     │      └─> Failure: Clear authStore session, purge state,
     │                   Redirect user to /login
```

1. **Short-Lived Access Tokens**:
   Stored in memory via `useAuthStore` and synchronized with persistent browser storage under key `ktc-auth-session`. Attached to all outgoing API requests via the `Authorization: Bearer <token>` header.

2. **Transparent Refresh Flow**:
   When an API request encounters HTTP 401 Unauthorized, the response interceptor queues concurrent outgoing calls. A single call to `/auth/token/refresh` exchanges the stored `refreshToken` for a new token pair. Upon success, the queue is drained and retried. Upon failure, the session is cleared and the user is redirected to `/login`.

3. **Storage Security**:
   Tokens and session data are scoped exclusively to client runtime storage. All sensitive state mutations occur through dedicated store actions: `setSession`, `updateTokens`, `setActiveHub`, and `clearSession`.

---

## Role-Based Access Control and Role Switching

Staff accounts within KTC operate across multiple operational personas:

- `SUPER_ADMIN`: Unrestricted global system access across all hubs, catalogues, ledgers, and configurations.
- `ADMIN`: Central operational access across pricing, crops, and staff verification.
- `HUB_MANAGER`: Scoped management for physical KTC hubs, inventory intake, and local operator assignments.
- `STORE_OPERATOR`: Field-level point-of-sale and weighing station operations.

### Staff Hub Assignments & Active Hub

Users with `HUB_MANAGER` or `STORE_OPERATOR` roles carry an array of `staffAssignments` containing `{ hubId, hubName, role }`. The active working hub is controlled via `activeHubId` in `authStore`. When switching hubs via the top bar selector, `setActiveHub(hubId)` updates the global session context without requiring re-authentication.

---

## State and Query Integration

- **Zustand (`useAuthStore`)**:
  - `user`: Identity object containing ID, name, email, phone.
  - `roles`: String array of all assigned roles.
  - `activeRole`: Currently selected working role for RBAC evaluation.
  - `staffAssignments`: Hub assignment profiles.
  - `activeHubId`: Identifier of the selected physical hub.
  - `isAuthenticated`: Boolean flag driving route access guards.

- **TanStack Query Hooks (`useAuth.js`)**:
  - `usePinLogin`: Mutation hook for PIN-based authentication.
  - `useSendOtp`: Mutation hook for dispatching verification codes.
  - `useOtpLogin`: Mutation hook for OTP-based authentication.
  - `useResetPin`: Mutation hook for credential recovery.
  - `useLogout`: Mutation hook for terminating active sessions.
  - `useCurrentUser`: Query hook reading the current user profile from `/auth/me`.

Toasts for success, failure, and network errors are dispatched directly to `useUiStore.getState().addToast(...)`.
