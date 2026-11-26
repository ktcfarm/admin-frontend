import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialState = {
  user: null,
  roles: [],
  activeRole: null,
  staffAssignments: [],
  activeHubId: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false
};

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,
      setSession: (sessionData = {}) =>
        set((state) => {
          const payload = sessionData?.data ?? sessionData;
          const user = payload?.user ?? (payload?.id ? payload : state.user);
          const rawRoles = payload?.roles ?? user?.roles ?? state.roles ?? [];
          const normalizedRoles = (Array.isArray(rawRoles) ? rawRoles : [])
            .map((r) => (typeof r === 'string' ? r : r?.role))
            .filter(Boolean);

          const activeRole =
            payload?.activeRole ??
            user?.activeRole ??
            normalizedRoles[0] ??
            state.activeRole ??
            null;

          const rawStaffAssignments =
            payload?.staffAssignments ??
            user?.staffAssignments ??
            state.staffAssignments ??
            [];

          const staffAssignments = (Array.isArray(rawStaffAssignments) ? rawStaffAssignments : []).map((item) => ({
            ...item,
            hubId: item.hubId || item.hub?.id || item.id,
            hubName: item.hubName ?? item.hub?.name ?? item.name ?? null,
            hubCode: item.hubCode ?? item.hub?.code ?? null
          }));

          const accessToken =
            payload?.accessToken ??
            payload?.tokens?.accessToken ??
            state.accessToken ??
            null;

          const refreshToken =
            payload?.refreshToken ??
            payload?.tokens?.refreshToken ??
            state.refreshToken ??
            null;

          const isScopedStaff =
            (activeRole === 'HUB_MANAGER' || activeRole === 'STORE_OPERATOR') &&
            !normalizedRoles.includes('SUPER_ADMIN');

          let nextActiveHubId =
            payload?.activeHubId !== undefined ? payload.activeHubId : state.activeHubId;

          if (isScopedStaff) {
            const roleAssignments = staffAssignments.filter((a) => a.role === activeRole);
            const pool = roleAssignments.length > 0 ? roleAssignments : staffAssignments;
            if (!nextActiveHubId || !pool.some((a) => a.hubId === nextActiveHubId)) {
              nextActiveHubId = pool[0]?.hubId || null;
            }
          } else if (
            (activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN') &&
            payload?.activeHubId === undefined &&
            !state.activeHubId
          ) {
            nextActiveHubId = null;
          }

          return {
            user: user ?? state.user,
            accessToken,
            refreshToken,
            activeRole,
            roles: normalizedRoles,
            staffAssignments,
            activeHubId: nextActiveHubId,
            isAuthenticated: Boolean(accessToken)
          };
        }),
      updateTokens: ({ accessToken, refreshToken }) =>
        set((state) => {
          const resolvedAccessToken = accessToken ?? state.accessToken;
          const resolvedRefreshToken = refreshToken ?? state.refreshToken;

          return {
            accessToken: resolvedAccessToken,
            refreshToken: resolvedRefreshToken,
            isAuthenticated: Boolean(resolvedAccessToken)
          };
        }),
      setActiveHub: (hubId) =>
        set({
          activeHubId: hubId || null
        }),
      clearSession: () =>
        set({
          ...initialState
        })
    }),
    {
      name: 'ktc-auth-session',
      partialize: (state) => ({
        user: state.user,
        roles: state.roles,
        activeRole: state.activeRole,
        staffAssignments: state.staffAssignments,
        activeHubId: state.activeHubId,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
