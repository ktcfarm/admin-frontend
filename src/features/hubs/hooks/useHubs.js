import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hubsApi } from '../api/hubs.api.js';
import { queryKeys } from '../../../core/query/query-keys.js';
import { useAuthStore } from '../../../core/auth/auth.store.js';
import { useUiStore } from '../../../core/ui/ui.store.js';
import { usePermission } from '../../../core/rbac/usePermission.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { useCopy } from '../../../core/constants/index.js';
import { useUrlQueryState } from '../../../shared/hooks/index.js';

export const HUBS_URL_DEFAULTS = Object.freeze({
  page: 1,
  limit: 10,
  search: '',
  isActive: 'all',
  onboardingStatus: 'all',
  state: '',
  sortBy: 'name',
  sortOrder: 'asc',
  hubId: ''
});

export function useHubsUrlState() {
  return useUrlQueryState(HUBS_URL_DEFAULTS);
}

export function useHubsList(params) {
  const canReadHubs = usePermission(ACTIONS.HUB.READ);
  const activeHubId = useAuthStore((state) => state.activeHubId);
  const activeRole = useAuthStore((state) => state.activeRole);

  const queryFilters = {
    page: params.page,
    limit: params.limit,
    ...(params.search ? { search: params.search } : {}),
    ...(params.isActive !== 'all' ? { isActive: params.isActive } : {}),
    ...(params.onboardingStatus && params.onboardingStatus !== 'all'
      ? { onboardingStatus: params.onboardingStatus }
      : {}),
    ...(params.state ? { state: params.state } : {}),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    ...(activeHubId ? { hubId: activeHubId } : {})
  };

  return useQuery({
    queryKey: queryKeys.hubs.list({ ...queryFilters, activeRole }),
    queryFn: () => hubsApi.listHubs(queryFilters),
    enabled: Boolean(canReadHubs)
  });
}

export function useHubDetail(hubId) {
  const canReadHubs = usePermission(ACTIONS.HUB.READ);

  return useQuery({
    queryKey: queryKeys.hubs.detail(hubId),
    queryFn: () => hubsApi.getHubById(hubId),
    enabled: Boolean(hubId) && Boolean(canReadHubs)
  });
}

export function useHubStaff(hubId) {
  const canViewStaff = usePermission(ACTIONS.STAFF.VIEW);

  return useQuery({
    queryKey: queryKeys.hubs.staff(hubId),
    queryFn: () => hubsApi.getHubStaff(hubId),
    enabled: Boolean(hubId) && Boolean(canViewStaff)
  });
}

export function useStaffCandidates(search, isEnabled = false) {
  const canAssignStaff = usePermission(ACTIONS.STAFF.ASSIGN);
  const trimmed = (search || '').trim();

  return useQuery({
    queryKey: queryKeys.hubs.staffCandidates(trimmed),
    queryFn: () => hubsApi.searchStaffCandidates({ search: trimmed, limit: 10 }),
    enabled: Boolean(isEnabled) && Boolean(canAssignStaff) && trimmed.length >= 2
  });
}

function useHubMutation({
  mutationFn,
  successTitle,
  successMessage,
  invalidateStaff = false,
  options = {}
}) {
  const queryClient = useQueryClient();
  const addToast = useUiStore((state) => state.addToast);
  const copy = useCopy();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hubs.all });
      const hubId = variables?.hubId;
      if (hubId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.hubs.detail(hubId)
        });
        if (invalidateStaff) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.hubs.staff(hubId)
          });
        }
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
        title: copy.hubs.toasts.actionFailedTitle,
        message: error.message
      });
      options.onError?.(error, variables, context);
    }
  });
}

export function useCreateHub(options = {}) {
  const copy = useCopy();
  return useHubMutation({
    mutationFn: (payload) => hubsApi.createHub(payload),
    successTitle: copy.hubs.toasts.createdTitle,
    successMessage: copy.hubs.toasts.createdMessage,
    options
  });
}

export function useUpdateHub(options = {}) {
  const copy = useCopy();
  return useHubMutation({
    mutationFn: ({ hubId, payload }) => hubsApi.updateHub(hubId, payload),
    successTitle: copy.hubs.toasts.updatedTitle,
    successMessage: copy.hubs.toasts.updatedMessage,
    options
  });
}

export function useAssignStaff(options = {}) {
  const copy = useCopy();
  return useHubMutation({
    mutationFn: ({ hubId, payload }) => hubsApi.assignStaff(hubId, payload),
    successTitle: copy.hubs.toasts.staffAssignedTitle,
    successMessage: copy.hubs.toasts.staffAssignedMessage,
    invalidateStaff: true,
    options
  });
}

export function useRemoveStaff(options = {}) {
  const copy = useCopy();
  return useHubMutation({
    mutationFn: ({ hubId, staffId }) => hubsApi.removeStaff(hubId, staffId),
    successTitle: copy.hubs.toasts.staffRemovedTitle,
    successMessage: copy.hubs.toasts.staffRemovedMessage,
    invalidateStaff: true,
    options
  });
}

export function useUpsertFranchiseProfile(options = {}) {
  const copy = useCopy();
  return useHubMutation({
    mutationFn: ({ hubId, payload }) =>
      hubsApi.upsertFranchiseProfile(hubId, payload),
    successTitle: copy.hubs.toasts.franchiseSavedTitle,
    successMessage: copy.hubs.toasts.franchiseSavedMessage,
    options
  });
}

export function useUploadAndRegisterDocument(options = {}) {
  const copy = useCopy();
  return useHubMutation({
    mutationFn: async ({
      hubId,
      file,
      documentType,
      bucketType,
      documentNumber,
      expiryDate
    }) => {
      const uploaded = await hubsApi.uploadDocumentAsset({ file, bucketType });
      return hubsApi.registerHubDocument(hubId, {
        documentType,
        bucketType: uploaded.bucketType || bucketType,
        storageKey: uploaded.key,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        documentNumber: documentNumber || null,
        expiryDate: expiryDate || null
      });
    },
    successTitle: copy.hubs.toasts.documentUploadedTitle,
    successMessage: copy.hubs.toasts.documentUploadedMessage,
    options
  });
}

export function useVerifyHubDocument(options = {}) {
  const copy = useCopy();
  return useHubMutation({
    mutationFn: ({ hubId, docId, payload }) =>
      hubsApi.verifyHubDocument(hubId, docId, payload),
    successTitle: copy.hubs.toasts.documentVerifiedTitle,
    successMessage: copy.hubs.toasts.documentVerifiedMessage,
    options
  });
}

export function useUpdateOnboardingStatus(options = {}) {
  const copy = useCopy();
  return useHubMutation({
    mutationFn: ({ hubId, payload }) =>
      hubsApi.updateOnboardingStatus(hubId, payload),
    successTitle: copy.hubs.toasts.onboardingUpdatedTitle,
    successMessage: copy.hubs.toasts.onboardingUpdatedMessage,
    options
  });
}

export function useOpenDocumentPreview() {
  const addToast = useUiStore((state) => state.addToast);
  const copy = useCopy();

  return useMutation({
    mutationFn: ({ hubId, docId }) => hubsApi.getHubDocumentUrl(hubId, docId),
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: copy.hubs.toasts.actionFailedTitle,
        message: error.message
      });
    }
  });
}
