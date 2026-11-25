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

          const staffAssignments =
            payload?.staffAssignments ??
            user?.staffAssignments ??
            state.staffAssignments ??
            [];

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

          return {
            user: user ?? state.user,
            accessToken,
            refreshToken,
            activeRole,
            roles: normalizedRoles,
            staffAssignments,
            activeHubId: state.activeHubId ?? (staffAssignments[0]?.hubId || null),
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
          activeHubId: hubId
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
