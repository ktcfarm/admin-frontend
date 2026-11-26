import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCopy } from '../../../core/constants/index.js';
import { queryKeys } from '../../../core/query/query-keys.js';
import { ACTIONS } from '../../../core/rbac/actions.js';
import { usePermission } from '../../../core/rbac/usePermission.js';
import { useUiStore } from '../../../core/ui/ui.store.js';
import { useUrlQueryState } from '../../../shared/hooks/index.js';
import { catalogApi } from '../api/catalog.api.js';

export const CATALOG_URL_DEFAULTS = Object.freeze({
  tab: 'varieties',
  page: 1,
  limit: 10,
  search: '',
  categoryId: '',
  cropId: '',
  baseUnit: 'all',
  perishability: 'all',
  grade: '',
  isActive: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
  detailId: ''
});

export function useCatalogUrlState() {
  return useUrlQueryState(CATALOG_URL_DEFAULTS);
}

export function useCatalogMeta() {
  const canView = usePermission(ACTIONS.CROP.VIEW);

  return useQuery({
    queryKey: queryKeys.crops.meta(),
    queryFn: () => catalogApi.getMetadata(),
    enabled: Boolean(canView)
  });
}

export function useCategoriesList(params, forceEnabled = true) {
  const canView = usePermission(ACTIONS.CROP.VIEW);

  const queryFilters = {
    page: params.page || 1,
    limit: params.limit || 10,
    ...(params.search ? { search: params.search } : {}),
    ...(params.isActive && params.isActive !== 'all' ? { isActive: params.isActive } : {}),
    sortBy: params.sortBy === 'displayOrder' || params.sortBy === 'createdAt' ? params.sortBy : 'displayOrder',
    sortOrder: params.sortOrder || 'asc'
  };

  return useQuery({
    queryKey: queryKeys.crops.categories(queryFilters),
    queryFn: () => catalogApi.listCategories(queryFilters),
    enabled: Boolean(canView) && Boolean(forceEnabled)
  });
}

export function useCategoryOptions(enabled = true) {
  const canView = usePermission(ACTIONS.CROP.VIEW);
  const filters = { page: 1, limit: 100, sortBy: 'displayOrder', sortOrder: 'asc' };

  return useQuery({
    queryKey: queryKeys.crops.categories({ ...filters, mode: 'options' }),
    queryFn: () => catalogApi.listCategories(filters),
    enabled: Boolean(canView) && Boolean(enabled)
  });
}

export function useCategoryDetail(categoryId, enabled = true) {
  const canView = usePermission(ACTIONS.CROP.VIEW);

  return useQuery({
    queryKey: queryKeys.crops.categoryDetail(categoryId),
    queryFn: () => catalogApi.getCategoryById(categoryId),
    enabled: Boolean(categoryId) && Boolean(canView) && Boolean(enabled)
  });
}

export function useCropsList(params, forceEnabled = true) {
  const canView = usePermission(ACTIONS.CROP.VIEW);

  const queryFilters = {
    page: params.page || 1,
    limit: params.limit || 10,
    ...(params.search ? { search: params.search } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.baseUnit && params.baseUnit !== 'all' ? { baseUnit: params.baseUnit } : {}),
    ...(params.perishability && params.perishability !== 'all'
      ? { perishabilityType: params.perishability }
      : {}),
    ...(params.isActive && params.isActive !== 'all' ? { isActive: params.isActive } : {}),
    sortBy: ['name', 'baseUnit', 'perishabilityType', 'createdAt'].includes(params.sortBy)
      ? params.sortBy
      : 'name',
    sortOrder: params.sortOrder || 'asc'
  };

  return useQuery({
    queryKey: queryKeys.crops.list(queryFilters),
    queryFn: () => catalogApi.listCrops(queryFilters),
    enabled: Boolean(canView) && Boolean(forceEnabled)
  });
}

