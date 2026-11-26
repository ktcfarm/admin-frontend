import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pricingApi } from '../api/pricing.api.js';
import { queryKeys } from '../../../core/query/query-keys.js';
import { useAuthStore } from '../../../core/auth/auth.store.js';
import { useUiStore } from '../../../core/ui/ui.store.js';
import { usePermission } from '../../../core/rbac/usePermission.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { ROLES, useCopy } from '../../../core/constants/index.js';
import { useUrlQueryState } from '../../../shared/hooks/index.js';

export const PRICING_URL_DEFAULTS = Object.freeze({
  page: 1,
  limit: 10,
  search: '',
  scope: 'all',
  categoryId: '',
  cropId: '',
  varietyId: '',
  status: 'all',
  effectiveDate: '',
  sortBy: 'rateDate',
  sortOrder: 'desc',
  rateId: ''
});

export function usePricingUrlState() {
  return useUrlQueryState(PRICING_URL_DEFAULTS);
}

export function usePricingRates(params) {
  const canViewRates = usePermission(ACTIONS.MANDI_RATE.VIEW);
  const activeHubId = useAuthStore((state) => state.activeHubId);
  const activeRole = useAuthStore((state) => state.activeRole);

  const queryFilters = {
    page: params.page,
    limit: params.limit,
    ...(params.search ? { search: params.search } : {}),
    ...(activeHubId
      ? { hubId: activeHubId }
      : params.scope && params.scope !== 'all'
        ? { scope: params.scope }
        : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.cropId ? { cropId: params.cropId } : {}),
    ...(params.varietyId ? { varietyId: params.varietyId } : {}),
    ...(params.status && params.status !== 'all' ? { status: params.status } : {}),
    ...(params.effectiveDate ? { effectiveDate: params.effectiveDate } : {}),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder
  };

  return useQuery({
    queryKey: queryKeys.pricing.rates({ ...queryFilters, activeRole }),
    queryFn: () => pricingApi.listRates(queryFilters),
    enabled: Boolean(canViewRates)
  });
}

export function useRateDetail(rateId) {
  const canViewRates = usePermission(ACTIONS.MANDI_RATE.VIEW);

  return useQuery({
    queryKey: queryKeys.pricing.detail(rateId),
    queryFn: () => pricingApi.getRateById(rateId),
    enabled: Boolean(rateId) && Boolean(canViewRates)
  });
}

export function usePricingFilterOptions() {
  const canViewRates = usePermission(ACTIONS.MANDI_RATE.VIEW);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.pricing.categories(),
    queryFn: () => pricingApi.listCategoryOptions(),
    enabled: Boolean(canViewRates)
  });

  const varietiesQuery = useQuery({
    queryKey: queryKeys.pricing.varieties(),
    queryFn: () => pricingApi.listVarietyOptions(),
    enabled: Boolean(canViewRates)
  });

  return {
    categories: categoriesQuery.data ?? [],
    varieties: varietiesQuery.data ?? []
  };
}

export function usePricingCropFilterOptions(categoryId = '') {
  const canViewRates = usePermission(ACTIONS.MANDI_RATE.VIEW);

  return useQuery({
    queryKey: queryKeys.pricing.crops(categoryId),
    queryFn: () => pricingApi.listCropOptions(categoryId),
    enabled: Boolean(canViewRates)
  });
}

export function usePricingEditorCatalog(isEnabled = false) {
  const canSetGlobal = usePermission(ACTIONS.MANDI_RATE.SET_GLOBAL);
  const canSetHub = usePermission(ACTIONS.MANDI_RATE.SET_HUB);
  const activeRole = useAuthStore((state) => state.activeRole);
  const roles = useAuthStore((state) => state.roles);

  const canMutate = canSetGlobal || canSetHub;
  const canFetchAllHubs =
    canSetGlobal || (Array.isArray(roles) && roles.includes(ROLES.SUPER_ADMIN) && activeRole === ROLES.HUB_MANAGER);

  const varietiesQuery = useQuery({
    queryKey: queryKeys.pricing.varieties(),
    queryFn: () => pricingApi.listVarietyOptions(),
    enabled: Boolean(isEnabled) && Boolean(canMutate)
  });

  const hubsQuery = useQuery({
    queryKey: queryKeys.pricing.hubs(),
    queryFn: () => pricingApi.listHubOptions(),
    enabled: Boolean(isEnabled) && Boolean(canFetchAllHubs)
  });

  return {
    varieties: varietiesQuery.data ?? [],
    hubs: hubsQuery.data ?? [],
    isLoadingVarieties: varietiesQuery.isLoading
  };
}

function usePricingMutation({
  mutationFn,
  successTitle,
  successMessage,
  options = {}
}) {
  const queryClient = useQueryClient();
  const addToast = useUiStore((state) => state.addToast);
  const copy = useCopy();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pricing.all });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.pricing.detail(variables.id)
        });
      }
      if (successTitle) {
        addToast({
          type: 'success',
          title: successTitle,
          message: successMessage
        });
      }
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      addToast({
        type: 'error',
        title: copy.pricing.toasts.actionFailedTitle,
        message: error.message
      });
      options.onError?.(error, variables, context);
    }
  });
}

export function useCreateRate(options = {}) {
  const copy = useCopy();
  return usePricingMutation({
    mutationFn: (payload) => pricingApi.createRate(payload),
    successTitle: copy.pricing.toasts.createdTitle,
    successMessage: copy.pricing.toasts.createdMessage,
    options
  });
}

export function useUpdateRate(options = {}) {
  const copy = useCopy();
  return usePricingMutation({
    mutationFn: ({ id, payload }) => pricingApi.updateRate(id, payload),
    successTitle: copy.pricing.toasts.updatedTitle,
    successMessage: copy.pricing.toasts.updatedMessage,
    options
  });
}

export function useUpdateRateStatus(options = {}) {
  const queryClient = useQueryClient();
  const addToast = useUiStore((state) => state.addToast);
  const copy = useCopy();

  return useMutation({
    mutationFn: ({ id, status }) => pricingApi.updateRateStatus(id, status),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pricing.all });
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.pricing.detail(variables.id)
        });
      }
      const isPublished = variables?.status === 'PUBLISHED';
      addToast({
        type: 'success',
        title: isPublished
          ? copy.pricing.toasts.publishedTitle
          : copy.pricing.toasts.archivedTitle,
        message: isPublished
          ? copy.pricing.toasts.publishedMessage
          : copy.pricing.toasts.archivedMessage
      });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      addToast({
        type: 'error',
        title: copy.pricing.toasts.actionFailedTitle,
        message: error.message
      });
      options.onError?.(error, variables, context);
    }
  });
}

export function useBulkUpsertRates(options = {}) {
  const copy = useCopy();
  return usePricingMutation({
    mutationFn: (items) => pricingApi.bulkUpsertRates(items),
    successTitle: copy.pricing.toasts.bulkSavedTitle,
    successMessage: copy.pricing.toasts.bulkSavedMessage,
    options
  });
}
