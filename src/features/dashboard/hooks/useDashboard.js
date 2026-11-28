import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../core/auth/auth.store.js';
import { queryKeys } from '../../../core/query/query-keys.js';
import { dashboardApi } from '../api/dashboard.api.js';

export function useDashboardSummary() {
  const activeRole = useAuthStore((state) => state.activeRole);
  const activeHubId = useAuthStore((state) => state.activeHubId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.dashboard.summary({
      activeRole: activeRole || null,
      hubId: activeHubId || null
    }),
    queryFn: () => dashboardApi.getSummary({ hubId: activeHubId || undefined }),
    enabled: Boolean(isAuthenticated)
  });
}

export default useDashboardSummary;