export function useCropOptions(enabled = true) {
  const canView = usePermission(ACTIONS.CROP.VIEW);
  const filters = { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' };

  return useQuery({
    queryKey: queryKeys.crops.list({ ...filters, mode: 'options' }),
    queryFn: () => catalogApi.listCrops(filters),
    enabled: Boolean(canView) && Boolean(enabled)
  });
}

export function useCropDetail(cropId, enabled = true) {
  const canView = usePermission(ACTIONS.CROP.VIEW);

  return useQuery({
    queryKey: queryKeys.crops.detail(cropId),
    queryFn: () => catalogApi.getCropById(cropId),
    enabled: Boolean(cropId) && Boolean(canView) && Boolean(enabled)
  });
}

export function useVarietiesList(params, forceEnabled = true) {
  const canView = usePermission(ACTIONS.CROP.VIEW);

  const queryFilters = {
    page: params.page || 1,
    limit: params.limit || 10,
    ...(params.search ? { search: params.search } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.cropId ? { cropId: params.cropId } : {}),
    ...(params.baseUnit && params.baseUnit !== 'all' ? { baseUnit: params.baseUnit } : {}),
    ...(params.perishability && params.perishability !== 'all'
      ? { perishabilityType: params.perishability }
      : {}),
    ...(params.grade ? { grade: params.grade } : {}),
    ...(params.isActive && params.isActive !== 'all' ? { isActive: params.isActive } : {}),
    sortBy: params.sortBy === 'createdAt' ? 'createdAt' : 'name',
    sortOrder: params.sortOrder || 'asc'
  };

  return useQuery({
    queryKey: queryKeys.crops.varieties(queryFilters),
    queryFn: () => catalogApi.listVarieties(queryFilters),
    enabled: Boolean(canView) && Boolean(forceEnabled)
  });
}

export function useVarietyDetail(varietyId, enabled = true) {
  const canView = usePermission(ACTIONS.CROP.VIEW);

  return useQuery({
    queryKey: queryKeys.crops.varietyDetail(varietyId),
    queryFn: () => catalogApi.getVarietyById(varietyId),
    enabled: Boolean(varietyId) && Boolean(canView) && Boolean(enabled)
  });
}

function useCatalogMutation({ mutationFn, successTitle, successMessage = '' }) {
  const queryClient = useQueryClient();
  const addToast = useUiStore((state) => state.addToast);
  const copy = useCopy();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crops.all });
      if (successTitle) {
        addToast({
          type: 'success',
          title: successTitle,
          message: successMessage
        });
      }
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: copy.catalog.toasts.actionFailed,
        message: error?.message || 'Unexpected catalog error'
      });
    }
  });
}

export function useCatalogMutations() {
  const copy = useCopy();
  const toasts = copy.catalog.toasts;

  const createCategory = useCatalogMutation({
    mutationFn: (payload) => catalogApi.createCategory(payload),
    successTitle: toasts.categoryCreated
  });

  const updateCategory = useCatalogMutation({
    mutationFn: ({ id, payload }) => catalogApi.updateCategory(id, payload),
    successTitle: toasts.categoryUpdated
  });

  const deleteCategory = useCatalogMutation({
    mutationFn: (id) => catalogApi.deleteCategory(id),
    successTitle: toasts.categoryDeleted
  });

  const createCrop = useCatalogMutation({
    mutationFn: (payload) => catalogApi.createCrop(payload),
    successTitle: toasts.cropCreated
  });

  const updateCrop = useCatalogMutation({
    mutationFn: ({ id, payload }) => catalogApi.updateCrop(id, payload),
    successTitle: toasts.cropUpdated
  });

  const deleteCrop = useCatalogMutation({
    mutationFn: (id) => catalogApi.deleteCrop(id),
    successTitle: toasts.cropDeleted
  });

  const createVariety = useCatalogMutation({
    mutationFn: (payload) => catalogApi.createVariety(payload),
    successTitle: toasts.varietyCreated
  });

  const updateVariety = useCatalogMutation({
    mutationFn: ({ id, payload }) => catalogApi.updateVariety(id, payload),
    successTitle: toasts.varietyUpdated
  });

  const deleteVariety = useCatalogMutation({
    mutationFn: (id) => catalogApi.deleteVariety(id),
    successTitle: toasts.varietyDeleted
  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    createCrop,
    updateCrop,
    deleteCrop,
    createVariety,
    updateVariety,
    deleteVariety
  };
}
